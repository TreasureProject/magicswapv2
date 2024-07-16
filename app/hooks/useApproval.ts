import type { PoolToken } from "~/types";
import { useApprove } from "./useApprove";
import { useIsApproved } from "./useIsApproved";

type Props = {
  token: PoolToken;
  amount?: bigint;
  enabled?: boolean;
};

export const useApproval = ({ token, amount, enabled }: Props) => {
  const { isApproved, refetch } = useIsApproved({
    token,
    amount,
    enabled: enabled && !token.isETH,
  });
  const { approve, isSuccess } = useApprove({
    token,
    amount,
    enabled: enabled && !isApproved && !token.isETH,
  });
  return {
    isApproved: isApproved || !!token.isETH,
    approve,
    refetch,
    isSuccess,
  };
};
