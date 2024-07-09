import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";

import type { FetchVaultItems } from "~/routes/resources.vaults.$id.items";
import type { TroveToken } from "~/types";

type Props = {
  id: string;
  type: "reserves" | "inventory";
  address?: string;
  itemsPerPage?: number;
  enabled?: boolean;
};

const DEFAULT_STATE = {
  items: [],
  page: 1,
  hasNextPage: false,
  isLoading: false,
  error: undefined,
};

export const useVaultItems = ({
  id,
  type,
  address,
  itemsPerPage = 25,
  enabled = true,
}: Props) => {
  const { load, state, data } = useFetcher<FetchVaultItems>();
  const [{ items, page, hasNextPage, isLoading, error }, setState] = useState<{
    items: TroveToken[];
    page: number;
    hasNextPage: boolean;
    isLoading: boolean;
    error: string | undefined;
  }>(DEFAULT_STATE);

  useEffect(() => {
    if (data?.ok) {
      setState((curr) => ({
        ...curr,
        items:
          curr.page === 1 ? data.results : [...curr.items, ...data.results],
        hasNextPage: data.results.length === itemsPerPage,
        isLoading: false,
        error: undefined,
      }));
    } else if (data?.error) {
      setState({ ...DEFAULT_STATE, error: data.error });
    }
  }, [data, page, itemsPerPage]);

  useEffect(() => {
    if (enabled) {
      const params = new URLSearchParams({
        type,
        page: page.toString(),
        itemsPerPage: itemsPerPage.toString(),
      });

      if (type === "inventory" && address) {
        params.set("address", address);
      }

      setState((curr) => ({ ...curr, isLoading: true }));
      load(`/resources/vaults/${id}/items?${params.toString()}`);
    } else {
      setState(DEFAULT_STATE);
    }
  }, [enabled, id, type, address, page, itemsPerPage, load]);

  return {
    isLoading: isLoading || state === "loading",
    items,
    page,
    hasNextPage,
    loadNextPage: () =>
      setState((curr) => ({ ...curr, isLoading: true, page: curr.page + 1 })),
    refetch: () => setState({ ...DEFAULT_STATE, isLoading: true }),
    error,
  };
};
