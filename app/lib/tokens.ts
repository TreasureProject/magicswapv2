import type { RToken } from "@sushiswap/tines";

import type { PoolToken, TroveTokenWithQuantity } from "~/types";
import { sumArray } from "./array";
import { formatTokenAmount } from "./currency";
import { floorBigInt } from "./number";

export const tokenToRToken = ({
  name,
  symbol,
  id: address,
  decimals,
}: PoolToken): RToken => ({
  name,
  symbol,
  address,
  decimals,
});

export const countTokens = (tokens: TroveTokenWithQuantity[]) =>
  sumArray(tokens.map(({ quantity }) => quantity));

export const formatTokenReserve = (token: PoolToken) =>
  formatTokenAmount(
    token.isNFT
      ? floorBigInt(BigInt(token.reserve), token.decimals)
      : BigInt(token.reserve),
    token.decimals,
  );
