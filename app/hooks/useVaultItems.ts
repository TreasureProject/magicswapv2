import { useEffect, useState } from "react";
import { useFetcher } from "react-router";

import type { TokenWithAmount } from "~/api/tokens.server";
import type { FetchVaultItems } from "~/routes/resources.vaults.$chainId.$address.items";

type Props = {
  type: "reserves" | "inventory";
  chainId: number;
  vaultAddress: string;
  userAddress?: string;
  resultsPerPage?: number;
  enabled?: boolean;
};

const DEFAULT_STATE = {
  results: [],
  page: 1,
  hasNextPage: false,
  isLoading: false,
  error: undefined,
};

export const useVaultItems = ({
  type,
  chainId,
  vaultAddress,
  userAddress,
  resultsPerPage = 25,
  enabled = true,
}: Props) => {
  const { load, state, data } = useFetcher<FetchVaultItems>();
  const [{ results, page, hasNextPage, isLoading, error }, setState] =
    useState<{
      results: TokenWithAmount[];
      page: number;
      hasNextPage: boolean;
      isLoading: boolean;
      error: string | undefined;
    }>(DEFAULT_STATE);

  useEffect(() => {
    if (data?.ok) {
      setState((curr) => ({
        ...curr,
        results:
          curr.page === 1 ? data.results : [...curr.results, ...data.results],
        hasNextPage: data.results.length === resultsPerPage,
        isLoading: false,
        error: undefined,
      }));
    } else if (data?.error) {
      setState({ ...DEFAULT_STATE, error: data.error });
    }
  }, [data, resultsPerPage]);

  useEffect(() => {
    if (enabled) {
      const params = new URLSearchParams({
        type,
        page: page.toString(),
        resultsPerPage: resultsPerPage.toString(),
      });

      if (type === "inventory" && userAddress) {
        params.set("address", userAddress);
      }

      setState((curr) => ({ ...curr, isLoading: true }));
      load(
        `/resources/vaults/${chainId}/${vaultAddress}/items?${params.toString()}`,
      );
    } else {
      setState(DEFAULT_STATE);
    }
  }, [
    enabled,
    type,
    chainId,
    vaultAddress,
    userAddress,
    page,
    resultsPerPage,
    load,
  ]);

  return {
    isLoading: isLoading || state === "loading",
    results,
    page,
    hasNextPage,
    loadNextPage: () =>
      setState((curr) => ({ ...curr, isLoading: true, page: curr.page + 1 })),
    refetch: () => setState({ ...DEFAULT_STATE, isLoading: true }),
    error,
  };
};
