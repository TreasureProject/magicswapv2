import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useWriteStakingContractSubscribeToIncentives } from "~/generated";
import type { UserIncentive } from "~/types";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  enabled?: boolean;
  onSuccess?: (incentives: UserIncentive[]) => void;
};

export const useSubscribeToIncentives = ({
  enabled = true,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");
  const subscribeToIncentives = useWriteStakingContractSubscribeToIncentives();
  const subscribeToIncentivesReceipt = useWaitForTransactionReceipt({
    hash: subscribeToIncentives.data,
  });
  const isEnabled = enabled && isConnected;

  const isSuccessSubscribeToIncentives = subscribeToIncentivesReceipt.isSuccess;

  useToast({
    title: "Subscribing to rewards",
    isLoading:
      subscribeToIncentives.isPending || subscribeToIncentivesReceipt.isLoading,
    isSuccess: isSuccessSubscribeToIncentives,
    isError:
      subscribeToIncentives.isError || subscribeToIncentivesReceipt.isError,
    errorDescription: (
      subscribeToIncentives.error || subscribeToIncentivesReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccessSubscribeToIncentives) {
      onSuccess?.([]);
    }
  }, [isSuccessSubscribeToIncentives, onSuccess]);

  return {
    subscribeToIncentives: (incentiveIds: bigint[]) => {
      if (!isEnabled) {
        return;
      }

      return subscribeToIncentives.writeContractAsync({
        address: stakingContractAddress,
        args: [incentiveIds],
      });
    },
  };
};
