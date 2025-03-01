import type { Address } from "viem";

import {
  CHAIN_ID_TO_TROVE_API_NETWORK,
  CHAIN_ID_TO_TROVE_API_URL,
} from "~/consts";
import { erc721Abi, erc1155Abi } from "~/generated";
import { graphql } from "~/gql/query.server";
import { sumArray } from "~/lib/array";
import { getViemClient } from "~/lib/chain.server";
import { getContext } from "~/lib/env.server";
import type { TroveToken } from "~/types";

export const TokenFragment = graphql(`
  fragment TokenFragment on token @_unmask {
    chainId
    address
    name
    symbol
    image
    gameId
    decimals
    derivedMagic
    isVault
    isMagic
    isEth
    collectionAddress
    collectionTokenIds
    collectionType
    collectionName
    collectionImage
    reserveItems {
      items {
        tokenId
        amount
      }
    }
  }
`);

const getTokenQuery = graphql(
  `
  query getToken($chainId: Float!, $address: String!) {
    token(chainId: $chainId, address: $address) {
      ...TokenFragment
    }
  }
`,
  [TokenFragment],
);

const getTokensQuery = graphql(
  `
  query getTokens(
    $where: tokenFilter
    $limit: Int = 100
    $orderBy: String = "symbol"
    $orderDirection: String = "asc"
  ) {
    tokens(
      where: $where
      limit: $limit
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        ...TokenFragment
      }
    }
  }
`,
  [TokenFragment],
);

const getTokenVaultReserveItemsQuery = graphql(`
  query getTokenVaultReserveItems(
    $chainId: Int!
    $address: String!
    $limit: Int = 50
    $orderBy: String = "tokenId"
    $orderDirection: String = "asc"
  ) {
    vaultReserveItems(
      where: { chainId: $chainId, vaultAddress: $address }
      limit: $limit
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      items {
        collectionAddress
        tokenId
        name
        image
        amount
      }
    }
  }
`);

/**
 * Fetches tokens available for swapping
 */
export const fetchTokens = async () => {
  const { graphClient } = await getContext();
  const { tokens } = await graphClient.request(getTokensQuery, {});
  return tokens.items ?? [];
};

/**
 * Fetches single token available for swapping with NFT metadata and USD prices
 */
export const fetchToken = async (params: {
  chainId: number;
  address: string;
}) => {
  const { graphClient } = await getContext();
  const { token } = await graphClient.request(getTokenQuery, params);
  return token ?? undefined;
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
          "X-API-Key": getContext().env.TROVE_API_KEY,
        },
      });
      const result = (await response.json()) as TroveToken[];
      return sumArray(result.map((token) => token.queryUserQuantityOwned ?? 0));
    }

    const balances = await viemClient.readContract({
      address: token.collectionAddress as Address,
      abi: erc1155Abi,
      functionName: "balanceOfBatch",
      args: [
        Array.from({
          length: collectionTokenIds.length,
        }).fill(address) as Address[],
        collectionTokenIds.map((tokenId) => BigInt(tokenId)),
      ],
    });
    return sumArray(balances.map(Number));
  }
  if (token.collectionType === "ERC721") {
    const balance = await viemClient.readContract({
      address: token.collectionAddress as Address,
      abi: erc721Abi,
      functionName: "balanceOf",
      args: [address as Address],
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
}) => {
  // Fetch vault data from subgraph
  const { env, graphClient } = await getContext();
  const { token } = await graphClient.request(getTokenQuery, {
    chainId,
    address: vaultAddress,
  });
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
      "X-API-Key": env.TROVE_API_KEY,
    },
  });
  const results = (await response.json()) as TroveToken[];
  return results.map((token) => ({
    collectionAddress: token.collectionAddr,
    tokenId: token.tokenId,
    name: token.metadata.name,
    image: token.image.uri,
    amount: token.queryUserQuantityOwned?.toString() ?? "0",
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
  const { graphClient } = await getContext();
  const { vaultReserveItems } = await graphClient.request(
    getTokenVaultReserveItemsQuery,
    {
      chainId,
      address,
      first: resultsPerPage,
      skip: (page - 1) * resultsPerPage,
    },
  );
  return vaultReserveItems?.items ?? [];
};

export type Token = NonNullable<Awaited<ReturnType<typeof fetchToken>>>;
export type TokenWithAmount = Awaited<
  ReturnType<typeof fetchVaultReserveItems>
>[number];
