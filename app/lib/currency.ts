import Decimal from "decimal.js-light";
import { formatUnits } from "viem";

export const formatUSD = (value: number | string) =>
  `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatAmount = (value: string | number) => {
  const decimal = new Decimal(value);
  let decimalPlaces: number;
  if (decimal.lt(1e-3)) {
    decimalPlaces = 6;
  } else if (decimal.lt(1)) {
    decimalPlaces = 4;
  } else if (decimal.lt(100)) {
    decimalPlaces = 3;
  } else {
    decimalPlaces = 2;
  }

  return decimal
    .toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN)
    .toNumber()
    .toLocaleString("en-US", { maximumFractionDigits: decimalPlaces });
};

export const formatTokenAmount = (value: bigint, decimals = 18) =>
  formatAmount(formatUnits(value, decimals));
