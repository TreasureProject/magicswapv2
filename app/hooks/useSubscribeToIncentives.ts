import { useWaitForTransactionReceipt } from "wagmi";

import { useEffect } from "react";
import { useAccount } from "~/contexts/account";
import { useWriteStakingContractSubscribeToIncentives } from "~/generated";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useSubscribeToIncentives = (props?: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");
  const subscribeToIncentives = useWriteStakingContractSubscribeToIncentives();
  const subscribeToIncentivesReceipt = useWaitForTransactionReceipt({
    hash: subscribeToIncentives.data,
  });

  const isEnabled = isConnected && props?.enabled !== false;
  const isSuccess = subscribeToIncentivesReceipt.isSuccess;

  useToast({
    title: "Subscribe to rewards",
    isLoading:
      subscribeToIncentives.isPending || subscribeToIncentivesReceipt.isLoading,
    isSuccess,
    isError:
      subscribeToIncentives.isError || subscribeToIncentivesReceipt.isError,
    errorDescription: (
      subscribeToIncentives.error || subscribeToIncentivesReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      props?.onSuccess?.();
    }
  }, [isSuccess, props?.onSuccess]);

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
