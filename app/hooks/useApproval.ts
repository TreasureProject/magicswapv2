import type { AddressString, Token } from "~/types";
import { useApprove } from "./useApprove";
import { useIsApproved } from "./useIsApproved";

type Props = {
  operator: AddressString;
  token: Token | string;
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useApproval = ({
  operator,
  token,
  amount,
  enabled,
  onSuccess,
}: Props) => {
  const isETH = typeof token !== "string" && !!token.isEth;
  const { isApproved, allowance, refetch } = useIsApproved({
    operator,
    token,
    amount,
    enabled: enabled && !isETH,
  });
  const { approve } = useApprove({
    operator,
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
