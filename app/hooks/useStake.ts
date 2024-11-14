import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import {
  useWriteStakingContractStakeAndSubscribeToIncentives,
  useWriteStakingContractStakeToken,
} from "~/generated";
import type { Pool } from "~/lib/pools.server";
import type { AddressString } from "~/types";
import { useApproval } from "./useApproval";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  pool: Pool;
  amount: bigint;
  enabled?: boolean;
  isSubscribed?: boolean;
  onSuccess?: () => void;
};

export const useStake = ({
  pool,
  amount,
  enabled = true,
  isSubscribed = false,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");

  const isEnabled = enabled && isConnected && amount > 0;
  const { isApproved, approve } = useApproval({
    operator: stakingContractAddress,
    token: pool.id,
    amount,
    enabled: isEnabled,
  });

  const stakeAndSubscribe =
    useWriteStakingContractStakeAndSubscribeToIncentives();
  const stakeAndSubscribeReceipt = useWaitForTransactionReceipt({
    hash: stakeAndSubscribe.data,
  });

  const stakeToken = useWriteStakingContractStakeToken();
  const stakeTokenReceipt = useWaitForTransactionReceipt({
    hash: stakeToken.data,
  });

  const isSuccessStakeAndSubscribe = stakeAndSubscribeReceipt.isSuccess;
  const isSuccessStakeToken = stakeTokenReceipt.isSuccess;

  useToast({
    title: `Staking ${pool.name} MLP`,
    isLoading:
      stakeAndSubscribe.isPending ||
      stakeAndSubscribeReceipt.isLoading ||
      stakeToken.isPending ||
      stakeTokenReceipt.isLoading,
    isSuccess: isSuccessStakeAndSubscribe || isSuccessStakeToken,
    isError:
      stakeAndSubscribe.isError ||
      stakeAndSubscribeReceipt.isError ||
      stakeToken.isError ||
      stakeTokenReceipt.isError,
    errorDescription:
      (stakeAndSubscribe.error || stakeAndSubscribeReceipt.error)?.message ||
      (stakeToken.error || stakeTokenReceipt.error)?.message,
  });

  useEffect(() => {
    if (isSuccessStakeAndSubscribe) {
      onSuccess?.();
    }
  }, [isSuccessStakeAndSubscribe, onSuccess]);

  useEffect(() => {
    if (isSuccessStakeToken) {
      onSuccess?.();
    }
  }, [isSuccessStakeToken, onSuccess]);

  return {
    isApproved,
    approve,
    stake: () => {
      if (!isEnabled || !isApproved) {
        return;
      }
      if (isSubscribed) {
        return stakeToken.writeContractAsync({
          address: stakingContractAddress,
          args: [pool.id as AddressString, amount, false],
        });
      }
      return stakeAndSubscribe.writeContractAsync({
        address: stakingContractAddress,
        args: [
          pool.id as AddressString,
          amount,
          pool.incentives.map(({ incentiveId }) => BigInt(incentiveId)),
          true,
        ],
      });
    },
  };
};
