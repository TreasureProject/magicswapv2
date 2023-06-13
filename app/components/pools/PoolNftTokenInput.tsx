import { Await } from "@remix-run/react";
import { Fragment, Suspense } from "react";

import { LoaderIcon } from "../Icons";
import { Button } from "../ui/Button";
import { DialogTrigger } from "../ui/Dialog";
import { PoolTokenImage } from "./PoolTokenImage";
import { formatAmount } from "~/lib/currency";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { TroveTokenWithQuantity } from "~/types";

export const PoolNftTokenInput = ({
  token,
  amount,
  balance,
  reserve,
  selectedNfts,
  onOpenSelect,
}: {
  token: PoolToken;
  amount?: number;
  balance?: Promise<number> | null;
  reserve?: number;
  selectedNfts: TroveTokenWithQuantity[];
  onOpenSelect: (token: PoolToken) => void;
}) => {
  const isVault = typeof reserve !== "undefined";
  return (
    <div className="overflow-hidden rounded-lg border border-night-900">
      <div className="flex gap-3 p-4">
        <PoolTokenImage className="h-10 w-10" token={token} />
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="truncate text-sm font-medium sm:text-xl">
              {token.name}
            </p>
            {token.name.toUpperCase() !== token.symbol.toUpperCase() && (
              <p className="text-xs text-night-400 sm:text-sm">
                {token.symbol}
              </p>
            )}
          </div>
          {selectedNfts.length > 0 ? (
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
                      <Fragment key={nft.tokenId}>
                        <img
                          className="h-10 w-10 rounded border-2 border-night-1100 sm:h-12 sm:w-12"
                          src={nft.image.uri}
                          alt={nft.metadata.name}
                        />
                        {token.type === "ERC1155" ? (
                          <p className="text-xs text-night-600">
                            {nft.quantity}x
                          </p>
                        ) : null}
                      </Fragment>
                    );
                  })}
              </div>
            </div>
          ) : (
            <DialogTrigger asChild>
              <Button
                variant="dark"
                size="md"
                onClick={() => onOpenSelect(token)}
              >
                {amount
                  ? amount === 1
                    ? "Select Item"
                    : `Select ${amount} Items`
                  : "Select Items"}
              </Button>
            </DialogTrigger>
          )}
        </div>
      </div>
      <div className="flex h-12 items-center justify-between bg-night-1100 p-2 pr-4">
        <p className="pl-2 text-sm text-night-400">
          {isVault ? "Vault" : "Inventory"}:
          <span className="pl-1 font-medium text-night-100">
            {isVault ? (
              formatAmount(reserve)
            ) : (
              <Suspense
                fallback={<LoaderIcon className="inline-block h-3.5 w-3.5" />}
              >
                <Await resolve={balance}>{(balance) => balance ?? 0}</Await>
              </Suspense>
            )}
          </span>
        </p>
        {selectedNfts.length > 0 ? (
          <DialogTrigger asChild>
            <Button variant="ghost" onClick={() => onOpenSelect(token)}>
              Edit Selection
            </Button>
          </DialogTrigger>
        ) : null}
      </div>
    </div>
  );
};
