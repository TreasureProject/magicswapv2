import { CurrencyInput } from "../CurrencyInput";
import { VisibleOnClient } from "../VisibleOnClient";
import { PoolTokenImage } from "./PoolTokenImage";
import { formatTokenAmount, formatUSD } from "~/lib/currency";
import type { PoolToken } from "~/lib/tokens.server";

export const PoolTokenInput = ({
  token,
  balance = BigInt(0),
  amount,
  disabled = false,
  onUpdateAmount,
}: {
  token: PoolToken;
  balance?: bigint;
  amount: string;
  disabled?: boolean;
  onUpdateAmount: (amount: string) => void;
}) => {
  const parsedAmount = Number(amount);
  return (
    <div className="overflow-hidden rounded-lg border border-night-900">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-4">
          <PoolTokenImage className="h-10 w-10" token={token} />
          <div className="space-y-1">
            <p className="text-sm font-medium sm:text-xl">{token.name}</p>
            {token.name.toUpperCase() !== token.symbol.toUpperCase() && (
              <p className="text-xs text-night-400 sm:text-sm">
                {token.symbol}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1 text-right">
          <CurrencyInput
            value={amount}
            disabled={disabled}
            onChange={onUpdateAmount}
          />
          <span className="block text-sm text-night-400">
            {formatUSD(
              token.priceUSD *
                (Number.isNaN(parsedAmount) || parsedAmount === 0
                  ? 1
                  : Number(amount.replace(/,/g, "")))
            )}
          </span>
        </div>
      </div>
      <div className="flex h-12 items-center justify-between bg-night-1100 p-2 pr-4">
        <p className="flex items-center pl-2 text-sm text-night-400">
          Balance:
          <span className="inline-block pl-1 font-medium text-night-100">
            <VisibleOnClient>
              {formatTokenAmount(balance, token.decimals)}
            </VisibleOnClient>
          </span>
        </p>
        <p className="text-xs text-night-400">
          Tokens are proportionally added
        </p>
      </div>
    </div>
  );
};
