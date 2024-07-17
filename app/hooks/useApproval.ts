import type { PoolToken } from "~/types";
import { useApprove } from "./useApprove";
import { useIsApproved } from "./useIsApproved";

type Props = {
  token: PoolToken | string;
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useApproval = ({ token, amount, enabled, onSuccess }: Props) => {
  const isETH = typeof token !== "string" && !!token.isETH;
  const { isApproved, allowance, refetch } = useIsApproved({
    token,
    amount,
    enabled: enabled && !isETH,
  });
  const { approve } = useApprove({
    token,
    amount,
    enabled: enabled && !isApproved && !isETH,
    onSuccess: () => {
      refetch();
      onSuccess?.();
    },
  });
  return {
    isApproved: isApproved || isETH,
    allowance,
    approve,
    refetch,
  };
};
