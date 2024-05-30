import { createPoolTokenCollection } from "./collections.server";
import type {
  PoolToken,
  Token,
  TroveCollectionMapping,
  TroveTokenMapping,
} from "~/types";

type Item = {
  collection: {
    id: string;
  };
  tokenId: string;
  amount: number;
};

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
) =>
  token.isNFT
    ? createTokenName(token, collections)
    : token.symbol.toUpperCase();

export const createPoolToken = (
  token: Token,
  collections: TroveCollectionMapping,
  magicUSD: number
): PoolToken => {
  const tokenCollections =
    token.vaultCollections.map(({ collection, tokenIds }) =>
      createPoolTokenCollection(collection, tokenIds ?? [], collections)
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
    collectionTokenIds: tokenCollections[0]?.tokenIds ?? [],
    priceUSD: Number(token.derivedMAGIC) * magicUSD,
    reserve: "0",
  };
};
