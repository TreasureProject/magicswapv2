import { Suspense } from "react";
import { Await, Link, useNavigate } from "react-router";

import { fetchUserPositions } from "~/api/user.server";
import { Badge } from "~/components/Badge";
import { MagicStarsIcon } from "~/components/ConnectButton";
import { PoolImage } from "~/components/pools/PoolImage";
import { Skeleton } from "~/components/ui/Skeleton";
import { formatAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import { getSession } from "~/sessions";
import type { Route } from "./+types/pools.my-positions";
import type { PoolsHandle } from "./pools";

export const handle: PoolsHandle = {
  tab: "user",
};

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const address = session.get("address");
  const url = new URL(request.url);
  const search = url.searchParams.get("search");
  const chainId = url.searchParams.get("chain");

  const fetchAndFilterUserPositions = async () => {
    const { total, positions } = await fetchUserPositions({
      address,
      chainId: chainId ? Number(chainId) : undefined,
    });
    return {
      total,
      positions: positions.filter(
        ({ pool: { name, token0, token1 } }) =>
          // Filter by search query
          !search ||
          name.toLowerCase().includes(search) ||
          token0.symbol.toLowerCase().includes(search) ||
          token1.symbol.toLowerCase().includes(search) ||
          token0.name.toLowerCase().includes(search) ||
          token1.name.toLowerCase().includes(search) ||
          token0.collectionName?.toLowerCase().includes(search) ||
          token1.collectionName?.toLowerCase().includes(search),
      ),
    };
  };

  return {
    userPositions: fetchAndFilterUserPositions(),
  };
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

export default function UserPositionsListPage({
  loaderData: { userPositions },
}: Route.ComponentProps) {
  const navigate = useNavigate();
  return (
    <table className="mt-4 w-full table-fixed rounded-md bg-night-700 sm:mt-6">
      <thead>
        <tr className="text-silver-100 text-sm">
          <th className="w-1/2 px-4 py-2.5 text-left font-normal text-sm sm:px-5">
            Name
          </th>
          <th className="px-4 py-2.5 text-right font-normal sm:px-5">
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
          fallback={Array.from({ length: 5 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows are identical
            <RowSkeleton key={i} />
          ))}
        >
          <Await resolve={userPositions}>
            {({ positions }) =>
              positions.map(({ balance, pool }) => {
                const lpShare =
                  bigIntToNumber(balance) / bigIntToNumber(pool.totalSupply);
                return (
                  // biome-ignore lint/a11y/useKeyWithClickEvents: it is only used for additional hit space
                  <tr
                    key={pool.address}
                    className="cursor-pointer border-night-500 border-t transition-colors hover:bg-night-600"
                    onClick={() =>
                      navigate(`/pools/${pool.chainId}/${pool.address}`)
                    }
                  >
                    <td className="px-4 py-3.5 text-left font-medium text-white sm:px-5">
                      <Link
                        to={`/pools/${pool.chainId}/${pool.address}`}
                        prefetch="intent"
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PoolImage pool={pool} showChainIcon />
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
                            {pool.incentives &&
                              pool.incentives.items.length > 0 && (
                                <Badge
                                  size="xs"
                                  color="secondary"
                                  title="Incentivized Pool"
                                >
                                  <div className="flex h-3.5 items-center">
                                    <MagicStarsIcon className="h-3" />
                                  </div>
                                </Badge>
                              )}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3.5 text-right text-silver-200 text-sm sm:px-5">
                      {pool.reserveUsd > 0
                        ? formatUSD(lpShare * pool.reserveUsd)
                        : `${formatAmount(lpShare)} MLP`}
                    </td>
                    <td className="hidden px-4 py-3.5 text-right text-silver-200 text-sm sm:table-cell sm:px-5">
                      {formatPercent(pool.apy)}
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
