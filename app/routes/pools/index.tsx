import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { Button } from "~/components/Button";
import { fetchPools } from "~/api/pools.server";
import { PoolImage } from "~/components/pools/PoolImage";
import type { Pool } from "~/types";
import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs } from "~/components/Tabs";
import { PoolIcon } from "~/components/Icons";
import { Badge } from "~/components/Badge";

export async function loader() {
  return json({
    pools: await fetchPools(),
  });
}

export default function PoolsListPage() {
  const { pools } = useLoaderData<typeof loader>();
  const [tab, setTab] = useState("all");
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Pools</h1>
          <p className="text-night-200">
            Earn from the Liquidity Provider fees by adding NFTs or tokens as
            liquidity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button mode="secondary">Learn More</Button>
          <Button>New Position</Button>
        </div>
      </div>
      <Tabs
        className="mt-8"
        tabs={[
          {
            id: "all",
            title: (
              <span className="flex items-center gap-2">
                <PoolIcon className="h-4 w-4" />
                All Pools
              </span>
            ),
          },
          {
            id: "user",
            title: (
              <span className="flex items-center gap-2">
                Your Positions
                <Badge>0</Badge>
              </span>
            ),
          },
        ]}
        activeTab={tab}
        onChange={setTab}
      />
      <table className="mt-6 w-full rounded-md bg-night-900 text-white">
        <thead>
          <tr>
            <th className="py-2.5 px-5 text-left text-sm font-normal text-night-200">
              Name
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-night-200">
              Volume (24h)
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-night-200">
              <abbr title="Annual Percentage Rate">APR</abbr>
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-night-200">
              <abbr title="Total Value Locked">TVL</abbr>
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-night-200">
              Fees
            </th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr key={pool.id}>
              <td className="flex items-center py-4 px-5 text-left font-medium uppercase">
                <PoolImage pool={pool as Pool} />
                {pool.name}
              </td>
              <td className="py-4 px-5 text-right">?</td>
              <td className="py-4 px-5 text-right">?</td>
              <td className="py-4 px-5 text-right">?</td>
              <td className="py-4 px-5 text-right">?</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
