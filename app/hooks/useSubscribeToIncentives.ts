import { useWaitForTransactionReceipt } from "wagmi";

import { useEffect } from "react";
import { useAccount } from "~/contexts/account";
import { useWriteStakingContractSubscribeToIncentives } from "~/generated";
import { getContractAddress } from "~/lib/address";
import { useToast } from "./useToast";

type Props = {
  chainId: number;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useSubscribeToIncentives = ({
  chainId,
  enabled = true,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();

  const subscribeToIncentives = useWriteStakingContractSubscribeToIncentives();
  const subscribeToIncentivesReceipt = useWaitForTransactionReceipt({
    hash: subscribeToIncentives.data,
  });

  const isEnabled = isConnected && enabled;
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
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    subscribeToIncentives: (incentiveIds: bigint[]) => {
      if (!isEnabled) {
        return;
      }

      return subscribeToIncentives.writeContractAsync({
        address: getContractAddress({ chainId, contract: "stakingContract" }),
        args: [incentiveIds],
      });
    },
  };
};
