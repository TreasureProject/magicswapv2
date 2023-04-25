import { formatEther } from "@ethersproject/units";
import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeftRightIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "lucide-react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { useAccount, useBalance } from "wagmi";

import { fetchPool } from "~/api/pools.server";
import Table, { CopyTable } from "~/components/Table";
import { PoolDepositTab } from "~/components/pools/PoolDepositTab";
import { PoolImage } from "~/components/pools/PoolImage";
import { PoolTokenInfo } from "~/components/pools/PoolTokenInfo";
import { PoolWithdrawTab } from "~/components/pools/PoolWithdrawTab";
import { Button } from "~/components/ui/Button";
import { MultiSelect } from "~/components/ui/MultiSelect";
import { formatBalance, formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { AddressString } from "~/types";

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
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<string>("deposit");

  type PoolActivityFilters = "all" | "swap" | "deposit" | "withdraw";
  const [poolActivityFilter, setPoolActivityFilter] =
    useState<PoolActivityFilters>("all");
  const poolActivityFilters = ["all", "swap", "deposit", "withdraw"];

  const { data: rawLpBalance } = useBalance({
    address,
    token: pool.id as AddressString,
    enabled: !!address,
  });

  const lpBalance = formatEther(rawLpBalance?.value ?? "0");
  const lpShare = Number(lpBalance) / pool.totalSupply;

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
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="w-full space-y-6 md:flex-row">
            <div className="flex flex-col justify-between gap-6 sm:flex-row md:items-center">
              <PoolTokenInfo token={pool.baseToken} />
              <PoolTokenInfo token={pool.quoteToken} />
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
                  </abbr>
                  :{" "}
                  <span className="font-medium">
                    {formatUSD(pool.tvlUSD * lpShare)}
                  </span>
                </span>
              </div>
              <div className="flex flex-col px-2 py-6">
                <div className="flex items-center">
                  <PoolImage pool={pool} className="h-10 w-10" />
                  <p className="text-base-100 text-3xl font-medium leading-[160%]">
                    {formatBalance(rawLpBalance?.formatted ?? 0)}
                  </p>
                </div>
                <p className="text-sm text-night-400">
                  Current LP Token Balance
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[pool.baseToken, pool.quoteToken].map((token) => (
                  <div key={token.id} className="space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="font-bold leading-[160%] text-night-100">
                        {token.name}
                      </p>
                      {token.name.toUpperCase() !==
                      token.symbol.toUpperCase() ? (
                        <>
                          <div className="h-3 w-[1px] bg-night-400" />
                          <p className="font-regular uppercase leading-[160%] text-night-300">
                            {token.symbol}
                          </p>
                        </>
                      ) : null}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 overflow-hidden rounded-full bg-night-1000">
                          {!!token.image && <img src={token.image} alt="" />}
                        </div>
                        <p className="text-3xl font-medium leading-[160%]">
                          {formatBalance(token.reserve * lpShare)}
                        </p>
                      </div>
                      <p className="text-night-500">
                        {formatUSD(token.reserve * lpShare * token.priceUSD)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Table
                items={[
                  // { label: "Initial LP Tokens", value: 0.0 },
                  // { label: "Rewards Earned", value: 0.0 },
                  {
                    label: "Current Share of Pool",
                    value: formatPercent(lpShare),
                  },
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
                  </abbr>
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
                        {formatBalance(token.reserve)}
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
            {/* <div className="flex w-full items-center justify-center gap-4 rounded-lg border border-night-800 p-3 text-night-400">
              <p className="text-sm font-medium">Rewards: 0.52%</p>
              <p className="text-sm font-medium">Fees: 5.67%</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row ">
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                <p className="text-night-500">Volume (24h)</p>
                <p className="font-bold text-night-100">$11,249,366</p>
              </div>
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                <p className="text-night-500">APR</p>
                <p className="font-bold text-night-100">4,21%</p>
              </div>
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                <p className="text-night-500">Fees (24h)</p>
                <p className="font-bold text-night-100">$11,249,366</p>
              </div>
            </div> */}
          </div>
          {/*Here the code splits between the left and right side (atleast on desktop) */}
          <div className="space-y-6 rounded-lg bg-night-1100 p-4">
            <MultiSelect
              tabs={[
                {
                  id: "deposit",
                  name: "Deposit",
                },
                {
                  id: "withdraw",
                  name: "Withdraw",
                },
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            {activeTab === "withdraw" && (
              <PoolWithdrawTab pool={pool} balance={lpBalance} />
            )}
            {activeTab === "deposit" && <PoolDepositTab pool={pool} />}
            {activeTab === "summary" && (
              <>
                <div className="flex w-full flex-col items-center gap-1 pt-6">
                  <div className="flex items-center gap-1">
                    <h1 className="text-3xl font-bold leading-[160%]">
                      Liquidity Removed
                    </h1>
                    <CheckIcon className="w-12 text-ruby-800" />
                  </div>
                  <p className="max-w-sm text-center text-sm text-night-400">
                    You have withdrawn the following items from the pool. Your
                    balance will be updated.
                  </p>
                </div>
                <div className="w-full">
                  <div className="mb-3 flex w-full items-center justify-between">
                    <p className="font-medium text-night-400">
                      {pool.baseToken.name}
                    </p>
                    <p className=" text-night-500">14</p>
                  </div>
                  <div className="grid grid-cols-4 justify-between sm:grid-cols-6 md:grid-cols-10 lg:grid-cols-6 xl:grid-cols-7">
                    {[
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                      {},
                    ].map((item, index) => (
                      <div className="flex flex-col items-center" key={index}>
                        <div className="h-[72px] w-[72px] rounded-md border-2 border-night-1200 bg-night-900"></div>
                        <p className=" text-sm leading-[160%] text-night-600">
                          2x
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full">
                  <p className="mb-3 font-medium capitalize text-night-400">
                    {pool.quoteToken.name}
                  </p>
                  <div className="gap flex items-center gap-4">
                    {pool.quoteToken.image ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={pool.quoteToken.image}
                        alt=""
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-night-900" />
                    )}
                    <h1 className="text-3xl font-bold text-night-100">
                      19,429
                    </h1>
                  </div>
                </div>
                <Table
                  items={[
                    {
                      label: "LP Tokens Spend",
                      icon: {
                        token0: pool.baseToken.image,
                        token1: pool.quoteToken.image,
                      },
                      value: "5398.35",
                    },
                    {
                      label: "LP Token Value",
                      value: "$125,000.00",
                    },
                    {
                      label: "Percentage of pool",
                      value: "$0.25%",
                    },
                  ]}
                />
                <div>
                  <CopyTable
                    label="Transaction ID:"
                    value="2BBWCVM...57YUTU3Q"
                  />
                  <div className="mt-2 flex cursor-pointer items-center gap-1 text-night-400 transition-colors hover:text-night-100">
                    <p className="text-xs">View on Arbiscan</p>
                    <ExternalLinkIcon className="w-3" />
                  </div>
                </div>
                <Button onClick={() => setActiveTab("deposit")}>Confirm</Button>
              </>
            )}
          </div>
        </div>
        {/*Here the pool & inventory start */}
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
        <PoolActivityTable token0={pool.baseToken} token1={pool.quoteToken} />
        {pool.baseToken.isNft || pool.quoteToken.isNft ? (
          <>
            <h3 className="flex items-center gap-3 font-medium">
              <ArrowLeftRightIcon className="h-4 w-4" />
              Pool Inventory
            </h3>
            {pool.baseToken.isNft && (
              <PoolTokenCollectionInventory token={pool.baseToken} />
            )}
            {pool.quoteToken.isNft && (
              <PoolTokenCollectionInventory token={pool.quoteToken} />
            )}
          </>
        ) : null}
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
                <td className="flex items-center justify-end gap-2 px-4 py-4 text-end sm:px-5">
                  <button className="cursor-pointer rounded-md p-1.5 text-night-400 transition-colors hover:text-night-100">
                    <ExternalLinkIcon className="w-5" />
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
                </td>
              </tr>

              {expandedRow === 0 && (
                <motion.div
                  initial={{ height: "0px", opacity: 0 }}
                  animate={{ height: "max", opacity: 1 }}
                  exit={{ height: "0px", opacity: 0 }}
                  className={cn("grid w-full bg-night-1100 px-3 py-6")}
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
            <span className="font-semibold">{name}</span>
            <span className="h-3 w-[1px] bg-night-400" />
            <span className="uppercase text-night-400">{symbol}</span>
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
