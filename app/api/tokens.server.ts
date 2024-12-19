import type { ExecutionResult } from "graphql";

import { BLOCKED_TOKENS } from "~/consts";
import { sumArray } from "~/lib/array";
import { ENV } from "~/lib/env.server";
import type { Token, TokenWithAmount, TroveToken } from "~/types";
import {
  GetTokenDocument,
  type GetTokenQuery,
  GetTokenVaultReserveItemsDocument,
  type GetTokenVaultReserveItemsQuery,
  GetTokensDocument,
  type GetTokensQuery,
  execute,
} from ".graphclient";

/**
 * Fetches tokens available for swapping
 */
export const fetchTokens = async () => {
  const { data, errors } = (await execute(GetTokensDocument, {
    where: {
      id_not_in: BLOCKED_TOKENS,
    },
  })) as ExecutionResult<GetTokensQuery>;
  if (errors) {
    throw new Error(
      `Error fetching tokens: ${errors.map((error) => error.message).join(", ")}`,
    );
  }

  return data?.tokens.items ?? [];
};

/**
 * Fetches single token available for swapping with NFT metadata and USD prices
 */
export const fetchToken = async (params: {
  chainId: number;
  address: string;
}): Promise<Token | undefined> => {
  const result = (await execute(
    GetTokenDocument,
    params,
  )) as ExecutionResult<GetTokenQuery>;
  return result.data?.token ?? undefined;
};

/**
 * Fetches user's balance for NFT vault
 */
export const fetchPoolTokenBalance = async (token: Token, address: string) => {
  const url = new URL(`${ENV.TROVE_API_URL}/tokens-for-user`);
  url.searchParams.append("userAddress", address);
  url.searchParams.append("projection", "queryUserQuantityOwned");

  const tokenIds = token.collectionTokenIds ?? [];
  if (tokenIds.length > 0) {
    url.searchParams.append("ids", tokenIds.join(","));
  } else {
    url.searchParams.append(
      "slugs",
      `${ENV.TROVE_API_NETWORK}/${token.collectionAddress}`,
    );
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": ENV.TROVE_API_KEY,
    },
  });
  const result = (await response.json()) as TroveToken[];
  return sumArray(result.map((token) => token.queryUserQuantityOwned ?? 0));
};

/**
 * Fetches user's inventory with metadata for NFT vault
 */
export const fetchVaultUserInventory = async ({
  id,
  address,
}: {
  id: string;
  address: string;
}): Promise<TokenWithAmount[]> => {
  // Fetch vault data from subgraph
  const result = (await execute(GetTokenDocument, {
    id,
  })) as ExecutionResult<GetTokenQuery>;
  const { token } = result.data ?? {};
  if (!token) {
    throw new Error("Vault not found");
  }

  // Fetch user inventory
  const url = new URL(`${ENV.TROVE_API_URL}/tokens-for-user`);
  url.searchParams.append("userAddress", address);

  const tokenIds = token.collectionTokenIds ?? [];
  if (tokenIds.length > 0) {
    url.searchParams.append("ids", tokenIds.join(","));
  } else {
    // TODO: switch to single collection query
    url.searchParams.append(
      "slugs",
      `${ENV.TROVE_API_NETWORK}/${token.collectionAddress}`,
    );
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": ENV.TROVE_API_KEY,
    },
  });
  const results = (await response.json()) as TroveToken[];
  return results.map((token) => ({
    collectionAddress: token.collectionAddr,
    tokenId: token.tokenId,
    name: token.metadata.name,
    image: token.image.uri,
    amount: token.queryUserQuantityOwned ?? 0,
  }));
};

/**
 * Fetches NFT vault's reserves with metadata
 */
export const fetchVaultReserveItems = async ({
  id,
  page = 1,
  resultsPerPage = 25,
}: {
  id: string;
  page?: number;
  resultsPerPage?: number;
}) => {
  // Fetch vault reserve items from subgraph
  const result = (await execute(GetTokenVaultReserveItemsDocument, {
    id,
    first: resultsPerPage,
    skip: (page - 1) * resultsPerPage,
  })) as ExecutionResult<GetTokenVaultReserveItemsQuery>;
  return result.data?.vaultReserveItems?.items ?? [];
};
