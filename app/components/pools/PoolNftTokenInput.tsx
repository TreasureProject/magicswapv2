import { Button } from "../ui/Button";
import { DialogTrigger } from "../ui/Dialog";
import { PoolTokenImage } from "./PoolTokenImage";
import { formatTokenAmount } from "~/lib/currency";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { TroveTokenWithQuantity } from "~/types";

export const PoolNftTokenInput = ({
  token,
  amount,
  balance = BigInt(0),
  selectedNfts,
  onOpenSelect,
}: {
  token: PoolToken;
  amount?: number;
  balance?: bigint;
  selectedNfts: TroveTokenWithQuantity[];
  onOpenSelect: (token: PoolToken) => void;
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-night-1000">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-4">
          <PoolTokenImage className="h-10 w-10" token={token} />
          <div className="space-y-1">
            <p className="text-xl font-medium">{token.name}</p>
            {token.name.toUpperCase() !== token.symbol.toUpperCase() && (
              <p className="text-sm text-night-400">{token.symbol}</p>
            )}
          </div>
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
      {balance !== undefined || selectedNfts.length > 0 ? (
        <div
          className={cn(
            "flex h-12 items-center bg-night-1100 p-2 pr-4",
            balance !== undefined ? "justify-between" : "justify-end"
          )}
        >
          {balance !== undefined ? (
            <p className="pl-2 text-sm text-night-400">
              Inventory:
              <span className="pl-1 font-medium text-night-100">
                {formatTokenAmount(balance, token.decimals)}
              </span>
            </p>
          ) : null}
          {selectedNfts.length > 0 ? (
            <DialogTrigger asChild>
              <Button variant="ghost" onClick={() => onOpenSelect(token)}>
                Edit Selection
              </Button>
            </DialogTrigger>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
