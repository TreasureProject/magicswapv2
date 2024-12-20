import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

import type { FetchNFTVaultBalance } from "~/routes/resources.vaults.$chainId.$address.balance";
import type { AddressString, Token } from "~/types";
import { useTokenBalance } from "./useTokenBalance";

type Props = {
  token: Token;
  address: AddressString | undefined;
};

export const usePoolTokenBalance = ({ token, address }: Props) => {
  const {
    load: loadNFTBalance,
    state: nftBalanceStatus,
    data: nftBalance,
  } = useFetcher<FetchNFTVaultBalance>();

  const { data: erc20Balance = 0n, isLoading } = useTokenBalance({
    id: token.address as AddressString,
    address,
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
