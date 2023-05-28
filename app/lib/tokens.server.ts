import { createPoolTokenCollection } from "./collections.server";
import { fetchTotalInventoryForUser } from "~/api/tokens.server";
import type { Token, TroveCollectionMapping, TroveTokenMapping } from "~/types";

type Item = {
  collection: {
    id: string;
  };
  tokenId: string;
  amount: number;
};

export const findInventories = async (
  address: string,
  token1?: PoolToken,
  token2?: PoolToken
) =>
  Promise.all([
    token1 && token1.isNFT
      ? fetchTotalInventoryForUser(token1.urlSlug, address)
      : null,
    token2 && token2.isNFT
      ? fetchTotalInventoryForUser(token2.urlSlug, address)
      : null,
  ]).then((res) => {
    return {
      ...(token1 && { [token1.id]: res[0] }),
      ...(token2 && { [token2.id]: res[1] }),
    };
  });

export type InventoryList = ReturnType<typeof findInventories>;

export const itemToTroveTokenItem = (
  { collection: { id: collectionId }, tokenId, amount }: Item,
  tokens: TroveTokenMapping
) => {
  const tokenDetails = tokens[collectionId]?.[tokenId];
  return {
    collectionId,
    tokenId,
    amount,
    name: tokenDetails?.metadata.name ?? "",
    image: tokenDetails?.image.uri ?? "",
    attributes: (tokenDetails?.metadata?.attributes || []).map(
      ({ value, trait_type: traitType, display_type: displayType = null }) => ({
        value,
        traitType,
        displayType,
      })
    ),
  };
};

export type TroveTokenItem = ReturnType<typeof itemToTroveTokenItem>;

export const getTokenCollectionAddresses = (token: Token) =>
  token.vaultCollections.map(({ collection }) => collection.id) ?? [];

export const getTokenReserveItemIds = (token: PoolToken) =>
  token.vaultReserveItems.map(
    ({ collection, tokenId }) => `${collection.id}/${tokenId}`
  );

export const createTokenName = (
  token: Token,
  collections: TroveCollectionMapping
) => {
  if (token.isNFT) {
    const addresses = getTokenCollectionAddresses(token);
    return addresses
      .map((address) => collections[address]?.displayName ?? address)
      .sort()
      .join(" & ");
  }

  return token.name;
};

export const createTokenSymbol = (
  token: Token,
  collections: TroveCollectionMapping
) => {
  if (token.isNFT) {
    const addresses = getTokenCollectionAddresses(token);
    return addresses
      .map(
        (address) => collections[address]?.tokenDisplayName.singular ?? address
      )
      .sort()
      .join(" / ")
      .toUpperCase();
  }

  return token.symbol.toUpperCase();
};

export const createPoolToken = (
  token: Token,
  collections: TroveCollectionMapping,
  magicUSD: number
) => {
  const tokenCollections =
    token.vaultCollections.map(({ collection }) =>
      createPoolTokenCollection(collection, collections)
    ) ?? [];
  const symbol = createTokenSymbol(token, collections);
  return {
    ...token,
    ...(tokenCollections[0]?.type
      ? {
          type: tokenCollections[0]?.type,
        }
      : {}),
    name: createTokenName(token, collections),
    symbol,
    image:
      tokenCollections[0]?.image ??
      (token.isNFT ? "" : `/img/tokens/${symbol.toLowerCase()}.png`),
    decimals: Number(token.decimals),
    isMAGIC: symbol.toLowerCase() === "magic",
    collections: tokenCollections,
    urlSlug: tokenCollections[0]?.urlSlug ?? "",
    collectionId: tokenCollections[0]?.id ?? "",
    priceUSD: Number(token.derivedMAGIC) * magicUSD,
    reserve: 0,
    reserveItems: token.vaultReserveItems,
  };
};

export type PoolToken = ReturnType<typeof createPoolToken>;

export type PoolTokenCollection = PoolToken["collections"];

export type TokenReserveItem = PoolToken["reserveItems"];
