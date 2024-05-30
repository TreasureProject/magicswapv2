import { parseUnits } from "viem";

import { createPoolToken } from "./tokens.server";
import type { NumberString, Pair, TroveCollectionMapping } from "~/types";

const getPoolAPY = (volume1w: number, reserveUSD: number) => {
  if (reserveUSD === 0) {
    return 0;
  }

  const apr = ((volume1w / 7) * 365 * 0.0025) / reserveUSD;
  return ((1 + apr / 100 / 3650) ** 3650 - 1) * 100;
};

export const createPoolFromPair = (
  pair: Pair,
  collections: TroveCollectionMapping,
  magicUSD: number,
  reserves?: [bigint, bigint]
) => {
  const token0 = {
    ...createPoolToken(pair.token0, collections, magicUSD),
    reserve: (
      reserves?.[0] ??
      parseUnits(pair.reserve0 as NumberString, Number(pair.token0.decimals))
    ).toString(),
  };
  const token1 = {
    ...createPoolToken(pair.token1, collections, magicUSD),
    reserve: (
      reserves?.[1] ??
      parseUnits(pair.reserve1 as NumberString, Number(pair.token1.decimals))
    ).toString(),
  };
  const reserveUSD = Number(pair.reserveUSD);
  const volume24h = Number(pair.dayData[0]?.volumeUSD ?? 0);
  const volume1w = pair.dayData.reduce(
    (total, { volumeUSD }) => total + Number(volumeUSD),
    0
  );
  return {
    ...pair,
    name: `${token0.symbol} / ${token1.symbol}`,
    token0,
    token1,
    hasNFT: token0.isNFT || token1.isNFT,
    isNFTNFT: token0.isNFT && token1.isNFT,
    reserveUSD,
    volume24h,
    volume1w,
    apy: getPoolAPY(volume1w, reserveUSD),
    feesUSD: Number(pair.volumeUSD) * Number(pair.lpFee),
    fees24h: volume24h * Number(pair.lpFee),
  };
};

export type Pool = ReturnType<typeof createPoolFromPair>;
