import { ArrowDownIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Cog6ToothIcon, Square3Stack3DIcon } from "@heroicons/react/24/solid";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Decimal } from "decimal.js-light";
import { useState } from "react";
import { useAccount, useBalance } from "wagmi";

import { fetchTokens } from "~/api/tokens.server";
import { CurrencyInput } from "~/components/CurrencyInput";
import { SwapIcon, TokenIcon } from "~/components/Icons";
import { PoolTokenImage } from "~/components/pools/PoolTokenImage";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/Dialog";
import { formatUSD } from "~/lib/currency";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";

export async function loader({ request }: LoaderArgs) {
  const tokens = await fetchTokens();

  const url = new URL(request.url);
  const inputAddress = url.searchParams.get("in");
  const outputAddress = url.searchParams.get("out");

  const inputToken = inputAddress
    ? tokens.find(({ id }) => id === inputAddress)
    : tokens.find(({ name }) => name === "MAGIC");
  const outputToken = outputAddress
    ? tokens.find(({ id }) => id === outputAddress)
    : undefined;

  return json({
    tokens,
    inputToken,
    outputToken,
  });
}

export default function SwapPage() {
  const { inputToken, outputToken, tokens } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleSelectToken = (direction: "in" | "out", token: PoolToken) => {
    searchParams.set(direction, token.id);
    setSearchParams(searchParams);
  };

  return (
    <main className="mx-auto max-w-xl py-6 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xl font-bold">
          <SwapIcon className="h-6 w-6 text-night-600" />
          Swap
        </div>
        <button>
          <Cog6ToothIcon className="h-6 w-6 text-night-600" />
        </button>
      </div>
      <div>
        <SwapTokenInput
          className="mt-6"
          token={inputToken}
          tokens={tokens}
          onSelect={(token) => handleSelectToken("in", token)}
        />
        <Link
          to={`/?in=${outputToken?.id}&out=${inputToken?.id}`}
          className="group relative z-10 -my-2 mx-auto flex h-8 w-8 items-center justify-center rounded border-4 border-night-1200 bg-night-1100 text-honey-25"
        >
          <ArrowDownIcon className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
        </Link>
        <SwapTokenInput
          token={outputToken}
          tokens={tokens}
          onSelect={(token) => handleSelectToken("out", token)}
        />
      </div>
    </main>
  );
}

const SwapTokenInput = ({
  token,
  tokens,
  onSelect,
  className,
}: {
  token?: PoolToken;
  tokens: PoolToken[];
  onSelect: (token: PoolToken) => void;
  className?: string;
}) => {
  const [tab, setTab] = useState<"tokens" | "collections">("collections");
  const [amount, setAmount] = useState("0");
  const { address } = useAccount();

  const { data: balance } = useBalance({
    address,
    token: token?.id as `0x${string}`,
    enabled: !!token && !token.isNft,
  });

  const amountPriceUSD =
    amount === "0"
      ? new Decimal(token?.priceUSD ?? 0)
      : new Decimal(token?.priceUSD ?? 0).mul(amount);

  return (
    <Dialog>
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
              <CurrencyInput value={amount} onChange={setAmount} />
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
                  {balance?.formatted ?? 0}
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
              <Square3Stack3DIcon className="h-6 w-6" />
            </div>
            Select Asset
          </button>
        </DialogTrigger>
      )}
      <DialogContent>
        <h1 className="font-semibold text-honey-25">Select Asset</h1>
        <div className="rounded-lg bg-night-1100 p-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              className={cn(
                "flex items-center gap-2.5 rounded-lg border border-night-600 bg-transparent px-3 py-2 text-sm font-medium text-night-500 transition-colors hover:text-honey-25",
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
                "flex items-center gap-2.5 rounded-lg border border-night-600 bg-transparent px-3 py-2 text-sm font-medium text-night-500 transition-colors hover:text-honey-25",
                tab === "collections" &&
                  "border-night-800 bg-night-800 text-honey-25"
              )}
              onClick={() => setTab("collections")}
            >
              <Square3Stack3DIcon className="h-4 w-4" />
              Collections
            </button>
          </div>
          <ul className="mt-4 border-t border-night-900 pt-4">
            {tokens
              .filter(({ isNft }) => (tab === "collections" ? isNft : !isNft))
              .map((token) => (
                <li key={token.id} className="">
                  <button
                    className="w-full rounded-lg px-3 py-2 hover:bg-night-900"
                    onClick={() => onSelect(token)}
                  >
                    <div className="flex w-full items-center justify-between gap-3">
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
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
