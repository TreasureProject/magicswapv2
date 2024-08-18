import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer, json } from "@remix-run/node";
import { Await, Link, useLoaderData, useNavigate } from "@remix-run/react";
import { Suspense } from "react";

import { fetchPools } from "~/api/pools.server";
import { fetchUserPositions } from "~/api/user.server";
import { Badge } from "~/components/Badge";
import { PoolImage } from "~/components/pools/PoolImage";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import { getPoolAPY, getPoolVolume24hDisplay } from "~/lib/pools";
import { getSession } from "~/sessions";
import type { PoolsHandle } from "./pools";

export const handle: PoolsHandle = {
  tab: "user",
};

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const address = session.get("address");
  return defer({
    userPositions: fetchUserPositions(address),
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
    <td className="hidden px-4 py-3.5 sm:table-cell sm:px-5">
      <Skeleton className="h-4" />
    </td>
  </tr>
);

export default function UserPositionsListPage() {
  const { userPositions } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <table className="mt-4 w-full rounded-md bg-night-1100 sm:mt-6">
      <thead>
        <tr className="text-night-100 text-sm">
          <th className="px-4 py-2.5 text-left font-normal text-sm sm:px-5">
            Name
          </th>
          <th className="hidden px-4 py-2.5 text-right font-normal sm:table-cell sm:px-5">
            Balance
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
          <Await resolve={userPositions}>
            {({ positions }) =>
              positions.map(({ balance, pool }) => {
                const lpShare =
                  bigIntToNumber(BigInt(balance)) /
                  bigIntToNumber(BigInt(pool.totalSupply));
                return (
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
                      {pool.reserveUSD > 0
                        ? formatUSD(lpShare * pool.reserveUSD)
                        : `${formatAmount(lpShare)} MLP`}
                    </td>
                    <td className="hidden px-4 py-3.5 text-right text-night-200 text-sm sm:table-cell sm:px-5">
                      {formatPercent(getPoolAPY(pool))}
                    </td>
                  </tr>
                );
              })
            }
          </Await>
        </Suspense>
      </tbody>
    </table>
  );
}
