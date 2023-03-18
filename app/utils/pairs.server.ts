import type { Pair } from "~/types";
import { getTokenCollectionAddresses, isTokenNft } from "./tokens.server";

export const getPairCollectionAddresses = (pair: Pair) => [
  ...new Set([
    ...getTokenCollectionAddresses(pair.token0),
    ...getTokenCollectionAddresses(pair.token1),
  ]),
];

export const getPairERC20Addresses = (pair: Pair) => [
  ...(isTokenNft(pair.token0) ? [] : [pair.token0.id]),
  ...(isTokenNft(pair.token1) ? [] : [pair.token1.id]),
];
