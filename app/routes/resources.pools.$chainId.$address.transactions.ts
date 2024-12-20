import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { fetchPoolTransactions } from "~/api/pools.server";
import type { transactionType as TransactionType } from ".graphclient";

const createErrorResponse = (error: string) =>
  json({ ok: false, error } as const);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { chainId, address } = params;
  invariant(chainId, "Chain ID required");
  invariant(address, "Pool address required");

  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const resultsPerPage = url.searchParams.get("resultsPerPage");
  const type = url.searchParams.get("type");

  try {
    const results = await fetchPoolTransactions({
      chainId: Number(chainId),
      address,
      page: page ? Number(page) : undefined,
      resultsPerPage: resultsPerPage ? Number(resultsPerPage) : undefined,
      type: type ? (type as TransactionType) : undefined,
    });
    return json({ ok: true, results } as const);
  } catch (err) {
    return createErrorResponse((err as Error).message);
  }
};

export type FetchPoolTransactions = typeof loader;
