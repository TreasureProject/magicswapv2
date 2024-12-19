import type { RToken } from "@sushiswap/tines";

import type { Token } from "~/types";
import { sumArray } from "./array";
import { formatAmount } from "./currency";
import { floorBigInt } from "./number";

export const tokenToRToken = ({
  address,
  name,
  symbol,
  decimals,
}: Token): RToken => ({
  name,
  symbol,
  address,
  decimals,
});

export const countTokens = (tokens: { amount: number }[]) =>
  sumArray(tokens.map(({ amount }) => amount));

export const formatTokenReserve = (token: Token, reserve: bigint) =>
  formatAmount(token.isVault ? floorBigInt(reserve, token.decimals) : reserve, {
    decimals: token.decimals,
  });
