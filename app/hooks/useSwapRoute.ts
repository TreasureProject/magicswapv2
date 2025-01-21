import { type Address, parseUnits } from "viem";

import { multiplyArray, sumArray } from "~/lib/array";
import { bigIntToNumber } from "~/lib/number";
import { createSwapRoute } from "~/lib/pools";
import type { NumberString, Pool, Token } from "~/types";

type Props = {
  tokenIn: Token;
  tokenOut: Token | undefined;
  pools: Pool[];
  amount: string;
  isExactOut: boolean;
};

export const useSwapRoute = ({
  tokenIn,
  tokenOut,
  pools,
  amount,
  isExactOut,
}: Props) => {
  const amountBI = parseUnits(
    amount as NumberString,
    isExactOut ? (tokenOut?.decimals ?? 18) : tokenIn.decimals,
  );
  const isSampleRoute = amountBI <= 0;

  const {
    amountInBI = 0n,
    amountOutBI = 0n,
    legs = [],
    priceImpact = 0,
  } = createSwapRoute(
    tokenIn,
    tokenOut,
    pools,
    isSampleRoute ? 1n : amountBI,
    isExactOut,
  ) ?? {};

  const poolLegs = legs
    .map((leg) => {
      const pool = pools.find((pool) => pool.address === leg.poolAddress);
      if (!pool) {
        return undefined;
      }

      const [tokenFrom, reserveFrom] =
        pool.token0Address === leg.tokenFrom.address
          ? [pool.token0, BigInt(pool.reserve0)]
          : [pool.token1, BigInt(pool.reserve1)];
      const [tokenTo, reserveTo] =
        pool.token0Address === leg.tokenTo.address
          ? [pool.token0, BigInt(pool.reserve0)]
          : [pool.token1, BigInt(pool.reserve1)];

      return {
        ...pool,
        tokenFrom,
        reserveFrom,
        tokenTo,
        reserveTo,
      };
    })
    .filter((leg) => !!leg);

  const isValid =
    poolLegs.length > 0 &&
    new Set(poolLegs.map(({ version }) => version)).size === 1 &&
    new Set(poolLegs.map(({ chainId }) => chainId)).size === 1;
  return {
    isValid,
    version: isValid ? poolLegs[0]?.version : undefined,
    amountIn: isSampleRoute ? 0n : amountInBI,
    amountOut: isSampleRoute ? 0n : amountOutBI,
    tokenIn: poolLegs[0]?.tokenFrom ?? tokenIn,
    tokenOut: poolLegs[poolLegs.length - 1]?.tokenTo ?? tokenOut ?? undefined,
    reserveIn: poolLegs[0]?.reserveFrom ?? 0n,
    reserveOut: poolLegs[poolLegs.length - 1]?.reserveTo ?? 0n,
    path: poolLegs.flatMap(({ tokenFrom, tokenTo }, i) =>
      i === poolLegs.length - 1
        ? [tokenFrom.address as Address, tokenTo.address as Address]
        : (tokenFrom.address as Address),
    ),
    priceImpact,
    derivedValue: multiplyArray(
      poolLegs.map(
        ({ tokenFrom, reserveFrom, tokenTo, reserveTo }) =>
          bigIntToNumber(reserveFrom, tokenFrom.decimals) /
          bigIntToNumber(reserveTo, tokenTo.decimals),
      ),
    ),
    lpFee: sumArray(poolLegs.map((leg) => leg.lpFee)),
    protocolFee: sumArray(poolLegs.map((leg) => leg.protocolFee)),
    royaltiesFee: sumArray(poolLegs.map((leg) => leg.royaltiesFee)),
  };
};

export type SwapRoute = ReturnType<typeof useSwapRoute>;
