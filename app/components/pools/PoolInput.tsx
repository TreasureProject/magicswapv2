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
    <div className="relative rounded-lg border border-night-900">
      <p className="absolute -top-3.5 left-1.5 flex items-center bg-background px-2.5 py-1 text-sm sm:-top-5 sm:text-lg">
        {pool.name}
      </p>
      <div className="flex items-center justify-between gap-3 p-4">
        <PoolImage pool={pool} />
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
      <div className="flex h-12 items-center justify-end bg-night-1000 p-2">
        {[0.25, 0.5, 0.75, 1].map((percent) => (
          <button
            key={percent}
            className="rounded-lg px-3 py-1.5 text-sm text-night-400 transition-colors hover:bg-night-900 hover:text-night-100"
            onClick={() =>
              onUpdateAmount(
                percent === 1
                  ? bigIntToNumber(balance).toString()
                  : formatAmount((bigIntToNumber(balance) * percent).toString())
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
