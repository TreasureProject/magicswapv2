import type { Token } from "~/types";
import { sumArray } from "./array";
import { formatAmount } from "./currency";
import { floorBigInt } from "./number";

export const countTokens = (tokens: { amount: number | string }[]) =>
  sumArray(tokens.map(({ amount }) => Number(amount)));

export const formatTokenReserve = (token: Token, reserve: bigint) =>
  formatAmount(token.isVault ? floorBigInt(reserve, token.decimals) : reserve, {
    decimals: token.decimals,
  });

export const parseTokenParams = ({
  inStr,
  outStr,
  defaultChainId,
  defaultTokenAddress,
}: {
  inStr: string;
  outStr: string;
  defaultChainId: number;
  defaultTokenAddress: string;
}) => {
  const paramsIn = inStr.split(":");
  const paramsOut = outStr.split(":");

  // Handle case where param is <chainId>:<tokenAddress> or just <tokenAddress> for backwards compatibility
  return {
    chainIdIn: paramsIn.length > 1 ? Number(paramsIn[0]) : defaultChainId,
    chainIdOut: paramsOut.length > 1 ? Number(paramsOut[0]) : defaultChainId,
    tokenAddressIn:
      (paramsIn.length > 1 ? paramsIn[1] : paramsIn[0]) || defaultTokenAddress,
    tokenAddressOut: paramsOut.length > 1 ? paramsOut[1] : paramsIn[0],
  };
};
