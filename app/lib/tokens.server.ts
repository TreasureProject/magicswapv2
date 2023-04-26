import { createPoolTokenCollection } from "./collections.server";
import type {
  Token,
  TokenPriceMapping,
  TroveCollectionMapping,
  TroveTokenMapping,
} from "~/types";

// TODO: Move to a token list JSON per chain
export const NORMALIZED_TOKEN_MAPPING: Record<string, string> = {
  "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65":
    "0x539bde0d7dbd336b79148aa742883198bbf60342",
};

export const isTokenNft = (token: Token) => token.vaultCollections.length > 0;

export const getTokenCollectionAddresses = (token: Token) =>
  token.vaultCollections.map(({ collection }) => collection.id) ?? [];

export const getTokenReserveItemIds = (token: Token) =>
  token.vaultReserveItems.map(
    ({ collection, tokenId }) => `${collection.id}/${tokenId}`
  );

export const createTokenName = (
  token: Token,
  collections: TroveCollectionMapping
) => {
  if (isTokenNft(token)) {
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
  if (isTokenNft(token)) {
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
  tokens: TroveTokenMapping,
  prices: TokenPriceMapping
) => {
  const tokenCollections =
    token.vaultCollections.map(({ collection }) =>
      createPoolTokenCollection(collection, collections)
    ) ?? [];
  const symbol = createTokenSymbol(token, collections);
  const isNft = isTokenNft(token);

  return {
    id: token.id,
    name: createTokenName(token, collections),
    symbol,
    decimals: token.decimals,
    image:
      tokenCollections[0]?.image ??
      (isNft ? "" : `/img/tokens/${symbol.toLowerCase()}.png`),
    collections: tokenCollections,
    urlSlug: tokenCollections[0]?.urlSlug ?? "",
    type: tokenCollections[0]?.type ?? "ERC721",
    isNft,
    collectionId: tokenCollections[0]?.id ?? "",
    priceUSD: prices[NORMALIZED_TOKEN_MAPPING[token.id] ?? token.id] ?? 0,
    reserve: 0,
    reserveItems: token.vaultReserveItems.map(
      ({ collection, tokenId, amount }) => {
        const tokenDetails = tokens[collection.id]?.[tokenId];
        return {
          collectionId: collection.id,
          tokenId,
          amount,
          name: tokenDetails?.metadata.name ?? "",
          image: tokenDetails?.image.uri ?? "",
          attributes: (tokenDetails?.metadata?.attributes || []).map(
            ({
              value,
              trait_type: traitType,
              display_type: displayType = null,
            }) => ({
              value,
              traitType,
              displayType,
            })
          ),
        };
      }
    ),
  };
};

export type PoolToken = ReturnType<typeof createPoolToken>;

export type PoolTokenCollection = PoolToken["collections"];

export type TokenReserveItem = PoolToken["reserveItems"];
