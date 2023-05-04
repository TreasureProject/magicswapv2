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
} from "~/lib/pairs.server";
import { createPoolFromPair } from "~/lib/pools.server";
import type { Pair } from "~/types";

export const createPoolsFromPairs = async (pairs: Pair[]) => {
  const [collections, tokens, magicUSD] = await Promise.all([
    fetchTroveCollections([
      ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
    ]),
    fetchTroveTokens([
      ...new Set(pairs.flatMap((pair) => getPairReserveItemAddresses(pair))),
    ]),
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
    fetchTroveTokens(getPairReserveItemAddresses(pair)),
    fetchMagicUSD(),
  ]);
  return createPoolFromPair(pair, collections, tokens, magicUSD);
};
