import {
  Link,
  useLoaderData,
  useLocation,
  useSearchParams,
} from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Decimal } from "decimal.js-light";
import {
  ArrowDownIcon,
  ChevronDownIcon,
  LayersIcon,
  SettingsIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ClientOnly } from "remix-utils";
import { formatUnits, parseUnits } from "viem";
import { useBalance } from "wagmi";

import { fetchPools } from "~/api/pools.server";
import { fetchTokens } from "~/api/tokens.server";
import { CurrencyInput } from "~/components/CurrencyInput";
import { SwapIcon, TokenIcon } from "~/components/Icons";
import { NumberInput } from "~/components/NumberInput";
import { VisibleOnClient } from "~/components/VisibleOnClient";
import { SelectionPopup } from "~/components/item_selection/SelectionPopup";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { Button, TransactionButton } from "~/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "~/components/ui/Dropdown";
import { useAccount } from "~/contexts/account";
import { useSettings } from "~/contexts/settings";
import { useApprove } from "~/hooks/useApprove";
import { useIsApproved } from "~/hooks/useIsApproved";
import { useSwap } from "~/hooks/useSwap";
import { formatBalance, formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import { getAmountIn, getAmountOut, getPriceImpact } from "~/lib/pools";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type {
  AddressString,
  NumberString,
  TroveTokenWithQuantity,
} from "~/types";

export async function loader({ request }: LoaderArgs) {
  const [tokens, pools] = await Promise.all([fetchTokens(), fetchPools()]);

  const url = new URL(request.url);
  const inputAddress = url.searchParams.get("in");
  const outputAddress = url.searchParams.get("out");

  const tokenIn = inputAddress
    ? tokens.find(({ id }) => id === inputAddress)
    : tokens.find(({ name }) => name === "MAGIC");

  if (!tokenIn) {
    throw new Response("Input token not found", {
      status: 404,
    });
  }

  const tokenOut = outputAddress
    ? tokens.find(({ id }) => id === outputAddress)
    : undefined;

  // TODO: update routing logic to path through multiple pools
  const pool = pools.find(
    ({ token0, token1 }) =>
      (token0.id === tokenIn?.id || token1.id === tokenIn?.id) &&
      (token0.id === tokenOut?.id || token1.id === tokenOut?.id)
  );
  const path = pool ? [pool] : [];

  return json({
    tokens,
    tokenIn,
    tokenOut,
    path,
  });
}

export default function SwapPage() {
  const {
    tokens,
    tokenIn,
    tokenOut,
    path: [pool],
  } = useLoaderData<typeof loader>();
  const { address, isConnected } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slippage, deadline, updateSlippage, updateDeadline } = useSettings();
  const [{ amount, isExactOut, nftsIn, nftsOut }, setTrade] = useState({
    amount: "0",
    nftsIn: [] as TroveTokenWithQuantity[],
    nftsOut: [] as TroveTokenWithQuantity[],
    isExactOut: false,
  });

  const handleSelectToken = (direction: "in" | "out", token: PoolToken) => {
    searchParams.set(direction, token.id);
    setSearchParams(searchParams);
  };

  const poolTokenIn =
    pool?.token0.id === tokenIn.id ? pool?.token0 : pool?.token1;
  const poolTokenOut =
    pool?.token0.id === tokenOut?.id ? pool?.token0 : pool?.token1;

  const amountIn = isExactOut
    ? getAmountIn(
        amount,
        poolTokenIn?.reserve,
        poolTokenOut?.reserve,
        tokenIn.decimals,
        pool?.totalFee ? Number(pool.totalFee) * 10000 : 0
      )
    : amount;
  const amountOut = isExactOut
    ? amount
    : getAmountOut(
        amount,
        poolTokenIn?.reserve,
        poolTokenOut?.reserve,
        tokenOut?.decimals,
        pool?.totalFee ? Number(pool.totalFee) * 10000 : 0
      );

  const amountInBN = Number.isNaN(Number(amountIn))
    ? BigInt(0)
    : parseUnits(amountIn as NumberString, Number(tokenIn.decimals));
  const amountOutBN = Number.isNaN(Number(amountOut))
    ? BigInt(0)
    : parseUnits(amountOut as NumberString, Number(tokenOut?.decimals));

  const hasAmounts = amountInBN > 0 && amountOutBN > 0;

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
      amount: amountInBN,
      enabled: isConnected && hasAmounts,
    });

  const { approve: approveTokenIn, isSuccess: isApproveTokenInSuccess } =
    useApprove({
      token: tokenIn,
      amount: amountInBN,
      enabled: !isTokenInApproved,
    });

  const {
    amountInMax,
    amountOutMin,
    swap,
    isSuccess: isSwapSuccess,
  } = useSwap({
    tokenIn,
    tokenOut,
    amountIn: amountInBN,
    amountOut: amountOutBN,
    isExactOut,
    nftsIn,
    nftsOut,
    enabled: isConnected && !!tokenOut && hasAmounts,
  });

  useEffect(() => {
    if (isApproveTokenInSuccess) {
      refetchTokenInApproval();
    }
  }, [isApproveTokenInSuccess, refetchTokenInApproval]);

  useEffect(() => {
    if (isSwapSuccess) {
      setTrade({
        amount: "0",
        nftsIn: [],
        nftsOut: [],
        isExactOut: false,
      });
      refetchTokenInBalance();
      refetchTokenOutBalance();
    }
  }, [isSwapSuccess, refetchTokenInBalance, refetchTokenOutBalance]);

  useEffect(() => {
    setTrade((trade) => ({
      ...trade,
      nftsIn: [],
    }));
  }, [tokenIn.id]);

  useEffect(() => {
    setTrade((trade) => ({
      ...trade,
      nftsOut: [],
    }));
  }, [tokenOut?.id]);

  return (
    <main className="mx-auto max-w-xl py-6 sm:py-10">
      <div className="flex items-center justify-between gap-3 text-night-600">
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <SwapIcon className="h-6 w-6" />
          <h1 className="text-night-100">Swap</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>
              <SettingsIcon className="h-6 w-6" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-night-900 p-3 text-sm text-honey-100"
            align="end"
          >
            <h3 className="text-base font-medium">Transaction Settings</h3>
            <DropdownMenuGroup className="mt-2 space-y-1">
              <label htmlFor="settingsSlippage">Slippage tolerance</label>
              <NumberInput
                id="settingsSlippage"
                className="px-2 py-1.5"
                value={slippage}
                onChange={updateSlippage}
                minValue={0.001}
                maxValue={0.49}
                placeholder="0.5%"
                formatOptions={{
                  style: "percent",
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 2,
                }}
                errorMessage="Slippage must be between 0.1% and 49%"
                errorCondition={(value) => value > 49}
                autoFocus
              />
            </DropdownMenuGroup>
            <DropdownMenuGroup className="mt-4 space-y-1">
              <label htmlFor="settingsDeadline">Transaction Deadline</label>
              <NumberInput
                id="settingsDeadline"
                className="px-2 py-1.5"
                value={deadline}
                onChange={updateDeadline}
                minValue={1}
                maxValue={60}
                placeholder="20"
                errorMessage="Deadline must be between 1 and 60"
                errorCondition={(value) => value > 60}
              >
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                  <span className="text-sm text-night-400">Minutes</span>
                </div>
              </NumberInput>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <SwapTokenInput
          className="mt-6"
          token={poolTokenIn ?? tokenIn}
          otherToken={poolTokenOut ?? tokenOut}
          isOut={false}
          balance={tokenInBalance?.formatted}
          amount={isExactOut ? formatBalance(amountIn) : amountIn}
          selectedNfts={nftsIn}
          tokens={tokens}
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
              amount: tokens.length.toString(),
              nftsIn: tokens,
              nftsOut: [],
              isExactOut: false,
            })
          }
        />
        <Link
          to={`/swap?in=${tokenOut?.id}&out=${tokenIn.id}`}
          className="group relative z-10 -my-2 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1200 bg-night-1100 text-honey-25"
        >
          <ArrowDownIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </Link>
        <SwapTokenInput
          token={poolTokenOut ?? tokenOut}
          otherToken={poolTokenIn ?? tokenIn}
          isOut
          balance={tokenOutBalance?.formatted}
          amount={isExactOut ? amountOut : formatBalance(amountOut)}
          selectedNfts={nftsOut}
          tokens={tokens}
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
              amount: tokens.length.toString(),
              nftsIn: [],
              nftsOut: tokens,
              isExactOut: true,
            })
          }
        />
        <div className="mt-4 space-y-1.5">
          <ClientOnly>
            {() => (
              <>
                {!isTokenInApproved && hasAmounts && (
                  <TransactionButton
                    className="w-full"
                    onClick={() => approveTokenIn()}
                  >
                    Approve {tokenIn.name}
                  </TransactionButton>
                )}
                <TransactionButton
                  className="w-full"
                  disabled={!isTokenInApproved || !hasAmounts}
                  onClick={() => swap()}
                >
                  Swap Items
                </TransactionButton>
              </>
            )}
          </ClientOnly>
        </div>
        {!!poolTokenIn && !!poolTokenOut && hasAmounts && (
          <div className="mt-4 text-sm text-night-400">
            <div className="flex items-center justify-between">
              Price Impact
              <span>
                -
                {formatPercent(
                  getPriceImpact(
                    poolTokenIn,
                    poolTokenOut,
                    Number(amountIn),
                    Number(amountOut),
                    isExactOut
                  )
                )}
              </span>
            </div>
            {!!pool?.lpFee && Number(pool.lpFee) > 0 && (
              <div className="flex items-center justify-between">
                Liquidity Provider Fee
                <span>{formatPercent(pool.lpFee)}</span>
              </div>
            )}
            {!!pool?.protocolFee && Number(pool.protocolFee) > 0 && (
              <div className="flex items-center justify-between">
                Protocol Fee
                <span>{formatPercent(pool.protocolFee)}</span>
              </div>
            )}
            {!!pool?.royaltiesFee && Number(pool.royaltiesFee) > 0 && (
              <div className="flex items-center justify-between">
                Royalties Fee
                <span>{formatPercent(pool.royaltiesFee)}</span>
              </div>
            )}
            {isExactOut ? (
              <div className="flex items-center justify-between">
                Maximum spent
                <span>
                  {formatBalance(
                    formatUnits(amountInMax, Number(poolTokenIn.decimals))
                  )}{" "}
                  {poolTokenIn.symbol}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                Minimum received
                <span>
                  {formatBalance(
                    formatUnits(amountOutMin, Number(poolTokenOut.decimals))
                  )}{" "}
                  {poolTokenOut.symbol}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

const SwapTokenInput = ({
  token,
  otherToken,
  isOut,
  balance = "0",
  amount,
  selectedNfts,
  tokens,
  onSelect,
  onUpdateAmount,
  onSelectNfts,
  className,
}: {
  token?: PoolToken;
  otherToken?: PoolToken;
  isOut: boolean;
  balance?: string;
  amount: string;
  selectedNfts: TroveTokenWithQuantity[];
  tokens: PoolToken[];
  onSelect: (token: PoolToken) => void;
  onUpdateAmount: (amount: string) => void;
  onSelectNfts: (tokens: TroveTokenWithQuantity[]) => void;
  className?: string;
}) => {
  const location = useLocation();
  const [openSelectionModal, setOpenSelectionModal] = useState(false);
  const parsedAmount = Number(amount);
  const amountPriceUSD =
    Number.isNaN(parsedAmount) || parsedAmount === 0
      ? new Decimal(token?.priceUSD ?? 0)
      : new Decimal(token?.priceUSD ?? 0).mul(amount);

  return token ? (
    <div className={cn("overflow-hidden rounded-lg bg-night-1100", className)}>
      <div className="flex items-center justify-between gap-3 p-4">
        <Dialog key={location.search}>
          <TokenSelectDialog
            tokens={tokens}
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
              <>
                <Dialog
                  open={openSelectionModal}
                  onOpenChange={setOpenSelectionModal}
                >
                  {openSelectionModal && (
                    <SelectionPopup
                      type={isOut ? "vault" : "inventory"}
                      token={token}
                      selectedTokens={selectedNfts}
                      onSubmit={onSelectNfts}
                    />
                  )}
                </Dialog>
                <Button
                  variant="dark"
                  size="md"
                  onClick={() => setOpenSelectionModal(true)}
                >
                  Select Items
                </Button>
              </>
            )
          ) : (
            <>
              <CurrencyInput
                value={amount}
                onChange={onUpdateAmount}
                disabled={!!otherToken?.isNFT}
              />
              <span className="block text-sm text-night-400">
                {formatUSD(amountPriceUSD.toFixed(2, Decimal.ROUND_DOWN))}
              </span>
            </>
          )}
        </div>
      </div>
      <div className="bg-night-800 px-4 py-2.5 text-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-night-400 sm:text-sm">
              {token.isNFT ? "Inventory" : "Balance"}:
            </span>
            <VisibleOnClient>
              <span className="font-semibold text-honey-25 sm:text-sm">
                {formatBalance(balance)}
              </span>
            </VisibleOnClient>
          </div>
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
        tokens={tokens}
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
  tokens,
  disabledTokenIds = [],
  onSelect,
}: {
  tokens: PoolToken[];
  disabledTokenIds?: string[];
  onSelect: (token: PoolToken) => void;
}) => {
  const [tab, setTab] = useState<"tokens" | "collections">("collections");
  return (
    <DialogPortal>
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
                tab === "tokens" &&
                  "border-night-800 bg-night-800 text-honey-25"
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
          <ul className="mt-4 h-80 overflow-auto border-t border-night-900 pt-4">
            {tokens
              .filter(({ isNFT }) => (tab === "collections" ? isNFT : !isNFT))
              .map((token) => (
                <li
                  key={token.id}
                  className={cn(
                    "relative rounded-lg px-3 py-2 hover:bg-night-900",
                    disabledTokenIds.includes(token.id) &&
                      "pointer-events-none opacity-50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <PoolTokenImage token={token} className="h-9 w-9" />
                    <div className="text-left text-sm">
                      <span className="block font-semibold text-honey-25">
                        {token.name}
                      </span>
                      <span className="block text-night-600">
                        {token.symbol}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSelect(token)}
                    className="absolute inset-0"
                  />
                </li>
              ))}
          </ul>
        </div>
      </DialogContent>
    </DialogPortal>
  );
};
