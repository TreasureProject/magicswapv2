import type { RToken } from "@sushiswap/tines";

import { sumArray } from "./array";
import type { PoolToken, TroveTokenWithQuantity } from "~/types";

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
