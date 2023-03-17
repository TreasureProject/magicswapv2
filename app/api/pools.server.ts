import type { ExecutionResult } from "graphql";
import type { Pool } from "~/types";
import { getPairCollectionAddresses } from "~/utils/pair.server";
import { createPoolName } from "~/utils/pool.server";
import { createPoolToken } from "~/utils/token.server";
import type { getPairsQuery } from "../../.graphclient";
import { execute, getPairsDocument } from "../../.graphclient";
import { getCollections } from "./collections.server";

export const getPools = async (): Promise<Pool[]> => {
  const result = (await execute(
    getPairsDocument,
    {}
  )) as ExecutionResult<getPairsQuery>;
  const { pairs = [] } = result.data ?? {};
  const collectionAddresses = [
    ...new Set(pairs.flatMap((pair) => getPairCollectionAddresses(pair))),
  ];
  const collections = await getCollections(collectionAddresses);
  return pairs.map((pair) => {
    const token0 = createPoolToken(pair.token0, collections);
    const token1 = createPoolToken(pair.token1, collections);
    return {
      id: pair.id,
      name: createPoolName(token0, token1),
      token0,
      token1,
    };
  });
};
