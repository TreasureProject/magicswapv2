import type {
  PoolToken,
  Token,
  TokenPriceMapping,
  TroveCollectionMapping,
} from "~/types";
import { createPoolTokenCollection } from "./collections.server";

// TODO: Move to a token list JSON per chain
export const NORMALIZED_TOKEN_MAPPING: Record<string, string> = {
  "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65":
    "0x539bde0d7dbd336b79148aa742883198bbf60342",
};

const ERC20_TOKEN_MAPPING: Record<string, string> = {
  "0x539bde0d7dbd336b79148aa742883198bbf60342": "MAGIC",
};

export const isTokenNft = (token: Token) => !!token.nftVault;

export const getTokenCollectionAddresses = (token: Token) =>
  token.nftVault?.nftVaultCollections.map(({ collection }) => collection.id) ??
  [];

export const createTokenName = (
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
      .join(" / ");
  }

  const tokenAddress = NORMALIZED_TOKEN_MAPPING[token.id] ?? token.id;
  return ERC20_TOKEN_MAPPING[tokenAddress] ?? tokenAddress;
};

export const createPoolToken = (
  token: Token,
  collections: TroveCollectionMapping,
  prices: TokenPriceMapping
): PoolToken => {
  const tokenCollections =
    token.nftVault?.nftVaultCollections.map(({ collection }) =>
      createPoolTokenCollection(collection, collections)
    ) ?? [];
  const tokenAddress = NORMALIZED_TOKEN_MAPPING[token.id] ?? token.id;
  return {
    id: token.id,
    name: createTokenName(token, collections),
    image: tokenCollections[0]?.image,
    collections: tokenCollections,
    isNft: isTokenNft(token),
    priceUSD: prices[tokenAddress] ?? 0,
  };
};
