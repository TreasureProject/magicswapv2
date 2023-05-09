import { formatEther } from "@ethersproject/units";

import { createPoolToken } from "./tokens.server";
import type { PoolToken } from "./tokens.server";
import type { Pair, TroveCollectionMapping, TroveTokenMapping } from "~/types";

export const createPoolName = (token0: PoolToken, token1: PoolToken) => {
  if (token1.isNft && !token0.isNft) {
    return `${token1.symbol} / ${token0.symbol}`;
  }

  return `${token0.symbol} / ${token1.symbol}`;
};

const getPoolAPY = (volume1w: number, reserveUSD: number) => {
  const apr = ((volume1w / 7) * 365 * 0.0025) / reserveUSD;
  return ((1 + apr / 100 / 3650) ** 3650 - 1) * 100;
};

export const createPoolFromPair = (
  pair: Pair,
  collections: TroveCollectionMapping,
  tokens: TroveTokenMapping,
  magicUSD: number
) => {
  const token0 = createPoolToken(pair.token0, collections, tokens, magicUSD);
  const token1 = createPoolToken(pair.token1, collections, tokens, magicUSD);
  const reserve0 = Number(pair.reserve0);
  const reserve1 = Number(pair.reserve1);
  const token0PriceUSD =
    token0.priceUSD ||
    (reserve0 > 0 ? (reserve1 * token1.priceUSD) / reserve0 : 0);
  const token1PriceUSD =
    token1.priceUSD ||
    (reserve1 > 0 ? (reserve0 * token0.priceUSD) / reserve1 : 0);
  const poolToken0 = {
    ...token0,
    priceUSD: token0PriceUSD,
    reserve: reserve0,
  };
  const poolToken1 = {
    ...token1,
    priceUSD: token1PriceUSD,
    reserve: reserve1,
  };
  const reserveUSD = Number(pair.reserveUSD);
  const volume24h = Number(pair.dayData[0]?.volumeUSD ?? 0);
  const volume1w = pair.dayData.reduce(
    (total, { volumeUSD }) => total + Number(volumeUSD),
    0
  );
  return {
    ...pair,
    name: createPoolName(token0, token1),
    token0: poolToken0,
    token1: poolToken1,
    totalSupply: Number(formatEther(pair.totalSupply)),
    baseToken: !poolToken0.isNft && poolToken1.isNft ? poolToken1 : poolToken0,
    quoteToken: !poolToken0.isNft && poolToken1.isNft ? poolToken0 : poolToken1,
    reserveUSD,
    volume24h,
    volume1w,
    apy: getPoolAPY(volume1w, reserveUSD),
    feesUSD: Number(pair.volumeUSD) * Number(pair.lpFee),
    fees24h: volume24h * Number(pair.lpFee),
  };
};

export type Pool = ReturnType<typeof createPoolFromPair>;

export type PoolTransactionType = Pool["transactions"][number]["type"];
