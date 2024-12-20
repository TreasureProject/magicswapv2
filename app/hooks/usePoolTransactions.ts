import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { FetchPoolTransactions } from "~/routes/resources.pools.$chainId.$address.transactions";
import type { transactionType as TransactionType } from ".graphclient";

type Props = {
  chainId: number;
  address: string;
  type?: TransactionType;
  resultsPerPage?: number;
  enabled?: boolean;
};

const DEFAULT_STATE = {
  page: 1,
  isLoading: false,
};

export const usePoolTransactions = ({
  chainId,
  address,
  type,
  resultsPerPage = 25,
  enabled = true,
}: Props) => {
  const { load, state, data } = useFetcher<FetchPoolTransactions>();
  const [{ page, isLoading }, setState] = useState<{
    page: number;
    isLoading: boolean;
  }>(DEFAULT_STATE);
  const lastType = useRef<TransactionType | undefined>();
  const results = data?.ok ? data.results : [];
  const hasPreviousPage = page > 1;
  const hasNextPage = results.length === resultsPerPage;

  useEffect(() => {
    if (enabled) {
      if (type !== lastType.current) {
        lastType.current = type;
        setState(DEFAULT_STATE);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        resultsPerPage: resultsPerPage.toString(),
      });

      if (type) {
        params.set("type", type);
      }

      setState((curr) => ({ ...curr, isLoading: true }));
      load(
        `/resources/pools/${chainId}/${address}/transactions?${params.toString()}`,
      );
      setState((curr) => ({ ...curr, isLoading: false }));
    } else {
      setState(DEFAULT_STATE);
    }
  }, [enabled, chainId, address, type, page, resultsPerPage, load]);

  return {
    isLoading: isLoading || state === "loading",
    results,
    page,
    resultsPerPage,
    hasPreviousPage,
    hasNextPage,
    goToPreviousPage: () =>
      setState((curr) =>
        hasPreviousPage ? { ...curr, page: curr.page - 1 } : curr,
      ),
    goToNextPage: () =>
      setState((curr) =>
        hasNextPage ? { ...curr, page: curr.page + 1 } : curr,
      ),
    refetch: () => setState({ ...DEFAULT_STATE, isLoading: true }),
    error: !data?.ok ? data?.error : undefined,
  };
};
