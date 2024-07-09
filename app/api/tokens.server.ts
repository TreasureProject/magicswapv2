import type { ExecutionResult } from "graphql";

import { fetchTokensCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import {
  GetTokenDocument,
  type GetTokenQuery,
  GetTokenVaultReserveItemsDocument,
  type GetTokenVaultReserveItemsQuery,
  GetTokensDocument,
  type GetTokensQuery,
  execute,
} from ".graphclient";
import { sumArray } from "~/lib/array";
import { getCachedValue } from "~/lib/cache.server";
import { createPoolToken } from "~/lib/tokens.server";
import type { PoolToken, TroveToken, TroveTokenMapping } from "~/types";

export const fetchTokens = () =>
  getCachedValue("tokens", async () => {
    const result = (await execute(
      GetTokensDocument,
      {}
    )) as ExecutionResult<GetTokensQuery>;
    const { tokens: rawTokens = [] } = result.data ?? {};
    const [[collectionMapping, tokenMapping], magicUSD] = await Promise.all([
      fetchTokensCollections(rawTokens),
      fetchMagicUSD(),
    ]);
    return rawTokens.map((token) =>
      createPoolToken(token, collectionMapping, tokenMapping, magicUSD)
    );
  });

export const fetchToken = (id: string) =>
  getCachedValue(`token-${id}`, async () => {
    const result = (await execute(GetTokenDocument, {
      id,
    })) as ExecutionResult<GetTokenQuery>;
    const { token: rawToken } = result.data ?? {};

    if (!rawToken) {
      return null;
    }

    const [[collectionMapping, tokenMapping], magicUSD] = await Promise.all([
      fetchTokensCollections([rawToken]),
      fetchMagicUSD(),
    ]);
    return createPoolToken(rawToken, collectionMapping, tokenMapping, magicUSD);
  });

const fetchTroveTokens = async (ids: string[]) => {
  const response = await fetch(`${process.env.TROVE_API_URL}/batch-tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.TROVE_API_KEY,
    },
    body: JSON.stringify({
      ids: ids.map((id) => `${process.env.TROVE_API_NETWORK}/${id}`),
    }),
  });
  const results = (await response.json()) as TroveToken[];
  return results;
};

export const fetchTroveTokenMapping = async (ids: string[]) => {
  const tokens = await fetchTroveTokens(ids);
  return tokens.reduce((acc, token) => {
    const collection = (acc[token.collectionAddr.toLowerCase()] ??= {});
    collection[token.tokenId] = token;
    return acc;
  }, {} as TroveTokenMapping);
};

export const fetchPoolTokenBalance = async (
  token: PoolToken,
  address: string
) => {
  const url = new URL(`${process.env.TROVE_API_URL}/tokens-for-user`);
  url.searchParams.append("userAddress", address);
  url.searchParams.append("projection", "queryUserQuantityOwned");

  const tokenIds = token.collections.flatMap(({ id, tokenIds }) =>
    tokenIds.map(
      (tokenId) => `${process.env.TROVE_API_NETWORK}/${id}/${tokenId}`
    )
  );
  if (tokenIds.length > 0) {
    url.searchParams.append("ids", tokenIds.join(","));
  } else {
    url.searchParams.append(
      "slugs",
      token.collections
        .map(({ id }) => `${process.env.TROVE_API_NETWORK}/${id}`)
        .join(",")
    );
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": process.env.TROVE_API_KEY,
    },
  });
  const result = (await response.json()) as TroveToken[];
  return sumArray(result.map((token) => token.queryUserQuantityOwned ?? 0));
};

export const fetchVaultUserInventory = async ({
  id,
  address,
}: {
  id: string;
  address: string;
}) => {
  // Fetch vault data from subgraph
  const result = (await execute(GetTokenDocument, {
    id,
  })) as ExecutionResult<GetTokenQuery>;
  const { token } = result.data ?? {};
  if (!token) {
    throw new Error("Vault not found");
  }

  // Fetch user inventory
  const url = new URL(`${process.env.TROVE_API_URL}/tokens-for-user`);
  url.searchParams.append("userAddress", address);

  const tokenIds =
    token.vaultCollections.flatMap(
      ({ collection: { id: collectionId }, tokenIds }) =>
        tokenIds?.map(
          (tokenId) =>
            `${process.env.TROVE_API_NETWORK}/${collectionId}/${tokenId}`
        ) ?? []
    ) ?? [];
  if (tokenIds.length > 0) {
    url.searchParams.append("ids", tokenIds.join(","));
  } else {
    url.searchParams.append(
      "slugs",
      token.vaultCollections
        .map(
          ({ collection: { id: collectionId } }) =>
            `${process.env.TROVE_API_NETWORK}/${collectionId}`
        )
        .join(",")
    );
  }

  const response = await fetch(url, {
    headers: {
      "X-API-Key": process.env.TROVE_API_KEY,
    },
  });
  const results = (await response.json()) as TroveToken[];
  return results;
};

export const fetchVaultReserveItems = async ({
  id,
  page = 1,
  itemsPerPage = 25,
}: {
  id: string;
  page?: number;
  itemsPerPage?: number;
}): Promise<TroveToken[]> => {
  // Fetch vault reserve items from subgraph
  const result = (await execute(GetTokenVaultReserveItemsDocument, {
    id,
    first: itemsPerPage,
    skip: (page - 1) * itemsPerPage,
  })) as ExecutionResult<GetTokenVaultReserveItemsQuery>;
  const { vaultReserveItems = [] } = result.data ?? {};

  // Create mapping of tokenIds to amount so we use the vault reserves instead of inventory balances
  const amountsMapping = vaultReserveItems.reduce(
    (acc, { collection: { id: collectionId }, tokenId, amount }) => {
      acc[`${collectionId.toLowerCase()}/${tokenId}`] = amount;
      return acc;
    },
    {} as Record<string, number>
  );

  // Fetch token metadata
  const items = await fetchTroveTokens(Object.keys(amountsMapping));
  return items.map((item) => ({
    ...item,
    queryUserQuantityOwned:
      amountsMapping[`${item.collectionAddr.toLowerCase()}/${item.tokenId}`] ??
      item.queryUserQuantityOwned ??
      0,
  }));
};
