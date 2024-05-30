import { useApprove } from "./useApprove";
import { useIsApproved } from "./useIsApproved";
import type { PoolToken } from "~/types";

type Props = {
  token: PoolToken;
  amount?: bigint;
  enabled?: boolean;
};

export const useApproval = ({ token, amount, enabled }: Props) => {
  const { isApproved, refetch } = useIsApproved({
    token,
    amount,
    enabled,
  });
  const { approve, isSuccess } = useApprove({
    token,
    amount,
    enabled: enabled && !isApproved,
  });
  return {
    isApproved,
    approve,
    refetch,
    isSuccess,
  };
};
