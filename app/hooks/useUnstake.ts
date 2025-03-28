import { useEffect } from "react";
import type { Address } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useWriteStakingContractUnstakeToken } from "~/generated";
import { getContractAddress } from "~/lib/address";
import type { Pool } from "~/types";
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
  const stakingContractAddress = getContractAddress({
    chainId: pool.chainId,
    contract: "stakingContract",
  });

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
        chainId: pool.chainId,
        address: stakingContractAddress,
        args: [pool.address as Address, amount, true],
      });
    },
  };
};
