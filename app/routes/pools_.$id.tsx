import { defer } from "@remix-run/node";
import type {
  LoaderArgs,
  SerializeFrom,
  V2_MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData, useRouteLoaderData } from "@remix-run/react";
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
import { ClientOnly } from "remix-utils";
import invariant from "tiny-invariant";
import { useAccount, useBalance } from "wagmi";

import { fetchPool } from "~/api/pools.server";
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
import { DialogTrigger } from "~/components/ui/Dialog";
import { Dialog } from "~/components/ui/Dialog";
import { MultiSelect } from "~/components/ui/MultiSelect";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/Sheet";
import { useBlockExplorer } from "~/hooks/useBlockExplorer";
import { useIsMounted } from "~/hooks/useIsMounted";
import { truncateEthAddress } from "~/lib/address";
import { formatAmount, formatTokenAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatNumber, formatPercent } from "~/lib/number";
import type {
  Pool,
  PoolTransactionItem,
  PoolTransactionType,
} from "~/lib/pools.server";
import { generateTitle, getSocialMetas, getUrl } from "~/lib/seo";
import type { PoolToken } from "~/lib/tokens.server";
import { findInventories } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { getSession } from "~/sessions";
import type { AddressString, Optional } from "~/types";

export const meta: V2_MetaFunction<
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
      `${pool?.baseToken.symbol} - ${pool?.quoteToken.symbol} Liquidity Pool`
    ),
    description: `Provide liquidity for ${pool?.baseToken.symbol}-${pool?.quoteToken.symbol} on Magicswap`,
    image: `${url}.png`,
  });
};

export async function loader({ params, request }: LoaderArgs) {
  invariant(params.id, "Pool ID required");

  const session = await getSession(request.headers.get("Cookie"));

  const address = session.get("address");

  const pool = await fetchPool(params.id);
  if (!pool) {
    throw new Response("Pool not found", {
      status: 404,
    });
  }

  if (!address || (!pool.baseToken.isNFT && !pool.quoteToken.isNFT)) {
    return defer({
      pool,
      inventory: null,
    });
  }

  return defer({
    pool,
    // TIL defer only tracks Promises values at the top level. Can't nest them inside an object
    inventory: findInventories(address, pool.baseToken, pool.quoteToken),
  });
}

export default function PoolDetailsPage() {
  const { pool } = useLoaderData<typeof loader>();
  const { address } = useAccount();

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
            <ClientOnly
              fallback={
                <div className="flex h-52 items-center justify-center">
                  <LoaderIcon className="h-10 w-10" />
                </div>
              }
            >
              {() => (
                <>
                  {address ? (
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
                          : {formatUSD(lpShare * pool.reserveUSD)}
                        </span>
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
                        {[pool.baseToken, pool.quoteToken].map((token) => (
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
                                  {formatUSD(lpShare * token.reserve)}
                                </p>
                              </div>
                              <p className="text-xs text-night-500">
                                {formatUSD(
                                  lpShare * token.reserve * token.priceUSD
                                )}
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
                  ) : null}
                </>
              )}
            </ClientOnly>
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
                    {formatAmount(
                      pool.quoteToken.reserve / pool.baseToken.reserve
                    )}
                  </span>{" "}
                  {pool.quoteToken.symbol}
                </p>
                {[pool.baseToken, null, pool.quoteToken].map((token) => {
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
          <PoolManagementView
            className="sticky top-4 col-span-3 hidden space-y-6 p-4 lg:block"
            pool={pool}
            lpBalance={lpBalance}
          />
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
      <Sheet>
        <SheetTrigger asChild>
          <div className="fixed bottom-12 left-0 right-0 flex justify-center lg:hidden">
            <Button size="lg" className="rounded-full">
              My Positions
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent position="right" size="xl">
          <PoolManagementView
            className="mt-4 space-y-6"
            pool={pool}
            lpBalance={lpBalance}
          />
        </SheetContent>
      </Sheet>
    </main>
  );
}

const PoolManagementView = ({
  pool,
  lpBalance,
  className,
}: {
  pool: Pool;
  lpBalance: bigint;
  className?: string;
}) => {
  const [activeTab, setActiveTab] = useState<string>("deposit");
  const { inventory } = useRouteLoaderData(
    "routes/pools_.$id"
  ) as SerializeFrom<typeof loader>;

  return (
    <div className={className}>
      <div className="flex items-center gap-3">
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
        <SettingsDropdownMenu />
      </div>
      {activeTab === "withdraw" && (
        <PoolWithdrawTab
          pool={pool}
          balance={lpBalance}
          inventory={inventory}
        />
      )}
      {activeTab === "deposit" && (
        <PoolDepositTab pool={pool} inventory={inventory} />
      )}
    </div>
  );
};

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
                    itemsA = tx.items0;
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
                  tokenA = pool.baseToken;
                  tokenB = pool.quoteToken;
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
                      <td className="px-4 py-4 text-left uppercase sm:px-5">
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
                        {formatUSD(tx.amountUSD)}
                      </td>
                      <td className="hidden px-4 py-4 text-center text-sm text-night-400 sm:table-cell sm:px-5">
                        {truncateEthAddress(tx.user.id)}
                      </td>
                      <td className="hidden px-4 py-4 text-right text-sm text-night-400 sm:table-cell sm:px-5">
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

const PoolTokenCollectionInventory = ({ token }: { token: PoolToken }) => {
  return (
    <>
      {token.collections.map(({ id, name, symbol }) => {
        const reserveItems = token.reserveItems.filter(
          ({ collectionId }) => collectionId === id
        );

        return (
          <div key={id} className="rounded-lg bg-night-1100">
            <Dialog>
              <div className="space-y-5 p-6">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{name}</span>
                  <span className="h-3 w-[1px] bg-night-400" />
                  <span className="uppercase text-night-400">{symbol}</span>
                </div>
                <div className="grid grid-cols-5 items-center gap-2 lg:grid-cols-10">
                  {reserveItems.map(({ tokenId, name, image, amount }) => (
                    <div
                      key={tokenId}
                      className="relative overflow-hidden rounded"
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
              <div className="flex items-center justify-between px-6 py-3">
                <span className="text-sm text-night-400">
                  Showing {token.reserveItems.length} of{" "}
                  {formatNumber(token.reserve)}
                </span>
                <DialogTrigger asChild>
                  <Button variant="ghost">View All</Button>
                </DialogTrigger>
              </div>
              <SelectionPopup type="vault" viewOnly token={token} />
            </Dialog>
          </div>
        );
      })}
    </>
  );
};
