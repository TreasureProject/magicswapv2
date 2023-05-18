import {
  getTokenCollectionAddresses,
  getTokenReserveItemIds,
} from "./tokens.server";
import type { Pair } from "~/types";

export const getPairCollectionAddresses = (pair: Pair) => [
  ...new Set([
    ...getTokenCollectionAddresses(pair.token0),
    ...getTokenCollectionAddresses(pair.token1),
  ]),
];

export const getPairERC20Addresses = (pair: Pair) => [
  ...(pair.token0.isNFT ? [] : [pair.token0.id]),
  ...(pair.token1.isNFT ? [] : [pair.token1.id]),
];

export const getPairReserveItemAddresses = (pair: Pair) => [
  ...new Set([
    ...getTokenReserveItemIds(pair.token0),
    ...getTokenReserveItemIds(pair.token1),
  ]),
];

export const getPairTransactionItemAddresses = (pair: Pair) => [
  ...new Set(
    pair.transactions.flatMap(({ items0, items1 }) => [
      ...(items0?.map(
        ({ collection, tokenId }) => `${collection.id}/${tokenId}`
      ) ?? []),
      ...(items1?.map(
        ({ collection, tokenId }) => `${collection.id}/${tokenId}`
      ) ?? []),
    ])
  ),
];
