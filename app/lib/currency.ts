import { formatUnits } from "viem";

export const formatUSD = (value: number | string) =>
  `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatCurrencyString = (value: string, significantDigits = 8) => {
  let formatted = value;
  const truncateAmount = formatted.startsWith("0.")
    ? significantDigits + 2
    : significantDigits + 1;
  if (formatted.includes(".") && formatted.length > truncateAmount) {
    formatted = formatted.slice(0, truncateAmount);
    if (formatted.endsWith(".")) {
      formatted = formatted.slice(0, -1);
    }
  }

  return Number(formatted).toLocaleString("en-US", {
    maximumFractionDigits: significantDigits,
  });
};

export const formatBigInt = (
  value: bigint,
  decimals = 18,
  significantDigits = 8
) => formatCurrencyString(formatUnits(value, decimals), significantDigits);
