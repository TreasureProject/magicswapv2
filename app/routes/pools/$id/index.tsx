import {
  ArrowsRightLeftIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { fetchPool } from "~/api/pools.server";
import { Badge } from "~/components/Badge";
import { Container } from "~/primitives/Container";
import { InventoryIcon } from "~/primitives/Icons";
import { PoolTokenInfo } from "~/components/pools/PoolTokenInfo";
import type { PoolToken } from "~/types";
import { formatUSD } from "~/utils/currency";
import { cn } from "~/utils/lib";

export async function loader({ params }: LoaderArgs) {
  invariant(params.id, "Pool ID required");

  const pool = await fetchPool(params.id);
  if (!pool) {
    throw new Response("Pool not found", {
      status: 404,
    });
  }

  return json({ pool });
}

export default function PoolDetailsPage() {
  const { pool } = useLoaderData<typeof loader>();
  return (
    <Container className="py-6 sm:py-10">
      <h1 className="flex items-center text-2xl font-bold uppercase">
        <Link
          to="/pools"
          className="py-2 pl-2 pr-4 text-night-400 transition-colors hover:text-night-100"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Link>
        {pool.name} Pool
      </h1>
      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-10 gap-10">
          <div className="col-span-6 space-y-6">
            <div className="flex items-center justify-between gap-6">
              <PoolTokenInfo token={pool.baseToken as PoolToken} />
              <PoolTokenInfo token={pool.quoteToken as PoolToken} />
            </div>
            <div className="h-[1px] bg-night-900" />
            <div className="space-y-4 rounded-md bg-night-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Pool Reserves</h3>
                <span className="text-night-100">
                  <abbr title="Total Value Locked">TVL</abbr>:{" "}
                  {formatUSD(pool.tvlUSD)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-night-400">
                <span>
                  <span className="text-white">1</span> {pool.baseToken.symbol}
                </span>
                <ArrowsRightLeftIcon className="h-4 w-4" />
                <span>
                  {pool.quoteToken.reserve / pool.baseToken.reserve}{" "}
                  {pool.quoteToken.symbol}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[pool.baseToken, pool.quoteToken].map((token) => (
                  <div
                    key={token.id}
                    className="bg-night-1000 flex items-center justify-between gap-4 p-3"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <div
                        className={cn(
                          "h-6 w-6 overflow-hidden bg-night-900",
                          token.isNft ? "rounded" : "rounded-full"
                        )}
                      >
                        {!!token.image && <img src={token.image} alt="" />}
                      </div>
                      {token.symbol}
                    </div>
                    <span>
                      {token.reserve}{" "}
                      <span className="text-night-400">
                        | {formatUSD(token.reserve * token.priceUSD)}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-span-4"></div>
        </div>
        <h3 className="flex items-center gap-3 font-medium">
          <InventoryIcon className="h-4 w-4" />
          Pool Inventory
          <Badge>
            {pool.token0.collections.length +
              pool.token1.collections.length +
              (pool.token0.isNft ? 0 : 1) +
              (pool.token1.isNft ? 0 : 1)}
          </Badge>
        </h3>
        {pool.token0.isNft && (
          <PoolTokenCollectionInventory token={pool.token0 as PoolToken} />
        )}
        {pool.token1.isNft && (
          <PoolTokenCollectionInventory token={pool.token1 as PoolToken} />
        )}
      </div>
    </Container>
  );
}

const PoolTokenCollectionInventory = ({ token }: { token: PoolToken }) => (
  <>
    {token.collections.map(({ id, name, symbol }) => (
      <div key={id} className="rounded-lg bg-night-900">
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold">{symbol}</span>
            <span className="h-3 w-[1px] bg-night-400" />
            <span className="text-night-400">{name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {token.reserveItems
              .filter(({ collectionId }) => collectionId === id)
              .map(({ tokenId, name, image, amount }) => (
                <div
                  key={tokenId}
                  className="relative h-24 w-24 overflow-hidden rounded"
                >
                  <img src={image} alt={name} />
                  <span className="absolute right-1 top-1 rounded-lg bg-night-100 px-1.5 py-0.5 text-xs font-bold text-night-900">
                    {amount}x
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="h-[1px] bg-night-800" />
        <div className="px-6 py-3">
          <span className="text-sm text-night-400">
            Showing {token.reserveItems.length} of {token.reserve}
          </span>
        </div>
      </div>
    ))}
  </>
);
