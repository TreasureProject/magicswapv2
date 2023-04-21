import Decimal from "decimal.js-light";

export const formatUSD = (value: number | string) =>
  `$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatBalance = (value: number | string) =>
  new Decimal(value)
    .toSignificantDigits(8, Decimal.ROUND_DOWN)
    .toNumber()
    .toLocaleString("en-US");
