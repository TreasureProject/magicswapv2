import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import {
  useWriteStakingContractStakeAndSubscribeToIncentives,
  useWriteStakingContractStakeToken,
} from "~/generated";
import type { AddressString, Pool } from "~/types";
import { useApproval } from "./useApproval";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  pool: Pool;
  amount: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useStake = ({
  pool,
  amount,
  enabled = true,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");

  const stakeAndSubscribe =
    useWriteStakingContractStakeAndSubscribeToIncentives();
  const stakeAndSubscribeReceipt = useWaitForTransactionReceipt({
    hash: stakeAndSubscribe.data,
  });

  const stakeToken = useWriteStakingContractStakeToken();
  const stakeTokenReceipt = useWaitForTransactionReceipt({
    hash: stakeToken.data,
  });

  const isEnabled = enabled && isConnected && amount > 0;
  const isSuccess =
    stakeTokenReceipt.isSuccess || stakeAndSubscribeReceipt.isSuccess;

  const { isApproved, approve } = useApproval({
    operator: stakingContractAddress,
    token: pool.address,
    amount,
    enabled: isEnabled,
  });

  useToast({
    title: `Staking ${pool.name} MLP`,
    isLoading:
      stakeAndSubscribe.isPending ||
      stakeAndSubscribeReceipt.isLoading ||
      stakeToken.isPending ||
      stakeTokenReceipt.isLoading,
    isSuccess,
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
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    isApproved,
    approve,
    stake: (newIncentiveIds: bigint[]) => {
      if (!isEnabled || !isApproved) {
        return;
      }

      if (newIncentiveIds.length === 0) {
        return stakeToken.writeContractAsync({
          address: stakingContractAddress,
          args: [pool.address as AddressString, amount, false],
        });
      }

      return stakeAndSubscribe.writeContractAsync({
        address: stakingContractAddress,
        args: [pool.address as AddressString, amount, newIncentiveIds, false],
      });
    },
  };
};
