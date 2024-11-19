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
import {
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownToLineIcon as DepositIcon,
  PlusIcon,
  ArrowUpToLineIcon as WithdrawIcon,
} from "lucide-react";
import type React from "react";
import {
  Fragment,
  Suspense as ReactSuspense,
  useCallback,
  useState,
} from "react";
import invariant from "tiny-invariant";
import type {
  GetUserIncentiveQuery,
  TransactionType,
  UserIncentive,
} from ".graphclient";

import { MagicLogo } from "@treasure-project/branding";
import type {
  PoolTransactionItem,
  PoolTransactionType,
} from "~/api/pools.server";
import { fetchPool } from "~/api/pools.server";
import {
  fetchPoolTokenBalance,
  fetchVaultReserveItems,
} from "~/api/tokens.server";
import { fetchUserIncentives, fetchUserPosition } from "~/api/user.server";
import { ExternalLinkIcon, LoaderIcon } from "~/components/Icons";
import { SelectionPopup } from "~/components/SelectionPopup";
import { SettingsDropdownMenu } from "~/components/SettingsDropdownMenu";
import { Table } from "~/components/Table";
import { PoolDepositTab } from "~/components/pools/PoolDepositTab";
import { PoolImage } from "~/components/pools/PoolImage";
import { PoolIncentiveStake } from "~/components/pools/PoolIncentiveStake";
import { PoolIncentiveUnstake } from "~/components/pools/PoolIncentiveUnstake";
import { PoolLpAmount } from "~/components/pools/PoolLpAmount";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { PoolTransactionImage } from "~/components/pools/PoolTransactionImage";
import { PoolWithdrawTab } from "~/components/pools/PoolWithdrawTab";
import { Button } from "~/components/ui/Button";
import { Dialog, DialogTrigger } from "~/components/ui/Dialog";
import { MultiSelect } from "~/components/ui/MultiSelect";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/Sheet";
import { useAccount } from "~/contexts/account";
import { useBlockExplorer } from "~/hooks/useBlockExplorer";
import { useFocusInterval } from "~/hooks/useFocusInterval";
import { useIsMounted } from "~/hooks/useIsMounted";
import { usePoolTransactions } from "~/hooks/usePoolTransactions";
import { useTokenBalance } from "~/hooks/useTokenBalance";
import { truncateEthAddress } from "~/lib/address";
import { sumArray } from "~/lib/array";
import { formatAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatNumber, formatPercent } from "~/lib/number";
import { getPoolFees24hDisplay, getPoolVolume24hDisplay } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import { generateTitle, generateUrl, getSocialMetas } from "~/lib/seo";
import { formatTokenReserve } from "~/lib/tokens";
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
> = ({ data, matches, location }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;
  const pool = data?.pool;
  const url = generateUrl(requestInfo?.origin, location.pathname);
  return getSocialMetas({
    url,
    title: generateTitle(
      `${pool?.token0.symbol}/${pool?.token1.symbol} Liquidity Pool`,
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
  return defer({
    pool,
    userPosition: await fetchUserPosition(address, params.id),
    userIncentives: await fetchUserIncentives(address, params.id),
    vaultItems0:
      pool.token0.isNFT && pool.token0.collectionTokenIds.length !== 1
        ? fetchVaultReserveItems({
            id: pool.token0.id,
          })
        : undefined,
    vaultItems1:
      pool.token1.isNFT && pool.token1.collectionTokenIds.length !== 1
        ? fetchVaultReserveItems({
            id: pool.token1.id,
          })
        : undefined,
    nftBalance0:
      pool.token0.isNFT && address
        ? fetchPoolTokenBalance(pool.token0, address)
        : undefined,
    nftBalance1:
      pool.token1.isNFT && address
        ? fetchPoolTokenBalance(pool.token1, address)
        : undefined,
  });
}

export default function PoolDetailsPage() {
  const { pool, userPosition, userIncentives, vaultItems0, vaultItems1 } =
    useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [poolActivityFilter, setPoolActivityFilter] =
    useState<Optional<PoolTransactionType>>();
  const blockExplorer = useBlockExplorer();

  const lpBalance = BigInt(userPosition.lpBalance);
  const lpStaked = BigInt(userPosition.lpStaked);
  const lpBalanceShare =
    bigIntToNumber(lpBalance) / bigIntToNumber(BigInt(pool.totalSupply));
  const lpStakedShare =
    bigIntToNumber(lpStaked) / bigIntToNumber(BigInt(pool.totalSupply));
  const lpShare = lpBalanceShare + lpStakedShare;

  const refetch = useCallback(() => {
    if (revalidator.state === "idle") {
      // revalidator.revalidate();
    }
  }, [revalidator]);

  useFocusInterval(refetch, 5_000);

  const baseToken =
    (pool.token1.isNFT && !pool.isNFTNFT) || pool.token1.isMAGIC
      ? pool.token1
      : pool.token0;
  const quoteToken =
    baseToken.id === pool.token1.id ? pool.token0 : pool.token1;

  return (
    <main className="container py-5 md:py-7">
      <Link
        to="/pools"
        className="inline-flex items-center text-night-400 text-xs transition-colors hover:text-night-100"
        prefetch="intent"
      >
        <ChevronLeftIcon className="h-4" />
        All Pools
      </Link>
      <div className="mt-6">
        <div className="relative grid grid-cols-1 items-start gap-10 lg:grid-cols-7">
          <div className="space-y-6 md:flex-row lg:col-span-4">
            <div className="-space-x-2 flex items-center">
              <PoolImage pool={pool} className="h-auto w-14" />
              <div className="flex flex-col text-2xl">
                <a
                  href={`${blockExplorer.url}/address/${pool.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:underline"
                >
                  {pool.name}
                </a>
                <span className="text-night-400 text-sm">
                  LP Fees: {formatPercent(pool.lpFee, 3)}
                </span>
              </div>
            </div>
            <ul className="flex flex-wrap items-center gap-5 text-night-100 text-sm">
              {[pool.token0, pool.token1].map(({ id, name, isNFT }) => (
                <li key={id} className="flex items-center gap-1.5">
                  <span className="font-medium">
                    {isNFT ? `${name} Vault` : name}
                  </span>{" "}
                  <a
                    href={`${blockExplorer.url}/address/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-night-400 hover:underline"
                  >
                    {truncateEthAddress(id)}{" "}
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </li>
              ))}
              {pool.collections.map(({ id, name }) => (
                <li key={id} className="flex items-center gap-1.5">
                  <span className="font-medium">{name}</span>{" "}
                  <a
                    href={`${blockExplorer.url}/address/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-0.5 text-night-400 hover:underline"
                  >
                    {truncateEthAddress(id)}{" "}
                    <ExternalLinkIcon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="h-[1px] bg-night-900" />
            <div className="grid grid-cols-7 gap-3">
              <div className="col-span-5 space-y-4 rounded-md bg-night-1100 p-4">
                <div>
                  <h3 className="font-medium text-lg">Pool Reserves</h3>
                  {pool.reserveUSD > 0 ? (
                    <span className="text-night-400 text-sm">
                      {formatUSD(pool.reserveUSD)}
                    </span>
                  ) : null}
                </div>
                <div className="space-y-2">
                  {[baseToken, quoteToken].map((token) => (
                    <PoolTokenRow
                      key={token.id}
                      token={token}
                      amount={formatTokenReserve(token)}
                      amountUSD={
                        bigIntToNumber(BigInt(token.reserve), token.decimals) *
                        token.priceUSD
                      }
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center gap-3 rounded-md bg-night-1200 p-3">
                  <p className="justify-self-end text-night-400">
                    <span className="text-night-100">1</span> {baseToken.symbol}
                  </p>
                  <ArrowLeftRightIcon className="h-4 w-4 text-night-600" />
                  <p className="text-night-400">
                    <span className="text-night-100">
                      {BigInt(baseToken.reserve) > 0
                        ? formatAmount(
                            bigIntToNumber(
                              BigInt(quoteToken.reserve),
                              quoteToken.decimals,
                            ) /
                              bigIntToNumber(
                                BigInt(baseToken.reserve),
                                baseToken.decimals,
                              ),
                          )
                        : 0}
                    </span>{" "}
                    {quoteToken.symbol}
                  </p>
                </div>
              </div>
              <div className="col-span-2">
                <div className="space-y-3">
                  <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                    <p className="text-night-500">Volume (24h)</p>
                    <p className="font-medium text-night-100">
                      {getPoolVolume24hDisplay(pool)}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                    <p className="text-night-500">Fees (24h)</p>
                    <p className="font-medium text-night-100">
                      {getPoolFees24hDisplay(pool)}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-0.5 rounded-lg bg-night-1100 px-4 py-3">
                    <p className="text-night-500">APY</p>
                    <p className="font-medium text-night-100">
                      {formatPercent(pool.apy)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {pool.incentives.length > 0 ? (
              <div className="col-span-5 space-y-4 rounded-md bg-night-1100 p-4">
                <h3 className="font-medium text-lg">Pool Rewards</h3>
                <div className="space-y-2">
                  {pool.incentives.map(
                    ({
                      incentiveId,
                      rewardToken,
                      rewardTokenAddress,
                      remainingRewardAmount,
                    }) => (
                      <div
                        key={incentiveId}
                        className="flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2 font-medium">
                          {rewardToken ? (
                            <PoolTokenImage
                              className="h-6 w-6"
                              token={rewardToken}
                            />
                          ) : null}
                          <span className="text-night-100">
                            {rewardToken?.symbol ??
                              truncateEthAddress(rewardTokenAddress)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-right">
                          <span>
                            {formatAmount(BigInt(remainingRewardAmount))}
                          </span>
                          {rewardToken?.priceUSD ? (
                            <span className="text-night-400 text-sm">
                              {formatUSD(
                                bigIntToNumber(BigInt(remainingRewardAmount)) *
                                  rewardToken.priceUSD,
                                { notation: "compact" },
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ) : null}
            {lpBalance > 0 || lpStaked > 0 ? (
              <div className="space-y-4 rounded-md bg-night-1100 p-4">
                <div>
                  <h3 className="font-medium text-lg">My Position</h3>
                  {pool.reserveUSD > 0 ? (
                    <span className="text-night-400 text-sm">
                      {formatUSD(lpShare * pool.reserveUSD)}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-2">
                    <h3 className="text-night-200">Unstaked</h3>
                    <PoolLpAmount pool={pool} amount={lpBalance} />
                    <div className="space-y-2">
                      {[baseToken, quoteToken].map((token) => (
                        <PoolTokenRow
                          key={token.id}
                          token={token}
                          amount={
                            lpBalanceShare *
                            bigIntToNumber(
                              BigInt(token.reserve),
                              token.decimals,
                            )
                          }
                          amountUSD={
                            lpBalanceShare *
                            bigIntToNumber(
                              BigInt(token.reserve),
                              token.decimals,
                            ) *
                            token.priceUSD
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-night-200">Staked</h3>
                    <PoolLpAmount pool={pool} amount={lpStaked} />
                    <div className="space-y-2">
                      {[baseToken, quoteToken].map((token) => (
                        <PoolTokenRow
                          key={token.id}
                          token={token}
                          amount={
                            lpStakedShare *
                            bigIntToNumber(
                              BigInt(token.reserve),
                              token.decimals,
                            )
                          }
                          amountUSD={
                            lpStakedShare *
                            bigIntToNumber(
                              BigInt(token.reserve),
                              token.decimals,
                            ) *
                            token.priceUSD
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Table
                  items={[
                    // { label: "Initial LP Tokens", value: 0.0 },
                    // { label: "Rewards Earned", value: 0.0 },
                    {
                      label: "Current share of pool",
                      value: formatPercent(lpShare),
                    },
                  ]}
                />
              </div>
            ) : null}
          </div>
          <PoolManagementView
            className="sticky top-4 col-span-3 hidden space-y-4 p-4 lg:block"
            pool={pool}
            lpBalance={lpBalance}
            lpStaked={lpStaked}
            userIncentives={userIncentives}
            onSuccess={refetch}
          />
        </div>
        {pool.hasNFT ? (
          <div className="mt-12 space-y-3.5">
            {vaultItems0 ? (
              <Suspense>
                <Await resolve={vaultItems0}>
                  {(vaultItems0) => (
                    <PoolTokenCollectionInventory
                      token={pool.token0}
                      items={vaultItems0}
                    />
                  )}
                </Await>
              </Suspense>
            ) : null}
            {vaultItems1 ? (
              <Suspense>
                <Await resolve={vaultItems1}>
                  {(vaultItems1) => (
                    <PoolTokenCollectionInventory
                      token={pool.token1}
                      items={vaultItems1}
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
                type="button"
                className={cn(
                  "text-night-400 text-sm capitalize hover:text-night-200",
                  value === poolActivityFilter && "text-night-100",
                )}
                onClick={() => setPoolActivityFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <PoolActivityTable pool={pool} type={poolActivityFilter} />
      </div>
      <Sheet>
        <SheetTrigger asChild>
          <div className="fixed right-0 bottom-12 left-0 flex justify-center lg:hidden">
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
            lpStaked={lpStaked}
            userIncentives={userIncentives}
            onSuccess={refetch}
          />
        </SheetContent>
      </Sheet>
    </main>
  );
}

const PoolManagementView = ({
  pool,
  lpBalance,
  lpStaked,
  userIncentives,
  onSuccess,
  className,
}: {
  pool: Pool;
  lpBalance: bigint;
  lpStaked: bigint;
  userIncentives: GetUserIncentiveQuery["userIncentives"];
  onSuccess: () => void;
  className?: string;
}) => {
  const [tab, setTab] = useState<"deposit" | "withdraw" | "stake" | "unstake">(
    "deposit",
  );
  const nftBalances = useRouteLoaderData("routes/pools_.$id") as SerializeFrom<
    typeof loader
  >;

  return (
    <div className={className}>
      <div className="flex w-full items-center justify-between">
        <h1 className="font-semibold text-lg text-night-100">
          Manage Liquidity
        </h1>
        <SettingsDropdownMenu />
      </div>
      <div className="flex h-[41px] items-center border-b-2 border-b-[#2C4868] font-medium text-[#9FA3A9]">
        {[
          ["deposit", "Deposit"],
          ["withdraw", "Withdraw"],
          ["stake", "Stake"],
          ["unstake", "Unstake"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            className={cn(
              "h-11 border-b-2 px-3 hover:text-[#FFFCF3]",
              key === tab
                ? "border-b-[#DC2626] text-[#FFFCF3]"
                : "border-b-transparent",
            )}
            onClick={() => setTab(key as typeof tab)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "deposit" ? (
        <PoolDepositTab
          pool={pool}
          nftBalances={nftBalances}
          onSuccess={onSuccess}
        />
      ) : null}
      {tab === "withdraw" ? (
        <PoolWithdrawTab
          pool={pool}
          balance={lpBalance}
          onSuccess={onSuccess}
        />
      ) : null}
      {tab === "stake" ? (
        <PoolIncentiveStake
          pool={pool}
          balance={lpBalance}
          userIncentives={userIncentives}
        />
      ) : null}
      {tab === "unstake" ? (
        <PoolIncentiveUnstake pool={pool} staked={lpStaked} />
      ) : null}
    </div>
  );
};

const PoolActivityTable = ({
  pool,
  type,
}: {
  pool: Pool;
  type?: TransactionType;
}) => {
  const {
    isLoading,
    results: transactions,
    page,
    resultsPerPage,
    hasPreviousPage,
    hasNextPage,
    goToPreviousPage,
    goToNextPage,
  } = usePoolTransactions({ id: pool.id, type });
  // const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const blockExplorer = useBlockExplorer();

  const isMounted = useIsMounted();
  if (!isMounted || isLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <LoaderIcon className="h-10 w-10" />
      </div>
    );

  return (
    <div>
      <table className="mt-3.5 w-full rounded-md bg-night-1100 text-night-100">
        <thead className="border-b border-b-night-900">
          <tr className="text-night-200 text-sm">
            <th className="px-4 py-2.5 text-left font-normal sm:px-5">
              Tokens
            </th>
            <th className="hidden px-4 py-2.5 text-center font-normal sm:table-cell sm:px-5">
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
        <tbody>
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
                  <td className="px-4 py-3.5 text-left sm:px-5">
                    <div className="grid grid-cols-[1fr,max-content,1fr] items-center gap-3 text-night-400 text-sm">
                      <div className="flex items-center gap-2.5">
                        <PoolTransactionImage token={tokenA} items={itemsA} />
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
                        <PoolTransactionImage token={tokenB} items={itemsB} />
                        <span>
                          <span className="text-honey-25">
                            {formatAmount(amountB)}
                          </span>{" "}
                          {tokenB.symbol}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3.5 text-center sm:table-cell sm:px-5">
                    {tx.type}
                  </td>
                  <td className="hidden px-4 py-3.5 text-center sm:table-cell sm:px-5">
                    {Number(tx.amountUSD) > 0 ? formatUSD(tx.amountUSD) : "-"}
                  </td>
                  <td className="hidden px-4 py-3.5 text-center text-night-400 text-sm sm:table-cell sm:px-5">
                    {tx.userDomain?.treasuretag ? (
                      <span className="flex items-center justify-center gap-1 font-medium text-honey-25">
                        <MagicLogo className="h-3 w-3" />
                        {tx.userDomain.treasuretag.name}
                      </span>
                    ) : (
                      <span className="font-mono">
                        {tx.user ? truncateEthAddress(tx.user.id) : "-"}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3.5 text-right text-night-400 text-sm sm:table-cell sm:px-5">
                    {new Date(Number(tx.timestamp) * 1000).toLocaleString()}
                  </td>
                  <td className="flex items-center justify-end gap-2 px-4 py-3.5 text-end sm:px-5">
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
        </tbody>
      </table>
      <nav className="flex w-full items-center justify-between rounded-b-lg bg-night-1100 px-3 py-2">
        <Button
          variant="ghost"
          className="pr-3.5 pl-2"
          disabled={!hasPreviousPage}
          onClick={() => goToPreviousPage()}
        >
          <ChevronLeftIcon className="w-4" />
          <p className="text-sm">Previous</p>
        </Button>
        <p className="text-night-500">
          Showing{" "}
          <span className="text-night-200">
            {formatNumber((page - 1) * resultsPerPage + 1)}
          </span>{" "}
          to{" "}
          <span className="text-night-200">
            {formatNumber((page - 1) * resultsPerPage + transactions.length)}
          </span>{" "}
          {!type ? (
            <>
              of{" "}
              <span className="text-night-200">
                {formatNumber(pool.txCount)}
              </span>
            </>
          ) : null}
        </p>
        <Button
          variant="ghost"
          className="pr-2 pl-3.5"
          disabled={!hasNextPage}
          onClick={() => goToNextPage()}
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
  const numVaultItems = sumArray(
    items.map(({ queryUserQuantityOwned }) => queryUserQuantityOwned ?? 1),
  );
  return (
    <div key={token.id} className="rounded-lg bg-night-1100">
      <Dialog>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">{token.name} Vault</span>
            {token.name !== token.symbol ? (
              <>
                <span className="h-3 w-[1px] bg-night-400" />
                <span className="text-night-400 uppercase">{token.symbol}</span>
              </>
            ) : null}
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
                {(item.queryUserQuantityOwned ?? 1) > 1 ? (
                  <span className="absolute right-1.5 bottom-1.5 rounded-lg bg-night-700/80 px-2 py-0.5 font-bold text-night-100 text-xs">
                    {formatNumber(item.queryUserQuantityOwned ?? 1)}x
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-night-800" />
        <div className="flex items-center justify-between px-6 py-3">
          <span className="text-night-400 text-sm">
            {formatNumber(numVaultItems)}{" "}
            {numVaultItems === 1 ? "item" : "items"}
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

const PoolTokenRow = ({
  token,
  amount,
  amountUSD,
}: {
  token: PoolToken;
  amount: number | string;
  amountUSD: number;
}) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 font-medium">
      <PoolTokenImage className="h-6 w-6" token={token} />
      <span className="text-night-100">{token.symbol}</span>
    </div>
    <div className="flex items-center gap-2 text-right">
      <span>{typeof amount === "string" ? amount : formatAmount(amount)}</span>
      {amountUSD > 0 ? (
        <span className="text-night-400 text-sm">
          {formatUSD(amountUSD, { notation: "compact" })}
        </span>
      ) : null}
    </div>
  </div>
);
