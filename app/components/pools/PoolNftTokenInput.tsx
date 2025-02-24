import { Suspense } from "react";
import { Await } from "react-router";

import type { Token, TokenWithAmount } from "~/api/tokens.server";
import { formatAmount } from "~/lib/currency";
import { formatNumber } from "~/lib/number";
import { cn } from "~/lib/utils";
import { LoaderIcon } from "../Icons";
import { Button } from "../ui/Button";
import { DialogTrigger } from "../ui/Dialog";
import { PoolTokenImage } from "./PoolTokenImage";

export const PoolNftTokenInput = ({
  token,
  amount,
  balance,
  reserve,
  selectedNfts,
  onOpenSelect,
}: {
  token: Token;
  amount?: number;
  balance?: Promise<number> | null;
  reserve?: bigint;
  selectedNfts: TokenWithAmount[];
  onOpenSelect?: (token: Token) => void;
}) => {
  const isVault = typeof reserve !== "undefined";
  return (
    <div className="overflow-hidden rounded-lg bg-night-700">
      <div className="flex gap-3 p-4">
        <PoolTokenImage className="h-10 w-10 shrink-0" token={token} />
        <div
          className={cn(
            "flex flex-1 justify-between gap-3",
            selectedNfts.length > 0 ? "items-start" : "items-center",
          )}
        >
          <div className="flex-1">
            <p className="truncate font-medium text-sm sm:text-xl">
              {token.symbol}
            </p>
            {token.collectionName &&
              token.name.toUpperCase() !==
                token.collectionName?.toUpperCase() && (
                <p className="text-silver-400 text-xs sm:text-sm">
                  {token.collectionName}
                </p>
              )}
          </div>
          {selectedNfts.length > 0 ? (
            <div className="flex grow flex-wrap items-center justify-end space-x-2">
              {selectedNfts.length > 5 ? (
                <div className="flex items-center rounded-md bg-night-500 px-2 py-1.5">
                  <p className="font-semibold text-silver-500 text-xs">
                    +{selectedNfts.length - 5}
                  </p>
                </div>
              ) : null}
              <ul
                className={cn("flex items-center", {
                  "-space-x-5": token.collectionType === "ERC721",
                })}
              >
                {selectedNfts
                  .slice(0, Math.min(selectedNfts.length, 5))
                  .map((nft) => {
                    return (
                      <li key={nft.tokenId} className="text-center">
                        {nft.image ? (
                          <img
                            className="h-10 w-10 rounded border-2 border-night-700 sm:h-12 sm:w-12"
                            src={nft.image}
                            alt={nft.name}
                          />
                        ) : null}
                        {token.collectionType === "ERC1155" ? (
                          <p className="text-silver-600 text-xs">
                            {nft.amount}x
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : (
            <DialogTrigger asChild>
              <Button
                variant="dark"
                size="md"
                onClick={() => onOpenSelect?.(token)}
              >
                {amount
                  ? `Select ${formatNumber(amount)} ${
                      amount === 1 ? "item" : "items"
                    }`
                  : "Select items"}
              </Button>
            </DialogTrigger>
          )}
        </div>
      </div>
      <div className="flex h-12 items-center justify-between bg-night-500 p-2 pr-4">
        <p className="pl-2 text-silver-400 text-sm">
          {isVault ? "Vault" : "Inventory"}:
          <span className="pl-1 font-medium text-silver-100">
            {isVault ? (
              formatAmount(reserve, { decimals: token.decimals })
            ) : (
              <Suspense
                fallback={<LoaderIcon className="inline-block h-3.5 w-3.5" />}
              >
                <Await resolve={balance}>
                  {(balance) => formatNumber(balance ?? 0)}
                </Await>
              </Suspense>
            )}
          </span>
        </p>
        {selectedNfts.length > 0 ? (
          <DialogTrigger asChild>
            <Button variant="ghost" onClick={() => onOpenSelect?.(token)}>
              Edit Selection
            </Button>
          </DialogTrigger>
        ) : null}
      </div>
    </div>
  );
};
