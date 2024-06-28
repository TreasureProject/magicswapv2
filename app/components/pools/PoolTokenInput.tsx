import { CurrencyInput } from "../CurrencyInput";
import { DisabledInputPopover } from "../DisabledInputPopover";
import { VisibleOnClient } from "../VisibleOnClient";
import { PoolTokenImage } from "./PoolTokenImage";
import { formatTokenAmount, formatUSD } from "~/lib/currency";
import type { PoolToken } from "~/types";

export const PoolTokenInput = ({
  token,
  balance = 0n,
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
    <div className="overflow-hidden rounded-lg bg-night-1100">
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
          {token.priceUSD ? (
            <span className="block text-[0.6rem] text-night-400 sm:text-sm">
              {formatUSD(
                token.priceUSD *
                  (Number.isNaN(parsedAmount) || parsedAmount === 0
                    ? 1
                    : Number(amount.replace(/,/g, "")))
              )}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between bg-night-900 p-3">
        <p className="flex items-center text-sm text-night-400">
          Balance:
          <span className="inline-block pl-1 font-medium text-night-100">
            <VisibleOnClient>
              {formatTokenAmount(balance, token.decimals)}
            </VisibleOnClient>
          </span>
        </p>
        {disabled ? <DisabledInputPopover /> : null}
      </div>
    </div>
  );
};
