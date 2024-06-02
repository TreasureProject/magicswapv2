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

const createTokenMetadata = (
  token: Token,
  collectionMapping: TroveCollectionMapping,
  tokenMapping: TroveTokenMapping
) => {
  if (token.isNFT) {
    const vaultCollectionAddresses = token.vaultCollections.map(
      ({ collection: { id } }) => id
    );
    const vaultTokenIds = token.vaultCollections.flatMap(
      ({ tokenIds }) => tokenIds ?? []
    );
    const vaultCollection = vaultCollectionAddresses[0]
      ? collectionMapping[vaultCollectionAddresses[0]]
      : undefined;
    const vaultToken =
      vaultCollectionAddresses[0] && vaultTokenIds[0]
        ? tokenMapping[vaultCollectionAddresses[0]]?.[vaultTokenIds[0]]
        : undefined;

    // Vault is a single collection with a single token ID defined
    if (
      vaultCollectionAddresses.length === 1 &&
      vaultTokenIds.length === 1 &&
      vaultToken
    ) {
      return {
        name: vaultToken.metadata.name,
        image: vaultToken.image.uri,
      };
    }

    // Vault is multiple collections with multiple token IDs defined
    if (
      vaultCollectionAddresses.length > 0 &&
      vaultTokenIds.length > 1 &&
      vaultToken
    ) {
      const type = vaultToken?.metadata.attributes.find(
        ({ trait_type }) => trait_type.toLowerCase() === "type"
      )?.value;
      if (type) {
        return {
          name: `${type}s`,
          image: vaultToken.image.uri,
        };
      }
    }

    return {
      name: vaultCollectionAddresses
        .map((address) => collectionMapping[address]?.displayName ?? address)
        .join(" & "),
      image: vaultCollection?.thumbnailUri,
    };
  }

  return { name: token.name, image: undefined };
};

export const createPoolToken = (
  token: Token,
  collectionMapping: TroveCollectionMapping,
  tokenMapping: TroveTokenMapping,
  magicUSD: number
): PoolToken => {
  const tokenCollections =
    token.vaultCollections.map(({ collection, tokenIds }) =>
      createPoolTokenCollection(collection, tokenIds ?? [], collectionMapping)
    ) ?? [];
  const { name, image } = createTokenMetadata(
    token,
    collectionMapping,
    tokenMapping
  );
  const symbol = token.isNFT ? name : token.symbol.toUpperCase();
  return {
    ...token,
    ...(tokenCollections[0]?.type
      ? {
          type: tokenCollections[0]?.type,
        }
      : {}),
    name,
    symbol,
    image:
      image ?? (token.isNFT ? "" : `/img/tokens/${symbol.toLowerCase()}.png`),
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
