import Decimal from "decimal.js-light";

import { CurrencyInput } from "../CurrencyInput";
import { Button } from "../ui/Button";
import { DialogTrigger } from "../ui/Dialog";
import { formatBalance, formatUSD } from "~/lib/currency";
import type { PoolToken } from "~/lib/tokens.server";

export const PoolNftTokenInput = ({
  token,
  balance = "0",
  amount,
  onUpdateAmount,
  onOpenSelect,
}: {
  token: PoolToken;
  balance?: string;
  amount: string;
  onUpdateAmount: (amount: string) => void;
  onOpenSelect: (token: PoolToken) => void;
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-night-900">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-night-1000">
            {token.image ? <img src={token.image} alt="" /> : null}
          </div>
          <div className="space-y-1">
            <p className="text-xl font-medium">{token.name}</p>
            {token.name.toUpperCase() !== token.symbol.toUpperCase() && (
              <p className="text-sm text-night-400">{token.symbol}</p>
            )}
          </div>
        </div>
        <DialogTrigger asChild>
          <Button variant="dark" size="md" onClick={() => onOpenSelect(token)}>
            Select Items
          </Button>
        </DialogTrigger>
      </div>
      <div className="flex h-12 items-center justify-between bg-night-1000 p-2 pr-4">
        <p className="pl-2 text-sm text-night-400">
          Inventory:
          <span className="pl-1 font-medium text-night-100">
            {formatBalance(balance)}
          </span>
        </p>
      </div>
    </div>
  );
};
