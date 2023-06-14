import { DialogClose } from "@radix-ui/react-dialog";
import type { LoaderArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
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
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownIcon,
  ChevronDownIcon,
  ExternalLink,
  LayersIcon,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { ClientOnly } from "remix-utils";
import { formatUnits } from "viem";
import { useBalance } from "wagmi";

import type { FetchNFTBalanceLoader } from "./resources.collections.$slug.balance";
import { fetchPools } from "~/api/pools.server";
import {
  fetchToken,
  fetchTokens,
  fetchUserCollectionBalance,
} from "~/api/tokens.server";
import { CurrencyInput } from "~/components/CurrencyInput";
import { DisabledInputPopover } from "~/components/DisabledInputPopover";
import { LoaderIcon, SwapIcon, TokenIcon } from "~/components/Icons";
import { SettingsDropdownMenu } from "~/components/SettingsDropdownMenu";
import { VisibleOnClient } from "~/components/VisibleOnClient";
import { SelectionPopup } from "~/components/item_selection/SelectionPopup";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { SwapRoutePanel } from "~/components/swap/SwapRoutePanel";
import { Button, TransactionButton } from "~/components/ui/Button";
import { LabeledCheckbox } from "~/components/ui/Checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/Dialog";
import { useAccount } from "~/contexts/account";
import { useApproval } from "~/hooks/useApproval";
import { useFocusInterval } from "~/hooks/useFocusInterval";
import { useSwap } from "~/hooks/useSwap";
import { useSwapRoute } from "~/hooks/useSwapRoute";
import { useTrove } from "~/hooks/useTrove";
import { sumArray } from "~/lib/array";
import { formatAmount, formatTokenAmount, formatUSD } from "~/lib/currency";
import { generateTitle, getSocialMetas, getUrl } from "~/lib/seo";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { getSession } from "~/sessions";
import type { AddressString, Optional, TroveTokenWithQuantity } from "~/types";

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
  const [pools, session] = await Promise.all([
    fetchPools(),
    getSession(request.headers.get("Cookie")),
  ]);

  const url = new URL(request.url);
  const inputAddress = url.searchParams.get("in");
  const outputAddress = url.searchParams.get("out");

  const [tokenIn, tokenOut] = await Promise.all([
    fetchToken(inputAddress ?? process.env.DEFAULT_TOKEN_ADDRESS),
    outputAddress ? fetchToken(outputAddress) : null,
  ]);

  if (!tokenIn) {
    throw new Response("Input token not found", {
      status: 404,
    });
  }

  const address = session.get("address");
  if (!address || !tokenIn.isNFT) {
    return defer({
      pools,
      tokens: fetchTokens(),
      tokenIn,
      tokenOut,
      tokenInNFTBalance: null,
    });
  }

  return defer({
    pools,
    tokens: fetchTokens(),
    tokenIn,
    tokenOut,
    tokenInNFTBalance: fetchUserCollectionBalance(tokenIn.urlSlug, address),
  });
}

const DEFAULT_STATE = {
  amount: "0",
  nftsIn: [] as TroveTokenWithQuantity[],
  nftsOut: [] as TroveTokenWithQuantity[],
  isExactOut: false,
};

export default function SwapPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { address, isConnected } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ amount, isExactOut, nftsIn, nftsOut }, setTrade] =
    useState(DEFAULT_STATE);
  const revalidator = useRevalidator();
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [priceImpactOptIn, setPriceImpactOptIn] = useState(false);

  const handleSelectToken = (direction: "in" | "out", token: PoolToken) => {
    searchParams.set(direction, token.id);
    // adding state (can be anything here) on client side transition to indicate that a modal can pop-up
    setSearchParams(searchParams, {
      state: "true",
    });
  };

  const swapRoute = useSwapRoute({
    ...loaderData,
    amount,
    isExactOut,
  });

  const { amountIn, amountOut, tokenIn, tokenOut, path, priceImpact } =
    swapRoute;

  const hasAmounts = amountIn > 0 && amountOut > 0;
  const requiresPriceImpactOptIn = hasAmounts && priceImpact >= 0.15;

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

  const {
    isApproved: isTokenInApproved,
    approve: approveTokenIn,
    refetch: refetchTokenInApproval,
    isSuccess: isApproveTokenInSuccess,
  } = useApproval({
    token: tokenIn,
    amount: amountIn,
    enabled: isConnected && hasAmounts,
  });

  const {
    amountInMax,
    amountOutMin,
    swap,
    isSuccess: isSwapSuccess,
  } = useSwap({
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    isExactOut,
    nftsIn,
    nftsOut,
    path,
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
      setPriceImpactOptIn(false);
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

  const formattedTokenInAmount = formatTokenAmount(amountIn, tokenIn.decimals);
  const formattedTokenOutAmount = formatTokenAmount(
    amountOut,
    tokenOut?.decimals ?? 18
  );

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
          isSwapSuccess={isSwapSuccess}
          token={tokenIn}
          otherToken={tokenOut}
          isOut={false}
          balance={tokenInBalance?.value}
          amount={isExactOut ? formattedTokenInAmount : amount}
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
          isSwapSuccess={isSwapSuccess}
          token={tokenOut}
          otherToken={tokenIn}
          isOut
          balance={tokenOutBalance?.value}
          amount={isExactOut ? amount : formattedTokenOutAmount}
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
        <div className="mt-4 space-y-4">
          <ClientOnly>
            {() => (
              <>
                {requiresPriceImpactOptIn ? (
                  <LabeledCheckbox
                    className="rounded-lg border border-red-500 bg-red-500/20 p-3 text-honey-25/90"
                    onCheckedChange={(checked) =>
                      setPriceImpactOptIn(Boolean(checked))
                    }
                    checked={priceImpactOptIn}
                    id="priceImpactOptIn"
                    description="You will lose a big portion of your funds in this trade. Please tick the box if you would like to continue."
                    checkboxClassName="border-red-900"
                  >
                    Price impact is too high
                  </LabeledCheckbox>
                ) : null}
                {!isTokenInApproved &&
                hasAmounts &&
                (!requiresPriceImpactOptIn || priceImpactOptIn) ? (
                  <TransactionButton
                    className="w-full"
                    size="lg"
                    onClick={() => approveTokenIn()}
                  >
                    Approve {tokenIn.name}
                  </TransactionButton>
                ) : (
                  <Dialog open={swapModalOpen} onOpenChange={setSwapModalOpen}>
                    <DialogTrigger asChild>
                      <TransactionButton
                        className="w-full"
                        size="lg"
                        disabled={
                          !hasAmounts ||
                          (requiresPriceImpactOptIn && !priceImpactOptIn)
                        }
                      >
                        Swap Items
                      </TransactionButton>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        Swap {formattedTokenInAmount} {tokenIn.symbol} for{" "}
                        {formattedTokenOutAmount} {tokenOut?.symbol}
                      </DialogHeader>
                      <div>
                        <div className="overflow-hidden rounded-lg bg-night-1100">
                          <div className="flex items-center bg-night-900 px-3.5 py-2.5">
                            <PoolTokenImage
                              token={tokenIn}
                              className="h-6 w-6"
                            />
                            <span className="ml-2 font-medium text-honey-25">
                              {tokenIn.name}
                            </span>
                          </div>
                          <div className="p-4">
                            {tokenIn.isNFT ? (
                              nftsIn.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn("flex", {
                                      "-space-x-5": tokenIn.type === "ERC721",
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
                                            {tokenIn.type === "ERC1155" ? (
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
                            <PoolTokenImage
                              token={tokenOut}
                              className="h-6 w-6"
                            />
                            <span className="ml-2 font-medium text-honey-25">
                              {tokenOut?.name}
                            </span>
                          </div>
                          <div className="p-4">
                            {tokenOut?.isNFT ? (
                              nftsOut.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn("flex", {
                                      "-space-x-5": tokenOut?.type === "ERC721",
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
                                            {tokenOut?.type === "ERC1155" ? (
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
                        <SwapRoutePanel
                          className="mt-4"
                          swapRoute={swapRoute}
                          isExactOut={isExactOut}
                          amountInMax={amountInMax}
                          amountOutMin={amountOutMin}
                        />
                        <div className="mt-4 grid grid-cols-3 gap-3">
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
        {tokenOut ? (
          <SwapRoutePanel
            className="mt-4"
            swapRoute={swapRoute}
            isExactOut={isExactOut}
            amountInMax={amountInMax}
            amountOutMin={amountOutMin}
          />
        ) : null}
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
  isSwapSuccess,
}: {
  token: Optional<PoolToken>;
  otherToken: Optional<PoolToken>;
  isOut: boolean;
  balance?: bigint;
  amount: string;
  selectedNfts: TroveTokenWithQuantity[];
  onSelect: (token: PoolToken) => void;
  onUpdateAmount: (amount: string) => void;
  onSelectNfts: (tokens: TroveTokenWithQuantity[]) => void;
  className?: string;
  isSwapSuccess: boolean;
}) => {
  const { isConnected } = useAccount();
  const location = useLocation();
  const parsedAmount = Number(amount);
  const amountPriceUSD =
    (token?.priceUSD ?? 0) *
    (Number.isNaN(parsedAmount) || parsedAmount === 0 ? 1 : parsedAmount);
  const { tokenInNFTBalance } = useLoaderData<typeof loader>();
  const { state: routeState } = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [ref, bounds] = useMeasure();
  const { createTokenUrl } = useTrove();
  const [openSelectionModal, setOpenSelectionModal] = useState(
    token?.isNFT && !otherToken?.isNFT && !!routeState
  );

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
                <span className="flex items-center gap-1.5 text-sm font-medium text-honey-25 sm:text-lg">
                  {token.name} <ChevronDownIcon className="h-3 w-3" />
                </span>
                <span className="block text-xs text-night-600 sm:text-sm">
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
                <Button
                  variant="ghost"
                  onClick={() => setCollapsed((col) => !col)}
                >
                  <ChevronDownIcon
                    className={cn(
                      "h-4 w-auto transition-transform will-change-transform",
                      !collapsed && "-rotate-180"
                    )}
                  />
                  <span className="sr-only">
                    {collapsed ? "See selected NFTs" : "Close"}
                  </span>
                </Button>
              </div>
            ) : (
              <ClientOnly>
                {() => (
                  <>
                    <Dialog
                      open={openSelectionModal}
                      onOpenChange={setOpenSelectionModal}
                      key={location.search}
                    >
                      {openSelectionModal ? (
                        <SelectionPopup
                          type={isOut ? "vault" : "inventory"}
                          token={token}
                          selectedTokens={selectedNfts}
                          onSubmit={onSelectNfts}
                        />
                      ) : null}
                    </Dialog>
                    <Button
                      variant="dark"
                      size="md"
                      disabled={!isConnected}
                      onClick={() => setOpenSelectionModal(true)}
                    >
                      Select Items
                    </Button>
                  </>
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
      <motion.div animate={{ height: bounds.height }}>
        <div ref={ref}>
          <AnimatePresence initial={false} mode="popLayout">
            {!collapsed ? (
              <motion.div
                key="collapsed"
                exit={{
                  opacity: 0,
                }}
              >
                <motion.div
                  className="grid max-h-64 grid-cols-4 gap-3 overflow-auto p-4"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: {
                      delay: 0.2,
                    },
                  }}
                  exit={{
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.15,
                  }}
                >
                  {selectedNfts.map((nft) => {
                    return (
                      <div
                        key={nft.tokenId}
                        className="flex flex-col overflow-hidden rounded-lg bg-night-900"
                      >
                        <div className="relative">
                          <img
                            src={nft.image.uri}
                            alt={nft.tokenId}
                            className="w-full"
                          />
                          {token.type === "ERC1155" ? (
                            <span className="absolute bottom-1.5 right-1.5 rounded-lg bg-night-700/80 px-2 py-0.5 text-xs font-bold text-night-100">
                              {nft.quantity}x
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-start justify-between gap-2 p-2.5">
                          <div className="min-w-0 text-left">
                            <p className="truncate text-xs font-medium text-honey-25">
                              {nft.metadata.name}
                            </p>
                            <p className="truncate text-[0.6rem] text-night-400">
                              #{nft.tokenId}
                            </p>
                          </div>
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View ${nft.metadata.name} on Trove`}
                            className="text-night-400 transition-colors hover:text-night-100"
                            href={createTokenUrl(
                              nft.collectionUrlSlug,
                              nft.tokenId
                            )}
                          >
                            <ExternalLink
                              className="h-3.5 w-auto"
                              aria-hidden="true"
                            />
                            <span className="sr-only">
                              View {nft.metadata.name} on Trove
                            </span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
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
                  formatTokenAmount(BigInt(token.reserve), token.decimals)
                ) : (
                  <Suspense
                    fallback={
                      <LoaderIcon className="inline-block h-3.5 w-3.5" />
                    }
                  >
                    <Await resolve={tokenInNFTBalance}>
                      {(balance) => balance ?? 0}
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
            <>
              <Dialog
                open={openSelectionModal}
                onOpenChange={setOpenSelectionModal}
              >
                {openSelectionModal ? (
                  <SelectionPopup
                    type={isOut ? "vault" : "inventory"}
                    token={token}
                    selectedTokens={selectedNfts}
                    onSubmit={onSelectNfts}
                  />
                ) : null}
              </Dialog>
              <Button
                variant="ghost"
                onClick={() => setOpenSelectionModal(true)}
              >
                Edit Selection
              </Button>
            </>
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
  const {
    load: loadNFTBalance,
    state: nftBalanceStatus,
    data: { balance: nftBalance = 0 } = {},
  } = useFetcher<FetchNFTBalanceLoader>();

  const { data: balance, status } = useBalance({
    address,
    token: token.id as AddressString,
    enabled: !!address && !token.isNFT,
  });

  useEffect(() => {
    if (!token.urlSlug || !address) {
      return;
    }

    const params = new URLSearchParams({
      address,
    });

    loadNFTBalance(
      `/resources/collections/${token.urlSlug}/balance?${params.toString()}`
    );
  }, [address, loadNFTBalance, token.urlSlug]);

  const isLoading = status === "loading" || nftBalanceStatus === "loading";

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
              ? nftBalance
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
