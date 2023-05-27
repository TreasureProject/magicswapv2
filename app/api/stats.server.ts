import cachified, { verboseReporter } from "cachified";
import type { ExecutionResult } from "graphql";

import type { getStatsQuery } from ".graphclient";
import { execute, getStatsDocument } from ".graphclient";
import { cache } from "~/lib/cache.server";

export function fetchStats() {
  return cachified({
    key: "magic-value",
    cache,
    async getFreshValue() {
      const result = (await execute(
        getStatsDocument,
        {}
      )) as ExecutionResult<getStatsQuery>;
      const { factories = [], dayDatas = [] } = result.data ?? {};
      return {
        global: factories[0],
        day: dayDatas[0],
      };
    },
    ttl: 1000 * 60, // 1 minutes,
    staleWhileRevalidate: 1000 * 60 * 60 * 24, // 1 day
  });
}

export const fetchMagicUSD = async () => {
  const stats = await fetchStats();
  return Number(stats.global?.magicUSD ?? 0);
};
