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
import { MagicLogo } from "@treasure-project/branding";
import {
  ArrowLeftRightIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import type React from "react";
import {
  Fragment,
  Suspense as ReactSuspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import invariant from "tiny-invariant";
import { type Address, parseUnits } from "viem";

import { type PoolTransactionItem, fetchPool } from "~/api/pools.server";
import { fetchMagicUsd } from "~/api/price.server";
import {
  fetchPoolTokenBalance,
  fetchVaultReserveItems,
} from "~/api/tokens.server";
import { fetchUserPosition } from "~/api/user.server";
import { Badge } from "~/components/Badge";
import { ExternalLinkIcon, LoaderIcon } from "~/components/Icons";
import { SelectionPopup } from "~/components/SelectionPopup";
import { SettingsDropdownMenu } from "~/components/SettingsDropdownMenu";
import { PoolDepositTab } from "~/components/pools/PoolDepositTab";
import { PoolImage } from "~/components/pools/PoolImage";
import { PoolIncentiveStake } from "~/components/pools/PoolIncentiveStake";
import { PoolIncentiveUnstake } from "~/components/pools/PoolIncentiveUnstake";
import { PoolLpAmount } from "~/components/pools/PoolLpAmount";
import { PoolTokenCollectionInventory } from "~/components/pools/PoolTokenCollectionInventory";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { PoolTransactionImage } from "~/components/pools/PoolTransactionImage";
import { PoolWithdrawTab } from "~/components/pools/PoolWithdrawTab";
import { Button, TransactionButton } from "~/components/ui/Button";
import { Dialog } from "~/components/ui/Dialog";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/Sheet";
import { useAccount } from "~/contexts/account";
import { useBlockExplorer } from "~/hooks/useBlockExplorer";
import { useClaimRewards } from "~/hooks/useClaimRewards";
import { useIsMounted } from "~/hooks/useIsMounted";
import { usePoolTransactions } from "~/hooks/usePoolTransactions";
import { useSubscribeToIncentives } from "~/hooks/useSubscribeToIncentives";
import { useTokenBalance } from "~/hooks/useTokenBalance";
import { useWithdrawBatch } from "~/hooks/useWithdrawBatch";
import { truncateEthAddress } from "~/lib/address";
import { formatAmount, formatUSD } from "~/lib/currency";
import { ENV } from "~/lib/env.server";
import {
  bigIntToNumber,
  floorBigInt,
  formatNumber,
  formatPercent,
} from "~/lib/number";
import { getPoolFees24hDisplay, getPoolVolume24hDisplay } from "~/lib/pools";
import { generateTitle, generateUrl, getSocialMetas } from "~/lib/seo";
import { formatTokenReserve } from "~/lib/tokens";
import { cn } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { getSession } from "~/sessions";
import type {
  AddressString,
  Optional,
  Pool,
  Token,
  TokenWithAmount,
} from "~/types";
import type { transactionType as TransactionType } from ".graphclient";

type PoolManagementTab = "deposit" | "withdraw" | "stake" | "unstake";

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
    title: generateTitle(`${pool?.name} Liquidity Pool`),
    description: `Provide liquidity for ${pool?.name} on Magicswap`,
    image: `${url}.png`,
  });
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.address, "Pool address required");

  const chainId = Number(params.chainId ?? ENV.PUBLIC_DEFAULT_CHAIN_ID);
  const [pool, session, magicUsd] = await Promise.all([
    fetchPool({
      chainId,
      address: params.address,
    }),
    getSession(request.headers.get("Cookie")),
    fetchMagicUsd(),
  ]);

  if (!pool) {
    throw new Response("Pool not found", {
      status: 404,
    });
  }

  const address = session.get("address");
  const userPosition = address
    ? await fetchUserPosition({
        chainId,
        pairAddress: params.address,
        userAddress: address,
      })
    : undefined;

  return defer({
    pool,
    lpBalance: userPosition?.lpBalance ?? "0",
    lpStaked: userPosition?.lpStaked ?? "0",
    userIncentives: userPosition?.userIncentives ?? [],
    vaultItems0: pool.token0.isVault
      ? fetchVaultReserveItems({
          chainId: pool.token0.chainId,
          address: pool.token0.address,
        })
      : undefined,
    vaultItems1: pool.token1.isVault
      ? fetchVaultReserveItems({
          chainId: pool.token1.chainId,
          address: pool.token1.address,
        })
      : undefined,
    nftBalance0:
      pool.token0.isVault && address
        ? fetchPoolTokenBalance(pool.token0, address)
        : undefined,
    nftBalance1:
      pool.token1.isVault && address
        ? fetchPoolTokenBalance(pool.token1, address)
        : undefined,
    magicUsd,
  });
}

export default function PoolDetailsPage() {
  const {
    pool,
    lpBalance: lpBalanceStr,
    lpStaked: lpStakedStr,
    userIncentives,
    vaultItems0,
    vaultItems1,
    magicUsd,
  } = useLoaderData<typeof loader>();

  const revalidator = useRevalidator();
  const { address: userAddress } = useAccount();
  const [poolActivityFilter, setPoolActivityFilter] =
    useState<Optional<TransactionType>>();
  const blockExplorer = useBlockExplorer({ chainId: pool.chainId });
  const [tab, setTab] = useState<PoolManagementTab>("deposit");
  const [
    optimisticSubscribedIncentiveIds,
    setOptimisticSubscribedIncentiveIds,
  ] = useState<bigint[]>([]);
  const [isWithdrawingFromVault, setIsWithdrawingFromVault] = useState(false);

  const poolIncentives = pool.incentives?.items ?? [];

  const nftIncentive = userIncentives.find(
    (userIncentive) =>
      userIncentive.isActive && userIncentive.incentive.rewardToken?.isVault,
  );
  const nftIncentiveDecimals =
    nftIncentive?.incentive.rewardToken?.decimals ?? 18;

  const {
    data: nftIncentiveTokenBalance,
    refetch: refetchNftIncentiveTokenBalance,
  } = useTokenBalance({
    id: nftIncentive?.incentive.rewardTokenAddress as Address | undefined,
    address: userAddress,
  });

  useEffect(() => {
    if (nftIncentiveTokenBalance > parseUnits("1", nftIncentiveDecimals)) {
      setIsWithdrawingFromVault(true);
    }
  }, [nftIncentiveDecimals, nftIncentiveTokenBalance]);

  const refetch = useCallback(() => {
    revalidator.revalidate();
    refetchNftIncentiveTokenBalance();
  }, [revalidator.revalidate, refetchNftIncentiveTokenBalance]);

  const { subscribeToIncentives } = useSubscribeToIncentives();
  const { claimRewards } = useClaimRewards();
  const { withdrawBatch, isLoading: isLoadingWithdrawBatch } = useWithdrawBatch(
    {
      vaultAddress: nftIncentive?.incentive.rewardTokenAddress as
        | Address
        | undefined,
    },
  );

  const lpBalance = BigInt(lpBalanceStr);
  const lpStaked = BigInt(lpStakedStr);
  const lpBalanceShare =
    bigIntToNumber(lpBalance) / bigIntToNumber(pool.totalSupply);
  const lpStakedShare =
    bigIntToNumber(lpStaked) / bigIntToNumber(pool.totalSupply);
  const lpShare = lpBalanceShare + lpStakedShare;
  const hasStakingRewards = userIncentives.some(
    (userIncentive) => BigInt(userIncentive.reward) > 0n,
  );

  const activePoolIncentives = poolIncentives.filter(
    (incentive) => Number(incentive.endTime) > Date.now() / 1000,
  );

  const subscribedIncentiveIds = userIncentives
    .filter((userIncentive) => userIncentive.isSubscribed)
    .map((userIncentive) => BigInt(userIncentive.incentive?.incentiveId ?? 0n))
    .concat(optimisticSubscribedIncentiveIds);

  const unsubscribedIncentiveIds = poolIncentives
    .filter(
      (incentive) =>
        !subscribedIncentiveIds.includes(BigInt(incentive.incentiveId)),
    )
    .map((incentive) => BigInt(incentive.incentiveId));

  const [baseToken, baseReserve] =
    (pool.token1.isVault && !pool.isVaultVault) || pool.token1.isMagic
      ? [pool.token1, BigInt(pool.reserve1)]
      : [pool.token0, BigInt(pool.reserve0)];
  const [quoteToken, quoteReserve] =
    baseToken.address === pool.token1.address
      ? [pool.token0, BigInt(pool.reserve0)]
      : [pool.token1, BigInt(pool.reserve1)];

  const memoizedUnsubscribedIncentiveIds = unsubscribedIncentiveIds.join(",");
  const handlePoolManagementSuccess = useCallback(
    (tab: PoolManagementTab) => {
      if (tab === "stake") {
        const incentiveIds = memoizedUnsubscribedIncentiveIds
          .split(",")
          .map((id) => BigInt(id));
        setOptimisticSubscribedIncentiveIds((curr) =>
          curr.concat(incentiveIds),
        );
      }

      refetch();
    },
    [memoizedUnsubscribedIncentiveIds, refetch],
  );

  const handleSubscribeToAll = async () => {
    const incentiveIds = [...unsubscribedIncentiveIds];
    await subscribeToIncentives(incentiveIds);
    // API can be slow to update, so optimistically update the subscribed list
    setOptimisticSubscribedIncentiveIds((curr) => curr.concat(incentiveIds));
    refetch();
  };

  const handleClaimRewards = async () => {
    await claimRewards(subscribedIncentiveIds);
    // Doesn't need optimistic update because data is pulled directly from contract
    refetch();
  };

  const handleWithdrawRewards = async (tokens: TokenWithAmount[]) => {
    await withdrawBatch(
      tokens.map((token) => ({
        id: BigInt(token.tokenId),
        amount: BigInt(token.amount),
        collectionId: token.collectionAddress as Address,
      })),
    );
    setIsWithdrawingFromVault(false);
    refetch();
  };

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
              <PoolImage pool={pool} className="h-auto w-14" showChainIcon />
              <div className="flex flex-col text-2xl">
                <a
                  href={`${blockExplorer.url}/address/${pool.address}`}
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
              {[pool.token0, pool.token1].map(
                ({
                  address,
                  name,
                  isVault,
                  collectionAddress,
                  collectionName,
                }) => (
                  <Fragment key={address}>
                    <li className="flex items-center gap-1.5">
                      <span className="font-medium">
                        {isVault ? `${name} Vault` : name}
                      </span>{" "}
                      <a
                        href={`${blockExplorer.url}/address/${address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:underline"
                      >
                        {truncateEthAddress(address)}{" "}
                        <ExternalLinkIcon className="h-2.5 w-2.5" />
                      </a>
                    </li>
                    {collectionAddress ? (
                      <li className="flex items-center gap-1.5">
                        <span className="font-medium">{collectionName}</span>{" "}
                        <a
                          href={`${blockExplorer.url}/address/${collectionAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:underline"
                        >
                          {truncateEthAddress(collectionAddress)}{" "}
                          <ExternalLinkIcon className="h-2.5 w-2.5" />
                        </a>
                      </li>
                    ) : null}
                  </Fragment>
                ),
              )}
            </ul>
            <div className="h-[1px] bg-night-900" />
            <div className="overflow-hidden rounded-md border border-night-800 bg-[#0C1420]">
              <div className="space-y-6 p-4 sm:p-6">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                  <div>
                    <h3 className="font-semibold text-lg">Pool Liquidity</h3>
                    {Number(pool.reserveUsd) > 0 ? (
                      <span className="text-night-400">
                        {formatUSD(pool.reserveUsd)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex w-full items-center justify-center gap-3 rounded-lg border border-night-900 p-2 text-night-200 sm:w-auto">
                    <p className="justify-self-end">1 {baseToken.symbol}</p>
                    <ArrowLeftRightIcon className="h-4 w-4 text-night-600" />
                    <p>
                      {baseReserve > 0
                        ? formatAmount(
                            bigIntToNumber(quoteReserve, quoteToken.decimals) /
                              bigIntToNumber(baseReserve, baseToken.decimals),
                          )
                        : 0}{" "}
                      {quoteToken.symbol}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3 text-[#FFFCF5]">
                    <span className="flex items-center gap-1">
                      <span className="text-sm">
                        {formatTokenReserve(baseToken, baseReserve)}
                      </span>
                      <PoolTokenImage token={baseToken} className="h-5 w-5" />
                      <span className="font-semibold">{baseToken.symbol}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-sm">
                        {formatTokenReserve(quoteToken, quoteReserve)}
                      </span>
                      <PoolTokenImage token={quoteToken} className="h-5 w-5" />
                      <span className="font-semibold">{quoteToken.symbol}</span>
                    </span>
                  </div>
                  <div />
                  <div className="flex items-center justify-between gap-3 text-night-400 text-sm">
                    <span>
                      {BigInt(baseToken.derivedMagic) > 0
                        ? formatUSD(
                            bigIntToNumber(baseReserve, baseToken.decimals) *
                              bigIntToNumber(baseToken.derivedMagic) *
                              magicUsd,
                          )
                        : null}
                    </span>
                    <span>
                      {BigInt(quoteToken.derivedMagic) > 0
                        ? formatUSD(
                            bigIntToNumber(quoteReserve, quoteToken.decimals) *
                              bigIntToNumber(quoteToken.derivedMagic) *
                              magicUsd,
                          )
                        : null}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-night-900 bg-night-1100 px-8 py-4 text-center text-[#FFFCF5]">
                <div>
                  <p className="text-night-400 text-sm">Volume (24h)</p>
                  <p>{getPoolVolume24hDisplay(pool)}</p>
                </div>
                <div>
                  <p className="text-night-400 text-sm">Fees (24h)</p>
                  <p>{getPoolFees24hDisplay(pool)}</p>
                </div>
                <div>
                  <p className="text-night-400 text-sm">APY</p>
                  <p>{formatPercent(pool.apy)}</p>
                </div>
              </div>
            </div>
            {poolIncentives.length > 0 ? (
              <div className="overflow-hidden rounded-md border border-night-800 bg-[#0C1420]">
                <div className="space-y-4 p-4 sm:p-6">
                  <div>
                    <h3 className="font-semibold text-lg">Rewards</h3>
                    <p className="text-night-400 text-sm">
                      Rewards are earned for staking in the pool
                    </p>
                  </div>
                  <div className="space-y-2">
                    {activePoolIncentives.map(
                      ({
                        incentiveId,
                        rewardToken,
                        rewardTokenAddress,
                        remainingRewardAmount,
                        endTime,
                      }) => (
                        <div
                          key={incentiveId}
                          className="flex items-center justify-between gap-3 rounded-md p-3 even:bg-night-1100"
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
                            {lpStaked > 0 &&
                            subscribedIncentiveIds.includes(
                              BigInt(incentiveId),
                            ) ? (
                              <Badge size="xs">Earning</Badge>
                            ) : lpStaked > 0 ? (
                              <Badge size="xs" color="secondary">
                                Not Earning
                              </Badge>
                            ) : null}
                          </div>
                          <div className="text-right">
                            <span>
                              {formatAmount(BigInt(remainingRewardAmount), {
                                type: "compact",
                              })}
                            </span>{" "}
                            <span className="block text-night-400 text-xs sm:inline sm:text-sm">
                              available until{" "}
                              {new Date(
                                Number(endTime) * 1000,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                  {lpStaked > 0 && unsubscribedIncentiveIds.length > 0 ? (
                    <TransactionButton
                      chainId={pool.chainId}
                      className="w-full"
                      onClick={handleSubscribeToAll}
                    >
                      Start earning all rewards
                    </TransactionButton>
                  ) : null}
                </div>
                {lpStaked > 0 ? (
                  <div className="space-y-6 bg-night-1100 px-4 py-4 sm:px-6">
                    <div className="space-y-3">
                      <h4 className="text-[#FFFCF5]">Your earned rewards</h4>
                      <ul className="flex flex-wrap items-start gap-8">
                        {userIncentives.map((userIncentive) => (
                          <li
                            key={userIncentive.incentive.incentiveId}
                            className="flex items-center gap-2"
                          >
                            {userIncentive.incentive.rewardToken ? (
                              <PoolTokenImage
                                token={userIncentive.incentive.rewardToken}
                                className="h-10 w-10"
                              />
                            ) : null}
                            <div className="text-lg">
                              {formatAmount(BigInt(userIncentive.reward), {
                                decimals: Number(
                                  userIncentive.incentive.rewardToken
                                    ?.decimals ?? 18,
                                ),
                              })}
                              <span className="block text-night-400 text-sm">
                                {userIncentive.incentive.rewardToken?.symbol}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {hasStakingRewards ? (
                      <TransactionButton
                        chainId={pool.chainId}
                        className="w-full"
                        onClick={handleClaimRewards}
                      >
                        Claim all rewards
                      </TransactionButton>
                    ) : null}
                  </div>
                ) : (
                  <div className="relative bg-[url(/img/pools/rewards_bg.png)] bg-contain bg-night-1100 bg-right bg-no-repeat p-6">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A111C]/0 to-[#463711]" />
                    <div className="relative flex w-full items-center justify-between gap-3">
                      <span className="font-medium text-[#FFFDF6] text-xl">
                        Start staking and{" "}
                        <span className="text-honey-900">earn rewards</span>
                      </span>
                      <button
                        type="button"
                        className="rounded-lg bg-[#FACE61] px-4 py-2 font-medium text-[#0E1725] transition-colors hover:bg-honey-700 active:bg-honey-800"
                        onClick={() => setTab("stake")}
                      >
                        Stake now
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            {lpBalance > 0 || lpStaked > 0 ? (
              <div className="space-y-4 rounded-md bg-night-1100 p-4">
                <div>
                  <h3 className="font-medium text-lg">My Position</h3>
                  {pool.reserveUsd > 0 ? (
                    <span className="text-night-400 text-sm">
                      {formatUSD(lpShare * pool.reserveUsd)}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-10">
                  <div className="space-y-2">
                    <h3 className="text-night-200">Unstaked</h3>
                    <PoolLpAmount pool={pool} amount={lpBalance} />
                    <div className="space-y-2">
                      {/* <PoolTokenRow
                          token={baseToken}
                          amount={
                            lpBalanceShare *
                            bigIntToNumber(
                              baseReserve,
                              baseToken.decimals,
                            )
                          }
                          amountUSD={
                            lpBalanceShare *
                            bigIntToNumber(
                              baseReserve,
                              baseToken.decimals,
                            ) *
                            baseToken.priceUSD
                          }
                        />
                        <PoolTokenRow
                          token={quoteToken}
                          amount={
                            lpBalanceShare *
                            bigIntToNumber(
                              quoteReserve,
                              quoteToken.decimals,
                            )
                          }
                          amountUSD={
                            lpBalanceShare *
                            bigIntToNumber(
                              quoteReserve,
                              quoteToken.decimals,
                            ) *
                            quoteToken.priceUSD
                          }
                        /> */}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-night-200">Staked</h3>
                    <PoolLpAmount pool={pool} amount={lpStaked} />
                    <div className="space-y-2">
                      {/* <PoolTokenRow
                          token={baseToken}
                          amount={
                            lpStakedShare *
                            bigIntToNumber(
                              baseReserve,
                              baseToken.decimals,
                            )
                          }
                          amountUSD={
                            lpStakedShare *
                            bigIntToNumber(
                              baseReserve,
                              baseToken.decimals,
                            ) *
                            baseToken.priceUSD
                          }
                        />
                        <PoolTokenRow
                          token={quoteToken}
                          amount={
                            lpStakedShare *
                            bigIntToNumber(
                              quoteReserve,
                              quoteToken.decimals,
                            )
                          }
                          amountUSD={
                            lpStakedShare *
                            bigIntToNumber(
                              quoteReserve,
                              quoteToken.decimals,
                            ) *
                            quoteToken.priceUSD
                          }
                        /> */}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <PoolManagementView
            className="sticky top-4 col-span-3 hidden space-y-4 p-4 lg:block"
            pool={pool}
            tab={tab}
            lpBalance={lpBalance}
            lpStaked={lpStaked}
            canStake={activePoolIncentives.length > 0}
            canUnstake={activePoolIncentives.length > 0 || lpStaked > 0}
            unsubscribedIncentiveIds={unsubscribedIncentiveIds}
            magicUsd={magicUsd}
            onChangeTab={setTab}
            onSuccess={handlePoolManagementSuccess}
          />
        </div>
        {pool.hasVault ? (
          <div className="mt-12 space-y-3.5">
            {vaultItems0 && pool.token0.collectionTokenIds?.length !== 1 ? (
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
            {vaultItems1 && pool.token1.collectionTokenIds?.length !== 1 ? (
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
              Manage Liquidity
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent position="bottom" size="xl">
          <PoolManagementView
            className="mt-4 space-y-6"
            pool={pool}
            tab={tab}
            lpBalance={lpBalance}
            lpStaked={lpStaked}
            canStake={activePoolIncentives.length > 0}
            canUnstake={activePoolIncentives.length > 0 || lpStaked > 0}
            unsubscribedIncentiveIds={unsubscribedIncentiveIds}
            magicUsd={magicUsd}
            onChangeTab={setTab}
            onSuccess={handlePoolManagementSuccess}
          />
        </SheetContent>
      </Sheet>
      {nftIncentive?.incentive.rewardToken &&
      nftIncentive.incentive.vaultItems.length > 0 ? (
        <span>
          <Dialog
            open={isWithdrawingFromVault}
            onOpenChange={setIsWithdrawingFromVault}
          >
            <SelectionPopup
              type="vault"
              token={nftIncentive.incentive.rewardToken}
              requiredAmount={bigIntToNumber(
                floorBigInt(nftIncentiveTokenBalance, nftIncentiveDecimals),
                nftIncentiveDecimals,
              )}
              onSubmit={handleWithdrawRewards}
              isSubmitDisabled={isLoadingWithdrawBatch}
              keepOpenOnSubmit
            />
          </Dialog>
        </span>
      ) : null}
    </main>
  );
}

const PoolManagementView = ({
  pool,
  tab,
  lpBalance,
  lpStaked,
  magicUsd,
  canStake,
  canUnstake,
  unsubscribedIncentiveIds,
  onChangeTab,
  onSuccess,
  className,
}: {
  pool: Pool;
  tab: PoolManagementTab;
  lpBalance: bigint;
  lpStaked: bigint;
  magicUsd: number;
  canStake: boolean;
  canUnstake: boolean;
  unsubscribedIncentiveIds: bigint[];
  onChangeTab: (tab: PoolManagementTab) => void;
  onSuccess: (tab: PoolManagementTab) => void;
  className?: string;
}) => {
  const [_activeTab, _setActiveTab] = useState<string>("deposit");
  const nftBalances = useRouteLoaderData(
    "routes/pools_.($chainId).$address",
  ) as SerializeFrom<typeof loader>;

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
          ...(canStake ? [["stake", "Stake"]] : []),
          ...(canUnstake ? [["unstake", "Unstake"]] : []),
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
            onClick={() => onChangeTab(key as typeof tab)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "deposit" ? (
        <PoolDepositTab
          pool={pool}
          magicUsd={magicUsd}
          nftBalances={nftBalances}
          onSuccess={useCallback(() => onSuccess("deposit"), [onSuccess])}
        />
      ) : null}
      {tab === "withdraw" ? (
        <PoolWithdrawTab
          pool={pool}
          magicUsd={magicUsd}
          balance={lpBalance}
          onSuccess={useCallback(() => onSuccess("withdraw"), [onSuccess])}
        />
      ) : null}
      {tab === "stake" ? (
        <PoolIncentiveStake
          pool={pool}
          balance={lpBalance}
          unsubscribedIncentiveIds={unsubscribedIncentiveIds}
          onSuccess={useCallback(() => onSuccess("stake"), [onSuccess])}
        />
      ) : null}
      {tab === "unstake" ? (
        <PoolIncentiveUnstake
          pool={pool}
          staked={lpStaked}
          onSuccess={useCallback(() => onSuccess("unstake"), [onSuccess])}
        />
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
    page,
    items: transactions,
    limit,
    hasPreviousPage,
    hasNextPage,
    totalCount,
    goToPreviousPage,
    goToNextPage,
  } = usePoolTransactions({
    chainId: pool.chainId,
    address: pool.address,
    type,
  });
  // const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const blockExplorer = useBlockExplorer({ chainId: pool.chainId });

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
            let tokenA: Token;
            let amountA: bigint;
            let itemsA: PoolTransactionItem[];
            let tokenB: Token;
            let amountB: bigint;
            let itemsB: PoolTransactionItem[];
            const isSwap = tx.type === "Swap";
            if (isSwap) {
              if (tx.isAmount1Out) {
                tokenA = pool.token0;
                amountA = BigInt(tx.amount0);
                itemsA = tx.items0 ?? [];
                tokenB = pool.token1;
                amountB = BigInt(tx.amount1);
                itemsB = tx.items1;
              } else {
                tokenA = pool.token1;
                amountA = BigInt(tx.amount1);
                itemsA = tx.items1;
                tokenB = pool.token0;
                amountB = BigInt(tx.amount0);
                itemsB = tx.items0;
              }
            } else {
              tokenA = pool.token0;
              tokenB = pool.token1;
              if (tokenA.address === pool.token0Address) {
                amountA = BigInt(tx.amount0);
                itemsA = tx.items0;
                amountB = BigInt(tx.amount1);
                itemsB = tx.items1;
              } else {
                amountA = BigInt(tx.amount1);
                itemsA = tx.items1;
                amountB = BigInt(tx.amount0);
                itemsB = tx.items0;
              }
            }

            return (
              <Fragment key={tx.hash}>
                <tr className="border-b border-b-night-900 transition-colors">
                  <td className="px-4 py-3.5 text-left sm:px-5">
                    <div className="grid grid-cols-[1fr,max-content,1fr] items-center gap-3 text-night-400 text-sm">
                      <div className="flex items-center gap-2.5">
                        <PoolTransactionImage token={tokenA} items={itemsA} />
                        <span>
                          <span className="text-honey-25">
                            {formatAmount(amountA, {
                              decimals: tokenA.decimals,
                              type: "compact",
                            })}
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
                            {formatAmount(amountB, {
                              decimals: tokenB.decimals,
                              type: "compact",
                            })}
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
                    {tx.amountUsd > 0 ? formatUSD(tx.amountUsd) : "-"}
                  </td>
                  <td className="hidden px-4 py-3.5 text-center text-night-400 text-sm sm:table-cell sm:px-5">
                    {tx.userDomain?.treasuretag ? (
                      <span className="flex items-center justify-center gap-1 font-medium text-honey-25">
                        <MagicLogo className="h-3 w-3" />
                        {tx.userDomain.treasuretag.name}
                      </span>
                    ) : (
                      <span className="font-mono">
                        {tx.userAddress
                          ? truncateEthAddress(tx.userAddress)
                          : "-"}
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
                        {token0.isVault &&
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
        {totalCount > 0 ? (
          <p className="text-night-500">
            Showing{" "}
            <span className="text-night-200">
              {formatNumber((page - 1) * limit + 1)}
            </span>{" "}
            to{" "}
            <span className="text-night-200">
              {formatNumber((page - 1) * limit + transactions.length)}
            </span>{" "}
            of{" "}
            <span className="text-night-200">{formatNumber(totalCount)}</span>
          </p>
        ) : null}
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

// const PoolTokenRow = ({
//   token,
//   items,
// }: {
//   token: Token;
//   items: TokenWithAmount[];
// }) => {
//   const numVaultItems = sumArray(items.map(({ amount }) => amount));
//   return (
//     <div className="flex items-center justify-between gap-3">
//       <div className="flex items-center gap-2 font-medium">
//         <PoolTokenImage className="h-6 w-6" token={token} />
//         <span className="text-night-100">{token.symbol}</span>
//       </div>
//       <div className="flex items-center gap-2 text-right">
//         <span>{typeof amount === "string" ? amount : formatAmount(amount)}</span>
//         {amountUSD > 0 ? (
//           <span className="text-night-400 text-sm">
//             {formatUSD(amountUSD, { notation: "compact" })}
//           </span>
//         ) : null}
//       </div>
//     </div>
//   );
// );
