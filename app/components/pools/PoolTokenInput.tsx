import type { Token } from "~/api/tokens.server";
import { formatAmount, formatUSD } from "~/lib/currency";
import { CurrencyInput } from "../CurrencyInput";
import { VisibleOnClient } from "../VisibleOnClient";
import { InfoPopover } from "../ui/InfoPopover";
import { PoolTokenImage } from "./PoolTokenImage";

export const PoolTokenInput = ({
  token,
  balance = 0n,
  priceUsd,
  amount,
  disabled = false,
  onUpdateAmount,
}: {
  token: Token;
  balance?: bigint;
  priceUsd: number;
  amount: string;
  disabled?: boolean;
  onUpdateAmount: (amount: string) => void;
}) => {
  const parsedAmount = Number(amount.replace(/,/g, ""));
  return (
    <div className="overflow-hidden rounded-lg bg-night-700">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center gap-4">
          <PoolTokenImage className="h-10 w-10" token={token} />
          <div className="flex-1">
            <p className="font-medium text-sm sm:text-xl">{token.symbol}</p>
            {token.name.toUpperCase() !== token.symbol.toUpperCase() ? (
              <p className="text-silver-400 text-xs sm:text-sm">{token.name}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-1 text-right">
          <CurrencyInput
            value={amount}
            disabled={disabled}
            onChange={onUpdateAmount}
          />
          {priceUsd > 0 ? (
            <span className="block text-[0.6rem] text-silver-400 sm:text-sm">
              {formatUSD(
                priceUsd *
                  (Number.isNaN(parsedAmount) || parsedAmount === 0
                    ? 1
                    : parsedAmount),
              )}
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex items-center justify-between bg-night-500 p-3">
        <p className="flex items-center text-silver-400 text-sm">
          Balance:
          <span className="inline-block pl-1 font-medium text-silver-100">
            <VisibleOnClient>
              {formatAmount(balance, { decimals: token.decimals })}
            </VisibleOnClient>
          </span>
        </p>
        {disabled ? (
          <InfoPopover>
            Input is disabled because the amount will be auto-calculated based
            on the selected NFTs.
          </InfoPopover>
        ) : null}
      </div>
    </div>
  );
};
