import type { ExecutionResult } from "graphql";

import type { getPairQuery, getPairsQuery } from "../../.graphclient";
import { getPairDocument } from "../../.graphclient";
import { execute, getPairsDocument } from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchTokenPrices, fetchTroveTokens } from "./tokens.server";
import {
  getPairCollectionAddresses,
  getPairERC20Addresses,
  getPairReserveItemAddresses,
} from "~/lib/pairs.server";
import { createPoolFromPair } from "~/lib/pools.server";
import type { Pair } from "~/types";

export const createPoolsFromPairs = async (pairs: Pair[]) => {
  const [collections, tokens, erc20Prices] = await Promise.all([
    fetchTroveCollections([
      ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
    ]),
    fetchTroveTokens([
      ...new Set(pairs.flatMap((pair) => getPairReserveItemAddresses(pair))),
    ]),
    fetchTokenPrices([
      ...new Set(pairs.flatMap((pair) => getPairERC20Addresses(pair))),
    ]),
  ]);
  return pairs.map((pair) =>
    createPoolFromPair(pair, collections, tokens, erc20Prices)
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

  const [collections, tokens, erc20Prices] = await Promise.all([
    fetchTroveCollections(getPairCollectionAddresses(pair)),
    fetchTroveTokens(getPairReserveItemAddresses(pair)),
    fetchTokenPrices(getPairERC20Addresses(pair)),
  ]);
  return createPoolFromPair(pair, collections, tokens, erc20Prices);
};
