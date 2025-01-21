import { useEffect } from "react";
import { useFetcher } from "react-router";
import type { Address } from "viem";

import type { FetchNFTVaultBalance } from "~/routes/resources.vaults.$chainId.$address.balance";
import type { Token } from "~/types";
import { useTokenBalance } from "./useTokenBalance";

type Props = {
  token: Token;
  address: Address | undefined;
};

export const usePoolTokenBalance = ({ token, address }: Props) => {
  const {
    load: loadNFTBalance,
    state: nftBalanceStatus,
    data: nftBalance,
  } = useFetcher<FetchNFTVaultBalance>();

  const { data: erc20Balance = 0n, isLoading } = useTokenBalance({
    chainId: token.chainId,
    tokenAddress: token.address as Address,
    userAddress: address,
    isETH: token.isEth,
    enabled: !!address && !token.isVault,
  });

  useEffect(() => {
    if (!token.isVault || !address) {
      return;
    }

    const params = new URLSearchParams({
      address,
    });
    loadNFTBalance(
      `/resources/vaults/${token.chainId}/${token.address}/balance?${params.toString()}`,
    );
  }, [token.isVault, token.chainId, token.address, address, loadNFTBalance]);

  return {
    data: token.isVault
      ? nftBalance?.ok
        ? nftBalance.balance
        : 0
      : erc20Balance,
    isLoading: isLoading || nftBalanceStatus === "loading",
  };
};
