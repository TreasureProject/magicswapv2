import { BigNumber } from "@ethersproject/bignumber";
import { DialogClose } from "@radix-ui/react-dialog";
import type { V2_MetaFunction } from "@remix-run/react";
import { useFetcher } from "@remix-run/react";
import {
  Await,
  Link,
  useLoaderData,
  useLocation,
  useRevalidator,
  useSearchParams,
} from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { defer } from "@remix-run/server-runtime";
import { ArrowDownIcon, ChevronDownIcon, LayersIcon } from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ClientOnly } from "remix-utils";
import { formatUnits, parseUnits } from "viem";
import { useBalance } from "wagmi";

import type { FetchInventoryLoader } from "./resources.fetch-inventory";
import { fetchPools } from "~/api/pools.server";
import {
  fetchToken,
  fetchTokens,
  fetchTotalInventoryForUser,
} from "~/api/tokens.server";
import { CurrencyInput } from "~/components/CurrencyInput";
import { DisabledInputPopover } from "~/components/DisabledInputPopover";
import { LoaderIcon, SwapIcon, TokenIcon } from "~/components/Icons";
import { SettingsDropdownMenu } from "~/components/SettingsDropdownMenu";
import { VisibleOnClient } from "~/components/VisibleOnClient";
import { SelectionPopup } from "~/components/item_selection/SelectionPopup";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { Button, TransactionButton } from "~/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/Dialog";
import { useAccount } from "~/contexts/account";
import { useApprove } from "~/hooks/useApprove";
import { useFocusInterval } from "~/hooks/useFocusInterval";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useStore } from "~/hooks/useStore";
import { useSwap } from "~/hooks/useSwap";
import { sumArray } from "~/lib/array";
import { formatAmount, formatTokenAmount, formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { createSwapRoute } from "~/lib/pools";
import type { Pool } from "~/lib/pools.server";
import { generateTitle, getSocialMetas, getUrl } from "~/lib/seo";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { getSession } from "~/sessions";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type {
  AddressString,
  NumberString,
  TroveTokenWithQuantity,
} from "~/types";

export const meta: V2_MetaFunction<
  typeof loader,
  {
    root: RootLoader;
  }
> = ({ matches, data }) => {
  const requestInfo = matches.find((match) => match.id === "root")?.data
    .requestInfo;

  const url = getUrl(requestInfo);

  return getSocialMetas({
    url,
    title: generateTitle(
      data?.tokenOut
        ? `Swap ${data?.tokenIn.symbol} to ${data?.tokenOut.symbol}`
        : "Swap"
    ),
    image: data?.tokenOut
      ? `${url}/${data?.tokenIn.id}/${data?.tokenOut.id}.png`
      : "/img/default_banner.png",
  });
};

export async function loader({ request }: LoaderArgs) {
  const pools = await fetchPools();
  const session = await getSession(request.headers.get("Cookie"));

  const address = session.get("address");

  const url = new URL(request.url);
  const inputAddress = url.searchParams.get("in");
  const outputAddress = url.searchParams.get("out");

  const tokenIn = inputAddress
    ? await fetchToken(inputAddress)
    : await fetchToken(process.env.DEFAULT_TOKEN_ADDRESS);

  if (!tokenIn) {
    throw new Response("Input token not found", {
      status: 404,
    });
  }

  const tokenOut = outputAddress ? await fetchToken(outputAddress) : null;

  const { amountInBN = BigNumber.from(0) } =
    createSwapRoute(
      tokenIn,
      tokenOut,
      pools,
      parseUnits("1", tokenOut?.decimals ?? 18),
      true
    ) ?? {};

  if (!address || !tokenIn.isNFT) {
    return defer({
      pools,
      tokens: fetchTokens(),
      tokenIn,
      tokenOut,
      inventory: null,
      comparisonValue: amountInBN.toString(),
    });
  }

  return defer({
    pools,
    tokens: fetchTokens(),
    tokenIn,
    tokenOut,
    inventory: fetchTotalInventoryForUser(tokenIn.urlSlug, address),
    comparisonValue: amountInBN.toString(),
  });
}

const DEFAULT_STATE = {
  amount: "0",
  nftsIn: [] as TroveTokenWithQuantity[],
  nftsOut: [] as TroveTokenWithQuantity[],
  isExactOut: false,
};

export default function SwapPage() {
  const { pools, tokenIn, tokenOut, comparisonValue } =
    useLoaderData<typeof loader>();
  const { address, isConnected } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ amount: rawAmount, isExactOut, nftsIn, nftsOut }, setTrade] =
    useState(DEFAULT_STATE);
  const revalidator = useRevalidator();
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  const handleSelectToken = (direction: "in" | "out", token: PoolToken) => {
    searchParams.set(direction, token.id);
    // adding state (can be anything here) on client side transition to indicate that a modal can pop-up
    setSearchParams(searchParams, {
      state: "true",
    });
  };

  const amount = parseUnits(
    rawAmount as NumberString,
    isExactOut ? tokenOut?.decimals ?? 18 : tokenIn.decimals
  );

  const {
    amountInBN = BigNumber.from(0),
    amountOutBN = BigNumber.from(0),
    legs = [],
    priceImpact = 0,
  } = createSwapRoute(
    tokenIn,
    tokenOut,
    pools,
    amount > 0 ? amount : BigInt(1),
    isExactOut
  ) ?? {};

  const amountIn = BigInt(amountInBN.toString());
  const amountOut = BigInt(amountOutBN.toString());

  const state = useStore(useSettingsStore, (state) => state);

  const tokenInPoolId = legs.find(
    ({ tokenFrom }) => tokenFrom.address === tokenIn.id
  )?.poolAddress;
  const tokenOutPoolId = tokenOut
    ? legs.find(({ tokenTo }) => tokenTo.address === tokenOut.id)?.poolAddress
    : undefined;
  const tokenInPool = pools.find(({ id }) => id === tokenInPoolId);
  const tokenOutPool = tokenOutPoolId
    ? pools.find(({ id }) => id === tokenOutPoolId)
    : undefined;
  const poolTokenIn =
    tokenIn.id === tokenInPool?.token0.id
      ? tokenInPool.token0
      : tokenInPool?.token1;
  const poolTokenOut =
    tokenOut && tokenOut.id === tokenOutPool?.token0.id
      ? tokenOutPool.token0
      : tokenOutPool?.token1;
  const legPools = legs
    .map(({ poolAddress }) => pools.find(({ id }) => id === poolAddress))
    .filter((pool) => !!pool) as Pool[];
  const lpFee = sumArray(legPools.map(({ lpFee }) => Number(lpFee ?? 0)));
  const protocolFee = sumArray(
    legPools.map(({ protocolFee }) => Number(protocolFee ?? 0))
  );
  const royaltiesFee = sumArray(
    legPools.map(({ royaltiesFee }) => Number(royaltiesFee ?? 0))
  );

  const hasAmounts = amountIn > 0 && amountOut > 0;

  const { data: tokenInBalance, refetch: refetchTokenInBalance } = useBalance({
    address,
    token: tokenIn.id as AddressString,
    enabled: isConnected && !tokenIn.isNFT,
  });
  const { data: tokenOutBalance, refetch: refetchTokenOutBalance } = useBalance(
    {
      address,
      token: tokenOut?.id as AddressString,
      enabled: isConnected && !!tokenOut && !tokenOut.isNFT,
    }
  );

  const { isApproved: isTokenInApproved, refetch: refetchTokenInApproval } =
    useIsApproved({
      token: tokenIn,
      amount: amountIn,
      enabled: isConnected && hasAmounts,
    });
  const { approve: approveTokenIn, isSuccess: isApproveTokenInSuccess } =
    useApprove({
      token: tokenIn,
      amount: amountIn,
      enabled: !isTokenInApproved,
    });

  const {
    amountInMax,
    amountOutMin,
    swap,
    isSuccess: isSwapSuccess,
  } = useSwap({
    tokenIn: tokenIn,
    tokenOut: tokenOut,
    amountIn,
    amountOut,
    isExactOut,
    nftsIn,
    nftsOut,
    path: legs.flatMap(({ tokenFrom, tokenTo }, i) =>
      i === legs.length - 1
        ? [tokenFrom.address as AddressString, tokenTo.address as AddressString]
        : (tokenFrom.address as AddressString)
    ),
    enabled: isConnected && !!tokenOut && hasAmounts,
  });

  useEffect(() => {
    if (isApproveTokenInSuccess) {
      refetchTokenInApproval();
    }
  }, [isApproveTokenInSuccess, refetchTokenInApproval]);

  useEffect(() => {
    if (isSwapSuccess) {
      setTrade(DEFAULT_STATE);
      refetchTokenInBalance();
      refetchTokenOutBalance();
      setSwapModalOpen(false);
    }
  }, [isSwapSuccess, refetchTokenInBalance, refetchTokenOutBalance]);

  useEffect(() => {
    if (tokenIn?.isNFT) {
      setTrade(DEFAULT_STATE);
    } else {
      setTrade((trade) => ({
        ...trade,
        nftsOut: [],
      }));
    }
  }, [tokenIn.id, tokenIn.isNFT]);

  useEffect(() => {
    if (tokenOut?.isNFT) {
      setTrade(DEFAULT_STATE);
    } else {
      setTrade((trade) => ({
        ...trade,
        nftsOut: [],
      }));
    }
  }, [tokenOut?.id, tokenOut?.isNFT]);

  useFocusInterval(
    useCallback(() => {
      revalidator.revalidate();
    }, [revalidator]),
    5000
  );

  const token = poolTokenIn ?? tokenIn;
  const otherToken = poolTokenOut ?? tokenOut;

  const formattedTokenInAmount = formatTokenAmount(amountIn, tokenIn.decimals);
  const formattedTokenOutAmount = formatTokenAmount(
    amountOut,
    tokenOut?.decimals ?? 18
  );

  // const tokenInAmountPriceUSD =
  //   (token?.priceUSD ?? 0) *
  //   (Number.isNaN(
  //     isExactOut ? formatUnits(amountIn, tokenIn.decimals) : rawAmount
  //   ) ||
  //   (isExactOut ? formatUnits(amountIn, tokenIn.decimals) : rawAmount) === 0
  //     ? 1
  //     : isExactOut
  //     ? formatUnits(amountIn, tokenIn.decimals)
  //     : rawAmount);

  // const tokenInAmountPriceUSD =
  //   (token?.priceUSD ?? 0) *
  //   (Number.isNaN(isExactOut ? formattedTokenInAmount : rawAmount) ||
  //   (isExactOut ? formattedTokenInAmount : rawAmount) === 0
  //     ? 1
  //     : isExactOut
  //     ? formattedTokenInAmount
  //     : rawAmount);
  return (
    <main className="mx-auto max-w-xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3 text-night-600">
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <SwapIcon className="h-6 w-6" />
          <h1 className="text-night-100">Swap</h1>
        </div>
        <SettingsDropdownMenu />
      </div>
      <div className="mt-3">
        <SwapTokenInput
          token={token}
          otherToken={otherToken}
          isOut={false}
          balance={tokenInBalance?.value}
          amount={isExactOut ? formattedTokenInAmount : rawAmount}
          selectedNfts={nftsIn}
          onSelect={(token) => handleSelectToken("in", token)}
          onUpdateAmount={(amount) =>
            setTrade({
              amount,
              nftsIn: [],
              nftsOut: [],
              isExactOut: false,
            })
          }
          onSelectNfts={(tokens) =>
            setTrade({
              amount: sumArray(
                tokens.map(({ quantity }) => quantity)
              ).toString(),
              nftsIn: tokens,
              nftsOut: [],
              isExactOut: false,
            })
          }
        />
        <Link
          to={`/swap?in=${tokenOut?.id}&out=${tokenIn.id}`}
          aria-disabled={!tokenOut?.id ? "true" : "false"}
          onClick={(e) => !tokenOut?.id && e.preventDefault()}
          className={cn(
            "relative z-10 -my-2 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1200 bg-night-1100 text-honey-25",
            !tokenOut?.id ? "cursor-not-allowed text-night-800" : "group"
          )}
        >
          <ArrowDownIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </Link>
        <SwapTokenInput
          token={otherToken}
          otherToken={token}
          isOut
          balance={tokenOutBalance?.value}
          amount={isExactOut ? rawAmount : formattedTokenOutAmount}
          selectedNfts={nftsOut}
          onSelect={(token) => handleSelectToken("out", token)}
          onUpdateAmount={(amount) =>
            setTrade({
              amount,
              nftsIn: [],
              nftsOut: [],
              isExactOut: true,
            })
          }
          onSelectNfts={(tokens) =>
            setTrade({
              amount: sumArray(
                tokens.map(({ quantity }) => quantity)
              ).toString(),
              nftsIn: [],
              nftsOut: tokens,
              isExactOut: true,
            })
          }
        />
        {otherToken ? (
          <div className="mt-6 rounded-lg border border-night-800 p-4">
            <p className="text-sm text-night-400">
              <span className="font-medium text-honey-25">
                {formatTokenAmount(BigInt(comparisonValue), tokenIn.decimals)}
              </span>{" "}
              {token.symbol} per {otherToken.symbol}
            </p>
          </div>
        ) : null}
        <div className="mt-4 space-y-1.5">
          <ClientOnly>
            {() => (
              <>
                {!isTokenInApproved && hasAmounts ? (
                  <TransactionButton
                    className="w-full"
                    onClick={() => approveTokenIn()}
                  >
                    Approve {tokenIn.name}
                  </TransactionButton>
                ) : (
                  <Dialog open={swapModalOpen} onOpenChange={setSwapModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={!hasAmounts}>
                        Swap Items
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        Swap {formattedTokenInAmount} {token.symbol} for{" "}
                        {formattedTokenOutAmount} {otherToken?.symbol}
                      </DialogHeader>
                      <div>
                        <div className="overflow-hidden rounded-lg bg-night-1100">
                          <div className="flex items-center bg-night-900 px-3.5 py-2.5">
                            <img
                              src={token.image}
                              alt={token.symbol}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="ml-2 font-medium text-honey-25">
                              {token.name}
                            </span>
                          </div>
                          <div className="p-4">
                            {token.isNFT ? (
                              nftsIn.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn("flex", {
                                      "-space-x-5": token.type === "ERC721",
                                    })}
                                  >
                                    {nftsIn
                                      .slice(0, Math.min(nftsIn.length, 5))
                                      .map((nft) => {
                                        return (
                                          <div
                                            key={nft.tokenId}
                                            className="flex flex-col items-center"
                                          >
                                            <img
                                              className="h-12 w-12 rounded border-2 border-night-1100"
                                              src={nft.image.uri}
                                              alt={nft.metadata.name}
                                            />
                                            {token.type === "ERC1155" ? (
                                              <p className="text-xs text-night-600">
                                                {nft.quantity}x
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                  </div>
                                  {nftsIn.length > 5 ? (
                                    <div className="flex items-center rounded-md bg-night-900 px-2 py-1.5">
                                      <p className="text-xs font-semibold text-night-500">
                                        +{nftsIn.length - 5}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null
                            ) : (
                              <p>{formattedTokenInAmount}</p>
                            )}
                          </div>
                        </div>
                        <div className="relative z-10 -my-2 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1200 bg-night-1100 text-honey-25">
                          <ArrowDownIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="overflow-hidden rounded-lg bg-night-1100">
                          <div className="flex items-center bg-night-900 px-3.5 py-2.5">
                            <img
                              src={otherToken?.image}
                              alt={otherToken?.symbol}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="ml-2 font-medium text-honey-25">
                              {otherToken?.name}
                            </span>
                          </div>
                          <div className="p-4">
                            {otherToken?.isNFT ? (
                              nftsOut.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn("flex", {
                                      "-space-x-5":
                                        otherToken?.type === "ERC721",
                                    })}
                                  >
                                    {nftsOut
                                      .slice(0, Math.min(nftsOut.length, 5))
                                      .map((nft) => {
                                        return (
                                          <div
                                            key={nft.tokenId}
                                            className="flex flex-col items-center"
                                          >
                                            <img
                                              className="h-12 w-12 rounded border-2 border-night-1100"
                                              src={nft.image.uri}
                                              alt={nft.metadata.name}
                                            />
                                            {otherToken?.type === "ERC1155" ? (
                                              <p className="text-xs text-night-600">
                                                {nft.quantity}x
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                  </div>
                                  {nftsOut.length > 5 ? (
                                    <div className="flex items-center rounded-md bg-night-900 px-2 py-1.5">
                                      <p className="text-xs font-semibold text-night-500">
                                        +{nftsOut.length - 5}
                                      </p>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null
                            ) : (
                              <p>{formattedTokenOutAmount}</p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 rounded-lg border border-night-800 p-4 text-sm text-night-400">
                          {!!poolTokenIn && !!poolTokenOut && hasAmounts ? (
                            <>
                              <div className="flex items-center justify-between">
                                Price Impact
                                <span>-{formatPercent(priceImpact)}</span>
                              </div>
                              {lpFee > 0 && (
                                <div className="flex items-center justify-between">
                                  Liquidity Provider Fee
                                  <span>{formatPercent(lpFee)}</span>
                                </div>
                              )}
                              {protocolFee > 0 && (
                                <div className="flex items-center justify-between">
                                  Protocol Fee
                                  <span>{formatPercent(protocolFee)}</span>
                                </div>
                              )}
                              {royaltiesFee > 0 && (
                                <div className="flex items-center justify-between">
                                  Royalties Fee
                                  <span>{formatPercent(royaltiesFee)}</span>
                                </div>
                              )}
                              {isExactOut ? (
                                <div className="flex items-center justify-between">
                                  Maximum spent
                                  <span>
                                    {formatTokenAmount(
                                      amountInMax,
                                      poolTokenIn.decimals
                                    )}{" "}
                                    {poolTokenIn.symbol}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  Minimum received
                                  <span>
                                    {formatTokenAmount(
                                      amountOutMin,
                                      poolTokenOut.decimals
                                    )}{" "}
                                    {poolTokenOut.symbol}
                                  </span>
                                </div>
                              )}
                            </>
                          ) : null}
                          <div className="flex items-center justify-between">
                            Slippage
                            <span>
                              {formatPercent(
                                state?.slippage || DEFAULT_SLIPPAGE
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            Deadline
                            <span>{state?.deadline || 30} Minutes</span>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-3 gap-3">
                          <Button
                            size="lg"
                            className="col-span-full sm:col-span-2"
                            onClick={() => swap()}
                          >
                            Confirm Swap
                          </Button>
                          <DialogClose asChild>
                            <Button
                              size="lg"
                              variant="secondary"
                              className="col-span-full sm:col-span-1"
                            >
                              Cancel
                            </Button>
                          </DialogClose>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </>
            )}
          </ClientOnly>
        </div>
        <div className="mt-4 text-sm text-night-400">
          {!!poolTokenIn && !!poolTokenOut && hasAmounts ? (
            <div className="flex items-center justify-between">
              Price Impact
              <span>-{formatPercent(priceImpact)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

const SwapTokenInput = ({
  token,
  otherToken,
  isOut,
  balance = BigInt(0),
  amount,
  selectedNfts,
  onSelect,
  onUpdateAmount,
  onSelectNfts,
  className,
}: {
  token: PoolToken | null;
  otherToken: PoolToken | null;
  isOut: boolean;
  balance?: bigint;
  amount: string;
  selectedNfts: TroveTokenWithQuantity[];
  onSelect: (token: PoolToken) => void;
  onUpdateAmount: (amount: string) => void;
  onSelectNfts: (tokens: TroveTokenWithQuantity[]) => void;
  className?: string;
}) => {
  const { isConnected } = useAccount();
  const location = useLocation();
  const parsedAmount = Number(amount);
  const amountPriceUSD =
    (token?.priceUSD ?? 0) *
    (Number.isNaN(parsedAmount) || parsedAmount === 0 ? 1 : parsedAmount);
  const { inventory } = useLoaderData<typeof loader>();
  const { state: routeState } = useLocation();

  return token ? (
    <div className={cn("overflow-hidden rounded-lg bg-night-1100", className)}>
      <div className="flex items-center justify-between gap-3 p-4">
        <Dialog key={location.search}>
          <TokenSelectDialog
            disabledTokenIds={
              [token.id, otherToken?.id].filter((id) => !!id) as string[]
            }
            onSelect={onSelect}
          />

          <DialogTrigger asChild>
            <button className="flex items-center gap-4 text-left">
              <PoolTokenImage className="h-12 w-12" token={token} />
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-lg font-medium text-honey-25">
                  {token.name} <ChevronDownIcon className="h-3 w-3" />
                </span>
                <span className="block text-sm text-night-600">
                  {token.symbol}
                </span>
              </div>
            </button>
          </DialogTrigger>
        </Dialog>
        <div className="space-y-1 text-right">
          {token.isNFT ? (
            selectedNfts.length > 0 ? (
              <div className="flex items-center space-x-2">
                {selectedNfts.length > 5 ? (
                  <div className="flex items-center rounded-md bg-night-900 px-2 py-1.5">
                    <p className="text-xs font-semibold text-night-500">
                      +{selectedNfts.length - 5}
                    </p>
                  </div>
                ) : null}
                <div
                  className={cn("flex", {
                    "-space-x-5": token.type === "ERC721",
                  })}
                >
                  {selectedNfts
                    .slice(0, Math.min(selectedNfts.length, 5))
                    .map((nft) => {
                      return (
                        <div
                          key={nft.tokenId}
                          className="flex flex-col items-center"
                        >
                          <img
                            className="h-12 w-12 rounded border-2 border-night-1100"
                            src={nft.image.uri}
                            alt={nft.metadata.name}
                          />
                          {token.type === "ERC1155" ? (
                            <p className="text-xs text-night-600">
                              {nft.quantity}x
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <ClientOnly>
                {() => (
                  <Dialog
                    defaultOpen={
                      token.isNFT && !otherToken?.isNFT && !!routeState
                    }
                    key={location.search}
                  >
                    <SelectionPopup
                      type={isOut ? "vault" : "inventory"}
                      token={token}
                      selectedTokens={selectedNfts}
                      onSubmit={onSelectNfts}
                    />
                    <DialogTrigger asChild>
                      <Button variant="dark" size="md" disabled={!isConnected}>
                        Select Items
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                )}
              </ClientOnly>
            )
          ) : (
            <ClientOnly>
              {() => (
                <>
                  <CurrencyInput
                    value={amount}
                    onChange={onUpdateAmount}
                    disabled={!!otherToken?.isNFT || !isConnected}
                  />
                  <span className="block text-sm text-night-400">
                    {formatUSD(amountPriceUSD)}
                  </span>
                </>
              )}
            </ClientOnly>
          )}
        </div>
      </div>
      <div className="bg-night-1000 px-4 py-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="text-night-400 sm:text-sm">
              {token.isNFT && isOut
                ? "Vault"
                : token.isNFT
                ? "Inventory"
                : "Balance"}
              :
            </span>
            {token.isNFT ? (
              <>
                {isOut ? (
                  formatAmount(token.reserve)
                ) : (
                  <Suspense
                    fallback={
                      <LoaderIcon className="inline-block h-3.5 w-3.5" />
                    }
                  >
                    <Await resolve={inventory}>
                      {(inventory) => inventory ?? 0}
                    </Await>
                  </Suspense>
                )}
              </>
            ) : (
              <VisibleOnClient>
                <span className="font-semibold text-honey-25 sm:text-sm">
                  {formatTokenAmount(balance, token.decimals)}
                </span>
              </VisibleOnClient>
            )}
          </div>
          {!token?.isNFT && otherToken?.isNFT ? <DisabledInputPopover /> : null}
          {!token?.isNFT && !otherToken?.isNFT && !isOut ? (
            <Button
              size="xs"
              variant="secondary"
              onClick={() =>
                onUpdateAmount(formatUnits(balance, token.decimals))
              }
            >
              Max
            </Button>
          ) : null}
          {selectedNfts.length > 0 ? (
            <Dialog>
              <SelectionPopup
                type={isOut ? "vault" : "inventory"}
                token={token}
                selectedTokens={selectedNfts}
                onSubmit={onSelectNfts}
              />
              <DialogTrigger asChild>
                <Button variant="ghost">Edit Selection</Button>
              </DialogTrigger>
            </Dialog>
          ) : null}
        </div>
      </div>
    </div>
  ) : (
    <Dialog key={location.search}>
      <TokenSelectDialog
        disabledTokenIds={[otherToken?.id].filter((id) => !!id) as string[]}
        onSelect={onSelect}
      />

      <DialogTrigger asChild>
        <button
          className={cn(
            "group flex w-full items-center gap-4 rounded-lg bg-night-1100 px-4 py-5 text-xl font-medium text-night-400 transition-colors hover:text-honey-25",
            className
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-night-800 text-night-600 transition-colors group-hover:text-honey-50">
            <LayersIcon className="h-6 w-6" />
          </div>
          Select Asset
        </button>
      </DialogTrigger>
    </Dialog>
  );
};

const TokenSelectDialog = ({
  disabledTokenIds = [],
  onSelect,
}: {
  disabledTokenIds?: string[];
  onSelect: (token: PoolToken) => void;
}) => {
  const [tab, setTab] = useState<"tokens" | "collections">("collections");
  const { tokens } = useLoaderData<typeof loader>();

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select Asset</DialogTitle>
        <DialogDescription>
          Select an asset to add to the swap.
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-lg bg-night-1100 p-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            className={cn(
              "flex items-center gap-2.5 rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-medium text-night-500 transition-colors hover:text-honey-25",
              tab === "tokens" && "border-night-800 bg-night-800 text-honey-25"
            )}
            onClick={() => setTab("tokens")}
          >
            <TokenIcon className="h-4 w-4" />
            Tokens
          </button>
          <button
            className={cn(
              "flex items-center gap-2.5 rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-medium text-night-500 transition-colors hover:text-honey-25",
              tab === "collections" &&
                "border-night-800 bg-night-800 text-honey-25"
            )}
            onClick={() => setTab("collections")}
          >
            <LayersIcon className="h-4 w-4" />
            Collections
          </button>
        </div>
        <Suspense
          fallback={
            <div className="flex h-80 items-center justify-center">
              <LoaderIcon className="h-6 w-6" />
            </div>
          }
        >
          <Await resolve={tokens}>
            {(tokens) => (
              <ul className="mt-4 h-80 overflow-auto border-t border-night-900 pt-4">
                {tokens
                  .filter(({ isNFT }) =>
                    tab === "collections" ? isNFT : !isNFT
                  )
                  .map((token) => (
                    <Token
                      key={token.id}
                      disabled={disabledTokenIds.includes(token.id)}
                      onSelect={onSelect}
                      token={token}
                    />
                  ))}
              </ul>
            )}
          </Await>
        </Suspense>
      </div>
    </DialogContent>
  );
};

const Token = ({
  token,
  disabled,
  onSelect,
}: {
  token: PoolToken;
  disabled: boolean;
  onSelect: (token: PoolToken) => void;
}) => {
  const { address } = useAccount();

  const { data: balance, status } = useBalance({
    address,
    token: token.id as AddressString,
    enabled: !!address && !token.isNFT,
  });

  const { load, state, data } = useFetcher<FetchInventoryLoader>();

  useEffect(() => {
    if (!token.isNFT || !address) return;

    const params = new URLSearchParams({
      address,
      slug: token.urlSlug,
    });

    load(`/resources/fetch-inventory?${params.toString()}`);
  }, [address, load, token.isNFT, token.urlSlug]);

  const isLoading = status === "loading" || state === "loading";

  return (
    <li
      className={cn(
        "relative rounded-lg px-3 py-2 hover:bg-night-900",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PoolTokenImage token={token} className="h-9 w-9" />
          <div className="text-left text-sm">
            <span className="block font-semibold text-honey-25">
              {token.name}
            </span>
            <span className="block text-night-600">{token.symbol}</span>
          </div>
        </div>
        {isLoading ? (
          <LoaderIcon className="h-4 w-4" />
        ) : address ? (
          <p className="text-base-400 text-sm">
            {token.isNFT
              ? data?.inventory
              : formatTokenAmount(balance?.value ?? BigInt(0), token.decimals)}
          </p>
        ) : null}
      </div>
      <button
        onClick={() => onSelect(token)}
        className="absolute inset-0 h-full w-full"
      />
    </li>
  );
};
