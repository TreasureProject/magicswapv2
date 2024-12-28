import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import type { UserIncentive } from "~/api/user.server";
import { useAccount } from "~/contexts/account";
import { useWriteStakingContractClaimAllRewards } from "~/generated";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  enabled?: boolean;
  onSuccess?: (incentives: UserIncentive[]) => void;
};

export const useClaimRewards = ({ enabled = true, onSuccess }: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");
  const claimAllRewards = useWriteStakingContractClaimAllRewards();
  const claimAllRewardsReceipt = useWaitForTransactionReceipt({
    hash: claimAllRewards.data,
  });

  const isEnabled = enabled && isConnected;
  const isSuccess = claimAllRewardsReceipt.isSuccess;

  useToast({
    title: "Subscribing to rewards",
    isLoading: claimAllRewards.isPending || claimAllRewardsReceipt.isLoading,
    isSuccess,
    isError: claimAllRewards.isError || claimAllRewardsReceipt.isError,
    errorDescription: (claimAllRewards.error || claimAllRewardsReceipt.error)
      ?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.([]);
    }
  }, [isSuccess, onSuccess]);

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
