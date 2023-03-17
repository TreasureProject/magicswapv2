import type { PoolToken } from "~/types";

export const createPoolName = (token0: PoolToken, token1: PoolToken) => {
  if (token1.isNft && !token0.isNft) {
    return `${token1.name} / ${token0.name}`;
  }

  return `${token0.name} / ${token1.name}`;
};
