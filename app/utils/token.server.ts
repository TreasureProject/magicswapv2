import type { PoolToken, Token, TroveCollectionMapping } from "~/types";
import { createPoolTokenCollection } from "./collection.server";

// TODO: Move to a token list JSON per chain
const ERC20_TOKEN_MAPPING: Record<string, string> = {
  "0x88f9efb3a7f728fdb2b8872fe994c84b1d148f65": "MAGIC",
};

export const isTokenNft = (token: Token) => !!token.nftVault;

export const getTokenCollectionAddresses = (token: Token) =>
  token.nftVault?.nftVaultCollections.map(
    ({ collection }) => collection.id as string
  ) ?? [];

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

  const tokenAddress = token.id as string;
  return ERC20_TOKEN_MAPPING[tokenAddress] ?? tokenAddress;
};

export const createPoolToken = (
  token: Token,
  collections: TroveCollectionMapping
): PoolToken => {
  const tokenCollections =
    token.nftVault?.nftVaultCollections.map(({ collection }) =>
      createPoolTokenCollection(collection, collections)
    ) ?? [];
  return {
    id: token.id,
    name: createTokenName(token, collections),
    image: tokenCollections[0]?.image,
    collections: tokenCollections,
    isNft: isTokenNft(token),
  };
};
