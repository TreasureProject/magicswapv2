import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import type { UserIncentive } from "~/api/user.server";
import { useAccount } from "~/contexts/account";
import { useWriteStakingContractSubscribeToIncentives } from "~/generated";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  enabled?: boolean;
  onSuccess?: (incentiveIds: bigint[]) => void;
};

export const useSubscribeToIncentives = ({
  enabled = true,
  onSuccess,
}: Props) => {
  const [lastIncentiveIds, setLastIncentiveIds] = useState<bigint[]>([]);
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");
  const subscribeToIncentives = useWriteStakingContractSubscribeToIncentives();
  const subscribeToIncentivesReceipt = useWaitForTransactionReceipt({
    hash: subscribeToIncentives.data,
  });

  const isEnabled = enabled && isConnected;
  const isSuccess = subscribeToIncentivesReceipt.isSuccess;

  useToast({
    title: "Subscribing to rewards",
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
      onSuccess?.(lastIncentiveIds);
    }
  }, [isSuccess, onSuccess, lastIncentiveIds]);

  return {
    subscribeToIncentives: (incentiveIds: bigint[]) => {
      if (!isEnabled) {
        return;
      }

      setLastIncentiveIds(incentiveIds);

      return subscribeToIncentives.writeContractAsync({
        address: stakingContractAddress,
        args: [incentiveIds],
      });
    },
  };
};
