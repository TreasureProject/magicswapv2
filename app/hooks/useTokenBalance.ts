import { useBalance } from "wagmi";

import { useReadErc20BalanceOf } from "~/generated";
import type { AddressString } from "~/types";

type Props = {
  chainId?: number;
  id?: AddressString;
  address: AddressString | undefined;
  isETH?: boolean;
  enabled?: boolean;
};

export const useTokenBalance = ({
  chainId,
  id,
  address,
  isETH = false,
  enabled = true,
}: Props) => {
  const {
    data = 0n,
    isLoading,
    refetch,
  } = useReadErc20BalanceOf({
    chainId,
    address: id,
    args: [address as AddressString],
    query: {
      enabled: enabled && !!id && !!address && !isETH,
    },
  });

  const {
    data: ethData,
    isLoading: isLoadingEthBalance,
    refetch: refetchEthBalance,
  } = useBalance({ chainId, address: isETH ? address : undefined });

  return {
    data: isETH ? (ethData?.value ?? 0n) : data,
    isLoading: isETH ? isLoadingEthBalance : isLoading,
    refetch: isETH ? refetchEthBalance : refetch,
  };
};
