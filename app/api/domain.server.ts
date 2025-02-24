import { arbitrum } from "viem/chains";

import { CHAIN_ID_TO_TROVE_API_URL } from "~/consts";
import { getCachedValue } from "~/lib/cache.server";
import { getContext } from "~/lib/env.server";
import type { AccountDomains } from "~/types";

export const fetchDomain = async (address: string) => {
  const { env } = getContext();
  return getCachedValue(`domain-${address}`, async () => {
    const response = await fetch(
      `${CHAIN_ID_TO_TROVE_API_URL[arbitrum.id]}/domain/${address}`,
      {
        headers: {
          "X-API-Key": env.TROVE_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching domain: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains;
    return result;
  });
};

export const fetchDomains = async (addresses: string[]) => {
  const uniqueAddresses = [
    ...new Set(addresses.filter((address) => address)),
  ].sort();
  const { env } = getContext();
  return getCachedValue(`domains-${uniqueAddresses.join(",")}`, async () => {
    const response = await fetch(
      `${CHAIN_ID_TO_TROVE_API_URL[arbitrum.id]}/batch-domains`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": env.TROVE_API_KEY,
        },
        body: JSON.stringify({ addresses: uniqueAddresses }),
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching domains: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains[];
    return result.reduce(
      (acc, domain) => {
        acc[domain.address] = domain;
        return acc;
      },
      {} as Record<string, AccountDomains>,
    );
  });
};
