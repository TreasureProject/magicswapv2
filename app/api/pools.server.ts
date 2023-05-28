import type { ExecutionResult } from "graphql";

import type {
  getPairQuery,
  getPairTransactionsQuery,
  getPairsQuery,
} from "../../.graphclient";
import {
  execute,
  getPairDocument,
  getPairTransactionsDocument,
  getPairsDocument,
} from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import { fetchTroveTokens } from "./tokens.server";
import { cachified } from "~/lib/cache.server";
import type { Pool } from "~/lib/pools.server";
import { createPoolFromPair } from "~/lib/pools.server";
import {
  getTokenCollectionAddresses,
  getTokenReserveItemIds,
  itemToTroveTokenItem,
} from "~/lib/tokens.server";
import type { Pair } from "~/types";

const getPairCollectionAddresses = (pair: Pair) => [
  ...new Set([
    ...getTokenCollectionAddresses(pair.token0),
    ...getTokenCollectionAddresses(pair.token1),
  ]),
];

export const fetchPoolTroveTokens = (pool: Pool[]) =>
  fetchTroveTokens([
    ...new Set([
      ...pool.flatMap((pool) => [
        ...new Set([
          ...getTokenReserveItemIds(pool.token0),
          ...getTokenReserveItemIds(pool.token1),
        ]),
      ]),
    ]),
  ]);

export const fetchTransactions = async (pool: Pool) => {
  const result = (await execute(getPairTransactionsDocument, {
    id: pool.id,
  })) as ExecutionResult<getPairTransactionsQuery>;
  const { transactions = [] } = result.data ?? {};

  const tokens = await fetchTroveTokens([
    ...new Set([
      ...transactions.flatMap((transaction) => [
        ...(transaction.items0?.map(
          ({ collection, tokenId }) => `${collection.id}/${tokenId}`
        ) ?? []),
        ...(transaction.items1?.map(
          ({ collection, tokenId }) => `${collection.id}/${tokenId}`
        ) ?? []),
      ]),
    ]),
  ]);

  return transactions.map(({ items0, items1, ...transaction }) => ({
    ...transaction,
    items0: items0?.map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
    items1: items1?.map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
  }));
};

export type PoolTransaction = Awaited<
  ReturnType<typeof fetchTransactions>
>[number];
export type PoolTransactionType = PoolTransaction["type"];
export type PoolTransactionItem = PoolTransaction["items0"][number];

export const createPoolsFromPairs = async (pairs: Pair[]) => {
  const [collections, magicUSD] = await Promise.all([
    fetchTroveCollections([
      ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
    ]),
    fetchMagicUSD(),
  ]);
  return pairs.map((pair) => createPoolFromPair(pair, collections, magicUSD));
};

export const fetchPools = async () =>
  cachified({
    key: "pools",
    async getFreshValue() {
      const result = (await execute(
        getPairsDocument,
        {}
      )) as ExecutionResult<getPairsQuery>;
      const { pairs = [] } = result.data ?? {};
      return createPoolsFromPairs(pairs);
    },
  });

export const fetchPool = async (id: string) =>
  cachified({
    key: `pool-${id}`,
    async getFreshValue() {
      const result = (await execute(getPairDocument, {
        id,
      })) as ExecutionResult<getPairQuery>;
      const pair = result.data?.pair;
      if (!pair) {
        return undefined;
      }

      const [collections, magicUSD] = await Promise.all([
        fetchTroveCollections(getPairCollectionAddresses(pair)),
        fetchMagicUSD(),
      ]);
      return createPoolFromPair(pair, collections, magicUSD);
    },
  });
