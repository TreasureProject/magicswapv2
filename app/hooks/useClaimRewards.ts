import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useWriteStakingContractClaimAllRewards } from "~/generated";
import { getContractAddress } from "~/lib/address";
import { useToast } from "./useToast";

type Props = {
  chainId: number;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useClaimRewards = ({
  chainId,
  enabled = true,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();

  const claimAllRewards = useWriteStakingContractClaimAllRewards();
  const claimAllRewardsReceipt = useWaitForTransactionReceipt({
    hash: claimAllRewards.data,
  });

  const isEnabled = isConnected && enabled;
  const isSuccess = claimAllRewardsReceipt.isSuccess;

  useToast({
    title: "Claim rewards",
    isLoading: claimAllRewards.isPending || claimAllRewardsReceipt.isLoading,
    isSuccess,
    isError: claimAllRewards.isError || claimAllRewardsReceipt.isError,
    errorDescription: (claimAllRewards.error || claimAllRewardsReceipt.error)
      ?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    claimRewards: (incentiveIds: bigint[]) => {
      if (!isEnabled) {
        return;
      }

      return claimAllRewards.writeContractAsync({
        address: getContractAddress({ chainId, contract: "stakingContract" }),
        args: [incentiveIds],
      });
    },
  };
};
