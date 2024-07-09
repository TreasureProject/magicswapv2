import type { ExecutionResult } from "graphql";

import { GetStatsDocument, type GetStatsQuery, execute } from ".graphclient";

const fetchStats = async () => {
  const result = (await execute(
    GetStatsDocument,
    {}
  )) as ExecutionResult<GetStatsQuery>;
  const { factories = [], dayDatas = [] } = result.data ?? {};
  return {
    global: factories[0],
    day: dayDatas[0],
  };
};

export const fetchMagicUSD = async () => {
  const stats = await fetchStats();
  return Number(stats.global?.magicUSD ?? 0);
};
