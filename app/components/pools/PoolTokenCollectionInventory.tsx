import { SelectionPopup } from "~/components/SelectionPopup";
import { Button } from "~/components/ui/Button";
import { Dialog, DialogTrigger } from "~/components/ui/Dialog";
import { sumArray } from "~/lib/array";
import { formatNumber } from "~/lib/number";

import type { Token, TokenWithAmount } from "~/types";

export const PoolTokenCollectionInventory = ({
  token,
  items,
}: {
  token: Token;
  items: TokenWithAmount[];
}) => {
  const numVaultItems = sumArray(items.map((item) => Number(item.amount)));
  return (
    <div className="rounded-lg bg-night-1100">
      <Dialog>
        <div className="space-y-5 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">{token.name} Vault</span>
            {token.name !== token.symbol ? (
              <>
                <span className="h-3 w-[1px] bg-night-400" />
                <span className="text-night-400 uppercase">{token.symbol}</span>
              </>
            ) : null}
          </div>
          <div className="grid grid-cols-3 items-center gap-2 sm:grid-cols-5 lg:grid-cols-10">
            {items.map((item) => (
              <div
                key={item.tokenId}
                className="relative overflow-hidden rounded"
              >
                {item.image ? (
                  <img src={item.image} alt={item.name} title={item.name} />
                ) : null}
                {Number(item.amount) > 1 ? (
                  <span className="absolute right-1.5 bottom-1.5 rounded-lg bg-night-700/80 px-2 py-0.5 font-bold text-night-100 text-xs">
                    {formatNumber(item.amount)}x
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-night-800" />
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-night-400 text-sm">
            {formatNumber(numVaultItems)}{" "}
            {numVaultItems === 1 ? "item" : "items"}
          </span>
          <DialogTrigger asChild>
            <Button variant="ghost">View All</Button>
          </DialogTrigger>
        </div>
        <SelectionPopup type="vault" viewOnly token={token} />
      </Dialog>
    </div>
  );
};
