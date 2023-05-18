import { formatUnits, parseUnits } from "viem";

import type { NumberString } from "~/types";

export const formatNumber = (
  value: number | string,
  options?: Intl.NumberFormatOptions
) =>
  (typeof value === "string" ? parseFloat(value) : value).toLocaleString(
    "en-US",
    options
  );

export const formatPercent = (percentage: string | number, rounded = false) => {
  const number =
    (typeof percentage === "string" ? parseFloat(percentage) : percentage) *
    100;
  const shouldRound = rounded && number >= 1;
  return (
    formatNumber(shouldRound ? Math.round(number) : number, {
      minimumFractionDigits: 0,
      maximumFractionDigits: shouldRound ? 0 : 2,
    }) + "%"
  );
};

export const floorBigInt = (value: bigint, decimals = 18) =>
  parseUnits(
    Math.floor(Number(formatUnits(value, decimals))).toString() as NumberString,
    decimals
  );

export const bigIntToNumber = (value: bigint, decimals = 18) =>
  Number(formatUnits(value, decimals));
