import type { ExecutionResult } from "graphql";

import type { getPairQuery, getPairsQuery } from "../../.graphclient";
import { getPairDocument } from "../../.graphclient";
import { execute, getPairsDocument } from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import { fetchTroveTokens } from "./tokens.server";
import {
  getPairCollectionAddresses,
  getPairReserveItemAddresses,
  getPairTransactionItemAddresses,
} from "~/lib/pairs.server";
import { createPoolFromPair } from "~/lib/pools.server";
import type { Pair } from "~/types";

const fetchPairsTroveTokens = (pairs: Pair[]) =>
  fetchTroveTokens([
    ...new Set([
      ...pairs.flatMap((pair) => getPairReserveItemAddresses(pair)),
      ...pairs.flatMap((pair) => getPairTransactionItemAddresses(pair)),
    ]),
  ]);

export const createPoolsFromPairs = async (pairs: Pair[]) => {
  const [collections, tokens, magicUSD] = await Promise.all([
    fetchTroveCollections([
      ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
    ]),
    fetchPairsTroveTokens(pairs),
    fetchMagicUSD(),
  ]);
  return pairs.map((pair) =>
    createPoolFromPair(pair, collections, tokens, magicUSD)
  );
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

  const [collections, tokens, magicUSD] = await Promise.all([
    fetchTroveCollections(getPairCollectionAddresses(pair)),
    fetchPairsTroveTokens([pair]),
    fetchMagicUSD(),
  ]);
  return createPoolFromPair(pair, collections, tokens, magicUSD);
};
