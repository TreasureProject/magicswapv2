import type { NetworkInfo } from "@sushiswap/tines";
import {
  ConstantProductRPool,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
} from "@sushiswap/tines";
import { parseUnits } from "viem";

import type { AddressString, Pool, Token } from "~/types";
import { formatAmount, formatUSD } from "./currency";
import { bigIntToNumber } from "./number";
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
  tokenIn: Token,
  tokenOut: Token | undefined,
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
    ({
      address,
      token0,
      token1,
      reserve0,
      reserve1,
      lpFee,
      protocolFee,
      royaltiesFee,
    }) => {
      return new ConstantProductRPool(
        address as AddressString,
        tokenToRToken(token0),
        tokenToRToken(token1),
        Number(lpFee) + Number(protocolFee) + Number(royaltiesFee),
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

export const getPoolVolume24hDisplay = (pool: Pool) => {
  if (!pool.volume24hUsd) {
    if (pool.isVaultVault || !pool.token0.isVault) {
      return `${formatAmount(pool.volume24h0, { type: "compact" })} ${pool.token0.symbol}`;
    }

    return `${formatAmount(pool.volume24h1, { type: "compact" })} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.volume24hUsd);
};

export const getPoolReserveDisplay = (pool: Pool) => {
  if (pool.reserveUsd === "0") {
    if (pool.isVaultVault || !pool.token0.isVault) {
      return `${formatAmount(BigInt(pool.reserve0) * 2n, { decimals: pool.token0.decimals, type: "compact" })} ${pool.token0.symbol}`;
    }

    return `${formatAmount(BigInt(pool.reserve1) * 2n, { decimals: pool.token1.decimals, type: "compact" })} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.reserveUsd);
};

export const getPoolFeesDisplay = (pool: Pool) => {
  const fee = Number(pool.lpFee);
  if (pool.volumeUsd === "0") {
    if (pool.isVaultVault || !pool.token0.isVault) {
      return `${formatAmount(bigIntToNumber(BigInt(pool.volume0), pool.token0.decimals) * fee, { type: "compact" })} ${pool.token0.symbol}`;
    }

    return `${formatAmount(bigIntToNumber(BigInt(pool.volume1), pool.token1.decimals) * fee, { type: "compact" })} ${pool.token1.symbol}`;
  }

  return formatUSD(Number(pool.volumeUsd) * fee);
};

export const getPoolFees24hDisplay = (pool: Pool) => {
  const fee = Number(pool.lpFee);
  if (!pool.volume24hUsd) {
    if (pool.isVaultVault || !pool.token0.isVault) {
      return `${formatAmount(pool.volume24h0 * fee, { type: "compact" })} ${pool.token0.symbol}`;
    }

    return `${formatAmount(pool.volume24h1 * fee, { type: "compact" })} ${pool.token1.symbol}`;
  }

  return formatUSD(pool.volume24hUsd * fee);
};
