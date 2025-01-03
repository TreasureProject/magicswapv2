import { useEffect, useMemo } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import type { UserIncentive } from "~/api/user.server";
import { useAccount } from "~/contexts/account";
import {
  useWriteStakingContractStakeAndSubscribeToIncentives,
  useWriteStakingContractStakeToken,
} from "~/generated";
import type { AddressString, Pool } from "~/types";
import { useApproval } from "./useApproval";
import { useContractAddress } from "./useContractAddress";
import { useToast } from "./useToast";

type Props = {
  pool: Pool;
  amount: bigint;
  enabled?: boolean;
  userIncentives: UserIncentive[];
  onSuccess?: (incentives: UserIncentive[]) => void;
};

export const useStake = ({
  pool,
  amount,
  enabled = true,
  userIncentives,
  onSuccess,
}: Props) => {
  const { isConnected } = useAccount();
  const stakingContractAddress = useContractAddress("stakingContract");

  const isEnabled = enabled && isConnected && amount > 0;
  const { isApproved, approve } = useApproval({
    operator: stakingContractAddress,
    token: pool.address,
    amount,
    enabled: isEnabled,
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

  const isSuccessStakeAndSubscribe = stakeAndSubscribeReceipt.isSuccess;
  const isSuccessStakeToken = stakeTokenReceipt.isSuccess;

  const unsubscribedIncentives = useMemo(() => {
    const subscribedIncentiveIds = userIncentives
      .filter((userIncentive) => userIncentive.isSubscribed)
      .map((userIncentive) => userIncentive.incentive.incentiveId);

    return (
      pool.incentives?.items.filter(
        (incentive) => !subscribedIncentiveIds.includes(incentive.incentiveId),
      ) ?? []
    );
  }, [pool, userIncentives]);

  useToast({
    title: `Staking ${pool.name} MLP`,
    isLoading:
      stakeAndSubscribe.isPending ||
      stakeAndSubscribeReceipt.isLoading ||
      stakeToken.isPending ||
      stakeTokenReceipt.isLoading,
    isSuccess: isSuccessStakeAndSubscribe || isSuccessStakeToken,
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
    if (isSuccessStakeAndSubscribe) {
      onSuccess?.([]);
    }
  }, [isSuccessStakeAndSubscribe, onSuccess]);

  useEffect(() => {
    if (isSuccessStakeToken) {
      onSuccess?.([]); // TODO: resolve this
    }
  }, [isSuccessStakeToken, onSuccess]);

  return {
    isApproved,
    approve,
    stake: () => {
      if (!isEnabled || !isApproved) {
        return;
      }
      if (unsubscribedIncentives.length === 0) {
        return stakeToken.writeContractAsync({
          address: stakingContractAddress,
          args: [pool.address as AddressString, amount, false],
        });
      }

      return stakeAndSubscribe.writeContractAsync({
        address: stakingContractAddress,
        args: [
          pool.address as AddressString,
          amount,
          unsubscribedIncentives.map(({ incentiveId }) => BigInt(incentiveId)),
          true,
        ],
      });
    },
  };
};
