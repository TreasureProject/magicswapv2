import type { ExecutionResult } from "graphql";

import { createPoolsFromPairs } from "./pools.server";
import { execute, GetUserDocument, type GetUserQuery } from ".graphclient";
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

export const fetchDomain = async (address: string) => {
  const res = await fetch(`${process.env.TROVE_API_URL}/domain/${address}`, {
    headers: {
      "X-API-Key": process.env.TROVE_API_KEY,
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching domain: ${res.statusText}`);
  }

  const result = (await res.json()) as AccountDomains;

  return result;
};
