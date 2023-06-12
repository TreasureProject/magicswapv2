import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "viem";

import { sumArray } from "~/lib/array";
import { createSwapRoute } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString, NumberString } from "~/types";

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

  const {
    amountInBN = BigNumber.from(0),
    amountOutBN = BigNumber.from(0),
    legs = [],
    priceImpact = 0,
  } = createSwapRoute(
    tokenIn,
    tokenOut,
    pools,
    amountBI > 0 ? amountBI : BigInt(1),
    isExactOut
  ) ?? {};

  const amountIn = BigInt(amountInBN.toString());
  const amountOut = BigInt(amountOutBN.toString());

  const tokenInPoolId = legs.find(
    ({ tokenFrom }) => tokenFrom.address === tokenIn.id
  )?.poolAddress;
  const tokenOutPoolId = tokenOut
    ? legs.find(({ tokenTo }) => tokenTo.address === tokenOut.id)?.poolAddress
    : undefined;
  const tokenInPool = pools.find(({ id }) => id === tokenInPoolId);
  const tokenOutPool = tokenOutPoolId
    ? pools.find(({ id }) => id === tokenOutPoolId)
    : undefined;
  const routeTokenIn =
    (tokenIn.id === tokenInPool?.token0.id
      ? tokenInPool.token0
      : tokenInPool?.token1) ?? tokenIn;
  const routeTokenOut =
    (tokenOut && tokenOut.id === tokenOutPool?.token0.id
      ? tokenOutPool.token0
      : tokenOutPool?.token1) ?? tokenOut;
  const legPools = legs
    .map(({ poolAddress }) => pools.find(({ id }) => id === poolAddress))
    .filter((pool) => !!pool) as Pool[];
  const lpFee = sumArray(legPools.map(({ lpFee }) => Number(lpFee ?? 0)));
  const protocolFee = sumArray(
    legPools.map(({ protocolFee }) => Number(protocolFee ?? 0))
  );
  const royaltiesFee = sumArray(
    legPools.map(({ royaltiesFee }) => Number(royaltiesFee ?? 0))
  );

  return {
    amountIn,
    amountOut,
    tokenIn: routeTokenIn,
    tokenOut: routeTokenOut || undefined,
    legs,
    path: legs.flatMap(({ tokenFrom, tokenTo }, i) =>
      i === legs.length - 1
        ? [tokenFrom.address as AddressString, tokenTo.address as AddressString]
        : (tokenFrom.address as AddressString)
    ),
    priceImpact,
    lpFee,
    protocolFee,
    royaltiesFee,
  };
};
