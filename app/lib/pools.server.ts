import { parseUnits } from "viem";

import { createPoolToken } from "./tokens.server";
import type {
  NumberString,
  Pair,
  TroveCollectionMapping,
  TroveTokenMapping,
} from "~/types";

export const createPoolFromPair = (
  pair: Pair,
  collectionMapping: TroveCollectionMapping,
  tokenMapping: TroveTokenMapping,
  magicUSD: number,
  reserves?: [bigint, bigint]
) => {
  const token0 = {
    ...createPoolToken(pair.token0, collectionMapping, tokenMapping, magicUSD),
    reserve: (
      reserves?.[0] ??
      parseUnits(pair.reserve0 as NumberString, Number(pair.token0.decimals))
    ).toString(),
  };
  const token1 = {
    ...createPoolToken(pair.token1, collectionMapping, tokenMapping, magicUSD),
    reserve: (
      reserves?.[1] ??
      parseUnits(pair.reserve1 as NumberString, Number(pair.token1.decimals))
    ).toString(),
  };

  const reserveUSD = Number(pair.reserveUSD);
  const dayTime = Math.floor(Date.now() / 1000) - 60 * 60 * 24;
  const dayData = pair.dayData.find(({ date }) => Number(date) >= dayTime);
  const weekTime = Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 7;
  const weekData = pair.dayData.filter(({ date }) => Number(date) >= weekTime);
  return {
    ...pair,
    name: `${token0.symbol} / ${token1.symbol}`,
    token0,
    token1,
    hasNFT: token0.isNFT || token1.isNFT,
    isNFTNFT: token0.isNFT && token1.isNFT,
    reserveUSD,
    volume0: Number(pair.volume0),
    volume1: Number(pair.volume1),
    volumeUSD: Number(pair.volumeUSD),
    volume24h0: Number(dayData?.volume0 ?? 0),
    volume24h1: Number(dayData?.volume1 ?? 0),
    volume24hUSD: Number(dayData?.volumeUSD ?? 0),
    volume1w0: weekData.reduce(
      (total, { volume0 }) => total + Number(volume0),
      0
    ),
    volume1w1: weekData.reduce(
      (total, { volume1 }) => total + Number(volume1),
      0
    ),
    volume1wUSD: weekData.reduce(
      (total, { volumeUSD }) => total + Number(volumeUSD),
      0
    ),
  };
};

export type Pool = ReturnType<typeof createPoolFromPair>;
