import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { useState } from "react";

import { fetchPools } from "~/api/pools.server";
import { fetchUser } from "~/api/user.server";
import { Badge } from "~/components/Badge";
import { PoolIcon } from "~/components/Icons";
import { Tabs } from "~/components/Tabs";
import { PoolImage } from "~/components/pools/PoolImage";
import { Button } from "~/components/ui/Button";
import { formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import type { Pool } from "~/lib/pools.server";
import { getSession } from "~/sessions";

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const address = session.get("address");

  const [pools, user] = await Promise.all([
    fetchPools(),
    address ? fetchUser(address) : undefined,
  ]);
  return json({
    pools,
    user,
  });
}

const PoolsTable = ({ pools }: { pools: Pool[] }) => {
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
            Earn from the Liquidity Provider fees by adding NFTs or tokens as
            liquidity.
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
                <Badge>{user?.liquidityPositionCount ?? 0}</Badge>
              </div>
            ),
          },
        ]}
        activeTab={tab}
        onChange={setTab}
      />
      {tab === "all" && <PoolsTable pools={pools} />}
      {tab === "user" && (
        <>
          {!user?.liquidityPositionCount && (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:mt-6 sm:gap-6">
              {/* <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-night-1000 p-4">
              <span className="text-xl">
                {user?.liquidityPositionCount ?? 0}
              </span>
              <span className="text-sm text-night-300">Open Positions</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-night-1000 p-4">
              <span className="text-xl">?</span>
              <span className="text-sm text-night-300">Rewards Earned</span>
            </div> */}
              <div className="col-span-2 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-night-1100 px-4 py-8 text-center sm:py-10">
                <p>You currently do not have any open positions.</p>
                <Button onClick={() => setTab("all")}>
                  Create a new position
                </Button>
              </div>
            </div>
          )}
          <PoolsTable pools={user?.pools ?? []} />
        </>
      )}
    </main>
  );
}
