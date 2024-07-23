import type { NetworkInfo } from "@sushiswap/tines";
import {
  ConstantProductRPool,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
} from "@sushiswap/tines";
import { parseUnits } from "viem";

import type { AddressString, PoolToken } from "~/types";
import { aprToApy } from "./apr";
import { formatAmount, formatTokenAmount, formatUSD } from "./currency";
import { bigIntToNumber } from "./number";
import type { Pool } from "./pools.server";
import { tokenToRToken } from "./tokens";

export const quote = (amountA: bigint, reserveA: bigint, reserveB: bigint) =>
  reserveA > 0 ? (amountA * reserveB) / reserveA : 0n;

export const getLpCountForTokens = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint,
) => (reserve > 0 ? (amount * totalSupply) / reserve : 0n);

export const getTokenCountForLp = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint,
) => (totalSupply > 0 ? (amount * reserve) / totalSupply : 0n);

export const getAmountMax = (amount: bigint, slippage: number) =>
  amount + (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;

export const getAmountMin = (amount: bigint, slippage: number) =>
  amount - (amount * BigInt(Math.ceil(slippage * 1000))) / 1000n;

export const createSwapRoute = (
  tokenIn: PoolToken,
  tokenOut: PoolToken | null,
  pools: Pool[],
  amount: bigint,
  isExactOut: boolean,
) => {
  if (amount <= 0 || !tokenOut) {
    return undefined;
  }

  const rTokenIn = tokenToRToken(tokenIn);
  const rTokenOut = tokenToRToken(tokenOut);
  const rPools = pools.map(
    ({ id, token0, token1, reserve0, reserve1, totalFee }) => {
      return new ConstantProductRPool(
        id as AddressString,
        tokenToRToken(token0),
        tokenToRToken(token1),
        Number(totalFee ?? 0),
        parseUnits(reserve0.toString(), token0.decimals),
        parseUnits(reserve1.toString(), token0.decimals),
      );
    },
  );
  const networks: NetworkInfo[] = [
    {
      baseToken: {
        name: "ETH",
        symbol: "ETH",
        address: "0x0",
        decimals: 18,
      },
      gasPrice: 0,
    },
  ];

  if (isExactOut) {
    return findMultiRouteExactOut(
      rTokenIn,
      rTokenOut,
      amount,
      rPools,
      networks,
    );
  }

  return findMultiRouteExactIn(rTokenIn, rTokenOut, amount, rPools, networks);
};

export const getPoolAPY = (pool: Pool) => {
  const volume1w = pool.volume1wUSD
    ? pool.volume1wUSD
    : pool.isNFTNFT || !pool.token0.isNFT
      ? pool.volume1w0
      : pool.volume1w1;
  const reserve = pool.reserveUSD
    ? pool.reserveUSD
    : pool.isNFTNFT || !pool.token0.isNFT
      ? bigIntToNumber(BigInt(pool.token0.reserve))
      : bigIntToNumber(BigInt(pool.token1.reserve));

  if (reserve === 0) {
    return 0;
  }

  const apr = ((volume1w / 7) * 365 * Number(pool.lpFee)) / reserve;
  return aprToApy(apr);
};

export const getPoolVolume24hDisplay = (pool: Pool) => {
  if (!pool.volume24hUSD) {
    if (pool.isNFTNFT || !pool.token0.isNFT) {
      return `${formatAmount(pool.volume24h0)} ${pool.token0.symbol}`;
    }

    return `${formatAmount(pool.volume24h1)} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.volume24hUSD);
};

export const getPoolReserveDisplay = (pool: Pool) => {
  if (!pool.reserveUSD) {
    if (pool.isNFTNFT || !pool.token0.isNFT) {
      return `${formatTokenAmount(BigInt(pool.token0.reserve) * 2n)} ${pool.token0.symbol}`;
    }

    return `${formatTokenAmount(BigInt(pool.token1.reserve) * 2n)} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.reserveUSD);
};

export const getPoolFeesDisplay = (pool: Pool) => {
  const fee = Number(pool.lpFee);
  if (!pool.volumeUSD) {
    if (pool.isNFTNFT || !pool.token0.isNFT) {
      return `${formatAmount(pool.volume0 * fee)} ${pool.token0.symbol}`;
    }

    return `${formatAmount(pool.volume1 * fee)} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.volumeUSD * fee);
};

export const getPoolFees24hDisplay = (pool: Pool) => {
  const fee = Number(pool.lpFee);
  if (!pool.volume24hUSD) {
    if (pool.isNFTNFT || !pool.token0.isNFT) {
      return `${formatAmount(pool.volume24h0 * fee)} ${pool.token0.symbol}`;
    }

    return `${formatAmount(pool.volume24h1 * fee)} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.volume24hUSD * fee);
};
