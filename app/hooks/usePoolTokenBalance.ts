import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

import { useReadErc20BalanceOf } from "~/generated";
import type { FetchNFTVaultBalance } from "~/routes/resources.vaults.$id.balance";
import type { AddressString, PoolToken } from "~/types";

type Props = {
  token: PoolToken;
  address: AddressString | undefined;
};

export const usePoolTokenBalance = ({ token, address }: Props) => {
  const {
    load: loadNFTBalance,
    state: nftBalanceStatus,
    data: nftBalance,
  } = useFetcher<FetchNFTVaultBalance>();

  const { data: erc20Balance = 0n, fetchStatus: erc20BalanceStatus } =
    useReadErc20BalanceOf({
      address: token.id as AddressString,
      args: [address as AddressString],
      query: {
        enabled: !!address && !token.isNFT,
      },
    });

  useEffect(() => {
    if (!token.isNFT || !address) {
      return;
    }

    const params = new URLSearchParams({
      address,
    });
    loadNFTBalance(
      `/resources/vaults/${token.id}/balance?${params.toString()}`
    );
  }, [token.isNFT, token.id, address, loadNFTBalance]);

  return {
    data: token.isNFT
      ? nftBalance?.ok
        ? nftBalance.balance
        : 0
      : erc20Balance,
    isLoading:
      erc20BalanceStatus === "fetching" || nftBalanceStatus === "loading",
  };
};
