import type { ExecutionResult } from "graphql";
import type { Pool } from "~/types";
import {
  getPairCollectionAddresses,
  getPairERC20Addresses,
} from "~/utils/pairs.server";
import { createPoolName } from "~/utils/pools.server";
import { createPoolToken } from "~/utils/tokens.server";
import type { getPairsQuery } from "../../.graphclient";
import { execute, getPairsDocument } from "../../.graphclient";
import { fetchTroveCollections } from "./collections.server";
import { fetchTokenPrices } from "./tokens.server";

export const fetchPools = async (): Promise<Pool[]> => {
  const result = (await execute(
    getPairsDocument,
    {}
  )) as ExecutionResult<getPairsQuery>;
  const { pairs = [] } = result.data ?? {};
  const collectionAddresses = [
    ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
  ];
  const erc20Addresses = [
    ...new Set(pairs.flatMap((pair) => getPairERC20Addresses(pair))),
  ];
  const [collections, erc20Prices] = await Promise.all([
    fetchTroveCollections(collectionAddresses),
    fetchTokenPrices(erc20Addresses),
  ]);
  return pairs.map((pair) => {
    const token0 = createPoolToken(pair.token0, collections, erc20Prices);
    const token1 = createPoolToken(pair.token1, collections, erc20Prices);
    const reserve0 = Number(pair.reserve0);
    const reserve1 = Number(pair.reserve1);
    const token0PriceUSD =
      token0.priceUSD ||
      (reserve0 > 0 ? (reserve1 * token1.priceUSD) / reserve0 : 0);
    const token1PriceUSD =
      token1.priceUSD ||
      (reserve1 > 0 ? (reserve0 * token0.priceUSD) / reserve1 : 0);
    return {
      id: pair.id,
      name: createPoolName(token0, token1),
      token0: {
        ...token0,
        priceUSD: token0PriceUSD,
      },
      token1: {
        ...token1,
        priceUSD: token1PriceUSD,
      },
      tvlUSD: token0PriceUSD * reserve0 * 2,
    };
  });
};
