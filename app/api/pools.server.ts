import type { ExecutionResult } from "graphql";

import { uniswapV2PairAbi } from "~/generated";
import { client } from "~/lib/chain.server";
import { createPoolFromPair } from "~/lib/pools.server";
import { itemToTroveTokenItem } from "~/lib/tokens.server";
import type { AddressString, Pair } from "~/types";
import {
  GetPairDocument,
  type GetPairQuery,
  GetPairTransactionsDocument,
  type GetPairTransactionsQuery,
  GetPairsDocument,
  type GetPairsQuery,
  type TransactionType,
  execute,
} from "../../.graphclient";
import { fetchTokensCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import { fetchTroveTokenMapping } from "./tokens.server";

export const fetchPoolTransactions = async ({
  id,
  page = 1,
  resultsPerPage = 25,
  type,
}: {
  id: string;
  page?: number;
  resultsPerPage?: number;
  type?: TransactionType;
}) => {
  const result = (await execute(GetPairTransactionsDocument, {
    pair: id,
    first: resultsPerPage,
    skip: (page - 1) * resultsPerPage,
    ...(type ? { where: { type } } : undefined),
  })) as ExecutionResult<GetPairTransactionsQuery>;
  const { pair } = result.data ?? {};
  if (!pair) {
    throw new Error(`Pair not found: ${id}`);
  }

  const transactions = pair.transactions;
  const tokens = await fetchTroveTokenMapping([
    ...new Set(
      transactions.flatMap(({ items }) =>
        items.map(({ collection, tokenId }) => `${collection.id}/${tokenId}`),
      ),
    ),
  ]);

  return transactions.map(({ items, ...transaction }) => ({
    ...transaction,
    items0:
      items
        ?.filter(({ vault }) => vault.id === pair.token0.id)
        .map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
    items1:
      items
        ?.filter(({ vault }) => vault.id === pair.token1.id)
        .map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
  }));
};

export type PoolTransaction = Awaited<
  ReturnType<typeof fetchPoolTransactions>
>[number];
export type PoolTransactionType = PoolTransaction["type"];
export type PoolTransactionItem = PoolTransaction["items0"][number];

export const createPoolsFromPairs = async (pairs: Pair[]) => {
  const [[collectionMapping, tokenMapping], magicUSD, reserves] =
    await Promise.all([
      fetchTokensCollections(
        pairs.flatMap(({ token0, token1 }) => [token0, token1]),
      ),
      fetchMagicUSD(),
      client.multicall({
        contracts: pairs.map(({ id }) => ({
          address: id as AddressString,
          abi: uniswapV2PairAbi,
          functionName: "getReserves",
        })),
      }),
    ]);
  return pairs.map((pair, i) => {
    const reserve = reserves[i] as {
      result: [bigint, bigint, number];
      status: "success" | "reverted";
    };
    return createPoolFromPair(
      pair,
      collectionMapping,
      tokenMapping,
      magicUSD,
      reserve?.status === "success"
        ? [reserve.result[0], reserve.result[1]]
        : undefined,
    );
  });
};

export const fetchPools = async () => {
  const result = (await execute(
    GetPairsDocument,
    {},
  )) as ExecutionResult<GetPairsQuery>;
  const { pairs = [] } = result.data ?? {};
  return createPoolsFromPairs(pairs);
};

export const fetchPool = async (id: string) => {
  const result = (await execute(GetPairDocument, {
    id,
  })) as ExecutionResult<GetPairQuery>;
  const pair = result.data?.pair;
  if (!pair) {
    return undefined;
  }

  const pools = await createPoolsFromPairs([pair]);
  return pools[0];
};
