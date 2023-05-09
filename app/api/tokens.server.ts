import type { ExecutionResult } from "graphql";

import { fetchTroveCollections } from "./collections.server";
import { fetchMagicUSD } from "./stats.server";
import type { getTokensQuery } from ".graphclient";
import { execute, getTokensDocument } from ".graphclient";
import { getTokenCollectionAddresses } from "~/lib/tokens.server";
import { getTokenReserveItemIds } from "~/lib/tokens.server";
import { createPoolToken } from "~/lib/tokens.server";
import type { TraitsResponse, TroveToken, TroveTokenMapping } from "~/types";

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
  traits: string | null
) => {
  const url = new URL(`${process.env.TROVE_API_URL}/tokens-for-user`);
  url.searchParams.set("userAddress", address);
  url.searchParams.set("slugs", slug);
  url.searchParams.set("chains", process.env.TROVE_API_NETWORK);
  if (traits) {
    url.searchParams.set("traits", traits);
  }

  const response = await fetch(url.toString());
  const result = (await response.json()) as TroveToken[];

  return result;
};

export const fetchIdsFromCollection = async (
  tokenIds: string,
  slug: string,
  traits: string | null,
  query: string | null
) => {
  const url = new URL(
    `${process.env.TROVE_API_URL}/collection/${process.env.TROVE_API_NETWORK}/${slug}/tokens`
  );

  url.searchParams.set("ids", tokenIds);

  if (traits) {
    url.searchParams.set("traits", traits);
  }

  if (query) {
    url.searchParams.set("query", query);
  }

  const response = await fetch(url.toString());
  const result = (await response.json()).tokens as TroveToken[];

  return result;
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
