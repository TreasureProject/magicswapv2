import { useEffect } from "react";
import type { Address } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

import type { Pool } from "~/api/pools.server";
import { useAccount } from "~/contexts/account";
import {
  useWriteStakingContractStakeAndSubscribeToIncentives,
  useWriteStakingContractStakeToken,
} from "~/generated";
import { getContractAddress } from "~/lib/address";
import { useApproval } from "./useApproval";
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
  const stakingContractAddress = getContractAddress({
    chainId: pool.chainId,
    contract: "stakingContract",
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

  const isEnabled = enabled && isConnected && amount > 0;
  const isSuccess =
    stakeTokenReceipt.isSuccess || stakeAndSubscribeReceipt.isSuccess;

  const { isApproved, approve } = useApproval({
    chainId: pool.chainId,
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
          chainId: pool.chainId,
          address: stakingContractAddress,
          args: [pool.address as Address, amount, false],
        });
      }

      return stakeAndSubscribe.writeContractAsync({
        chainId: pool.chainId,
        address: stakingContractAddress,
        args: [pool.address as Address, amount, newIncentiveIds, false],
      });
    },
  };
};
