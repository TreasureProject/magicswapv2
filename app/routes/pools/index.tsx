import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import { Button } from "~/components/Button";
import { getPools } from "~/api/pools.server";
import { PoolImage } from "~/components/pools/PoolImage";
import type { Pool } from "~/types";

export async function loader() {
  return json({
    pools: await getPools(),
  });
}

export default function PoolsListPage() {
  const { pools } = useLoaderData<typeof loader>();
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-white">Pools</h1>
          <p>
            Earn from the Liquidity Provider fees by adding NFTs or tokens as
            liquidity.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button mode="secondary">Learn More</Button>
          <Button>New Position</Button>
        </div>
      </div>
      <table className="mt-6 w-full rounded-md bg-steel-700 text-white">
        <thead>
          <tr>
            <th className="py-2.5 px-5 text-left text-sm font-normal text-steel-100">
              Name
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-steel-100">
              Volume (24h)
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-steel-100">
              <abbr title="Annual Percentage Rate">APR</abbr>
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-steel-100">
              <abbr title="Total Value Locked">TVL</abbr>
            </th>
            <th className="py-2.5 px-5 text-right text-sm font-normal text-steel-100">
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
