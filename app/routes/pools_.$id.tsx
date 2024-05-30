import { defer } from "@remix-run/node";
import type {
  LoaderFunctionArgs,
  MetaFunction,
  SerializeFrom,
} from "@remix-run/node";
import {
  Await,
  Link,
  useLoaderData,
  useRevalidator,
  useRouteLoaderData,
} from "@remix-run/react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownToLineIcon as DepositIcon,
  ExternalLinkIcon,
  PlusIcon,
  RepeatIcon,
  ArrowUpToLineIcon as WithdrawIcon,
} from "lucide-react";
import React, {
  Fragment,
  Suspense as ReactSuspense,
  useCallback,
  useState,
} from "react";
import { ClientOnly } from "remix-utils/client-only";
import invariant from "tiny-invariant";

import type {
  PoolTransaction,
  PoolTransactionItem,
  PoolTransactionType,
} from "~/api/pools.server";
import { fetchPool, fetchTransactions } from "~/api/pools.server";
import {
  fetchCollectionOwnedByAddress,
  fetchPoolTokenBalance,
} from "~/api/tokens.server";
import { LoaderIcon } from "~/components/Icons";
import { SettingsDropdownMenu } from "~/components/SettingsDropdownMenu";
import Table from "~/components/Table";
import { SelectionPopup } from "~/components/item_selection/SelectionPopup";
import { PoolDepositTab } from "~/components/pools/PoolDepositTab";
import { PoolImage } from "~/components/pools/PoolImage";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { PoolTransactionImage } from "~/components/pools/PoolTransactionImage";
import { PoolWithdrawTab } from "~/components/pools/PoolWithdrawTab";
import { Button } from "~/components/ui/Button";
import { Dialog, DialogTrigger } from "~/components/ui/Dialog";
import { MultiSelect } from "~/components/ui/MultiSelect";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/Sheet";
import { useAccount } from "~/contexts/account";
import { useReadErc20BalanceOf } from "~/generated";
import { useBlockExplorer } from "~/hooks/useBlockExplorer";
import { useFocusInterval } from "~/hooks/useFocusInterval";
import { useIsMounted } from "~/hooks/useIsMounted";
import { truncateEthAddress } from "~/lib/address";
import { sumArray } from "~/lib/array";
import { formatAmount, formatTokenAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatNumber, formatPercent } from "~/lib/number";
import type { Pool } from "~/lib/pools.server";
import { generateTitle, getSocialMetas, getUrl } from "~/lib/seo";
import { getTroveTokenQuantity } from "~/lib/tokens";
import { cn } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { getSession } from "~/sessions";
import type { AddressString, Optional, PoolToken, TroveToken } from "~/types";

const Suspense = ({ children }: { children: React.ReactNode }) => (
  <ReactSuspense
    fallback={
      <div className="flex h-96 items-center justify-center">
        <LoaderIcon className="h-10 w-auto" />
      </div>
    }
  >
    {children}
  </ReactSuspense>
);

export const meta: MetaFunction<
  typeof loader,
  {
    root: RootLoader;
  }
> = ({ data, matches }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;
  const pool = data?.pool;

  const url = getUrl(requestInfo);

  return getSocialMetas({
    url,
    title: generateTitle(
      `${pool?.token0.symbol}/${pool?.token1.symbol} Liquidity Pool`
    ),
    description: `Provide liquidity for ${pool?.token0.symbol}/${pool?.token1.symbol} on Magicswap`,
    image: `${url}.png`,
  });
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.id, "Pool ID required");

  const [pool, session] = await Promise.all([
    fetchPool(params.id),
    getSession(request.headers.get("Cookie")),
  ]);

  if (!pool) {
    throw new Response("Pool not found", {
      status: 404,
    });
  }

  const address = session.get("address");
  if (!address || (!pool.token0.isNFT && !pool.token1.isNFT)) {
    return defer({
      pool,
      transactions: fetchTransactions(pool),
      vaultItems0: null,
      vaultItems1: null,
      nftBalance0: null,
      nftBalance1: null,
    });
  }

  return defer({
    pool,
    transactions: fetchTransactions(pool),
    vaultItems0: fetchCollectionOwnedByAddress(
      pool.token0.id,
      pool.token0.urlSlug,
      [],
      pool.token0.collectionTokenIds,
      null,
      null,
      0
    ),
    vaultItems1: fetchCollectionOwnedByAddress(
      pool.token1.id,
      pool.token1.urlSlug,
      [],
      pool.token1.collectionTokenIds,
      null,
      null,
      0
    ),
    nftBalance0: fetchPoolTokenBalance(pool.token0, address),
    nftBalance1: fetchPoolTokenBalance(pool.token1, address),
  });
}

export default function PoolDetailsPage() {
  const { pool, vaultItems0, vaultItems1, transactions } =
    useLoaderData<typeof loader>();
  const { address } = useAccount();

  const [poolActivityFilter, setPoolActivityFilter] =
    useState<Optional<PoolTransactionType>>();

  const { data: rawLpBalance, refetch: refetchLpBalance } =
    useReadErc20BalanceOf({
      address: pool.id as AddressString,
      args: [address as AddressString],
      query: {
        enabled: !!address,
      },
    });

  const lpBalance = rawLpBalance ?? BigInt(0);
  const lpShare =
    bigIntToNumber(lpBalance) / bigIntToNumber(BigInt(pool.totalSupply));

  const revalidator = useRevalidator();

  const refresh = useCallback(() => {
    if (revalidator.state === "idle") {
      revalidator.revalidate();
    }

    refetchLpBalance();
  }, [refetchLpBalance, revalidator]);

  useFocusInterval(refresh, 5000);

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
                <span className="text-sm text-night-400">
                  LP Fees: {formatPercent(pool.lpFee)}
                </span>
              </div>
            </div>
            <div className="h-[1px] bg-night-900" />
            <ClientOnly
              fallback={
                <div className="flex h-52 items-center justify-center">
                  <LoaderIcon className="h-10 w-10" />
                </div>
              }
            >
              {() => (
                <>
                  {address && lpBalance > BigInt(0) ? (
                    <div className="space-y-4 rounded-md bg-night-1100 p-4">
                      <div className="flex items-center justify-between gap-3 rounded-md bg-night-900 px-4 py-2">
                        <h3 className="font-medium">Your Positions</h3>
                        {pool.reserveUSD > 0 ? (
                          <span className="text-night-200">
                            <abbr
                              title="Total Value Locked"
                              className="text-night-600 no-underline"
                            >
                              TVL
                            </abbr>
                            : {formatUSD(lpShare * pool.reserveUSD)}
                          </span>
                        ) : null}
                      </div>
                      <div className="flex flex-col space-y-2 px-2 py-4">
                        <div className="flex items-center -space-x-1">
                          <PoolImage pool={pool} className="h-10 w-10" />
                          <p className="text-3xl text-night-100">
                            {formatTokenAmount(lpBalance)}
                          </p>
                        </div>
                        <p className="text-sm text-night-400">
                          Current LP Token Balance
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {[pool.token0, pool.token1].map((token) => (
                          <div key={token.id} className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <p className="font-medium text-night-100">
                                {token.name}
                              </p>
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
                                <PoolTokenImage
                                  className="h-6 w-6"
                                  token={token}
                                />
                                <p className="text-night-100">
                                  {formatAmount(
                                    lpShare *
                                      bigIntToNumber(
                                        BigInt(token.reserve),
                                        token.decimals
                                      )
                                  )}
                                </p>
                              </div>
                              {token.priceUSD > 0 ? (
                                <p className="text-xs text-night-500">
                                  {formatUSD(
                                    lpShare *
                                      bigIntToNumber(
                                        BigInt(token.reserve),
                                        token.decimals
                                      ) *
                                      token.priceUSD
                                  )}
                                </p>
                              ) : null}
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
                  ) : null}
                </>
              )}
            </ClientOnly>
            <div className="rounded-md bg-night-1100 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-medium">Pool Reserves</h3>
                {pool.reserveUSD > 0 ? (
                  <span className="text-night-200">
                    <abbr
                      title="Total Value Locked"
                      className="text-night-600 no-underline"
                    >
                      TVL
                    </abbr>
                    : <span className="">{formatUSD(pool.reserveUSD)}</span>
                  </span>
                ) : null}
              </div>
              <div className="mt-4 grid grid-cols-[1fr,max-content,1fr] items-center gap-4">
                <p className="justify-self-end text-night-400">
                  <span className="text-night-100">1</span> {pool.token0.symbol}
                </p>
                <ArrowLeftRightIcon className="h-4 w-4 text-night-600" />
                <p className="text-night-400">
                  <span className="text-night-100">
                    {formatAmount(
                      bigIntToNumber(
                        BigInt(pool.token1.reserve),
                        pool.token1.decimals
                      ) /
                        bigIntToNumber(
                          BigInt(pool.token0.reserve),
                          pool.token0.decimals
                        )
                    )}
                  </span>{" "}
                  {pool.token1.symbol}
                </p>
                {[pool.token0, null, pool.token1].map((token) => {
                  if (!token) {
                    return <div className="hidden sm:block" key="empty" />;
                  }
                  return (
                    <div
                      key={token.id}
                      className="col-span-3 flex flex-1 items-center justify-between gap-3 rounded-md bg-night-1200 p-3 sm:col-span-1"
                    >
                      <div className="flex items-center gap-2 font-medium">
                        <PoolTokenImage className="h-6 w-6" token={token} />
                        <span className="text-night-100">{token.symbol}</span>
                      </div>
                      <div className="space-y-0.5 text-right">
                        <p className="text-night-100">
                          {formatTokenAmount(
                            BigInt(token.reserve),
                            token.decimals
                          )}
                        </p>
                        {token.priceUSD > 0 ? (
                          <p className="text-xs text-night-400">
                            {formatUSD(
                              bigIntToNumber(
                                BigInt(token.reserve),
                                token.decimals
                              ) * token.priceUSD
                            )}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row">
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
          <PoolManagementView
            className="sticky top-4 col-span-3 hidden space-y-6 p-4 lg:block"
            pool={pool}
            lpBalance={lpBalance}
            onSuccess={refresh}
          />
        </div>
        {pool.hasNFT ? (
          <div className="mt-12 space-y-3.5">
            {pool.token0.isNFT && vaultItems0 ? (
              <Suspense>
                <Await resolve={vaultItems0}>
                  {(vaultItems0) => (
                    <PoolTokenCollectionInventory
                      token={pool.token0}
                      items={vaultItems0.tokens}
                    />
                  )}
                </Await>
              </Suspense>
            ) : null}
            {pool.token1.isNFT && vaultItems1 ? (
              <Suspense>
                <Await resolve={vaultItems1}>
                  {(vaultItems1) => (
                    <PoolTokenCollectionInventory
                      token={pool.token1}
                      items={vaultItems1.tokens}
                    />
                  )}
                </Await>
              </Suspense>
            ) : null}
          </div>
        ) : null}
        <div className="mt-6 flex w-full items-center justify-between">
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
        <Suspense>
          <Await resolve={transactions}>
            {(transactions) => (
              <PoolActivityTable
                pool={pool}
                transactions={transactions}
                filter={poolActivityFilter}
              />
            )}
          </Await>
        </Suspense>
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <div className="fixed bottom-12 left-0 right-0 flex justify-center lg:hidden">
            <Button size="lg" className="rounded-full">
              My Positions
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent position="bottom" size="xl">
          <PoolManagementView
            className="mt-4 space-y-6"
            pool={pool}
            lpBalance={lpBalance}
            onSuccess={refresh}
          />
        </SheetContent>
      </Sheet>
    </main>
  );
}

const PoolManagementView = ({
  pool,
  lpBalance,
  onSuccess,
  className,
}: {
  pool: Pool;
  lpBalance: bigint;
  onSuccess: () => void;
  className?: string;
}) => {
  const [activeTab, setActiveTab] = useState<string>("deposit");
  const nftBalances = useRouteLoaderData("routes/pools_.$id") as SerializeFrom<
    typeof loader
  >;

  return (
    <div className={className}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <RepeatIcon className="h-5 w-5 text-night-400" />
          <h1 className="text-lg font-semibold text-night-100 ">
            Add Liquidity
          </h1>
        </div>
        <SettingsDropdownMenu />
      </div>
      <MultiSelect
        className="bg-night-1200 sm:bg-night-1100"
        tabs={[
          {
            id: "deposit",
            icon: DepositIcon,
            name: "Deposit",
          },
          {
            id: "withdraw",
            icon: WithdrawIcon,
            name: "Withdraw",
          },
        ]}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {activeTab === "withdraw" && (
        <PoolWithdrawTab
          pool={pool}
          balance={lpBalance}
          onSuccess={onSuccess}
        />
      )}
      {activeTab === "deposit" && (
        <PoolDepositTab
          pool={pool}
          nftBalances={nftBalances}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
};

const PoolActivityTable = ({
  pool,
  transactions,
  filter,
}: {
  pool: Pool;
  transactions: PoolTransaction[];
  filter?: PoolTransactionType;
}) => {
  // const [expandedRow, setExpandedRow] = useState<number | null>(null);
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
              {transactions
                .filter(({ type }) => !filter || type === filter)
                .map((tx) => {
                  let tokenA: PoolToken;
                  let amountA: string;
                  let itemsA: PoolTransactionItem[];
                  let tokenB: PoolToken;
                  let amountB: string;
                  let itemsB: PoolTransactionItem[];
                  const isSwap = tx.type === "Swap";
                  if (isSwap) {
                    if (tx.isAmount1Out) {
                      tokenA = pool.token0;
                      amountA = tx.amount0;
                      itemsA = tx.items0 ?? [];
                      tokenB = pool.token1;
                      amountB = tx.amount1;
                      itemsB = tx.items1;
                    } else {
                      tokenA = pool.token1;
                      amountA = tx.amount1;
                      itemsA = tx.items1;
                      tokenB = pool.token0;
                      amountB = tx.amount0;
                      itemsB = tx.items0;
                    }
                  } else {
                    tokenA = pool.token0;
                    tokenB = pool.token1;
                    if (tokenA.id === pool.token0.id) {
                      amountA = tx.amount0;
                      itemsA = tx.items0;
                      amountB = tx.amount1;
                      itemsB = tx.items1;
                    } else {
                      amountA = tx.amount1;
                      itemsA = tx.items1;
                      amountB = tx.amount0;
                      itemsB = tx.items0;
                    }
                  }

                  return (
                    <Fragment key={tx.id}>
                      <tr className="border-b border-b-night-900 transition-colors">
                        <td className="px-4 py-4 text-left sm:px-5">
                          <div className="grid grid-cols-[1fr,max-content,1fr] items-center gap-3 text-sm text-night-400">
                            <div className="flex items-center gap-2.5">
                              <PoolTransactionImage
                                token={tokenA}
                                items={itemsA}
                              />
                              <span>
                                <span className="text-honey-25">
                                  {formatAmount(amountA)}
                                </span>{" "}
                                {tokenA.symbol}
                              </span>
                            </div>
                            {isSwap ? (
                              <ArrowRightIcon className="h-6 w-6" />
                            ) : (
                              <PlusIcon className="h-6 w-6" />
                            )}
                            <div className="flex items-center gap-2.5">
                              <PoolTransactionImage
                                token={tokenB}
                                items={itemsB}
                              />
                              <span>
                                <span className="text-honey-25">
                                  {formatAmount(amountB)}
                                </span>{" "}
                                {tokenB.symbol}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden px-4 py-4 text-center sm:table-cell sm:px-5">
                          {tx.type}
                        </td>
                        <td className="hidden px-4 py-4 text-center sm:table-cell sm:px-5">
                          {tx.amountUSD !== "0" ? formatUSD(tx.amountUSD) : "-"}
                        </td>
                        <td className="hidden px-4 py-4 text-center text-sm text-night-400 sm:table-cell sm:px-5">
                          {truncateEthAddress(tx.user.id)}
                        </td>
                        <td className="hidden px-4 py-4 text-right text-sm text-night-400 sm:table-cell sm:px-5">
                          {new Date(
                            Number(tx.timestamp) * 1000
                          ).toLocaleString()}
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
        <Button
          variant="ghost"
          className="pl-2 pr-3.5"
          onClick={() => handlePagination("prev")}
        >
          <ChevronLeftIcon className="w-4" />
          <p className="text-sm">Previous</p>
        </Button>
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
        <Button
          variant="ghost"
          className="pl-3.5 pr-2"
          onClick={() => handlePagination("next")}
        >
          <p className="text-sm">Next</p>
          <ChevronRightIcon className="w-4" />
        </Button>
      </nav>
    </div>
  );
};

const PoolTokenCollectionInventory = ({
  token,
  items,
}: {
  token: PoolToken;
  items: TroveToken[];
}) => {
  return (
    <div key={token.id} className="rounded-lg bg-night-1100">
      <Dialog>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">{token.name}</span>
            <span className="h-3 w-[1px] bg-night-400" />
            <span className="uppercase text-night-400">{token.symbol}</span>
          </div>
          <div className="grid grid-cols-5 items-center gap-2 lg:grid-cols-10">
            {items.map((item) => (
              <div
                key={item.tokenId}
                className="relative overflow-hidden rounded"
              >
                <img
                  src={item.image.uri}
                  alt={item.metadata.name}
                  title={item.metadata.name}
                />
                {getTroveTokenQuantity(item) > 1 ? (
                  <span className="absolute bottom-1.5 right-1.5 rounded-lg bg-night-700/80 px-2 py-0.5 text-xs font-bold text-night-100">
                    {getTroveTokenQuantity(item)}x
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-night-800" />
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-sm text-night-400">
            Showing {sumArray(items.map(getTroveTokenQuantity))} of{" "}
            {formatTokenAmount(BigInt(token.reserve), token.decimals)}
          </span>
          <DialogTrigger asChild>
            <Button variant="ghost">View All</Button>
          </DialogTrigger>
        </div>
        <SelectionPopup type="vault" viewOnly token={token} />
      </Dialog>
    </div>
  );
};
