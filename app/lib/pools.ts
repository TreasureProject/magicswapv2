import type { PoolToken } from "./tokens.server";

export const getAmountOut = (
  amountIn: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  totalFee = 0
) => {
  const amountInWithFee = amountIn * BigInt(10000 - totalFee);
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * BigInt(10000) + amountInWithFee;
  return denominator > 0 ? numerator / denominator : BigInt(0);
};

export const getAmountIn = (
  amountOut: bigint,
  reserveIn: bigint,
  reserveOut: bigint,
  totalFee = 0
) => {
  const numerator = reserveIn * amountOut * BigInt(10000);
  const denominator = (reserveOut - amountOut) * BigInt(10000 - totalFee);
  return denominator > 0 ? numerator / denominator + BigInt(1) : BigInt(0);
};

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

export const getPriceImpact = (
  tokenIn: PoolToken,
  tokenOut: PoolToken,
  amountIn: number,
  amountOut: number,
  isExactOut: boolean
) => {
  if (isExactOut) {
    return 1 - (amountOut * (tokenIn.reserve / tokenOut.reserve)) / amountIn;
  }

  return 1 - amountOut / (amountIn * (tokenOut.reserve / tokenIn.reserve));
};
