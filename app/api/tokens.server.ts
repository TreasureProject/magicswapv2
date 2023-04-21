import type { ExecutionResult } from "graphql";

import { fetchTroveCollections } from "./collections.server";
import type { getTokensQuery } from ".graphclient";
import { execute, getTokensDocument } from ".graphclient";
import { NORMALIZED_TOKEN_MAPPING } from "~/lib/tokens.server";
import { getTokenCollectionAddresses } from "~/lib/tokens.server";
import { getTokenReserveItemIds } from "~/lib/tokens.server";
import { isTokenNft } from "~/lib/tokens.server";
import { createPoolToken } from "~/lib/tokens.server";
import type {
  LlamaTokensResponse,
  TokenPriceMapping,
  TroveToken,
  TroveTokenMapping,
} from "~/types";

export const fetchTokens = async () => {
  const result = (await execute(
    getTokensDocument,
    {}
  )) as ExecutionResult<getTokensQuery>;
  const { tokens: rawTokens = [] } = result.data ?? {};
  const [collections, tokens, erc20Prices] = await Promise.all([
    fetchTroveCollections([
      ...new Set(
        rawTokens.flatMap((token) => getTokenCollectionAddresses(token))
      ),
    ]),
    fetchTroveTokens([
      ...new Set(rawTokens.flatMap((token) => getTokenReserveItemIds(token))),
    ]),
    fetchTokenPrices([
      ...new Set(
        rawTokens.flatMap((token) => (isTokenNft(token) ? [] : [token.id]))
      ),
    ]),
  ]);
  return rawTokens.map((token) =>
    createPoolToken(token, collections, tokens, erc20Prices)
  );
};

export const fetchCollectionOwnedByAddress = async (
  address: string,
  slug: string
) => {
  const url = new URL(`${process.env.TROVE_API_URL}/tokens-for-user`);
  url.searchParams.set("userAddress", address);
  url.searchParams.set("slugs", slug);
  url.searchParams.set("chains", process.env.TROVE_API_NETWORK);

  const response = await fetch(url.toString());
  const result = (await response.json()) as TroveToken[];

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

export const fetchTokenPrices = async (
  addresses: string[]
): Promise<TokenPriceMapping> => {
  const normalizedAddresses = addresses.map(
    (address) =>
      `arbitrum:${
        NORMALIZED_TOKEN_MAPPING[address.toLowerCase()] ?? address.toLowerCase()
      }`
  );
  const response = await fetch(
    `https://coins.llama.fi/prices/current/${normalizedAddresses.join(",")}`
  );
  const result = (await response.json()) as LlamaTokensResponse;
  return Object.entries(result.coins).reduce((acc, [address, { price }]) => {
    const tokenName = address.split(":")[1];

    if (!tokenName) return acc;

    return {
      ...acc,
      [tokenName]: price,
    };
  }, {} as TokenPriceMapping);
};
