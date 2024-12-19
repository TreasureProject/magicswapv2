import type { ExecutionResult } from "graphql";

import { arbitrum } from "viem/chains";
import { CHAIN_ID_TO_TROVE_API_NETWORK } from "~/consts";
import { getCachedValue } from "~/lib/cache.server";
import { getOneWeekAgoTimestamp } from "~/lib/date.server";
import { ENV } from "~/lib/env.server";
import type { AccountDomains } from "~/types";
import { pairToPool } from "./pools.server";
import {
  GetUserPositionsDocument,
  type GetUserPositionsQuery,
  execute,
} from ".graphclient";

export const fetchUserPositions = async (address: string | undefined) => {
  if (!address) {
    return {
      total: 0,
      positions: [],
    };
  }

  const result = (await execute(GetUserPositionsDocument, {
    id: address,
    dayDataWhere: {
      date_gte: getOneWeekAgoTimestamp(),
    },
  })) as ExecutionResult<GetUserPositionsQuery>;
  if (!result.data?.user) {
    return {
      total: 0,
      positions: [],
    };
  }

  const { user } = result.data;
  return {
    total: Number(user.liquidityPositionCount),
    positions:
      user.liquidityPositions?.items.map(({ pair, ...liquidityPosition }) => ({
        ...liquidityPosition,
        pool: pairToPool(pair!),
      })) ?? [],
  };
};

export const fetchDomain = async (address: string) =>
  getCachedValue(`domain-${address}`, async () => {
    const response = await fetch(
      `${CHAIN_ID_TO_TROVE_API_NETWORK[arbitrum.id]}/domain/${address}`,
      {
        headers: {
          "X-API-Key": ENV.TROVE_API_KEY,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error fetching domain: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains;
    return result;
  });

export const fetchDomains = async (addresses: string[]) => {
  const uniqueAddresses = [...new Set(addresses.filter((address) => address))];
  return getCachedValue(`domains-${uniqueAddresses.join(",")}`, async () => {
    const response = await fetch(
      `${CHAIN_ID_TO_TROVE_API_NETWORK[arbitrum.id]}/batch-domains`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": ENV.TROVE_API_KEY,
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
