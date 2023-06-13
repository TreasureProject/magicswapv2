import type { RToken } from "@sushiswap/tines";

import type { PoolToken } from "./tokens.server";
import type { TroveToken } from "~/types";

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

export const getTroveTokenQuantity = (token: TroveToken) =>
  "queryUserQuantityOwned" in token ? token.queryUserQuantityOwned ?? 1 : 1;
