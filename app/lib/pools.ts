import { BigNumber } from "@ethersproject/bignumber";
import {
  ConstantProductRPool,
  findMultiRouteExactIn,
  findMultiRouteExactOut,
} from "@sushiswap/tines";
import { parseUnits } from "viem";

import type { Pool } from "./pools.server";
import type { PoolToken } from "./tokens.server";
import type { NumberString, Optional } from "~/types";

export const quote = (amountA: bigint, reserveA: bigint, reserveB: bigint) =>
  reserveA > 0 ? (amountA * reserveB) / reserveA : BigInt(0);

export const getLpCountForTokens = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint
) => (reserve > 0 ? (amount * totalSupply) / reserve : BigInt(0));

export const getTokenCountForLp = (
  amount: bigint,
  reserve: bigint,
  totalSupply: bigint
) => (totalSupply > 0 ? (amount * reserve) / totalSupply : BigInt(0));

export const getAmountMax = (amount: bigint, slippage: number) =>
  amount + (amount * BigInt(slippage * 1000)) / BigInt(1000);

export const getAmountMin = (amount: bigint, slippage: number) =>
  amount - (amount * BigInt(slippage * 1000)) / BigInt(1000);

export const createSwapRoute = (
  tokenIn: PoolToken,
  tokenOut: Optional<PoolToken>,
  pools: Pool[],
  amount: bigint,
  isExactOut: boolean
) => {
  if (!tokenOut) {
    return undefined;
  }

  const rTokenIn = {
    name: tokenIn.name,
    symbol: tokenIn.symbol,
    address: tokenIn.id,
  };
  const rTokenOut = {
    name: tokenOut.name,
    symbol: tokenOut.symbol,
    address: tokenOut.id,
  };
  const rPools = pools.map(
    ({ id, token0, token1, reserve0, reserve1, totalFee }) => {
      return new ConstantProductRPool(
        id,
        {
          name: token0.name,
          symbol: token0.symbol,
          address: token0.id,
        },
        {
          name: token1.name,
          symbol: token1.symbol,
          address: token1.id,
        },
        Number(totalFee ?? 0),
        BigNumber.from(parseUnits(reserve0 as NumberString, token0.decimals)),
        BigNumber.from(parseUnits(reserve1 as NumberString, token0.decimals))
      );
    }
  );
  const networks = [
    {
      baseToken: {
        name: "ETH",
        symbol: "ETH",
        address: "0x0",
      },
      gasPrice: 0,
    },
  ];

  const amountBN = BigNumber.from(amount.toString());

  if (isExactOut) {
    return findMultiRouteExactOut(
      rTokenIn,
      rTokenOut,
      amountBN,
      rPools,
      networks
    );
  }

  return findMultiRouteExactIn(rTokenIn, rTokenOut, amountBN, rPools, networks);
};
