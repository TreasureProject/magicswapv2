import type { RToken } from "@sushiswap/tines";

import type { PoolToken, TroveTokenWithQuantity } from "~/types";
import { sumArray } from "./array";

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
