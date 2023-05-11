import { verboseReporter } from "cachified";
import { cachified } from "cachified";
import type { ExecutionResult } from "graphql";

import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import type { getTokenQuery, getTokensQuery } from ".graphclient";
import { getTokenDocument } from ".graphclient";
import { execute, getTokensDocument } from ".graphclient";
import { ITEMS_PER_PAGE } from "~/consts";
import { cache } from "~/lib/cache.server";
import { getTokenCollectionAddresses } from "~/lib/tokens.server";
import { getTokenReserveItemIds } from "~/lib/tokens.server";
import { createPoolToken } from "~/lib/tokens.server";
import type {
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

export const fetchTokens = async () => {
  const result = (await execute(
    getTokensDocument,
    {}
  )) as ExecutionResult<getTokensQuery>;
  const { tokens: rawTokens = [] } = result.data ?? {};
  const [collections, tokens, magicUSD] = await Promise.all([
    fetchTroveCollections([
      ...new Set(
        rawTokens.flatMap((token) => getTokenCollectionAddresses(token))
      ),
    ]),
    fetchTroveTokens([
      ...new Set(rawTokens.flatMap((token) => getTokenReserveItemIds(token))),
    ]),
    fetchMagicUSD(),
  ]);
  return rawTokens.map((token) =>
    createPoolToken(token, collections, tokens, magicUSD)
  );
};

export const fetchFilters = async (slug: string) => {
  const response = await fetch(
    `${process.env.TROVE_API_URL}/collection/${process.env.TROVE_API_NETWORK}/${slug}/traits`
  );

  const { traitsMap } = (await response.json()) as TraitsResponse;

  return Object.entries(traitsMap).map(([traitName, traitMetadata]) => {
    const values = Object.entries(traitMetadata.valuesMap).map(
      ([valueName, valueMetadata]) => {
        return {
          valueName,
          count: valueMetadata.valueCount,
          valuePriority: valueMetadata.valuePriority ?? 0,
        };
      }
    );
    if (traitMetadata.display_order === "name") {
      // Priority sort, then sort by alphabetical order of valueName.
      values.sort((a, b) => {
        if (a.valuePriority !== b.valuePriority) {
          return b.valuePriority - a.valuePriority;
        }

        return a.valueName.localeCompare(b.valueName);
      });
    } else if (traitMetadata.display_order === "frequency_desc") {
      // Priority sort, then sort by descending frequency of value count.
      values.sort((a, b) => {
        if (a.valuePriority !== b.valuePriority) {
          return b.valuePriority - a.valuePriority;
        }

        return b.count - a.count;
      });
    } else {
      // Priority sort, then sort by ascending frequency of value count.
      values.sort((a, b) => {
        if (a.valuePriority !== b.valuePriority) {
          return b.valuePriority - a.valuePriority;
        }

        return a.count - b.count;
      });
    }

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
        },
        body: JSON.stringify(
          filterNullValues({
            userAddress: address,
            slugs: [slug],
            limit: ITEMS_PER_PAGE,
            chains: [process.env.TROVE_API_NETWORK],
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

function getTokenIds(id: string) {
  return cachified({
    reporter: verboseReporter(),
    key: `collection-${id}`,
    cache,
    async getFreshValue() {
      const res = (await execute(getTokenDocument, {
        id,
      })) as ExecutionResult<getTokenQuery>;

      const { token } = res.data ?? {};

      if (!token) throw new Error("Token not found");

      const tokenIds = token.vaultReserveItems.map(({ tokenId }) => tokenId);

      return tokenIds;
    },
    ttl: 1000 * 60, // 1 minutes
  });
}

export const fetchIdsFromCollection = async (
  id: string,
  slug: string,
  traits: string[],
  query: string | null,
  pageKey: string | null,
  offset: number
) => {
  try {
    const tokenIds = await getTokenIds(id);

    const response = await fetch(
      `${process.env.TROVE_API_URL}/collection/${process.env.TROVE_API_NETWORK}/${slug}/tokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          filterNullValues({
            ids: tokenIds,
            limit: ITEMS_PER_PAGE,
            traits,
            query,
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
    },
    body: JSON.stringify({
      ids: ids.map((id) => `${process.env.TROVE_API_NETWORK}/${id}`),
    }),
  });
  const result = (await response.json()) as TroveToken[];
  return result.reduce((acc, token) => {
    const next = { ...acc };
    const collection = (next[token.collectionAddr] ??= {});
    collection[token.tokenId] = token;
    return next;
  }, {} as TroveTokenMapping);
};
