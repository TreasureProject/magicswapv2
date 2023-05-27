import type { ExecutionResult } from "graphql";

import type {
  getPairQuery,
  getPairsQuery,
  getTransactionQuery,
} from "../../.graphclient";
import { getTransactionDocument } from "../../.graphclient";
import { getPairDocument } from "../../.graphclient";
import { execute, getPairsDocument } from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import { fetchTroveTokens } from "./tokens.server";
import {
  getPairCollectionAddresses,
  getPairTransactionItemAddresses,
  getPoolReserveItemAddresses,
} from "~/lib/pairs.server";
import type { Pool } from "~/lib/pools.server";
import { createPoolFromPair } from "~/lib/pools.server";
import { itemToTroveTokenItem } from "~/lib/tokens.server";
import type { Pair, Transaction } from "~/types";

export const fetchPoolTroveTokens = (pool: Pool[]) =>
  fetchTroveTokens([
    ...new Set([...pool.flatMap((pool) => getPoolReserveItemAddresses(pool))]),
  ]);

export const fetchTransactionTroveTokens = (transactions: Transaction[]) => {
  return fetchTroveTokens([
    ...new Set([
      ...transactions.flatMap((transaction) =>
        getPairTransactionItemAddresses(transaction)
      ),
    ]),
  ]);
};

export const fetchTransactions = async (pool: Pool) => {
  const result = (await execute(getTransactionDocument, {
    id: pool.id,
  })) as ExecutionResult<getTransactionQuery>;
  const { transactions = [] } = result.data ?? {};

  const tokens = await fetchTransactionTroveTokens(transactions);

  return transactions.map(({ items0, items1, ...transaction }) => ({
    ...transaction,
    items0: items0?.map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
    items1: items1?.map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
  }));
};

type PoolTransaction = Awaited<ReturnType<typeof fetchTransactions>>[number];

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

export const fetchPools = async () => {
  const result = (await execute(
    getPairsDocument,
    {}
  )) as ExecutionResult<getPairsQuery>;
  const { pairs = [] } = result.data ?? {};
  return createPoolsFromPairs(pairs);
};

export const fetchPool = async (id: string) => {
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
};
