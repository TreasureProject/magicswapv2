import { Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { fetchPool } from "~/api/pools.server";
import { Badge } from "~/components/Badge";
import {
  ArrowLeftRight as ArrowLeftRightIcon,
  ExternalLink as ExternalLinkIcon,
  ChevronDown as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from "lucide-react";
import { PoolTokenInfo } from "~/components/pools/PoolTokenInfo";
import type { Pool, PoolToken } from "~/types";
import { formatUSD } from "~/lib/currency";
import { PoolImage } from "~/components/pools/PoolImage";
import { cn } from "~/lib/utils";
import { Button } from "~/components/Button";
import { motion, AnimatePresence } from "framer-motion";
import SelectionFrame from "~/components/item_selection/SelectionFrame";
import Table from "~/components/Table";

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
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  type PoolActivityFilters = "all" | "swap" | "deposit" | "withdraw";
  const [poolActivityFilter, setPoolActivityFilter] =
    useState<PoolActivityFilters>("all");
  const poolActivityFilters = ["all", "swap", "deposit", "withdraw"];

  return (
    <main className="container">
      <h1 className="flex items-center text-2xl font-bold uppercase">
        <Link
          to="/pools"
          className="py-2 pl-2 pr-4 text-night-400 transition-colors hover:text-night-100"
        >
          <ChevronLeftIcon className="h-6" />
        </Link>
        {pool.name} Pool
      </h1>
      <div className="mt-6 space-y-6">
        <div className="flex flex-col gap-10 lg:flex-row ">
          <div className="w-full space-y-6 md:flex-row">
            <div className="flex  items-center justify-between gap-6 ">
              <PoolTokenInfo token={pool.baseToken as PoolToken} />
              <PoolTokenInfo token={pool.quoteToken as PoolToken} />
            </div>
            <div className="h-[1px] bg-night-900" />
            <div className="space-y-4 rounded-md bg-night-1100 p-4">
              <div className="flex items-center justify-between gap-3 rounded-md bg-night-900 px-4 py-2">
                <h3 className="font-semibold">Your Positions</h3>
                <span className="text-night-200">
                  <abbr
                    title="Total Value Locked"
                    className="text-night-600 no-underline"
                  >
                    TVL
                  </abbr>{" "}
                  :{" "}
                  <span className="font-medium">{formatUSD(pool.tvlUSD)}</span>
                </span>
              </div>
              <div className="flex flex-col py-6 px-2">
                <div className="flex items-center">
                  <PoolImage pool={pool as Pool} className="h-10 w-10" />
                  <p className="text-base-100 text-3xl font-medium leading-[160%]">
                    0.00
                  </p>
                </div>
                <p className="text-sm text-night-400">
                  Current LP token Balance
                </p>
              </div>
              <div className="flex w-full flex-col gap-4 px-2 sm:flex-row lg:flex-col xl:flex-row xl:gap-0 ">
                <div className="flex w-1/2 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <p className="font-bold uppercase leading-[160%] text-night-100">
                      {pool.token1.name}
                    </p>
                    <div className="h-3 w-[1px] bg-night-400" />
                    <p className="font-regular leading-[160%] text-night-300">
                      {!pool.token1.isNft && "$"}
                      {pool.token1.name}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="h-7 w-7 overflow-hidden rounded-full bg-night-1000">
                        {pool.token1.image && (
                          <img
                            src={pool.token1.image}
                            alt={`${pool.token1.name} token`}
                          />
                        )}
                      </div>
                      <p className="text-base-100 text-3xl font-medium leading-[160%]">
                        {pool.token1.reserve}
                      </p>
                    </div>
                    <p className="text-night-500">$0.00</p>
                  </div>
                </div>
                <div className="flex w-1/2 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <p className="font-bold uppercase leading-[160%] text-night-100">
                      {pool.token0.name}
                    </p>
                    <div className="h-3 w-[1px] bg-night-400" />
                    <p className="font-regular leading-[160%] text-night-300">
                      {!pool.token0.isNft && "$"}
                      {pool.token0.name}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-4">
                      <div className="h-7 w-7 overflow-hidden rounded-full bg-night-1000">
                        {pool.token0.image && (
                          <img
                            src={pool.token0.image}
                            alt={`${pool.token0.name} token`}
                          />
                        )}
                      </div>
                      <p className="text-base-100 text-3xl font-medium leading-[160%]">
                        {pool.token0.reserve}
                      </p>
                    </div>
                    <p className="text-night-500">$0.00</p>
                  </div>
                </div>
              </div>
              <Table
                items={[
                  { label: "Initial LP Tokens", value: 0.0 },
                  { label: "Rewards earned", value: 0.0 },
                  { label: "Current share of pool", value: 0.0 },
                ]}
              />
            </div>
            <div className="space-y-4 rounded-md bg-night-1100 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold">Pool Reserves</h3>
                <span className="text-night-200">
                  <abbr
                    title="Total Value Locked"
                    className="text-night-600 no-underline"
                  >
                    TVL
                  </abbr>{" "}
                  :{" "}
                  <span className="font-medium">{formatUSD(pool.tvlUSD)}</span>
                </span>
              </div>
              <div className="flex items-center justify-center gap-4 text-night-400">
                <span className="font-medium">
                  <span className="text-night-100">1</span>{" "}
                  {pool.baseToken.symbol}
                </span>
                <ArrowLeftRightIcon className="h-4 w-4 text-night-600" />
                <span className="font-medium">
                  <span className="text-night-100">
                    {pool.quoteToken.reserve / pool.baseToken.reserve}
                  </span>{" "}
                  {pool.quoteToken.symbol}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {[pool.baseToken, pool.quoteToken].map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between gap-4 rounded-md bg-night-1200 p-3"
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <div
                        className={cn(
                          "h-6 w-6 overflow-hidden rounded-full bg-night-900"
                          // token.isNft ? "rounded" : "rounded-full"
                        )}
                      >
                        {!!token.image && <img src={token.image} alt="" />}
                      </div>
                      {token.symbol}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-night-100">
                        {" "}
                        {token.reserve}
                      </span>
                      <div className="h-3 w-[1px] bg-night-700" />
                      <span className="font-medium text-night-400">
                        {" "}
                        {formatUSD(token.reserve * token.priceUSD)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex w-full items-center justify-center gap-4 rounded-lg border border-night-800 p-3 text-night-400">
              <p className="text-sm font-medium">Rewards: 0.52%</p>
              <p className="text-sm font-medium">Fees: 5.67%</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row ">
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 py-3 px-4">
                <p className="text-night-500">Volume (24h)</p>
                <p className="font-bold text-night-100">$11,249,366</p>
              </div>
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 py-3 px-4">
                <p className="text-night-500">APR</p>
                <p className="font-bold text-night-100">4,21%</p>
              </div>
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 py-3 px-4">
                <p className="text-night-500">Fees (24h)</p>
                <p className="font-bold text-night-100">$11,249,366</p>
              </div>
            </div>
          </div>
          <div className="flex h-max w-full flex-col gap-6 rounded-lg bg-night-1100 p-4 xl:min-w-[512px]">
            <div className="flex w-full items-center justify-between  rounded-full bg-night-1200 p-2">
              <button
                className={cn(
                  "w-full rounded-full py-2  font-medium leading-[160%] text-night-400  transition-colors",
                  activeTab === "deposit" && "bg-night-900 text-night-100"
                )}
                onClick={() => setActiveTab("deposit")}
              >
                Deposit
              </button>
              <button
                className={cn(
                  "w-full rounded-full py-2  font-medium leading-[160%]  text-night-400 transition-colors",
                  activeTab === "withdraw" && "bg-night-900 text-night-100"
                )}
                onClick={() => setActiveTab("withdraw")}
              >
                Withdraw
              </button>
            </div>
            <SelectionFrame
              title="Initial Asset"
              token={pool.token1 as PoolToken}
              mode="transparent"
            />
            <SelectionFrame
              title="Paired Asset"
              token={pool.token0 as PoolToken}
              mode="transparent"
            />
            <Table
              items={[
                { label: "Current Share of Pool", value: "0.00%" },
                { label: "New Share of Pool", value: "0.00%" },
                {
                  label: "LP Tokens Owned",
                  icon: {
                    token0: pool.token0.image,
                    token1: pool.token1.image,
                  },
                  value: 1539,
                },
                {
                  label: "LP Tokens Spent",
                  icon: {
                    token0: pool.token0.image,
                    token1: pool.token1.image,
                  },
                  value: 0.0,
                },
              ]}
            >
              Test
            </Table>
            <Button disabled>Remove Liquidity</Button>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <h3 className="flex items-center gap-3 font-medium">
            <ArrowLeftRightIcon className="h-4 w-4" />
            Pool Activity
          </h3>
          <div className="flex gap-2">
            {poolActivityFilters.map((filter) => (
              <button
                className={cn(
                  "text-sm font-medium capitalize text-night-400 hover:text-night-200",
                  filter === poolActivityFilter && "text-night-100"
                )}
                key={filter}
                onClick={() =>
                  setPoolActivityFilter(filter as PoolActivityFilters)
                }
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <PoolActivityTable
          token0={pool.token0 as PoolToken}
          token1={pool.token1 as PoolToken}
        />
        <h3 className="flex items-center gap-3 font-medium">
          <ArrowLeftRightIcon className="h-4 w-4" />
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
    </main>
  );
}

const PoolActivityTable = ({
  token0,
  token1,
}: {
  token0: PoolToken;
  token1: PoolToken;
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const showPerPage = 12;
  const [activePage, setActivePage] = useState<number>(0);

  const handlePagination = (direction: "next" | "prev") => {
    if (direction === "next" && activePage < 1 / showPerPage - 1) {
      setActivePage(activePage + 1);
    }
    if (direction === "prev" && activePage > 0) {
      setActivePage(activePage - 1);
    }
  };
  return (
    <div>
      <table className="mt-4 w-full rounded-md bg-night-1100 text-white sm:mt-6">
        <thead className="border-b border-b-night-900">
          <tr>
            <th className="px-4 py-2.5 text-left text-sm font-normal text-night-200 sm:px-5">
              Action
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5 ">
              Action
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5">
              <abbr title="Annual Percentage Rate" className="no-underline">
                Amount
              </abbr>
            </th>
            <th className="px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:px-5">
              <abbr title="Total Value Locked" className="no-underline">
                Token Amount
              </abbr>
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5">
              Time
            </th>
            <th className="hidden px-4 py-2.5 text-right text-sm font-normal text-night-200 sm:table-cell sm:px-5"></th>
          </tr>
        </thead>
        <AnimatePresence>
          <tbody className="transition-all">
            <>
              <tr className="border-b border-b-night-900 transition-colors">
                <td className="px-4 py-4 text-left font-medium uppercase sm:px-5">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 overflow-hidden",
                          token0.isNft
                            ? "rounded-[4px]"
                            : "rounded-full bg-night-1000"
                        )}
                      >
                        {token0.image && (
                          <img
                            src={token0.image}
                            className={cn(
                              "h-6 w-6 rounded-full",
                              token0.isNft && "h-9 w-9 rounded-none"
                            )}
                            alt={token0.name}
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium uppercase leading-[160%] text-night-100">
                          {token0.name}
                        </p>
                        <p className="text-sm capitalize leading-[160%] text-night-400">
                          0 {token0.name}
                        </p>
                      </div>
                    </div>
                    <ArrowLeftRightIcon className="w-6 text-night-400" />
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-9 w-9 overflow-hidden",
                          token1.isNft
                            ? "rounded-[4px]"
                            : "rounded-full bg-night-1000"
                        )}
                      >
                        {token1.image && (
                          <img
                            src={token1.image}
                            className={cn(
                              "h-6 w-6 rounded-full",
                              token1.isNft && "h-9 w-9 rounded-none"
                            )}
                            alt={token1.name}
                          />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium uppercase leading-[160%] text-night-100">
                          {token1.name}
                        </p>
                        <p className="text-sm capitalize leading-[160%] text-night-400">
                          0 {token1.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                  Sell
                </td>
                <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                  $0.00
                </td>
                <td className="px-4 py-4 text-right sm:px-5">0</td>
                <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                  12:42:00
                </td>
                <div className="flex items-center justify-end gap-2 px-4 py-4 text-end sm:px-5">
                  <button className="cursor-pointer rounded-md p-1.5 text-night-400 transition-colors hover:text-night-100">
                    <ExternalLinkIcon className="w-5 " />
                  </button>
                  <button
                    className="cursor-pointer rounded-md p-1.5 text-night-400 transition-colors hover:bg-night-900 hover:text-night-100"
                    onClick={() => setExpandedRow(expandedRow === 0 ? null : 0)}
                  >
                    <ChevronDownIcon
                      className={cn(
                        "w-5 transition-all",
                        expandedRow === 0 && "-rotate-180"
                      )}
                    />
                  </button>
                </div>
              </tr>

              {expandedRow === 0 && (
                <motion.div
                  initial={{ height: "0px", opacity: 0 }}
                  animate={{ height: "max", opacity: 1 }}
                  exit={{ height: "0px", opacity: 0 }}
                  className={cn("grid w-full bg-night-1100 py-6 px-3")}
                >
                  {token0.isNft &&
                    token0.reserveItems.map(
                      ({ tokenId, name, image, amount }) => (
                        <div
                          key={tokenId}
                          className="relative h-24 w-24 overflow-hidden rounded"
                        >
                          <img src={image} alt={name} />
                          <span className="absolute right-1 top-1 rounded-lg bg-night-100 px-1.5 py-0.5 text-xs font-bold text-night-900">
                            {amount}x
                          </span>
                        </div>
                      )
                    )}
                </motion.div>
              )}
            </>
          </tbody>
        </AnimatePresence>
      </table>
      <nav className="flex w-full items-center justify-between rounded-b-lg bg-night-1100 px-3 py-2">
        <button
          className="flex items-center rounded-md bg-transparent p-2 text-night-500 transition-colors hover:bg-night-900 hover:text-night-200"
          onClick={() => handlePagination("prev")}
        >
          <ChevronLeftIcon className="w-6" />
          <p className="text-sm font-medium">Previous</p>
        </button>
        <p className="text-night-500">
          Showing{" "}
          <span className="font-medium text-night-200">
            {activePage * showPerPage + 1}
          </span>{" "}
          to <span className="font-medium text-night-200">1</span> of{" "}
          <span className="font-medium text-night-200">1</span>
        </p>
        <button
          className="flex items-center rounded-md bg-transparent p-2 text-night-500 transition-colors hover:bg-night-900 hover:text-night-200"
          onClick={() => handlePagination("next")}
        >
          <p className="text-sm font-medium">Next</p>
          <ChevronRightIcon className="w-6" />
        </button>
      </nav>
    </div>
  );
};

const PoolTokenCollectionInventory = ({ token }: { token: PoolToken }) => (
  <>
    {token.collections.map(({ id, name, symbol }) => (
      <div key={id} className="rounded-lg bg-night-1100">
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
