import { formatEther } from "viem";

import { CurrencyInput } from "../CurrencyInput";
import { PoolImage } from "./PoolImage";
import { formatAmount, formatUSD } from "~/lib/currency";
import { bigIntToNumber, formatPercent } from "~/lib/number";
import type { Pool } from "~/lib/pools.server";

export const PoolInput = ({
  pool,
  balance,
  amount,
  onUpdateAmount,
}: {
  pool: Pool;
  balance: bigint;
  amount: string;
  onUpdateAmount: (amount: string) => void;
}) => {
  const parsedAmount = Number(amount);
  return (
    <div className="relative overflow-hidden rounded-lg bg-night-1100">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center">
          <PoolImage pool={pool} />
          <p className="-ml-2 text-sm font-medium sm:text-xl">{pool.name}</p>
        </div>
        <div className="space-y-1 text-right">
          <CurrencyInput value={amount} onChange={onUpdateAmount} />
          <span className="block text-sm text-night-400">
            {formatUSD(
              (pool.reserveUSD / bigIntToNumber(BigInt(pool.totalSupply))) *
                (Number.isNaN(parsedAmount) || parsedAmount === 0
                  ? 1
                  : Number(amount.replace(/,/g, "")))
            )}
          </span>
        </div>
      </div>
      <div className="flex h-12 items-center justify-end bg-night-900 p-2">
        {[0.25, 0.5, 0.75, 1].map((percent) => (
          <button
            key={percent}
            className="rounded-lg px-3 py-1.5 text-sm text-night-400 transition-colors hover:bg-night-800 hover:text-night-100"
            onClick={() =>
              onUpdateAmount(
                percent === 1
                  ? formatEther(balance)
                  : formatAmount(bigIntToNumber(balance) * percent, false)
              )
            }
          >
            {formatPercent(percent)}
          </button>
        ))}
      </div>
    </div>
  );
};
