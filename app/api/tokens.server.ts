import type { ExecutionResult } from "graphql";

import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import {
  GetTokenDocument,
  type GetTokenQuery,
  GetTokensDocument,
  type GetTokensQuery,
  execute,
} from ".graphclient";
import { ITEMS_PER_PAGE } from "~/consts";
import { sumArray } from "~/lib/array";
import { cachified } from "~/lib/cache.server";
import {
  createPoolToken,
  getTokenCollectionAddresses,
} from "~/lib/tokens.server";
import type {
  PoolToken,
  TraitsResponse,
  TroveApiResponse,
  TroveToken,
  TroveTokenMapping,
} from "~/types";

function filterNullValues(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const filteredObj: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null) {
      filteredObj[key] = value;
    }
  }

  return filteredObj;
}

export const fetchTokens = async () =>
  cachified({
    key: "tokens",
    async getFreshValue() {
      const result = (await execute(
        GetTokensDocument,
        {}
      )) as ExecutionResult<GetTokensQuery>;
      const { tokens: rawTokens = [] } = result.data ?? {};
      const [collections, magicUSD] = await Promise.all([
        fetchTroveCollections([
          ...new Set(
            rawTokens.flatMap((token) => getTokenCollectionAddresses(token))
          ),
        ]),
        fetchMagicUSD(),
      ]);
      return rawTokens.map((token) =>
        createPoolToken(token, collections, magicUSD)
      );
    },
  });

export const fetchToken = async (id: string) =>
  cachified({
    key: `token-${id}`,
    async getFreshValue() {
      const result = (await execute(GetTokenDocument, {
        id,
      })) as ExecutionResult<GetTokenQuery>;
      const { token: rawToken } = result.data ?? {};

      if (!rawToken) {
        return null;
      }

      const [collections, magicUSD] = await Promise.all([
        fetchTroveCollections(getTokenCollectionAddresses(rawToken)),
        fetchMagicUSD(),
      ]);
      return createPoolToken(rawToken, collections, magicUSD);
    },
  });

export const fetchFilters = async (slug: string) => {
  const response = await fetch(
    `${process.env.TROVE_API_URL}/collection/${process.env.TROVE_API_NETWORK}/${slug}/traits`,
    {
      headers: {
        "X-API-Key": process.env.TROVE_API_KEY,
      },
    }
  );

  const { traitsMap } = (await response.json()) as TraitsResponse;

  return Object.entries(traitsMap).map(([traitName, traitMetadata]) => {
    const isNumeric =
      "display_type" in traitMetadata &&
      (traitMetadata.display_type === "numeric" ||
        traitMetadata.display_type === "percentage");
    const values = Object.entries(traitMetadata.valuesMap)
      .map(([valueName, valueMetadata]) => {
        return {
          valueName,
          count: valueMetadata.valueCount,
          valuePriority: valueMetadata.valuePriority ?? 0,
        };
      })
      .sort((a, b) => {
        if (a.valuePriority !== b.valuePriority) {
          return b.valuePriority - a.valuePriority;
        }

        return a.valueName.localeCompare(b.valueName, undefined, {
          numeric: isNumeric || a.valueName.includes("%"),
        });
      });

    return {
      ...traitMetadata,
      traitName,
      values,
    };
  });
};

export type TroveFilters = ReturnType<typeof fetchFilters>;

export const fetchCollectionOwnedByAddress = async (
  address: string,
  slug: string,
  traits: string[],
  tokenIds: string[],
  query: string | null,
  pageKey: string | null,
  offset: number
) => {
  try {
    const response = await fetch(
      `${process.env.TROVE_API_URL}/tokens-for-user-page-fc`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.TROVE_API_KEY,
        },
        body: JSON.stringify(
          filterNullValues({
            userAddress: address,
            ...(tokenIds.length > 0
              ? {
                  ids: tokenIds.map((tokenId) => `${slug}/${tokenId}`),
                }
              : {
                  slugs: [slug],
                }),
            limit: ITEMS_PER_PAGE,
            query,
            traits,
            pageKey,
            offset,
          })
        ),
      }
    );
    const result = (await response.json()) as TroveApiResponse;

    return result;
  } catch (e) {
    throw new Error("Error fetching collection");
  }
};

export const fetchTroveTokens = async (
  ids: string[]
): Promise<TroveTokenMapping> => {
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
  const result = (await response.json()) as TroveToken[];
  return result.reduce((acc, token) => {
    const collection = (acc[token.collectionAddr] ??= {});
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
