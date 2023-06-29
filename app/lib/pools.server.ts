import { parseUnits } from "viem";

import { createPoolToken } from "./tokens.server";
import type { NumberString, Pair, TroveCollectionMapping } from "~/types";

const getPoolAPY = (volume1w: number, reserveUSD: number) => {
  const apr = ((volume1w / 7) * 365 * 0.0025) / reserveUSD;
  return ((1 + apr / 100 / 3650) ** 3650 - 1) * 100;
};

export const createPoolFromPair = (
  pair: Pair,
  collections: TroveCollectionMapping,
  magicUSD: number,
  reserves?: [bigint, bigint]
) => {
  const token0 = createPoolToken(pair.token0, collections, magicUSD);
  const token1 = createPoolToken(pair.token1, collections, magicUSD);
  const poolToken0 = {
    ...token0,
    reserve: (
      reserves?.[0] ??
      parseUnits(pair.reserve0 as NumberString, token0.decimals)
    ).toString(),
  };
  const poolToken1 = {
    ...token1,
    reserve: (
      reserves?.[1] ??
      parseUnits(pair.reserve1 as NumberString, token1.decimals)
    ).toString(),
  };
  const switchTokens =
    (!poolToken0.isNFT && poolToken1.isNFT) || poolToken0.isMAGIC;
  const baseToken = switchTokens ? poolToken1 : poolToken0;
  const quoteToken = switchTokens ? poolToken0 : poolToken1;
  const reserveUSD = Number(pair.reserveUSD);
  const volume24h = Number(pair.dayData[0]?.volumeUSD ?? 0);
  const volume1w = pair.dayData.reduce(
    (total, { volumeUSD }) => total + Number(volumeUSD),
    0
  );
  return {
    ...pair,
    name: `${baseToken.symbol} / ${quoteToken.symbol}`,
    token0: poolToken0,
    token1: poolToken1,
    baseToken,
    quoteToken,
    hasNFT: baseToken.isNFT || quoteToken.isNFT,
    isNFTNFT: baseToken.isNFT && quoteToken.isNFT,
    reserveUSD,
    volume24h,
    volume1w,
    apy: getPoolAPY(volume1w, reserveUSD),
    feesUSD: Number(pair.volumeUSD) * Number(pair.lpFee),
    fees24h: volume24h * Number(pair.lpFee),
  };
};

export type Pool = ReturnType<typeof createPoolFromPair>;
