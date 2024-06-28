import type { NetworkInfo } from "@sushiswap/tines";
import {
  ConstantProductRPool,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
} from "@sushiswap/tines";
import { parseUnits } from "viem";

import type { Pool } from "./pools.server";
import { tokenToRToken } from "./tokens";
import type { AddressString, NumberString, PoolToken } from "~/types";

export const quote = (amountA: bigint, reserveA: bigint, reserveB: bigint) =>
  reserveA > 0 ? (amountA * reserveB) / reserveA : 0n;

export const getLpCountForTokens = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint
) => (reserve > 0 ? (amount * totalSupply) / reserve : 0n);

export const getTokenCountForLp = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint
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
  isExactOut: boolean
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
        parseUnits(reserve0 as NumberString, token0.decimals),
        parseUnits(reserve1 as NumberString, token0.decimals)
      );
    }
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
      networks
    );
  }

  return findMultiRouteExactIn(rTokenIn, rTokenOut, amount, rPools, networks);
};
