import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useWriteStakingContractUnstakeToken } from "~/generated";
import type { Pool } from "~/lib/pools.server";
import type { AddressString } from "~/types";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  pool: Pool;
  amount: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useUnstake = ({
  pool,
  amount,
  enabled = true,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");

  const isEnabled = enabled && isConnected && amount > 0;

  const unstake = useWriteStakingContractUnstakeToken();
  const unstakeReceipt = useWaitForTransactionReceipt({
    hash: unstake.data,
  });

  const isSuccess = unstake.isSuccess;

  useToast({
    title: `Staking ${pool.name} MLP`,
    isLoading: unstake.isPending || unstakeReceipt.isLoading,
    isSuccess,
    isError: unstake.isError || unstakeReceipt.isError,
    errorDescription: (unstake.error || unstakeReceipt.error)?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    unstake: () => {
      if (!isEnabled) {
        return;
      }

      return unstake.writeContractAsync({
        address: stakingContractAddress,
        args: [pool.id as AddressString, amount, true],
      });
    },
  };
};
