import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import type { V2_MetaFunction } from "@remix-run/react";
import { Await, Link, useLoaderData } from "@remix-run/react";
import { Suspense, useState } from "react";

import { fetchPools } from "~/api/pools.server";
import { fetchUser } from "~/api/user.server";
import { Badge } from "~/components/Badge";
import { LoaderIcon, PoolIcon } from "~/components/Icons";
import { Tabs } from "~/components/Tabs";
import { PoolImage } from "~/components/pools/PoolImage";
import { Button } from "~/components/ui/Button";
import { formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import type { Pool } from "~/lib/pools.server";
import { generateTitle, getSocialMetas, getUrl } from "~/lib/seo";
import type { RootLoader } from "~/root";
import { getSession } from "~/sessions";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const address = session.get("address");

  if (!address) {
    return defer({
      pools: await fetchPools(),
      user: null,
    });
  }

  return defer({
    pools: await fetchPools(),
    user: fetchUser(address),
  });
}

export const meta: V2_MetaFunction<
  typeof loader,
  {
    root: RootLoader;
  }
> = ({ matches }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;

  const url = getUrl(requestInfo);

  return getSocialMetas({
    url,
    title: generateTitle("Liquidity Pools"),
    image: "/img/pools_banner.png",
  });
};

const PoolsTable = ({ pools }: { pools: Pool[] }) => {
  if (pools.length === 0) return null;

  return (
    <div>
      <table className="mt-4 w-full rounded-md bg-night-1100 text-white sm:mt-6">
        <thead>
          <tr>
            <th className="px-4 py-2.5 text-left text-sm font-normal text-night-200 sm:px-5">
              Name
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5 ">
              Volume (24h)
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5">
              <abbr title="Annual Percentage Rate" className="no-underline">
                APY
              </abbr>
            </th>
            <th className="px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:px-5">
              <abbr title="Total Value Locked" className="no-underline">
                TVL
              </abbr>
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5">
              LP Fees
            </th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr
              key={pool.id}
              className="cursor-pointer border-t border-night-900 transition-colors hover:bg-night-1000"
            >
              <td className="px-4 py-4 text-left font-medium uppercase sm:px-5">
                <Link
                  to={`/pools/${pool.id}`}
                  prefetch="intent"
                  className="flex items-center"
                >
                  <PoolImage pool={pool} />
                  <span className="-ml-2 sm:ml-0">{pool.name}</span>
                </Link>
              </td>
              <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                {formatUSD(pool.volume24h)}
              </td>
              <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                {formatPercent(pool.apy)}
              </td>
              <td className="px-4 py-4 text-right sm:px-5">
                {formatUSD(pool.reserveUSD)}
              </td>
              <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                {formatUSD(pool.feesUSD)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* <nav className="flex w-full items-center justify-between bg-night-1100 px-3 py-2">
        <Button variant="ghost" onClick={() => handlePagination("prev")}>
          <ChevronLeftIcon className="w-6" />
          <p className="text-sm font-medium">Previous</p>
        </Button>
        <p className="text-night-500">
          Showing{" "}
          <span className="font-medium text-night-200">
            {activePage * showPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-medium text-night-200">
            {
              pools.slice(
                activePage * showPerPage,
                activePage * (showPerPage * activePage + 1) + 1
              ).length
            }{" "}
          </span>{" "}
          of <span className="font-medium text-night-200">{pools.length}</span>
        </p>
        <Button variant="ghost" onClick={() => handlePagination("next")}>
          <p className="text-sm font-medium">Next</p>
          <ChevronRightIcon className="w-6" />
        </Button>
      </nav> */}
    </div>
  );
};

export default function PoolsListPage() {
  const { pools, user } = useLoaderData<typeof loader>();
  const [tab, setTab] = useState("all");

  return (
    <main className="container">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Pools</h1>
          <p className="text-night-200">
            Use your game assets to earn rewards by providing liquidity.
          </p>
        </div>
        <Button variant="dark" size="md">
          Learn More
        </Button>
      </div>
      <Tabs
        className="mt-6 grid w-full grid-cols-2 border-b border-b-night-900 sm:mt-8 sm:flex"
        tabs={[
          {
            id: "all",
            title: (
              <div className="flex items-center justify-center gap-2">
                <PoolIcon className="h-4 w-4" />
                All Pools
              </div>
            ),
          },
          {
            id: "user",
            title: (
              <div className="flex items-center justify-center gap-2">
                Your Positions
                <Suspense fallback={<LoaderIcon className="h-4 w-4" />}>
                  <Await resolve={user}>
                    {(user) => (
                      <Badge>{user?.liquidityPositionCount ?? 0}</Badge>
                    )}
                  </Await>
                </Suspense>
              </div>
            ),
          },
        ]}
        activeTab={tab}
        onChange={setTab}
      />
      {tab === "all" && <PoolsTable pools={pools} />}
      {tab === "user" && (
        <Suspense
          fallback={
            <div className="flex h-96 items-center justify-center">
              <LoaderIcon className="h-10 w-auto" />
            </div>
          }
        >
          <Await resolve={user}>
            {(user) => {
              const positionCount = Number(user?.liquidityPositionCount ?? "0");
              return (
                <>
                  {positionCount === 0 ? (
                    <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:gap-6">
                      <div className="col-span-2 flex flex-col items-center justify-center space-y-6 rounded-lg bg-night-1100 px-4 py-8 text-center sm:py-10">
                        <p>You currently do not have any open positions.</p>
                        <Button onClick={() => setTab("all")}>
                          Create a new position
                        </Button>
                      </div>
                    </div>
                  ) : null}
                  {user?.pools ? <PoolsTable pools={user.pools} /> : null}
                </>
              );
            }}
          </Await>
        </Suspense>
      )}
    </main>
  );
}
