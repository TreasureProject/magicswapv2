import type { LlamaTokensResponse, TokenPriceMapping } from "~/types";
import { NORMALIZED_TOKEN_MAPPING } from "~/utils/tokens.server";

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
