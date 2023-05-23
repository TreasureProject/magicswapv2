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
    <div className="relative rounded-lg border border-night-900">
      <p className="absolute -top-3.5 left-1.5 flex items-center bg-background px-2.5 py-1 text-sm sm:-top-5 sm:text-lg">
        {token.name}
      </p>
      <div className="flex items-center justify-between gap-3 p-4">
        <PoolTokenImage className="h-10 w-10" token={token} />
        <div className="space-y-1 text-right">
          <CurrencyInput
            value={amount}
            disabled={disabled}
            onChange={onUpdateAmount}
          />
          <span className="block text-[0.6rem] text-night-400 sm:text-sm">
            {formatUSD(
              token.priceUSD *
                (Number.isNaN(parsedAmount) || parsedAmount === 0
                  ? 1
                  : Number(amount.replace(/,/g, "")))
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-col space-y-2 bg-night-1100 p-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center text-sm text-night-400">
          Balance:
          <span className="inline-block pl-1 font-medium text-night-100">
            <VisibleOnClient>
              {formatTokenAmount(balance, token.decimals)}
            </VisibleOnClient>
          </span>
        </p>
        <p className="text-xs text-night-500">
          Tokens are proportionally added
        </p>
      </div>
    </div>
  );
};
