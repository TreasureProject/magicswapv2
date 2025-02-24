import { DialogClose } from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  GlobeIcon as AllIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  LayersIcon,
} from "lucide-react";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  Await,
  Link,
  useLoaderData,
  useLocation,
  useRevalidator,
  useSearchParams,
} from "react-router";
import useMeasure from "react-use-measure";
import { ClientOnly } from "remix-utils/client-only";
import { type Address, formatUnits, parseUnits } from "viem";

import { fetchGames } from "~/api/games.server";
import { fetchPools } from "~/api/pools.server";
import { fetchMagicUsd } from "~/api/price.server";
import {
  type Token,
  type TokenWithAmount,
  fetchPoolTokenBalance,
  fetchToken,
  fetchTokens,
} from "~/api/tokens.server";
import { ChainFilter } from "~/components/ChainFilter";
import { CurrencyInput } from "~/components/CurrencyInput";
import { GameFilter } from "~/components/GameFilter";
import { LoaderIcon, SwapIcon, TokenIcon } from "~/components/Icons";
import { SearchFilter } from "~/components/SearchFilter";
import { SelectionPopup } from "~/components/SelectionPopup";
import { SettingsDropdownMenu } from "~/components/SettingsDropdownMenu";
import { VisibleOnClient } from "~/components/VisibleOnClient";
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
import { InfoPopover } from "~/components/ui/InfoPopover";
import { useAccount } from "~/contexts/account";
import { useApproval } from "~/hooks/useApproval";
import { useFocusInterval } from "~/hooks/useFocusInterval";
import { usePoolTokenBalance } from "~/hooks/usePoolTokenBalance";
import { useSwap } from "~/hooks/useSwap";
import { useSwapRoute } from "~/hooks/useSwapRoute";
import { useTokenBalance } from "~/hooks/useTokenBalance";
import { getRouterContractAddress } from "~/lib/address";
import { formatAmount, formatUSD } from "~/lib/currency";
import { getContext } from "~/lib/env.server";
import { bigIntToNumber, floorBigInt, formatNumber } from "~/lib/number";
import { generateTitle, generateUrl, getSocialMetas } from "~/lib/seo";
import { countTokens, parseTokenParams } from "~/lib/tokens";
import { cn } from "~/lib/utils";
import type { RootLoaderData } from "~/root";
import { getSession } from "~/sessions";
import type { Optional } from "~/types";
import type { Route } from "./+types/swap";

export const meta: Route.MetaFunction = ({ data, matches, location }) => {
  const requestInfo = (
    matches.find((match) => match?.id === "root")?.data as
      | RootLoaderData
      | undefined
  )?.requestInfo;
  const url = generateUrl(requestInfo?.origin, location.pathname);
  return getSocialMetas({
    url,
    title: generateTitle(
      data?.tokenOut
        ? `Swap ${data?.tokenIn.symbol} to ${data?.tokenOut.symbol}`
        : "Swap",
    ),
    image: data?.tokenOut
      ? `${url}/${data.tokenIn.chainId}:${data.tokenIn.address}/${data.tokenOut.chainId}:${data.tokenOut.address}.png`
      : generateUrl(requestInfo?.origin, "/img/seo-banner.png"),
  });
};

export async function loader({ request }: Route.LoaderArgs) {
  const { env } = getContext();
  const url = new URL(request.url);

  const { chainIdIn, chainIdOut, tokenAddressIn, tokenAddressOut } =
    parseTokenParams({
      inStr: url.searchParams.get("in") ?? "",
      outStr: url.searchParams.get("out") ?? "",
      defaultChainId: env.PUBLIC_DEFAULT_CHAIN_ID,
      defaultTokenAddress: env.PUBLIC_DEFAULT_TOKEN_ADDRESS,
    });

  const [session, games, pools, tokenIn, tokenOut, magicUsd] =
    await Promise.all([
      getSession(request.headers.get("Cookie")),
      fetchGames(),
      fetchPools(),
      fetchToken({ chainId: chainIdIn, address: tokenAddressIn }),
      tokenAddressOut
        ? fetchToken({ chainId: chainIdOut, address: tokenAddressOut })
        : undefined,
      fetchMagicUsd(),
    ]);

  if (!tokenIn) {
    throw new Response("Input token not found", {
      status: 404,
    });
  }

  const address = session.get("address");
  return {
    games,
    pools,
    tokens: fetchTokens(),
    tokenIn,
    tokenOut,
    tokenInNFTBalance:
      address && tokenIn.isVault
        ? await fetchPoolTokenBalance(tokenIn, address)
        : 0,
    address,
    magicUsd,
  };
}

const DEFAULT_STATE = {
  amount: "0",
  nftsIn: [] as TokenWithAmount[],
  nftsOut: [] as TokenWithAmount[],
  isExactOut: false,
};

export default function SwapPage() {
  const { pools, tokenIn, tokenOut, magicUsd, tokenInNFTBalance } =
    useLoaderData<typeof loader>(); // TODO: remove useLoaderData
  const revalidator = useRevalidator();
  const { address, isConnected } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const [{ amount, isExactOut, nftsIn, nftsOut }, setTrade] =
    useState(DEFAULT_STATE);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [priceImpactOptIn, setPriceImpactOptIn] = useState(false);
  const location = useLocation();

  const handleSelectToken = (direction: "in" | "out", token: Token) => {
    searchParams.set(direction, `${token.chainId}:${token.address}`);
    // adding state (can be anything here) on client side transition to indicate that a modal can pop-up
    setSearchParams(searchParams, {
      state: "true",
    });
  };

  const { data: tokenInBalance, refetch: refetchTokenInBalance } =
    useTokenBalance({
      chainId: tokenIn.chainId,
      tokenAddress: tokenIn.address as Address,
      userAddress: address,
      isETH: tokenIn.isEth,
      enabled: !tokenIn.isVault,
    });

  const { data: tokenOutBalance, refetch: refetchTokenOutBalance } =
    useTokenBalance({
      chainId: tokenOut?.chainId,
      tokenAddress: tokenOut?.address as Address,
      userAddress: address,
      isETH: tokenOut?.isEth,
      enabled: !tokenOut?.isVault,
    });

  const refetch = useCallback(() => {
    revalidator.revalidate();
    refetchTokenInBalance();
    refetchTokenOutBalance();
  }, [revalidator.revalidate, refetchTokenInBalance, refetchTokenOutBalance]);

  useFocusInterval(refetch, 5_000);

  const swapRoute = useSwapRoute({
    pools,
    tokenIn,
    tokenOut,
    amount,
    isExactOut,
  });

  const amountNFTsIn = countTokens(nftsIn);
  const amountNFTsOut = countTokens(nftsOut);

  const {
    isValid: isValidSwapRoute,
    version = "V2",
    reserveIn,
    reserveOut,
    amountIn,
    amountOut,
    path,
    priceImpact,
  } = swapRoute;

  const requiredNftsIn = Math.ceil(bigIntToNumber(amountIn, tokenIn.decimals));
  const requiredNftsOut = Math.floor(
    bigIntToNumber(amountOut, tokenOut?.decimals),
  );

  const hasAmounts =
    amountIn > 0 &&
    amountOut > 0 &&
    (!tokenIn.isVault || requiredNftsIn === amountNFTsIn) &&
    (!tokenOut?.isVault || requiredNftsOut === amountNFTsOut);
  const requiresPriceImpactOptIn = hasAmounts && priceImpact >= 0.15;

  const { amountInMax, amountOutMin, swap } = useSwap({
    version,
    tokenIn,
    tokenOut,
    amountIn,
    amountOut,
    isExactOut,
    nftsIn,
    nftsOut,
    path,
    enabled: isConnected && !!tokenOut && hasAmounts && isValidSwapRoute,
    onSuccess: useCallback(() => {
      setTrade(DEFAULT_STATE);
      refetch();
      setSwapModalOpen(false);
      setPriceImpactOptIn(false);
    }, [refetch]),
  });

  const { isApproved: isTokenInApproved, approve: approveTokenIn } =
    useApproval({
      chainId: tokenIn.chainId,
      operator: getRouterContractAddress({ chainId: tokenIn.chainId, version }),
      token: tokenIn,
      amount: amountInMax,
      enabled: isConnected && hasAmounts,
    });

  // biome-ignore lint/correctness/useExhaustiveDependencies: tokenIn is not memoized
  useEffect(() => {
    if (tokenIn.isVault) {
      setTrade(DEFAULT_STATE);
    } else {
      setTrade((trade) => ({
        ...trade,
        nftsOut: [],
      }));
    }
  }, [tokenIn.address]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: tokenOut is not memoized
  useEffect(() => {
    if (tokenOut?.isVault) {
      setTrade(DEFAULT_STATE);
    } else {
      setTrade((trade) => ({
        ...trade,
        nftsOut: [],
      }));
    }
  }, [tokenOut?.address]);

  const formattedTokenInAmount = formatAmount(amountIn, {
    decimals: tokenIn.decimals,
  });
  const formattedTokenOutAmount = formatAmount(amountOut, {
    decimals: tokenOut?.decimals,
  });
  const insufficientBalance =
    isConnected &&
    (tokenIn.isVault
      ? amountNFTsIn > tokenInNFTBalance
      : amountIn > tokenInBalance);

  return (
    <main className="mx-auto max-w-xl px-4 pt-12 pb-20 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3 text-silver-600">
        <div className="flex items-center gap-1.5 font-bold text-xl">
          <SwapIcon className="h-6 w-6" />
          <h1 className="text-silver-100">Swap</h1>
        </div>
        <SettingsDropdownMenu />
      </div>
      <div className="mt-3">
        <SwapTokenInput
          key={`${location.search}-in`}
          token={tokenIn}
          otherToken={tokenOut}
          isOut={false}
          balance={tokenInBalance}
          amount={
            isExactOut
              ? tokenIn.isVault
                ? requiredNftsIn.toString()
                : formattedTokenInAmount
              : amount
          }
          tokenReserve={reserveIn}
          tokenPriceUsd={bigIntToNumber(tokenIn.derivedMagic) * magicUsd}
          selectedNfts={nftsIn}
          requiredNftSelectionAmount={
            isExactOut && amountNFTsOut > 0 ? requiredNftsIn : undefined
          }
          onSelect={(token) => handleSelectToken("in", token)}
          onUpdateAmount={(amount) =>
            setTrade({
              amount,
              nftsIn: [],
              nftsOut: [],
              isExactOut: false,
            })
          }
          onSelectNfts={(tokens) => {
            const amountTokens = countTokens(tokens);
            setTrade((curr) => {
              // Determine if we should treat this seleciton as a new transaction
              if (
                (amountNFTsIn === 0 && amountNFTsOut === 0) || // user hasn't selecting anything previously
                (amountNFTsIn > 0 && amountNFTsIn !== amountTokens) // user previously selected NFTs in, but changed the amount
              ) {
                return {
                  amount: amountTokens.toString(),
                  nftsIn: tokens,
                  nftsOut: [],
                  isExactOut: false,
                };
              }

              // Not a new transaction, treat this simply as an NFT selection
              return {
                ...curr,
                nftsIn: tokens,
              };
            });
          }}
        />
        <Link
          to={`/swap?in=${tokenOut?.chainId}:${tokenOut?.address}&out=${tokenIn.chainId}:${tokenIn.address}`}
          aria-disabled={!tokenOut?.address ? "true" : "false"}
          onClick={(e) => !tokenOut?.address && e.preventDefault()}
          className={cn(
            "-my-2 relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1000 bg-night-700 text-cream",
            !tokenOut?.address ? "cursor-not-allowed text-night-400" : "group",
          )}
        >
          <ArrowDownIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </Link>
        <SwapTokenInput
          key={`${location.search}-out`}
          token={tokenOut}
          otherToken={tokenIn}
          isOut
          balance={tokenOutBalance}
          amount={
            isExactOut
              ? amount
              : tokenOut?.isVault
                ? requiredNftsOut.toString()
                : formattedTokenOutAmount
          }
          tokenReserve={reserveOut}
          tokenPriceUsd={
            bigIntToNumber(tokenOut?.derivedMagic ?? 0n) * magicUsd
          }
          selectedNfts={nftsOut}
          requiredNftSelectionAmount={
            !isExactOut && amountNFTsIn > 0 ? requiredNftsOut : undefined
          }
          onSelect={(token) => handleSelectToken("out", token)}
          onUpdateAmount={(amount) =>
            setTrade({
              amount,
              nftsIn: [],
              nftsOut: [],
              isExactOut: true,
            })
          }
          onSelectNfts={(tokens) => {
            const amountTokens = countTokens(tokens);
            setTrade((curr) => {
              // Determine if we should treat this seleciton as a new transaction
              if (
                (amountNFTsIn === 0 && amountNFTsOut === 0) || // user hasn't selecting anything previously
                (amountNFTsOut > 0 && amountNFTsOut !== amountTokens) // user previously selected NFTs out, but changed the amount
              ) {
                return {
                  amount: amountTokens.toString(),
                  nftsIn: [],
                  nftsOut: tokens,
                  isExactOut: true,
                };
              }

              // Not a new transaction, treat this simply as an NFT selection
              return {
                ...curr,
                nftsOut: tokens,
              };
            });
          }}
        />
        <div className="mt-4 space-y-4">
          <ClientOnly>
            {() => (
              <>
                {requiresPriceImpactOptIn ? (
                  <LabeledCheckbox
                    className="rounded-lg border border-red-500 bg-red-500/20 p-3 text-cream/90"
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
                {!!tokenOut && !isValidSwapRoute ? (
                  <Button className="w-full" size="lg" disabled>
                    Swap route not available
                  </Button>
                ) : insufficientBalance ? (
                  <Button className="w-full" size="lg" disabled>
                    Insufficient balance
                  </Button>
                ) : !isTokenInApproved &&
                  hasAmounts &&
                  (!requiresPriceImpactOptIn || priceImpactOptIn) ? (
                  <TransactionButton
                    chainId={tokenIn.chainId}
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
                        chainId={tokenIn.chainId}
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
                        <div className="overflow-hidden rounded-lg bg-night-700">
                          <div className="flex items-center bg-night-500 px-3.5 py-2.5">
                            <PoolTokenImage
                              token={tokenIn}
                              className="h-6 w-6"
                              showChainIcon
                            />
                            <span className="ml-2 font-medium text-cream">
                              {tokenIn.name}
                            </span>
                          </div>
                          <div className="p-4">
                            {tokenIn.isVault ? (
                              nftsIn.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn("flex", {
                                      "-space-x-5":
                                        tokenIn.collectionType === "ERC721",
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
                                            {nft.image ? (
                                              <img
                                                className="h-12 w-12 rounded border-2 border-night-700"
                                                src={nft.image}
                                                alt={nft.name}
                                              />
                                            ) : null}
                                            {tokenIn.collectionType ===
                                            "ERC1155" ? (
                                              <p className="text-silver-600 text-xs">
                                                {nft.amount}x
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                  </div>
                                  {nftsIn.length > 5 ? (
                                    <div className="flex items-center rounded-md bg-night-500 px-2 py-1.5">
                                      <p className="font-semibold text-silver-500 text-xs">
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
                        <div className="-my-2 relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1000 bg-night-700 text-cream">
                          <ArrowDownIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="overflow-hidden rounded-lg bg-night-700">
                          <div className="flex items-center bg-night-500 px-3.5 py-2.5">
                            <PoolTokenImage
                              token={tokenOut}
                              className="h-6 w-6"
                              showChainIcon
                            />
                            <span className="ml-2 font-medium text-cream">
                              {tokenOut?.name}
                            </span>
                          </div>
                          <div className="p-4">
                            {tokenOut?.isVault ? (
                              nftsOut.length > 0 ? (
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={cn("flex", {
                                      "-space-x-5":
                                        tokenOut?.collectionType === "ERC721",
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
                                            {nft.image ? (
                                              <img
                                                className="h-12 w-12 rounded border-2 border-night-700"
                                                src={nft.image}
                                                alt={nft.name}
                                              />
                                            ) : null}
                                            {tokenOut?.collectionType ===
                                            "ERC1155" ? (
                                              <p className="text-silver-600 text-xs">
                                                {nft.amount}x
                                              </p>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                  </div>
                                  {nftsOut.length > 5 ? (
                                    <div className="flex items-center rounded-md bg-night-500 px-2 py-1.5">
                                      <p className="font-semibold text-silver-500 text-xs">
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
                          amountInMax={
                            tokenIn.isVault
                              ? floorBigInt(amountIn)
                              : amountInMax
                          }
                          amountOutMin={
                            tokenOut?.isVault
                              ? floorBigInt(amountOut)
                              : amountOutMin
                          }
                        />
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <TransactionButton
                            chainId={tokenIn.chainId}
                            size="lg"
                            className="col-span-full sm:col-span-2"
                            onClick={() => swap()}
                          >
                            Confirm Swap
                          </TransactionButton>
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
        {!!tokenOut && isValidSwapRoute ? (
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
  balance = 0n,
  amount,
  tokenReserve,
  tokenPriceUsd,
  selectedNfts,
  requiredNftSelectionAmount,
  onSelect,
  onUpdateAmount,
  onSelectNfts,
  className,
}: {
  token: Optional<Token>;
  otherToken: Optional<Token>;
  isOut: boolean;
  balance?: bigint;
  amount: string;
  tokenReserve: bigint;
  tokenPriceUsd: number;
  selectedNfts: TokenWithAmount[];
  requiredNftSelectionAmount?: number;
  onSelect: (token: Token) => void;
  onUpdateAmount: (amount: string) => void;
  onSelectNfts: (tokens: TokenWithAmount[]) => void;
  className?: string;
}) => {
  const parsedAmount = Number(amount.replace(/,/g, ""));
  const amountPriceUSD =
    tokenPriceUsd *
    (Number.isNaN(parsedAmount) || parsedAmount === 0 ? 1 : parsedAmount);
  const { tokenInNFTBalance } = useLoaderData<typeof loader>();
  const [collapsed, setCollapsed] = useState(true);
  const [ref, bounds] = useMeasure();
  const [openSelectionModal, setOpenSelectionModal] = useState(false);

  const handleSelectMax = () => {
    if (!token) {
      return;
    }

    let maxAmount = balance;
    // Subtract gas fees if native token
    if (token.isEth) {
      maxAmount -= parseUnits(token.isMagic ? "0.1" : "0.01", token.decimals);
    }

    onUpdateAmount(formatUnits(maxAmount, token.decimals));
  };

  return token ? (
    <div className={cn("overflow-hidden rounded-lg bg-night-700", className)}>
      <div className="flex items-center justify-between gap-3 p-4">
        <Dialog>
          <TokenSelectDialog
            disabledTokenIds={
              [token.address, otherToken?.address].filter(
                (address) => !!address,
              ) as string[]
            }
            defaultChainId={otherToken?.chainId}
            isOut={isOut}
            onSelect={onSelect}
          />

          <DialogTrigger asChild>
            <button type="button" className="flex items-center gap-4 text-left">
              <PoolTokenImage
                className="h-12 w-12"
                token={token}
                showChainIcon
              />
              <div className="flex-1">
                <span className="flex items-center gap-1.5 font-medium text-cream text-sm sm:text-lg">
                  {token.symbol} <ChevronDownIcon className="h-3 w-3" />
                </span>
                {token.isVault ? (
                  <>
                    {token.collectionName &&
                      token.name.toUpperCase() !==
                        token.collectionName.toUpperCase() && (
                        <p className="text-silver-400 text-xs sm:text-sm">
                          {token.collectionName}
                        </p>
                      )}
                  </>
                ) : (
                  <>
                    {token.name.toUpperCase() !== token.symbol.toUpperCase() ? (
                      <span className="block text-silver-400 text-xs sm:text-sm">
                        {token.name}
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            </button>
          </DialogTrigger>
        </Dialog>
        <div className="space-y-1 text-right">
          {token.isVault ? (
            selectedNfts.length > 0 ? (
              <div className="flex items-center space-x-2">
                {selectedNfts.length > 5 ? (
                  <div className="flex items-center rounded-md bg-night-500 px-2 py-1.5">
                    <p className="font-semibold text-silver-500 text-xs">
                      +{selectedNfts.length - 5}
                    </p>
                  </div>
                ) : null}
                <div
                  className={cn("flex", {
                    "-space-x-5": token.collectionType === "ERC721",
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
                          {nft.image ? (
                            <img
                              className="h-12 w-12 rounded border-2 border-night-700"
                              src={nft.image}
                              alt={nft.name}
                            />
                          ) : null}
                          {token.collectionType === "ERC1155" ? (
                            <p className="text-silver-600 text-xs">
                              {nft.amount}x
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
                      !collapsed && "-rotate-180",
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
                    >
                      {openSelectionModal ? (
                        <SelectionPopup
                          type={isOut ? "vault" : "inventory"}
                          token={token}
                          selectedTokens={selectedNfts}
                          requiredAmount={requiredNftSelectionAmount}
                          onSubmit={onSelectNfts}
                        >
                          {({ amount }) =>
                            requiredNftSelectionAmount ? undefined : (
                              <TotalDisplay
                                amount={amount}
                                isExactOut={isOut}
                              />
                            )
                          }
                        </SelectionPopup>
                      ) : null}
                    </Dialog>
                    <Button
                      variant="dark"
                      size="md"
                      onClick={() => setOpenSelectionModal(true)}
                    >
                      {amount === "0"
                        ? "Select items"
                        : `Select ${amount} ${Number(amount) === 1 ? "item" : "items"}`}
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
                    disabled={!!otherToken?.isVault}
                  />
                  {amountPriceUSD > 0 ? (
                    <span className="block text-silver-400 text-sm">
                      {formatUSD(amountPriceUSD)}
                    </span>
                  ) : null}
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
                        className="flex flex-col overflow-hidden rounded-lg bg-night-500"
                      >
                        <div className="relative">
                          {nft.image ? (
                            <img
                              src={nft.image}
                              alt={nft.tokenId}
                              className="w-full"
                            />
                          ) : null}
                          {token.collectionType === "ERC1155" ? (
                            <span className="absolute right-1.5 bottom-1.5 rounded-lg bg-night-200/80 px-2 py-0.5 font-bold text-silver-100 text-xs">
                              {nft.amount}x
                            </span>
                          ) : null}
                        </div>
                        <div className="flex items-start justify-between gap-2 p-2.5">
                          <div className="min-w-0 text-left">
                            <p className="truncate font-medium text-cream text-xs">
                              {nft.name}
                            </p>
                            <p className="truncate text-[0.6rem] text-silver-400">
                              #{nft.tokenId}
                            </p>
                          </div>
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
      <div className="bg-silver-1000 px-4 py-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <span className="text-silver-400 sm:text-sm">
              {token.isVault && isOut
                ? "Vault"
                : token.isVault
                  ? "Inventory"
                  : "Balance"}
              :
            </span>
            {token.isVault ? (
              <>
                {isOut
                  ? formatAmount(tokenReserve, {
                      decimals: token.decimals,
                    })
                  : formatNumber(tokenInNFTBalance)}
              </>
            ) : (
              <VisibleOnClient>
                <span className="font-semibold text-cream sm:text-sm">
                  {formatAmount(balance, { decimals: token.decimals })}
                </span>
              </VisibleOnClient>
            )}
          </div>
          {!token?.isVault && otherToken?.isVault ? (
            <InfoPopover>
              Input is disabled because the amount will be auto-calculated based
              on the selected NFTs.
            </InfoPopover>
          ) : null}
          {!token?.isVault && !otherToken?.isVault && !isOut ? (
            <Button size="xs" variant="secondary" onClick={handleSelectMax}>
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
                    requiredAmount={requiredNftSelectionAmount}
                    onSubmit={onSelectNfts}
                  >
                    {({ amount }) =>
                      requiredNftSelectionAmount ? undefined : (
                        <TotalDisplay amount={amount} isExactOut={isOut} />
                      )
                    }
                  </SelectionPopup>
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
    <Dialog>
      <TokenSelectDialog
        disabledTokenIds={
          [otherToken?.address].filter((address) => !!address) as string[]
        }
        defaultChainId={otherToken?.chainId}
        isOut={isOut}
        onSelect={onSelect}
      />
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center gap-4 rounded-lg bg-night-700 px-4 py-5 font-medium text-silver-400 text-xl transition-colors hover:text-cream",
            className,
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-night-400 text-silver-600 transition-colors group-hover:text-honey-100">
            <LayersIcon className="h-6 w-6" />
          </div>
          Select Asset
        </button>
      </DialogTrigger>
    </Dialog>
  );
};

const TotalDisplay = ({
  amount,
  isExactOut,
}: {
  amount: string;
  isExactOut: boolean;
}) => {
  const { pools, tokenIn, tokenOut } = useLoaderData<typeof loader>();
  const { amountIn, amountOut } = useSwapRoute({
    pools,
    tokenIn,
    tokenOut,
    amount,
    isExactOut,
  });

  if (!tokenOut || (amountIn === 0n && amountOut === 0n)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-night-400 p-4">
      <span className="text-silver-400 text-sm">Cost:</span>
      <span className="flex items-center gap-1">
        <PoolTokenImage
          token={isExactOut ? tokenIn : tokenOut}
          className="h-4 w-4 flex-shrink-0"
        />
        <span className="truncate font-medium text-cream text-sm">
          {isExactOut
            ? formatAmount(amountIn, {
                decimals: tokenIn.decimals,
              })
            : formatAmount(amountOut, {
                decimals: tokenOut?.decimals,
              })}
        </span>
      </span>
    </div>
  );
};

const TokenSelectDialog = ({
  disabledTokenIds = [],
  defaultChainId,
  isOut,
  onSelect,
}: {
  disabledTokenIds?: string[];
  defaultChainId?: number;
  isOut: boolean;
  onSelect: (token: Token) => void;
}) => {
  const [tab, setTab] = useState<"all" | "tokens" | "collections">("all");
  const [search, setSearch] = useState<string | undefined>();
  const [gameId, setGameId] = useState<string | undefined>();
  const [chainId, setChainId] = useState<number | undefined>(defaultChainId);
  const { games, tokens } = useLoaderData<typeof loader>();

  const handleClearFilters = () => {
    setSearch(undefined);
    setGameId(undefined);
    setChainId(undefined);
  };

  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle>Select an asset to {isOut ? "buy" : "sell"}</DialogTitle>
        <DialogDescription>
          Choose from the list of tokens and NFTs below.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 rounded-lg bg-night-700 p-3 sm:p-4">
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-2 py-2 font-medium text-silver-500 text-sm transition-colors hover:text-cream sm:gap-2.5 sm:px-3",
                tab === "all" && "border-night-400 bg-night-400 text-cream",
              )}
              onClick={() => setTab("all")}
            >
              <AllIcon className="h-4 w-4 shrink-0" />
              All
            </button>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-2 py-2 font-medium text-silver-500 text-sm transition-colors hover:text-cream sm:gap-2.5 sm:px-3",
                tab === "tokens" && "border-night-400 bg-night-400 text-cream",
              )}
              onClick={() => setTab("tokens")}
            >
              <TokenIcon className="h-4 w-4 shrink-0" />
              Tokens
            </button>
            <button
              type="button"
              className={cn(
                "flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-2 py-2 font-medium text-silver-500 text-sm transition-colors hover:text-cream sm:gap-2.5 sm:px-3",
                tab === "collections" &&
                  "border-night-400 bg-night-400 text-cream",
              )}
              onClick={() => setTab("collections")}
            >
              <LayersIcon className="h-4 w-4 shrink-0" />
              Collections
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SearchFilter className="w-28" onChange={setSearch} />
            <GameFilter
              games={games}
              selectedGameId={gameId}
              onChange={setGameId}
              onClear={() => setGameId(undefined)}
            />
            <ChainFilter
              selectedChainId={chainId}
              onChange={setChainId}
              onClear={() => setChainId(undefined)}
            />
            {search || gameId || chainId ? (
              <Button
                variant="link"
                className="text-primary-foreground"
                onClick={handleClearFilters}
              >
                Reset
              </Button>
            ) : null}
          </div>
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
              <ul className="h-80 overflow-auto border-night-500 border-t pt-4">
                {tokens
                  .filter(
                    ({
                      address,
                      symbol,
                      name,
                      collectionAddress,
                      collectionName,
                      isVault,
                      ...token
                    }) =>
                      // Filter by search query
                      (!search ||
                        symbol.toLowerCase().includes(search.toLowerCase()) ||
                        name.toLowerCase().includes(search.toLowerCase()) ||
                        collectionName
                          ?.toLowerCase()
                          .includes(search.toLowerCase())) &&
                      // Filter by selected game
                      (!gameId || token.gameId === gameId) &&
                      // Filter by selected chain
                      (!chainId || chainId === token.chainId) &&
                      // Filter by selected tab
                      (tab === "all" ||
                        (tab === "collections" ? isVault : !isVault)),
                  )
                  .map((token) => (
                    <TokenView
                      key={token.address}
                      disabled={disabledTokenIds.includes(token.address)}
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

const TokenView = ({
  token,
  disabled,
  onSelect,
}: {
  token: Token;
  disabled: boolean;
  onSelect: (token: Token) => void;
}) => {
  const { address } = useAccount();
  const { data: balance, isLoading } = usePoolTokenBalance({ token, address });
  return (
    <li
      className={cn(
        "relative rounded-lg px-3 py-2 hover:bg-night-500",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PoolTokenImage token={token} className="h-9 w-9" showChainIcon />
          <div className="text-left text-sm">
            <span className="block font-semibold text-cream">
              {token.symbol}
            </span>
            {token.name.toUpperCase() !== token.symbol.toUpperCase() ? (
              <span className="block text-silver-600">{token.name}</span>
            ) : token.collectionName &&
              token.name.toUpperCase() !==
                token.collectionName.toUpperCase() ? (
              <p className="text-silver-400 text-xs sm:text-sm">
                {token.collectionName}
              </p>
            ) : null}
          </div>
        </div>
        {isLoading ? (
          <LoaderIcon className="h-4 w-4" />
        ) : address ? (
          <p className="text-base-400 text-sm">
            {formatAmount(balance, { decimals: token.decimals })}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        className="absolute inset-0 h-full w-full"
        onClick={() => onSelect(token)}
      />
    </li>
  );
};
