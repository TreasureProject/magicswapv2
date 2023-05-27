import type { Pool } from "./pools.server";
import {
  getTokenCollectionAddresses,
  getTokenReserveItemIds,
} from "./tokens.server";
import type { Pair, Transaction } from "~/types";

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

export const getPoolReserveItemAddresses = (pool: Pool) => [
  ...new Set([
    ...getTokenReserveItemIds(pool.token0),
    ...getTokenReserveItemIds(pool.token1),
  ]),
];

export const getPairTransactionItemAddresses = (transaction: Transaction) => {
  return [
    ...(transaction.items0?.map(
      ({ collection, tokenId }) => `${collection.id}/${tokenId}`
    ) ?? []),
    ...(transaction.items1?.map(
      ({ collection, tokenId }) => `${collection.id}/${tokenId}`
    ) ?? []),
  ];
};
