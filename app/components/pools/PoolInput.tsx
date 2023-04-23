import Decimal from "decimal.js-light";

import { CurrencyInput } from "../CurrencyInput";
import { PoolImage } from "./PoolImage";
import { formatUSD } from "~/lib/currency";
import { formatPercent } from "~/lib/number";
import type { Pool } from "~/lib/pools.server";

export const PoolInput = ({
  pool,
  balance = "0",
  amount,
  onUpdateAmount,
}: {
  pool: Pool;
  balance?: string;
  amount: string;
  onUpdateAmount: (amount: string) => void;
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-night-900">
      <div className="flex items-center justify-between gap-3 p-4">
        <div className="flex items-center">
          <PoolImage pool={pool} />
          <p className="text-xl font-medium">{pool.name}</p>
        </div>
        <div className="space-y-1 text-right">
          <CurrencyInput value={amount} onChange={onUpdateAmount} />
          <span className="block text-sm text-night-400">
            {formatUSD(
              new Decimal(amount === "0" ? 1 : amount)
                .mul(pool.baseToken.priceUSD * 2)
                .toFixed(2, Decimal.ROUND_DOWN)
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
              onUpdateAmount(new Decimal(balance).mul(percent).toString())
            }
          >
            {formatPercent(percent)}
          </button>
        ))}
      </div>
    </div>
  );
};
