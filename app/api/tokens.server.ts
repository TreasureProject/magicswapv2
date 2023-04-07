import type {
  LlamaTokensResponse,
  TokenPriceMapping,
  TroveToken,
  TroveTokenMapping,
} from "~/types";
import { NORMALIZED_TOKEN_MAPPING } from "~/lib/tokens.server";

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
    if (!next[token.collectionAddr]) {
      next[token.collectionAddr] = {};
    }

    next[token.collectionAddr][token.tokenId] = token;
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
  return Object.entries(result.coins).reduce(
    (acc, [address, { price }]) => ({
      ...acc,
      [address.split(":")[1]]: price,
    }),
    {} as TokenPriceMapping
  );
};
