import { data } from "react-router";
import invariant from "tiny-invariant";

import {
  type TransactionType,
  fetchPoolTransactions,
} from "~/api/pools.server";
import type { Route } from "./+types/resources.pools.$chainId.$address.transactions";

const createErrorResponse = (error: string) =>
  data({ ok: false, error } as const);

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { chainId, address } = params;
  invariant(chainId, "Chain ID required");
  invariant(address, "Pool address required");

  const url = new URL(request.url);
  const type = url.searchParams.get("type");

  try {
    return data({
      ok: true,
      data: await fetchPoolTransactions({
        chainId: Number(chainId),
        address,
        type: type ? (type as TransactionType) : undefined,
        limit: url.searchParams.get("limit")
          ? Number(url.searchParams.get("limit"))
          : undefined,
        after: url.searchParams.get("after") || undefined,
      }),
    } as const);
  } catch (err) {
    return createErrorResponse((err as Error).message);
  }
};

export type FetchPoolTransactions = typeof loader;
