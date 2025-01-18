import { useCallback } from "react";

import type { AddressString, Token } from "~/types";
import { useApprove } from "./useApprove";
import { useIsApproved } from "./useIsApproved";

type Props = {
  chainId: number;
  operator: AddressString;
  token: Token | string;
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useApproval = ({
  chainId,
  operator,
  token,
  amount,
  enabled,
  onSuccess,
}: Props) => {
  const isETH = typeof token !== "string" && !!token.isEth;
  const { isApproved, allowance, refetch } = useIsApproved({
    chainId,
    operator,
    token,
    amount,
    enabled: enabled && !isETH,
  });
  const { approve } = useApprove({
    chainId,
    operator,
    token,
    amount,
    enabled: enabled && !isApproved && !isETH,
    onSuccess: useCallback(() => {
      refetch();
      onSuccess?.();
    }, [refetch, onSuccess]),
  });
  return {
    isApproved: isApproved || isETH,
    allowance,
    approve,
    refetch,
  };
};
