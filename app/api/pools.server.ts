import type { ExecutionResult } from "graphql";

import {
  execute,
  GetPairDocument,
  GetPairTransactionsDocument,
  GetPairsDocument,
  type GetPairQuery,
  type GetPairTransactionsQuery,
  type GetPairsQuery,
} from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import { fetchTroveTokens } from "./tokens.server";
import { uniswapV2PairAbi } from "~/generated";
import { client } from "~/lib/chain.server";
import type { Pool } from "~/lib/pools.server";
import { createPoolFromPair } from "~/lib/pools.server";
import {
  getTokenCollectionAddresses,
  itemToTroveTokenItem,
} from "~/lib/tokens.server";
import type { AddressString, Pair } from "~/types";

const getPairCollectionAddresses = (pair: Pair) => [
  ...new Set([
    ...getTokenCollectionAddresses(pair.token0),
    ...getTokenCollectionAddresses(pair.token1),
  ]),
];

export const fetchTransactions = async (pool: Pool) => {
  const result = (await execute(GetPairTransactionsDocument, {
    id: pool.id,
  })) as ExecutionResult<GetPairTransactionsQuery>;
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
  const [collections, magicUSD, reserves] = await Promise.all([
    fetchTroveCollections([
      ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
    ]),
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
      collections,
      magicUSD,
      reserve?.status === "success"
        ? [reserve.result[0], reserve.result[1]]
        : undefined
    );
  });
};

export const fetchPools = async () => {
  const result = (await execute(
    GetPairsDocument,
    {}
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
