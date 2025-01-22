import type { Address } from "viem";
import { useBalance } from "wagmi";

import { useReadErc20BalanceOf } from "~/generated";

type Props = {
  chainId: number | undefined;
  tokenAddress?: Address;
  userAddress: Address | undefined;
  isETH?: boolean;
  enabled?: boolean;
};

export const useTokenBalance = ({
  chainId,
  tokenAddress,
  userAddress,
  isETH = false,
  enabled = true,
}: Props) => {
  const {
    data = 0n,
    isLoading,
    refetch,
  } = useReadErc20BalanceOf({
    chainId,
    address: tokenAddress,
    args: [userAddress as Address],
    query: {
      enabled: enabled && !!tokenAddress && !!userAddress && !isETH,
    },
  });

  const {
    data: ethData,
    isLoading: isLoadingEthBalance,
    refetch: refetchEthBalance,
  } = useBalance({
    chainId,
    address: isETH ? userAddress : undefined,
    query: {
      enabled: !!chainId && !!userAddress && isETH,
    },
  });

  return {
    data: isETH ? (ethData?.value ?? 0n) : data,
    isLoading: isETH ? isLoadingEthBalance : isLoading,
    refetch: isETH ? refetchEthBalance : refetch,
  };
};
