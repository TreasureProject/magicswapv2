import type { ExecutionResult } from "graphql";

import { createPoolsFromPairs } from "./pools.server";
import { GetUserDocument, type GetUserQuery, execute } from ".graphclient";
import { getCachedValue } from "~/lib/cache.server";
import { ENV } from "~/lib/env.server";
import type { AccountDomains } from "~/types";

export const fetchUser = async (address: string) => {
  const result = (await execute(GetUserDocument, {
    id: address,
  })) as ExecutionResult<GetUserQuery>;
  const { user } = result.data ?? {};
  if (!user) {
    return null;
  }

  return {
    ...user,
    pools: await createPoolsFromPairs(
      user.liquidityPositions.map(({ pair }) => pair)
    ),
  };
};

export const fetchDomain = async (address: string) =>
  getCachedValue(`domain-${address}`, async () => {
    const response = await fetch(`${ENV.TROVE_API_URL}/domain/${address}`, {
      headers: {
        "X-API-Key": ENV.TROVE_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching domain: ${response.statusText}`);
    }

    const result = (await response.json()) as AccountDomains;
    return result;
  });
