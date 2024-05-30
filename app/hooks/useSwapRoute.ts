import { parseUnits } from "viem";

import { multiplyArray, sumArray } from "~/lib/array";
import { bigIntToNumber } from "~/lib/number";
import { createSwapRoute } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken , AddressString, NumberString } from "~/types";

type Props = {
  tokenIn: PoolToken;
  tokenOut: PoolToken | null;
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
    isExactOut ? tokenOut?.decimals ?? 18 : tokenIn.decimals
  );
  const isSampleRoute = amountBI <= 0;

  const {
    amountInBI = BigInt(0),
    amountOutBI = BigInt(0),
    legs = [],
    priceImpact = 0,
  } = createSwapRoute(
    tokenIn,
    tokenOut,
    pools,
    isSampleRoute ? BigInt(1) : amountBI,
    isExactOut
  ) ?? {};

  const poolLegs = legs
    .map(({ poolAddress, tokenFrom, tokenTo }) => {
      const pool = pools.find((pool) => pool.id === poolAddress);
      if (!pool) {
        return undefined;
      }

      return {
        ...pool,
        tokenFrom:
          pool.token0.id === tokenFrom.address
            ? pool.token0
            : pool.token1,
        tokenTo:
          pool.token0.id === tokenTo.address
            ? pool.token0
            : pool.token1,
      };
    })
    .filter((leg) => !!leg) as (Pool & {
    tokenFrom: PoolToken;
    tokenTo: PoolToken;
  })[];

  return {
    amountIn: BigInt(isSampleRoute ? 0 : amountInBI.toString()),
    amountOut: BigInt(isSampleRoute ? 0 : amountOutBI.toString()),
    tokenIn: poolLegs[0]?.tokenFrom ?? tokenIn,
    tokenOut: poolLegs[poolLegs.length - 1]?.tokenTo ?? tokenOut ?? undefined,
    legs,
    path: poolLegs.flatMap(({ tokenFrom, tokenTo }, i) =>
      i === poolLegs.length - 1
        ? [tokenFrom.id as AddressString, tokenTo.id as AddressString]
        : (tokenFrom.id as AddressString)
    ),
    priceImpact,
    derivedValue: multiplyArray(
      poolLegs.map(
        ({ tokenFrom, tokenTo }) =>
          bigIntToNumber(BigInt(tokenFrom.reserve), tokenFrom.decimals) /
          bigIntToNumber(BigInt(tokenTo.reserve), tokenTo.decimals)
      )
    ),
    lpFee: sumArray(poolLegs.map(({ lpFee }) => Number(lpFee))),
    protocolFee: sumArray(
      poolLegs.map(({ protocolFee }) => Number(protocolFee))
    ),
    royaltiesFee: sumArray(
      poolLegs.map(({ royaltiesFee }) => Number(royaltiesFee))
    ),
  };
};

export type SwapRoute = ReturnType<typeof useSwapRoute>;
