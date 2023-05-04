import type { ExecutionResult } from "graphql";

import { createPoolsFromPairs } from "./pools.server";
import type { getUserQuery } from ".graphclient";
import { execute, getUserDocument } from ".graphclient";

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
