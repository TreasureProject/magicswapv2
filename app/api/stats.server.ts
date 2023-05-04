import type { ExecutionResult } from "graphql";

import type { getStatsQuery } from ".graphclient";
import { execute, getStatsDocument } from ".graphclient";

export const fetchStats = async () => {
  const result = (await execute(
    getStatsDocument,
    {}
  )) as ExecutionResult<getStatsQuery>;
  const { factories = [], dayDatas = [] } = result.data ?? {};
  return {
    global: factories[0],
    day: dayDatas[0],
  };
};
