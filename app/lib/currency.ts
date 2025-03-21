import Decimal from "decimal.js-light";
import { formatUnits } from "viem";

export const formatUSD = (
  value: number | string,
  options?: Intl.NumberFormatOptions,
) =>
  `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: Number(value) >= 1 ? 2 : undefined,
    maximumSignificantDigits:
      Number(value) < 0.1 ? 5 : Number(value) < 1 ? 4 : undefined,
    ...options,
  })}`;

export const formatAmount = (
  value: number | string | bigint,
  params?: {
    type?: "default" | "raw" | "compact";
    decimals?: number;
  },
): string => {
  const { type = "default", decimals = 18 } = params ?? {};
  if (typeof value === "bigint") {
    return formatAmount(formatUnits(value, decimals), { type });
  }

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

  const rounded = decimal.toDecimalPlaces(decimalPlaces, Decimal.ROUND_DOWN);
  if (type !== "default" && type !== "compact") {
    return rounded.toString();
  }

  return rounded.toNumber().toLocaleString("en-US", {
    notation: type === "compact" ? "compact" : "standard",
    maximumFractionDigits: decimalPlaces,
  });
};
