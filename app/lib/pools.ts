import { Decimal } from "decimal.js-light";

export const getAmountOut = (
  amountIn: string,
  reserveIn: number | undefined,
  reserveOut: number | undefined
) => {
  const parsedAmountIn = Number(amountIn);
  if (Number.isNaN(parsedAmountIn) || parsedAmountIn === 0) {
    return "0";
  }

  const totalFee = 0;
  const amountInWithFee = new Decimal(amountIn).mul(10000 - totalFee);
  const numerator = amountInWithFee.mul(reserveOut ?? 0);
  const denominator = new Decimal(reserveIn ?? 0)
    .mul(10000)
    .add(amountInWithFee);
  return denominator.gt(0) ? numerator.div(denominator).toString() : "0";
};

export const getAmountIn = (
  amountOut: string,
  reserveIn: number | undefined,
  reserveOut: number | undefined
) => {
  const parsedAmountOut = Number(amountOut);
  if (Number.isNaN(parsedAmountOut) || parsedAmountOut === 0) {
    return "0";
  }

  const totalFee = 0;
  const numerator = new Decimal(reserveIn ?? 0).mul(amountOut).mul(10000);
  const denominator = new Decimal(reserveOut ?? 0)
    .sub(amountOut)
    .mul(10000 - totalFee);
  return denominator.gt(0) ? numerator.div(denominator).add(1).toString() : "0";
};

export const quote = (
  amountBase: string,
  reserveBase: number | undefined,
  reserveQuote: number | undefined
) => {
  if (Number.isNaN(Number(amountBase))) {
    return "0";
  }

  const denominator = new Decimal(reserveBase ?? 0);
  return denominator.gt(0)
    ? new Decimal(amountBase)
        .mul(reserveQuote ?? 0)
        .div(denominator)
        .toString()
    : "0";
};

export const getLpCountForTokens = (
  amount: string,
  reserve: number | undefined,
  totalSupply: number
) => {
  if (Number.isNaN(Number(amount))) {
    return "0";
  }

  const denominator = new Decimal(reserve ?? 0);
  return denominator.gt(0)
    ? new Decimal(amount).mul(totalSupply).div(denominator).toString()
    : "0";
};

export const getTokenCountForLp = (
  amount: string,
  reserve: number | undefined,
  totalSupply: number
) => {
  if (Number.isNaN(Number(amount))) {
    return "0";
  }

  return totalSupply > 0
    ? new Decimal(amount)
        .mul(reserve ?? 0)
        .div(totalSupply)
        .toString()
    : "0";
};

export const getAmountMin = (amount: string, slippage: number) => {
  const parsedAmount = Number(amount);
  if (Number.isNaN(parsedAmount)) {
    return 0;
  }

  return parsedAmount - (parsedAmount * slippage * 1000) / 1000;
};
