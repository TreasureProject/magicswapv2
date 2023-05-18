import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  PlusIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
import invariant from "tiny-invariant";
import { useAccount, useBalance } from "wagmi";

import { fetchPool } from "~/api/pools.server";
import { LoaderIcon } from "~/components/Icons";
import Table from "~/components/Table";
import { VisibleOnClient } from "~/components/VisibleOnClient";
import { PoolDepositTab } from "~/components/pools/PoolDepositTab";
import { PoolImage } from "~/components/pools/PoolImage";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { PoolTransactionImage } from "~/components/pools/PoolTransactionImage";
import { PoolWithdrawTab } from "~/components/pools/PoolWithdrawTab";
import { MultiSelect } from "~/components/ui/MultiSelect";
import { useBlockExplorer } from "~/hooks/useBlockExplorer";
import { useIsMounted } from "~/hooks/useIsMounted";
import { truncateEthAddress } from "~/lib/address";
import { formatBigInt, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatNumber, formatPercent } from "~/lib/number";
import type { Pool, PoolTransactionType } from "~/lib/pools.server";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { AddressString, Optional } from "~/types";

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

  const [poolActivityFilter, setPoolActivityFilter] =
    useState<Optional<PoolTransactionType>>();

  const { data: rawLpBalance } = useBalance({
    address,
    token: pool.id as AddressString,
    enabled: !!address,
  });

  const lpBalance = rawLpBalance?.value ?? BigInt(0);
  const lpShare =
    bigIntToNumber(lpBalance) / bigIntToNumber(BigInt(pool.totalSupply));

  return (
    <main className="container">
      <Link
        to="/pools"
        className="flex items-center text-xs text-night-400 transition-colors hover:text-night-100"
      >
        <ChevronLeftIcon className="h-4" />
        All Pools
      </Link>
      <div className="mt-6">
        <div className="relative grid grid-cols-1 items-start gap-10 lg:grid-cols-7">
          <div className="space-y-6 md:flex-row lg:col-span-4">
            <div className="flex items-center -space-x-2">
              <PoolImage pool={pool} className="h-auto w-14" />
              <div className="flex flex-col text-2xl">
                <span>{pool.name}</span>
                <span className="text-xs text-night-400">
                  LP Fees: {formatPercent(pool.lpFee)}
                </span>
              </div>
            </div>
            <div className="h-[1px] bg-night-900" />
            <div className="space-y-4 rounded-md bg-night-1100 p-4">
              <div className="flex items-center justify-between gap-3 rounded-md bg-night-900 px-4 py-2">
                <h3 className="font-medium">Your Positions</h3>
                <span className="text-night-200">
                  <abbr
                    title="Total Value Locked"
                    className="text-night-600 no-underline"
                  >
                    TVL
                  </abbr>
                  :{" "}
                  <VisibleOnClient>
                    {formatUSD(lpShare * pool.reserveUSD)}
                  </VisibleOnClient>
                </span>
              </div>
              <div className="flex flex-col space-y-2 px-2 py-4">
                <div className="flex items-center -space-x-1">
                  <PoolImage pool={pool} className="h-10 w-10" />
                  <VisibleOnClient>
                    <p className="text-3xl text-night-100">
                      {formatBigInt(lpBalance, 18, 5)}
                    </p>
                  </VisibleOnClient>
                </div>
                <p className="text-sm text-night-400">
                  Current LP Token Balance
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[pool.baseToken, pool.quoteToken].map((token) => (
                  <div key={token.id} className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <p className="font-medium text-night-100">{token.name}</p>
                      {token.name.toUpperCase() !==
                      token.symbol.toUpperCase() ? (
                        <>
                          <div className="h-3 w-[1px] bg-night-400" />
                          <p className="font-regular uppercase text-night-300">
                            {token.symbol}
                          </p>
                        </>
                      ) : null}
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <PoolTokenImage className="h-6 w-6" token={token} />
                        <VisibleOnClient>
                          <p className="text-night-100">
                            {formatUSD(lpShare * token.reserve)}
                          </p>
                        </VisibleOnClient>
                      </div>
                      <VisibleOnClient>
                        <p className="text-xs text-night-500">
                          {formatUSD(lpShare * token.reserve * token.priceUSD)}
                        </p>
                      </VisibleOnClient>
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
                    value: (
                      <VisibleOnClient>
                        {formatPercent(lpShare)}
                      </VisibleOnClient>
                    ),
                  },
                ]}
              />
            </div>
            <div className="rounded-md bg-night-1100 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Pool Reserves</h3>
                <span className="text-night-200">
                  <abbr
                    title="Total Value Locked"
                    className="text-night-600 no-underline"
                  >
                    TVL
                  </abbr>
                  : <span className="">{formatUSD(pool.reserveUSD)}</span>
                </span>
              </div>
              <div className="mt-4 grid grid-cols-[1fr,max-content,1fr] items-center gap-4">
                <p className="justify-self-end text-night-400">
                  <span className="text-night-100">1</span>{" "}
                  {pool.baseToken.symbol}
                </p>
                <ArrowLeftRightIcon className="h-4 w-4 text-night-600" />
                <p className="text-night-400">
                  <span className="text-night-100">
                    {formatBigInt(
                      BigInt(pool.quoteToken.reserveBI) /
                        BigInt(pool.baseToken.reserveBI),
                      18
                    )}
                  </span>{" "}
                  {pool.quoteToken.symbol}
                </p>
                {[pool.baseToken, null, pool.quoteToken].map((token) => {
                  if (!token) {
                    return <div key="empty" />;
                  }
                  return (
                    <div
                      key={token.id}
                      className="flex flex-1 items-center justify-between gap-3 rounded-md bg-night-1200 p-3"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <PoolTokenImage className="h-6 w-6" token={token} />
                        <span className="text-night-100">{token.symbol}</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <p className="text-night-100">
                          {formatBigInt(
                            BigInt(token.reserveBI),
                            token.decimals
                          )}
                        </p>
                        <p className="text-xs text-night-400">
                          {formatUSD(token.reserve * token.priceUSD)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row ">
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                <p className="text-night-500">Volume (24h)</p>
                <p className="font-medium text-night-100">
                  {formatUSD(pool.volume24h)}
                </p>
              </div>
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                <p className="text-night-500">APR</p>
                <p className="font-medium text-night-100">
                  {formatPercent(pool.apy)}
                </p>
              </div>
              <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                <p className="text-night-500">Fees (24h)</p>
                <p className="font-medium text-night-100">
                  {formatUSD(pool.fees24h)}
                </p>
              </div>
            </div>
          </div>
          {/*Here the code splits between the left and right side (atleast on desktop) */}
          <div className="sticky top-4 space-y-6 p-4 lg:col-span-3">
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
          </div>
        </div>
        {/*Here the pool & inventory start */}
        <div className="mt-12 flex w-full items-center justify-between">
          <h3 className="flex items-center gap-3">
            <ArrowLeftRightIcon className="h-4 w-4" />
            Pool Activity
          </h3>
          <div className="flex items-center gap-3">
            {(
              [
                {
                  label: "All",
                  value: undefined,
                },
                {
                  label: "Swaps",
                  value: "Swap",
                },
                {
                  label: "Deposits",
                  value: "Deposit",
                },
                {
                  label: "Withdrawals",
                  value: "Withdrawal",
                },
              ] as const
            ).map(({ label, value }) => (
              <button
                key={label}
                className={cn(
                  "text-sm capitalize text-night-400 hover:text-night-200",
                  value === poolActivityFilter && "text-night-100"
                )}
                onClick={() => setPoolActivityFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <PoolActivityTable pool={pool} filter={poolActivityFilter} />
        {pool.baseToken.isNFT || pool.quoteToken.isNFT ? (
          <div className="mt-6 space-y-3.5">
            <h3 className="flex items-center gap-3">
              <ArrowLeftRightIcon className="h-4 w-4" />
              Pool Inventory
            </h3>
            {pool.baseToken.isNFT && (
              <PoolTokenCollectionInventory token={pool.baseToken} />
            )}
            {pool.quoteToken.isNFT && (
              <PoolTokenCollectionInventory token={pool.quoteToken} />
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}

const PoolActivityTable = ({
  pool,
  filter,
}: {
  pool: Pool;
  filter?: PoolTransactionType;
}) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const showPerPage = 12;
  const [activePage, setActivePage] = useState<number>(0);
  const blockExplorer = useBlockExplorer();

  const handlePagination = (direction: "next" | "prev") => {
    if (direction === "next" && activePage < 1 / showPerPage - 1) {
      setActivePage(activePage + 1);
    }
    if (direction === "prev" && activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  const transactions = pool.transactions.filter(
    ({ type }) => !filter || type === filter
  );

  const isMounted = useIsMounted();

  if (!isMounted)
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderIcon className="h-10 w-10" />
      </div>
    );

  return (
    <div>
      <table className="mt-3.5 w-full rounded-md bg-night-1100 text-night-100">
        <thead className="border-b border-b-night-900">
          <tr className="text-sm text-night-200">
            <th className="px-4 py-2.5 text-left font-normal sm:px-5">
              Tokens
            </th>
            <th className="hidden px-4 py-2.5 text-center font-normal sm:table-cell sm:px-5 ">
              Action
            </th>
            <th className="hidden px-4 py-2.5 text-center font-normal sm:table-cell sm:px-5">
              Value
            </th>
            <th className="hidden px-4 py-2.5 text-center font-normal sm:table-cell sm:px-5">
              User
            </th>
            <th className="hidden px-4 py-2.5 text-right font-normal sm:table-cell sm:px-5">
              Date
            </th>
            <th className="hidden px-4 py-2.5 sm:table-cell sm:px-5" />
          </tr>
        </thead>
        <AnimatePresence>
          <tbody className="transition-all">
            <>
              {transactions.map((tx) => {
                let baseToken: PoolToken;
                let baseAmount: string;
                let quoteToken: PoolToken;
                let quoteAmount: string;
                const isSwap = tx.type === "Swap";
                if (isSwap) {
                  if (tx.isAmount1Out) {
                    baseToken = pool.token0;
                    baseAmount = tx.amount0;
                    quoteToken = pool.token1;
                    quoteAmount = tx.amount1;
                  } else {
                    baseToken = pool.token1;
                    baseAmount = tx.amount1;
                    quoteToken = pool.token0;
                    quoteAmount = tx.amount0;
                  }
                } else {
                  baseToken = pool.baseToken;
                  quoteToken = pool.quoteToken;
                  if (baseToken.id === pool.token0.id) {
                    baseAmount = tx.amount0;
                    quoteAmount = tx.amount1;
                  } else {
                    baseAmount = tx.amount1;
                    quoteAmount = tx.amount0;
                  }
                }

                return (
                  <Fragment key={tx.id}>
                    <tr className="border-b border-b-night-900 transition-colors">
                      <td className="px-4 py-4 text-left uppercase sm:px-5">
                        <div className="flex items-center gap-4 text-sm text-night-400">
                          <div className="flex items-center gap-2.5">
                            <PoolTransactionImage
                              token={baseToken}
                              items={tx.baseItems}
                            />
                            <span>
                              <span className="text-honey-25">
                                {baseAmount}
                              </span>{" "}
                              {baseToken.symbol}
                            </span>
                          </div>
                          {isSwap ? (
                            <ArrowRightIcon className="h-6 w-6" />
                          ) : (
                            <PlusIcon className="h-6 w-6" />
                          )}
                          <div className="flex items-center gap-2.5">
                            <PoolTransactionImage
                              token={quoteToken}
                              items={tx.quoteItems}
                            />
                            <span>
                              <span className="text-honey-25">
                                {quoteAmount}
                              </span>{" "}
                              {quoteToken.symbol}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-4 text-center sm:table-cell sm:px-5">
                        {tx.type}
                      </td>
                      <td className="hidden px-4 py-4 text-center sm:table-cell sm:px-5">
                        {formatUSD(tx.amountUSD)}
                      </td>
                      <td className="px-4 py-4 text-center sm:px-5">
                        {truncateEthAddress(tx.user.id)}
                      </td>
                      <td className="hidden px-4 py-4 text-right sm:table-cell sm:px-5">
                        {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                      </td>
                      <td className="flex items-center justify-end gap-2 px-4 py-4 text-end sm:px-5">
                        <a
                          className="cursor-pointer rounded-md p-1.5 text-night-400 transition-colors hover:text-night-100"
                          href={`${blockExplorer.url}/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`View on ${blockExplorer.name}`}
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                        {/* <button
                          className="cursor-pointer rounded-md p-1.5 text-night-400 transition-colors hover:bg-night-900 hover:text-night-100"
                          onClick={() =>
                            setExpandedRow(expandedRow === 0 ? null : 0)
                          }
                        >
                          <ChevronDownIcon
                            className={cn(
                              "w-5 transition-all",
                              expandedRow === 0 && "-rotate-180"
                            )}
                          />
                        </button> */}
                      </td>
                    </tr>
                    {/* {expandedRow === 0 && (
                      <motion.div
                        initial={{ height: "0px", opacity: 0 }}
                        animate={{ height: "max", opacity: 1 }}
                        exit={{ height: "0px", opacity: 0 }}
                        className={cn("grid w-full bg-night-1100 px-3 py-6")}
                      >
                        {token0.isNFT &&
                          token0.reserveItems.map(
                            ({ tokenId, name, image, amount }) => (
                              <div
                                key={tokenId}
                                className="relative h-24 w-24 overflow-hidden rounded"
                              >
                                <img src={image} alt={name} />
                                <span className="absolute right-1 top-1 rounded-lg bg-night-100 px-1.5 py-0.5 text-xs font-medium text-night-900">
                                  {amount}x
                                </span>
                              </div>
                            )
                          )}
                      </motion.div>
                    )} */}
                  </Fragment>
                );
              })}
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
          <p className="text-sm">Previous</p>
        </button>
        <p className="text-night-500">
          Showing{" "}
          <span className="text-night-200">{activePage * showPerPage + 1}</span>{" "}
          to{" "}
          <span className="text-night-200">
            {formatNumber(transactions.length)}
          </span>{" "}
          of{" "}
          <span className="text-night-200">{formatNumber(pool.txCount)}</span>
        </p>
        <button
          className="flex items-center rounded-md bg-transparent p-2 text-night-500 transition-colors hover:bg-night-900 hover:text-night-200"
          onClick={() => handlePagination("next")}
        >
          <p className="text-sm">Next</p>
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
            <span className="font-medium">{name}</span>
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
                  <img src={image} alt={name} title={name} />
                  {token.type === "ERC1155" && (
                    <span className="absolute right-1 top-1 rounded-lg bg-night-100 px-1.5 py-0.5 text-xs font-medium text-night-900">
                      {amount}x
                    </span>
                  )}
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
