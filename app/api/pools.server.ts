import type { ExecutionResult } from "graphql";
import type { Optional, Pool } from "~/types";
import {
  getPairCollectionAddresses,
  getPairERC20Addresses,
  getPairReserveItemAddresses,
} from "~/utils/pairs.server";
import { createPoolFromPair } from "~/utils/pools.server";
import type { getPairQuery, getPairsQuery } from "../../.graphclient";
import { getPairDocument } from "../../.graphclient";
import { execute, getPairsDocument } from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchTokenPrices, fetchTroveTokens } from "./tokens.server";

export const fetchPools = async (): Promise<Pool[]> => {
  const result = (await execute(
    getPairsDocument,
    {}
  )) as ExecutionResult<getPairsQuery>;
  const { pairs = [] } = result.data ?? {};
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

export const fetchPool = async (id: string): Promise<Optional<Pool>> => {
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
