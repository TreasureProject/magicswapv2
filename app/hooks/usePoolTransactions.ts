import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import type { FetchPoolTransactions } from "~/routes/resources.pools.$chainId.$address.transactions";
import type { transactionType as TransactionType } from ".graphclient";

type Props = {
  chainId: number;
  address: string;
  type?: TransactionType;
  limit?: number;
  enabled?: boolean;
};

const DEFAULT_STATE = {
  page: 1,
  before: undefined,
  after: undefined,
  isLoading: false,
};

export const usePoolTransactions = ({
  chainId,
  address,
  type,
  limit = 15,
  enabled = true,
}: Props) => {
  const { load, state, data } = useFetcher<FetchPoolTransactions>();
  const [{ page, before, after, isLoading }, setState] = useState<{
    page: number;
    before: string | undefined;
    after: string | undefined;
    isLoading: boolean;
  }>(DEFAULT_STATE);
  const lastType = useRef<TransactionType | undefined>();

  useEffect(() => {
    if (!enabled) {
      setState(DEFAULT_STATE);
      return;
    }

    if (type !== lastType.current) {
      lastType.current = type;
      setState(DEFAULT_STATE);
    }

    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (before) {
      params.set("before", before);
    }

    if (after) {
      params.set("after", after);
    }

    if (type) {
      params.set("type", type);
    }

    setState((curr) => ({ ...curr, isLoading: true }));
    load(
      `/resources/pools/${chainId}/${address}/transactions?${params.toString()}`,
    );
    setState((curr) => ({ ...curr, isLoading: false }));
  }, [enabled, chainId, address, type, limit, before, after, load]);

  const hasPreviousPage = data?.ok
    ? !!data.data.pageInfo?.hasPreviousPage
    : false;
  const hasNextPage = data?.ok ? !!data.data.pageInfo?.hasNextPage : false;

  return {
    isLoading: isLoading || state === "loading",
    items: data?.ok ? data.data.items : [],
    page,
    limit,
    hasPreviousPage,
    hasNextPage,
    totalCount: data?.ok ? (data.data.totalCount ?? 0) : 0,
    goToPreviousPage: () =>
      setState((curr) =>
        hasPreviousPage
          ? {
              ...curr,
              page: curr.page - 1,
              before: data?.ok
                ? data.data.pageInfo?.startCursor || undefined
                : undefined,
              after: undefined,
            }
          : curr,
      ),
    goToNextPage: () =>
      setState((curr) =>
        hasNextPage
          ? {
              ...curr,
              page: curr.page + 1,
              before: undefined,
              after: data?.ok
                ? data.data.pageInfo?.endCursor || undefined
                : undefined,
            }
          : curr,
      ),
    refetch: () => setState({ ...DEFAULT_STATE, isLoading: true }),
    error: !data?.ok ? data?.error : undefined,
  };
};
