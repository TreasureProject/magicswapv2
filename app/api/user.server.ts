import type { ExecutionResult } from "graphql";

import { createPoolsFromPairs } from "./pools.server";
import type { getUserQuery } from ".graphclient";
import { execute, getUserDocument } from ".graphclient";
import type { AccountDomains } from "~/types";

export const fetchUser = async (address: string) => {
  const result = (await execute(getUserDocument, {
    id: address,
  })) as ExecutionResult<getUserQuery>;
  const { user } = result.data ?? {};
  if (!user) {
    return undefined;
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
