import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { Button } from "~/components/Button";
import { fetchPools } from "~/api/pools.server";
import { PoolImage } from "~/components/pools/PoolImage";
import type { Pool } from "~/types";
import { useState } from "react";
import { Tabs } from "~/components/Tabs";
import { PoolIcon } from "~/components/Icons";
import { Badge } from "~/components/Badge";
import { Container } from "~/components/Container";

export async function loader() {
  return json({
    pools: await fetchPools(),
  });
}

export default function PoolsListPage() {
  const { pools } = useLoaderData<typeof loader>();
  const [tab, setTab] = useState("all");
  return (
    <Container className="py-6 sm:py-10">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
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
        className="mt-6 grid grid-cols-2 sm:mt-8"
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
                <Badge>0</Badge>
              </div>
            ),
          },
        ]}
        activeTab={tab}
        onChange={setTab}
      />
      <table className="mt-6 w-full rounded-md bg-night-900 text-white">
        <thead>
          <tr>
            <th className="py-2.5 px-4 text-left text-sm font-normal text-night-200 sm:px-5">
              Name
            </th>
            <th className="hidden py-2.5 px-4 text-right text-sm font-normal text-night-200 sm:block sm:px-5">
              Volume (24h)
            </th>
            <th className="hidden py-2.5 px-4 text-right text-sm font-normal text-night-200 sm:block sm:px-5">
              <abbr title="Annual Percentage Rate">APR</abbr>
            </th>
            <th className="py-2.5 px-4 text-right text-sm font-normal text-night-200 sm:px-5">
              <abbr title="Total Value Locked">TVL</abbr>
            </th>
            <th className="hidden py-2.5 px-4 text-right text-sm font-normal text-night-200 sm:block sm:px-5">
              Fees
            </th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr key={pool.id}>
              <td className="flex items-center py-4 px-4 text-left font-medium uppercase sm:px-5">
                <PoolImage pool={pool as Pool} />
                <span className="-ml-2 sm:ml-0">{pool.name}</span>
              </td>
              <td className="hidden py-4 px-4 text-right sm:block sm:px-5">
                ?
              </td>
              <td className="hidden py-4 px-4 text-right sm:block sm:px-5">
                ?
              </td>
              <td className="py-4 px-4 text-right sm:px-5">?</td>
              <td className="hidden py-4 px-4 text-right sm:block sm:px-5">
                ?
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Container>
  );
}
