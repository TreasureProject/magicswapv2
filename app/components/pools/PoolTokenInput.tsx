import { CurrencyInput } from "../CurrencyInput";
import { DisabledInputPopover } from "../DisabledInputPopover";
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
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex-center flex gap-3">
          <PoolTokenImage className="h-10 w-10" token={token} />
          <div>
            <p className=" text-md flex items-center">{token.name}</p>
            <p className="text-sm leading-4 text-night-700">{token.symbol}</p>
          </div>
        </div>
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
      <div className="flex items-center justify-between bg-night-1100 p-3">
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
