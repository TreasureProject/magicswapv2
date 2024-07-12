import type { ExecutionResult } from "graphql";

import { GetStatsDocument, type GetStatsQuery, execute } from ".graphclient";

const fetchStats = async () => {
  const result = (await execute(
    GetStatsDocument,
    {},
  )) as ExecutionResult<GetStatsQuery>;
  const { factories = [] } = result.data ?? {};
  return factories[0];
};

export const fetchMagicUSD = async () => {
  const stats = await fetchStats();
  return Number(stats?.magicUSD ?? 0);
};
