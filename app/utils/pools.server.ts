import type {
  Pair,
  Pool,
  PoolToken,
  TokenPriceMapping,
  TroveCollectionMapping,
} from "~/types";
import { createPoolToken } from "./tokens.server";

export const createPoolName = (token0: PoolToken, token1: PoolToken) => {
  if (token1.isNft && !token0.isNft) {
    return `${token1.name} / ${token0.name}`;
  }

  return `${token0.name} / ${token1.name}`;
};

export const createPoolFromPair = (
  pair: Pair,
  collections: TroveCollectionMapping,
  prices: TokenPriceMapping
): Pool => {
  const token0 = createPoolToken(pair.token0, collections, prices);
  const token1 = createPoolToken(pair.token1, collections, prices);
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
};
