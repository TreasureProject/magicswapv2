import { Await, useRouteLoaderData } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/server-runtime";
import { Suspense } from "react";

import { LoaderIcon } from "../Icons";
import { Button } from "../ui/Button";
import { DialogTrigger } from "../ui/Dialog";
import { PoolTokenImage } from "./PoolTokenImage";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { loader } from "~/routes/pools_.$id";
import type { TroveTokenWithQuantity } from "~/types";

export const PoolNftTokenInput = ({
  token,
  amount,
  selectedNfts,
  onOpenSelect,
}: {
  token: PoolToken;
  amount?: number;
  selectedNfts: TroveTokenWithQuantity[];
  onOpenSelect: (token: PoolToken) => void;
}) => {
  const { inventory } = useRouteLoaderData(
    "routes/pools_.$id"
  ) as SerializeFrom<typeof loader>;

  return (
    <div className="relative rounded-lg border border-night-1000">
      <p className="absolute -top-3.5 left-1.5 flex items-center bg-background px-2.5 py-1 text-sm sm:-top-5 sm:text-lg">
        {token.name}
      </p>
      <div className="flex items-center justify-between gap-3 p-4">
        <PoolTokenImage className="h-10 w-10" token={token} />

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
      <div className="flex h-12 items-center justify-between bg-night-1100 p-2 pr-4">
        <p className="pl-2 text-sm text-night-400">
          Inventory:
          <span className="pl-1 font-medium text-night-100">
            <Suspense
              fallback={<LoaderIcon className="inline-block h-3.5 w-3.5" />}
            >
              <Await resolve={inventory}>
                {(inventory) => inventory?.[token.id] ?? 0}
              </Await>
            </Suspense>
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
