import { type LoaderFunctionArgs, defer } from "@remix-run/node";
import {
  Await,
  Link,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import { Suspense, useCallback } from "react";

import { fetchPools } from "~/api/pools.server";
import { Badge } from "~/components/Badge";
import { PoolImage } from "~/components/pools/PoolImage";
import { Skeleton } from "~/components/ui/Skeleton";
import { useFocusInterval } from "~/hooks/useFocusInterval";
import {
  getCollectionIdsMapForGame,
  getTokenIdsMapForGame,
} from "~/lib/game.server";
import { formatPercent } from "~/lib/number";
import {
  getPoolFeesDisplay,
  getPoolReserveDisplay,
  getPoolVolume24hDisplay,
} from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import type { PoolsHandle } from "./pools";

export const handle: PoolsHandle = {
  tab: "pools",
};

export function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const gameId = url.searchParams.get("game");

  const fetchAndFilterPools = async () => {
    const allPools = await fetchPools();
    let pools: typeof allPools = [];

    if (gameId) {
      const tokenIdsMap = getTokenIdsMapForGame(gameId);
      for (const pool of allPools) {
        if (tokenIdsMap[pool.token0.id] || tokenIdsMap[pool.token1.id]) {
          pools.push(pool);
        }
      }

      const collectionIdsMap = getCollectionIdsMapForGame(gameId);
      for (const pool of allPools) {
        if (pool.collections.some(({ id }) => collectionIdsMap[id])) {
          pools.push(pool);
        }
      }
    } else {
      pools = allPools;
    }

    if (search) {
      pools = pools.filter(({ name }) =>
        name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    return pools;
  };

  return defer({
    pools: fetchAndFilterPools(),
  });
}

const RowSkeleton = () => (
  <tr>
    <td className="px-4 py-3.5 sm:px-5">
      <div className="flex items-center">
        <div className="flex items-center">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="-translate-x-1/3 h-9 w-9 rounded-full" />
        </div>
        <div className="-ml-2 flex-1 space-y-1 sm:ml-0">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </td>
    <td className="hidden px-4 py-3.5 sm:table-cell sm:px-5">
      <Skeleton className="h-4" />
    </td>
    <td className="px-4 py-3.5 sm:px-5">
      <Skeleton className="h-4" />
    </td>
    <td className="hidden px-4 py-3.5 sm:table-cell sm:px-5">
      <Skeleton className="h-4" />
    </td>
    <td className="hidden px-4 py-3.5 sm:table-cell sm:px-5">
      <Skeleton className="h-4" />
    </td>
  </tr>
);

export default function PoolsListPage() {
  const { pools } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const navigate = useNavigate();

  const refetch = useCallback(() => {
    if (revalidator.state === "idle") {
      // revalidator.revalidate();
    }
  }, [revalidator]);

  useFocusInterval(refetch, 5_000);

  return (
    <table className="mt-4 w-full table-fixed rounded-md bg-night-1100 sm:mt-6">
      <thead>
        <tr className="text-night-100 text-sm">
          <th className="w-2/3 px-4 py-2.5 text-left font-normal text-sm sm:w-1/3 sm:px-5">
            Name
          </th>
          <th className="hidden px-4 py-2.5 text-right font-normal sm:table-cell sm:px-5">
            Volume (24h)
          </th>
          <th className="px-4 py-2.5 text-right font-normal sm:px-5">
            <abbr title="Total Value Locked" className="no-underline">
              TVL
            </abbr>
          </th>
          <th className="hidden px-4 py-2.5 text-right font-normal sm:table-cell sm:px-5">
            LP Fees
          </th>
          <th className="hidden px-4 py-2.5 text-right font-normal sm:table-cell sm:px-5">
            <abbr title="Annual Percentage Yield" className="no-underline">
              APY
            </abbr>
          </th>
        </tr>
      </thead>
      <tbody>
        <Suspense
          fallback={
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are identical
                <RowSkeleton key={i} />
              ))}
            </>
          }
        >
          <Await resolve={pools}>
            {(pools) =>
              pools.map((pool) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: it is only used for additional hit space
                <tr
                  key={pool.id}
                  className="cursor-pointer border-night-900 border-t transition-colors hover:bg-night-1000"
                  onClick={() => navigate(`/pools/${pool.id}`)}
                >
                  <td className="px-4 py-3.5 text-left font-medium text-white sm:px-5">
                    <Link
                      to={`/pools/${pool.id}`}
                      prefetch="intent"
                      className="flex items-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PoolImage pool={pool} />
                      <div className="-ml-2 space-y-1 sm:ml-0">
                        <span className="block">{pool.name}</span>
                        <div className="flex items-center gap-1">
                          <Badge
                            size="xs"
                            color={
                              pool.version === "V2" ? "primary" : "secondary"
                            }
                          >
                            {pool.version}
                          </Badge>
                          <Badge size="xs">
                            {formatPercent(pool.lpFee, 3)}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-night-200 text-sm sm:table-cell sm:px-5">
                    {getPoolVolume24hDisplay(pool)}
                  </td>
                  <td className="px-4 py-3.5 text-right text-night-200 text-sm sm:px-5">
                    {getPoolReserveDisplay(pool)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-night-200 text-sm sm:table-cell sm:px-5">
                    {getPoolFeesDisplay(pool)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-night-200 text-sm sm:table-cell sm:px-5">
                    {formatPercent(pool.apy)}
                  </td>
                </tr>
              ))
            }
          </Await>
        </Suspense>
      </tbody>
    </table>
  );
}
