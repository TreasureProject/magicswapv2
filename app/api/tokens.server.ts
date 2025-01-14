import type { ExecutionResult } from "graphql";

import {
  CHAIN_ID_TO_TROVE_API_NETWORK,
  CHAIN_ID_TO_TROVE_API_URL,
} from "~/consts";
import { erc721Abi, erc1155Abi } from "~/generated";
import { sumArray } from "~/lib/array";
import { getViemClient } from "~/lib/chain.server";
import { ENV } from "~/lib/env.server";
import type {
  AddressString,
  Token,
  TokenWithAmount,
  TroveToken,
} from "~/types";
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
  const { data, errors } = (await execute(
    GetTokensDocument,
    {},
  )) as ExecutionResult<GetTokensQuery>;
  if (errors) {
    throw new Error(
      `Error fetching tokens: ${errors
        .map((error) => error.message)
        .join(", ")}`,
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
  const viemClient = getViemClient(token.chainId);
  if (token.collectionType === "ERC1155") {
    const collectionTokenIds = token.collectionTokenIds || [];

    // If no token IDs are provided, fetch all tokens for the collection
    if (collectionTokenIds.length === 0) {
      const url = new URL(
        `${CHAIN_ID_TO_TROVE_API_URL[token.chainId]}/tokens-for-user`,
      );
      url.searchParams.append("userAddress", address);
      url.searchParams.append("projection", "queryUserQuantityOwned");
      url.searchParams.append(
        "slugs",
        `${CHAIN_ID_TO_TROVE_API_NETWORK[token.chainId]}/${
          token.collectionAddress
        }`,
      );

      const response = await fetch(url, {
        headers: {
          "X-API-Key": ENV.TROVE_API_KEY,
        },
      });
      const result = (await response.json()) as TroveToken[];
      return sumArray(result.map((token) => token.queryUserQuantityOwned ?? 0));
    }

    const balances = await viemClient.readContract({
      address: token.collectionAddress as AddressString,
      abi: erc1155Abi,
      functionName: "balanceOfBatch",
      args: [
        Array.from({
          length: collectionTokenIds.length,
        }).fill(address) as AddressString[],
        collectionTokenIds.map((tokenId) => BigInt(tokenId)),
      ],
    });
    return sumArray(balances.map(Number));
  }
  if (token.collectionType === "ERC721") {
    const balance = await viemClient.readContract({
      address: token.collectionAddress as AddressString,
      abi: erc721Abi,
      functionName: "balanceOf",
      args: [address as AddressString],
    });
    return Number(balance);
  }

  return 0;
};

/**
 * Fetches user's inventory with metadata for NFT vault
 */
export const fetchVaultUserInventory = async ({
  chainId,
  vaultAddress,
  userAddress,
}: {
  chainId: number;
  vaultAddress: string;
  userAddress: string;
}): Promise<TokenWithAmount[]> => {
  // Fetch vault data from subgraph
  const result = (await execute(GetTokenDocument, {
    chainId,
    address: vaultAddress,
  })) as ExecutionResult<GetTokenQuery>;
  const { token } = result.data ?? {};
  if (!token) {
    throw new Error("Vault not found");
  }

  // Fetch user inventory
  const url = new URL(
    `${CHAIN_ID_TO_TROVE_API_URL[token.chainId]}/tokens-for-user`,
  );
  url.searchParams.append("userAddress", userAddress);

  const tokenIds = token.collectionTokenIds ?? [];
  if (tokenIds.length > 0) {
    url.searchParams.append(
      "ids",
      tokenIds
        .map(
          (tokenId) =>
            `${CHAIN_ID_TO_TROVE_API_NETWORK[token.chainId]}/${
              token.collectionAddress
            }/${tokenId}`,
        )
        .join(","),
    );
  } else {
    // TODO: switch to single collection query
    url.searchParams.append(
      "slugs",
      `${CHAIN_ID_TO_TROVE_API_NETWORK[token.chainId]}/${
        token.collectionAddress
      }`,
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
  chainId,
  address,
  page = 1,
  resultsPerPage = 25,
}: {
  chainId: number;
  address: string;
  page?: number;
  resultsPerPage?: number;
}) => {
  // Fetch vault reserve items from subgraph
  const result = (await execute(GetTokenVaultReserveItemsDocument, {
    chainId,
    address,
    first: resultsPerPage,
    skip: (page - 1) * resultsPerPage,
  })) as ExecutionResult<GetTokenVaultReserveItemsQuery>;
  return result.data?.vaultReserveItems?.items ?? [];
};
