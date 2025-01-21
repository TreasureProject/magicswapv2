import {
  ConstantProductRPool,
  type NetworkInfo,
  type RToken,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
} from "@sushiswap/tines";
import type { Address } from "viem";

import type { Pool, Token } from "~/types";
import { formatAmount, formatUSD } from "./currency";

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

const tokenToRToken = ({ address, name, symbol, decimals }: Token): RToken => ({
  address,
  name,
  symbol,
  decimals,
});

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
        address as Address,
        tokenToRToken(token0),
        tokenToRToken(token1),
        lpFee + protocolFee + royaltiesFee,
        BigInt(reserve0),
        BigInt(reserve1),
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
  if (pool.volume24hUsd === 0) {
    if (pool.volume24h0 > 0 && (pool.isVaultVault || !pool.token0.isVault)) {
      return `${formatAmount(pool.volume24h0, { type: "compact" })} ${pool.token0.symbol}`;
    }

    if (pool.volume24h1 > 0) {
      return `${formatAmount(pool.volume24h1, { type: "compact" })} ${pool.token1.symbol}`;
    }
  }

  return formatUSD(pool.volume24hUsd, { notation: "compact" });
};

export const getPoolReserveDisplay = (pool: Pool) => {
  if (pool.reserveUsd === 0) {
    if (
      BigInt(pool.reserve0) > 0 &&
      (pool.isVaultVault || !pool.token0.isVault)
    ) {
      return `${formatAmount(BigInt(pool.reserve0) * 2n, { decimals: pool.token0.decimals, type: "compact" })} ${pool.token0.symbol}`;
    }

    if (BigInt(pool.reserve1) > 0) {
      return `${formatAmount(BigInt(pool.reserve1) * 2n, { decimals: pool.token1.decimals, type: "compact" })} ${pool.token1.symbol}`;
    }
  }

  return formatUSD(pool.reserveUsd, { notation: "compact" });
};

export const getPoolFees24hDisplay = (pool: Pool) => {
  const fee = pool.lpFee;
  if (pool.volume24hUsd === 0) {
    if (pool.volume24h0 > 0 && (pool.isVaultVault || !pool.token0.isVault)) {
      return `${formatAmount(pool.volume24h0 * fee, { type: "compact" })} ${pool.token0.symbol}`;
    }

    if (pool.volume24h1 > 0) {
      return `${formatAmount(pool.volume24h1 * fee, { type: "compact" })} ${pool.token1.symbol}`;
    }
  }

  return formatUSD(pool.volume24hUsd * fee, { notation: "compact" });
};
