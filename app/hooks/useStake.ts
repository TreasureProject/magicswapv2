import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useWriteStakingContractStakeAndSubscribeToIncentives } from "~/generated";
import type { Pool } from "~/lib/pools.server";
import type { AddressString } from "~/types";
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

  const isSuccess = stakeAndSubscribeReceipt.isSuccess;

  useToast({
    title: `Staking ${pool.name} MLP`,
    isLoading:
      stakeAndSubscribe.isPending || stakeAndSubscribeReceipt.isLoading,
    isSuccess,
    isError: stakeAndSubscribe.isError || stakeAndSubscribeReceipt.isError,
    errorDescription: (
      stakeAndSubscribe.error || stakeAndSubscribeReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    isApproved,
    approve,
    stake: () => {
      if (!isEnabled || !isApproved) {
        return;
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
