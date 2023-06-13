import type { HTMLAttributes } from "react";

import type { SwapRoute } from "~/hooks/useSwapRoute";
import { formatAmount, formatTokenAmount } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { cn } from "~/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  swapRoute: SwapRoute;
  isExactOut: boolean;
  amountInMax: bigint;
  amountOutMin: bigint;
};

export const SwapRoutePanel = ({
  swapRoute: {
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    priceImpact,
    derivedValue,
    lpFee,
    protocolFee,
    royaltiesFee,
  },
  isExactOut,
  amountInMax,
  amountOutMin,
  className,
}: Props) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-night-800 p-4 text-sm text-night-400",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span>
          <span className="font-medium text-honey-25">1</span>{" "}
          {tokenOut?.symbol} ={" "}
          <span className="font-medium text-honey-25">
            {formatAmount(derivedValue)}
          </span>{" "}
          {tokenIn.symbol}
        </span>
      </div>
      {amountIn > 0 && amountOut > 0 ? (
        <ul className="mt-2.5 space-y-1">
          <li className="flex items-center justify-between">
            Price impact
            <span className={getPriceImpactClassName(priceImpact)}>
              -{formatPercent(priceImpact)}
            </span>
          </li>
          {lpFee > 0 && (
            <li className="flex items-center justify-between">
              Liquidity provider fee
              <span>{formatPercent(lpFee)}</span>
            </li>
          )}
          {protocolFee > 0 && (
            <li className="flex items-center justify-between">
              Protocol fee
              <span>{formatPercent(protocolFee)}</span>
            </li>
          )}
          {royaltiesFee > 0 && (
            <li className="flex items-center justify-between">
              Royalties fee
              <span>{formatPercent(royaltiesFee)}</span>
            </li>
          )}
          {isExactOut ? (
            <li className="flex items-center justify-between">
              Maximum spent
              <span>
                {formatTokenAmount(amountInMax, tokenIn.decimals)}{" "}
                {tokenIn.symbol}
              </span>
            </li>
          ) : (
            <li className="flex items-center justify-between">
              Minimum received
              <span>
                {formatTokenAmount(amountOutMin, tokenOut?.decimals)}{" "}
                {tokenOut?.symbol}
              </span>
            </li>
          )}
        </ul>
      ) : null}
    </div>
  );
};

const getPriceImpactClassName = (priceImpact: number) =>
  priceImpact >= 0.05
    ? "text-red-500"
    : priceImpact > 0.01
    ? "text-amber-500"
    : "text-honey-25";
