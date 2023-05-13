import Decimal from "decimal.js-light";

import { CurrencyInput } from "../CurrencyInput";
import { VisibleOnClient } from "../VisibleOnClient";
import { formatBalance, formatUSD } from "~/lib/currency";
import type { PoolToken } from "~/lib/tokens.server";

export const PoolTokenInput = ({
  token,
  balance = "0",
  amount,
  onUpdateAmount,
}: {
  token: PoolToken;
  balance?: string;
  amount: string;
  onUpdateAmount: (amount: string) => void;
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
        <div className="space-y-1 text-right">
          <CurrencyInput value={amount} onChange={onUpdateAmount} />
          <span className="block text-sm text-night-400">
            {formatUSD(
              new Decimal(amount === "0" ? 1 : amount)
                .mul(token.priceUSD)
                .toFixed(2, Decimal.ROUND_DOWN)
            )}
          </span>
        </div>
      </div>
      <div className="flex h-12 items-center justify-between bg-night-1000 p-2 pr-4">
        <p className="flex items-center pl-2 text-sm text-night-400">
          Balance:
          <span className="inline-block pl-1 font-medium text-night-100">
            <VisibleOnClient>{formatBalance(balance)}</VisibleOnClient>
          </span>
        </p>
        <p className="text-xs text-night-400">
          Tokens are proportionally added
        </p>
      </div>
    </div>
  );
};
