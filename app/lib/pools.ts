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
  return denominator.lte(0) ? "0" : numerator.div(denominator).toString();
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
  return denominator.lte(0)
    ? "0"
    : numerator.div(denominator).add(1).toString();
};
