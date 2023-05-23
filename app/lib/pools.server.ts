import { parseUnits } from "viem";

import { createPoolToken, itemToTroveTokenItem } from "./tokens.server";
import type {
  NumberString,
  Pair,
  TroveCollectionMapping,
  TroveTokenMapping,
} from "~/types";

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
    reserveBI: parseUnits(
      pair.reserve0 as NumberString,
      token0.decimals
    ).toString(),
  };
  const poolToken1 = {
    ...token1,
    priceUSD: token1PriceUSD,
    reserve: reserve1,
    reserveBI: parseUnits(
      pair.reserve1 as NumberString,
      token1.decimals
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
    reserveUSD,
    transactions: pair.transactions.map(
      ({ items0, items1, ...transaction }) => ({
        ...transaction,
        items0: items0?.map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
        items1: items1?.map((item) => itemToTroveTokenItem(item, tokens)) ?? [],
      })
    ),
    volume24h,
    volume1w,
    apy: getPoolAPY(volume1w, reserveUSD),
    feesUSD: Number(pair.volumeUSD) * Number(pair.lpFee),
    fees24h: volume24h * Number(pair.lpFee),
  };
};

export type Pool = ReturnType<typeof createPoolFromPair>;

export type PoolTransactionType = Pool["transactions"][number]["type"];

export type PoolTransactionItem =
  Pool["transactions"][number]["items0"][number];
