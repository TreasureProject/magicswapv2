import type { RToken } from "@sushiswap/tines";

import type { PoolToken } from "./tokens.server";

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
