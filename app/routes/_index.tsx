import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
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
import { useAccount, useBalance, useWaitForTransaction } from "wagmi";

import { fetchPools } from "~/api/pools.server";
import { fetchTokens } from "~/api/tokens.server";
import { CurrencyInput } from "~/components/CurrencyInput";
import { SwapIcon, TokenIcon } from "~/components/Icons";
import { NumberInput } from "~/components/NumberInput";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { Button } from "~/components/ui/Button";
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
import { useSettings } from "~/contexts/settings";
import {
  magicSwapV2RouterAddress,
  useErc20Allowance,
  useErc20Approve,
  useMagicSwapV2RouterSwapExactTokensForTokens,
  useMagicSwapV2RouterSwapTokensForExactTokens,
  usePrepareErc20Approve,
  usePrepareMagicSwapV2RouterSwapExactTokensForTokens,
  usePrepareMagicSwapV2RouterSwapTokensForExactTokens,
} from "~/generated";
import { formatBalance, formatUSD } from "~/lib/currency";
import {
  getAmountIn,
  getAmountMax,
  getAmountMin,
  getAmountOut,
} from "~/lib/pools";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { AddressString } from "~/types";

export async function loader({ request }: LoaderArgs) {
  const [tokens, pools] = await Promise.all([fetchTokens(), fetchPools()]);

  const url = new URL(request.url);
  const inputAddress = url.searchParams.get("in");
  const outputAddress = url.searchParams.get("out");

  const tokenIn = inputAddress
    ? tokens.find(({ id }) => id === inputAddress)
    : tokens.find(({ name }) => name === "MAGIC");
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
  const { address } = useAccount();
  const [searchParams, setSearchParams] = useSearchParams();
  const { slippage, deadline, updateSlippage, updateDeadline } = useSettings();
  const [swapInput, setSwapInput] = useState({
    value: "0",
    isExactOut: false,
  });

  console.log(useLoaderData<typeof loader>());

  const handleSelectToken = (direction: "in" | "out", token: PoolToken) => {
    searchParams.set(direction, token.id);
    setSearchParams(searchParams);
  };

  const poolTokenIn =
    pool?.token0.id === tokenIn?.id ? pool?.token0 : pool?.token1;
  const poolTokenOut =
    pool?.token0.id === tokenOut?.id ? pool?.token0 : pool?.token1;

  const amountIn = swapInput.isExactOut
    ? getAmountIn(
        swapInput.value,
        poolTokenIn?.reserve,
        poolTokenOut?.reserve,
        tokenIn?.decimals
      )
    : swapInput.value;
  const amountOut = swapInput.isExactOut
    ? swapInput.value
    : getAmountOut(
        swapInput.value,
        poolTokenIn?.reserve,
        poolTokenOut?.reserve,
        tokenOut?.decimals
      );

  const amountInBN = parseUnits(amountIn, tokenIn?.decimals);
  const amountOutBN = parseUnits(amountOut, tokenOut?.decimals);

  const hasAmounts = amountInBN.gt(0) && amountOutBN.gt(0);

  const { data: tokenInBalance, refetch: refetchTokenInBalance } = useBalance({
    address,
    token: tokenIn?.id as AddressString,
    enabled: !!address && !!tokenIn && !tokenIn.isNft,
  });
  const { data: tokenOutBalance, refetch: refetchTokenOutBalance } = useBalance(
    {
      address,
      token: tokenOut?.id as AddressString,
      enabled: !!address && !!tokenOut && !tokenOut.isNft,
    }
  );

  const { data: tokenInAllowance, refetch: refetchTokenInAllowance } =
    useErc20Allowance({
      address: tokenIn?.id as AddressString,
      args: [address ?? "0x0", magicSwapV2RouterAddress[421613]],
      enabled: !!address && !!tokenIn && !tokenIn.isNft && hasAmounts,
    });

  const isTokenInApproved = tokenInAllowance?.gte(amountInBN) ?? false;

  const { config: approveTokenInConfig } = usePrepareErc20Approve({
    address: tokenIn?.id as AddressString,
    args: [magicSwapV2RouterAddress[421613], amountInBN],
    enabled: !isTokenInApproved,
  });
  const { data: approveTokenInData, write: approveTokenIn } =
    useErc20Approve(approveTokenInConfig);
  const { isSuccess: isApproveTokenInSuccess } =
    useWaitForTransaction(approveTokenInData);

  const { config: swapExactTokensForTokensConfig } =
    usePrepareMagicSwapV2RouterSwapExactTokensForTokens({
      args: [
        amountInBN,
        parseUnits(
          getAmountMin(amountOut, slippage).toString(),
          tokenOut?.decimals
        ),
        [poolTokenIn?.id as AddressString, poolTokenOut?.id as AddressString],
        address ?? "0x0",
        BigNumber.from(Math.floor(Date.now() / 1000) + deadline * 60),
      ],
      enabled:
        !!address &&
        !!poolTokenIn &&
        !!poolTokenOut &&
        hasAmounts &&
        !swapInput.isExactOut,
    });
  const {
    data: swapExactTokensForTokensData,
    write: swapExactTokensForTokens,
  } = useMagicSwapV2RouterSwapExactTokensForTokens(
    swapExactTokensForTokensConfig
  );
  const { isSuccess: isSwapExactTokensForTokensSuccess } =
    useWaitForTransaction(swapExactTokensForTokensData);

  const { config: swapTokensForExactTokensConfig } =
    usePrepareMagicSwapV2RouterSwapTokensForExactTokens({
      args: [
        amountOutBN,
        parseUnits(
          getAmountMax(amountIn, slippage).toString(),
          tokenIn?.decimals
        ),
        [poolTokenIn?.id as AddressString, poolTokenOut?.id as AddressString],
        address ?? "0x0",
        BigNumber.from(Math.floor(Date.now() / 1000) + deadline * 60),
      ],
      enabled:
        !!address &&
        !!poolTokenIn &&
        !!poolTokenOut &&
        hasAmounts &&
        swapInput.isExactOut,
    });
  const {
    data: swapTokensForExactTokensData,
    write: swapTokensForExactTokens,
  } = useMagicSwapV2RouterSwapTokensForExactTokens(
    swapTokensForExactTokensConfig
  );
  const { isSuccess: isSwapTokensForExactTokensSuccess } =
    useWaitForTransaction(swapTokensForExactTokensData);

  useEffect(() => {
    if (isApproveTokenInSuccess) {
      refetchTokenInAllowance();
    }
  }, [isApproveTokenInSuccess, refetchTokenInAllowance]);

  useEffect(() => {
    if (
      isSwapExactTokensForTokensSuccess ||
      isSwapTokensForExactTokensSuccess
    ) {
      setSwapInput({
        value: "0",
        isExactOut: false,
      });
      refetchTokenInBalance();
      refetchTokenOutBalance();
    }
  }, [
    isSwapExactTokensForTokensSuccess,
    isSwapTokensForExactTokensSuccess,
    refetchTokenInBalance,
    refetchTokenOutBalance,
  ]);

  return (
    <main className="mx-auto max-w-xl py-6 sm:py-10">
      <div className="flex items-center justify-between gap-3 text-night-600">
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <SwapIcon className="h-6 w-6" />
          Swap
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
          balance={tokenInBalance?.formatted}
          amount={amountIn}
          tokens={tokens}
          onSelect={(token) => handleSelectToken("in", token)}
          onUpdateAmount={(value) =>
            setSwapInput({
              value,
              isExactOut: false,
            })
          }
        />
        <Link
          to={`/?in=${tokenOut?.id}&out=${tokenIn?.id}`}
          className="group relative z-10 -my-2 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1200 bg-night-1100 text-honey-25"
        >
          <ArrowDownIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </Link>
        <SwapTokenInput
          token={poolTokenOut ?? tokenOut}
          balance={tokenOutBalance?.formatted}
          amount={amountOut}
          tokens={tokens}
          onSelect={(token) => handleSelectToken("out", token)}
          onUpdateAmount={(value) =>
            setSwapInput({
              value,
              isExactOut: true,
            })
          }
        />
        <div className="mt-4 space-y-1.5">
          {!isTokenInApproved && (
            <Button className="w-full" onClick={() => approveTokenIn?.()}>
              Approve {tokenIn?.name}
            </Button>
          )}
          <Button
            className="w-full"
            disabled={!isTokenInApproved || !hasAmounts}
            onClick={() =>
              swapInput.isExactOut
                ? swapTokensForExactTokens?.()
                : swapExactTokensForTokens?.()
            }
          >
            Swap Items
          </Button>
        </div>
      </div>
    </main>
  );
}

const SwapTokenInput = ({
  token,
  balance = "0",
  amount,
  tokens,
  onSelect,
  onUpdateAmount,
  className,
}: {
  token?: PoolToken;
  balance?: string;
  amount: string;
  tokens: PoolToken[];
  onSelect: (token: PoolToken) => void;
  onUpdateAmount: (amount: string) => void;
  className?: string;
}) => {
  const [tab, setTab] = useState<"tokens" | "collections">("collections");
  const location = useLocation();

  const parsedAmount = Number(amount);
  const amountPriceUSD =
    Number.isNaN(parsedAmount) || parsedAmount === 0
      ? new Decimal(token?.priceUSD ?? 0)
      : new Decimal(token?.priceUSD ?? 0).mul(amount);

  return (
    // Unmount the dialog when the location changes
    <Dialog key={location.search}>
      {token ? (
        <div
          className={cn("overflow-hidden rounded-lg bg-night-1100", className)}
        >
          <div className="flex items-center justify-between gap-3 p-4">
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
            <div className="space-y-1 text-right">
              <CurrencyInput value={amount} onChange={onUpdateAmount} />
              <span className="block text-sm text-night-400">
                {formatUSD(amountPriceUSD.toFixed(2, Decimal.ROUND_DOWN))}
              </span>
            </div>
          </div>
          <div className="bg-night-800 px-4 py-2.5 text-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="text-night-400 sm:text-sm">Balance</span>
                <span className="font-semibold text-honey-25 sm:text-sm">
                  {formatBalance(balance)}
                </span>
              </div>
              {/* <Button mode="secondary">Max</Button> */}
            </div>
          </div>
        </div>
      ) : (
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
      )}
      <DialogPortal>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Asset</DialogTitle>
            <DialogDescription>Select an asset to swap with.</DialogDescription>
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
            <ul className="mt-4 border-t border-night-900 pt-4">
              {tokens
                .filter(({ isNft }) => (tab === "collections" ? isNft : !isNft))
                .map((token) => (
                  <li
                    key={token.id}
                    className="relative rounded-lg px-3 py-2 hover:bg-night-900"
                  >
                    {/* <div className="flex w-full items-center justify-between gap-3"> */}
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
                    {/* </div> */}
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
    </Dialog>
  );
};
