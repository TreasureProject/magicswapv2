import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useWriteStakingContractClaimAllRewards } from "~/generated";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useClaimRewards = (props?: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");
  const claimAllRewards = useWriteStakingContractClaimAllRewards();
  const claimAllRewardsReceipt = useWaitForTransactionReceipt({
    hash: claimAllRewards.data,
  });

  const isEnabled = isConnected && props?.enabled !== false;
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
      props?.onSuccess?.();
    }
  }, [isSuccess, props?.onSuccess]);

  return {
    claimRewards: (incentiveIds: bigint[]) => {
      if (!isEnabled) {
        return;
      }

      return claimAllRewards.writeContractAsync({
        address: stakingContractAddress,
        args: [incentiveIds],
      });
    },
  };
};
