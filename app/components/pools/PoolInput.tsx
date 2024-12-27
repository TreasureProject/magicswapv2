import { VaultIcon, WalletIcon } from "lucide-react";
import { formatEther } from "viem";

import { useAccount } from "~/contexts/account";
import { formatAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import type { Pool } from "~/lib/pools.server";
import { CurrencyInput } from "../CurrencyInput";
import { PoolImage } from "./PoolImage";

export const PoolInput = ({
  pool,
  balance,
  amount,
  isBalanceStaked = false,
  onUpdateAmount,
}: {
  pool: Pool;
  balance: bigint;
  amount: string;
  isBalanceStaked?: boolean;
  onUpdateAmount: (amount: string) => void;
}) => {
  const { isConnected } = useAccount();
  const parsedAmount = Number(amount);

  const handleSelectMax = () => {
    onUpdateAmount(formatEther(balance));
  };

  const handleSelect = (percent: number) => {
    if (percent === 1) {
      handleSelectMax();
    } else {
      onUpdateAmount(
        formatAmount(bigIntToNumber(balance) * percent, {
          type: "raw",
        }),
      );
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-night-1100">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex-1 space-y-1">
          <CurrencyInput
            className="text-left font-semibold text-2xl text-[#FFFCF3]"
            value={amount}
            onChange={onUpdateAmount}
            disabled={!isConnected}
          />
          {pool.reserveUSD ? (
            <span className="block text-night-400 text-sm">
              {formatUSD(
                (pool.reserveUSD / bigIntToNumber(BigInt(pool.totalSupply))) *
                  (Number.isNaN(parsedAmount) || parsedAmount === 0
                    ? 1
                    : Number(amount.replace(/,/g, ""))),
              )}
            </span>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <div className="flex shrink-0 items-center justify-end">
            <PoolImage pool={pool} className="h-5 w-5" />
            <p className="-ml-2 whitespace-nowrap font-medium text-lg text-night-100">
              LP Tokens
            </p>
          </div>
          <button
            type="button"
            className="mr-0 ml-auto flex items-center justify-end gap-1.5 text-night-600 text-sm transition-colors hover:text-[#49AEE8]"
            onClick={handleSelectMax}
          >
            {isBalanceStaked ? (
              <VaultIcon className="h-4 w-4" />
            ) : (
              <WalletIcon className="h-4 w-4" />
            )}
            {formatAmount(balance)}
          </button>
        </div>
      </div>
      <div className="flex h-12 items-center justify-end bg-night-900 p-2">
        {[0.1, 0.25, 0.5, 0.75, 1].map((percent) => (
          <button
            key={percent}
            type="button"
            className="rounded-lg px-3 py-1.5 text-night-400 text-sm transition-colors hover:bg-night-800 hover:text-night-100"
            onClick={() => handleSelect(percent)}
          >
            {percent === 1 ? "Max" : formatPercent(percent)}
          </button>
        ))}
      </div>
    </div>
  );
};
