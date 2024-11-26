import { SelectionPopup } from "~/components/SelectionPopup";
import { Button } from "~/components/ui/Button";
import { Dialog, DialogTrigger } from "~/components/ui/Dialog";
import { sumArray } from "~/lib/array";
import { formatNumber } from "~/lib/number";

import type { PoolToken, TroveToken } from "~/types";

export const PoolTokenCollectionInventory = ({
  token,
  items,
}: {
  token: PoolToken;
  items: TroveToken[];
}) => {
  const numVaultItems = sumArray(
    items.map(({ queryUserQuantityOwned }) => queryUserQuantityOwned ?? 1),
  );
  return (
    <div key={token.id} className="rounded-lg bg-night-1100">
      <Dialog>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <span className="font-medium">{token.name} Vault</span>
            {token.name !== token.symbol ? (
              <>
                <span className="h-3 w-[1px] bg-night-400" />
                <span className="text-night-400 uppercase">{token.symbol}</span>
              </>
            ) : null}
          </div>
          <div className="grid grid-cols-5 items-center gap-2 lg:grid-cols-10">
            {items.map((item) => (
              <div
                key={item.tokenId}
                className="relative overflow-hidden rounded"
              >
                <img
                  src={item.image.uri}
                  alt={item.metadata.name}
                  title={item.metadata.name}
                />
                {(item.queryUserQuantityOwned ?? 1) > 1 ? (
                  <span className="absolute right-1.5 bottom-1.5 rounded-lg bg-night-700/80 px-2 py-0.5 font-bold text-night-100 text-xs">
                    {formatNumber(item.queryUserQuantityOwned ?? 1)}x
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[1px] bg-night-800" />
        <div className="flex items-center justify-between px-6 py-3">
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
