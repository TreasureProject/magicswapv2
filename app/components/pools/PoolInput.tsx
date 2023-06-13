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
    <div className="relative rounded-lg border border-night-900">
      <div className="flex items-center justify-between p-4">
        <div className="flex-center flex gap-3">
          <PoolImage pool={pool} />
          <div className="-ml-2">
            <p className=" text-md flex items-center">{pool.name}</p>
            <p className="text-sm leading-4 text-night-700">{pool.name}</p>
          </div>
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
      <div className="flex h-12 items-center justify-end bg-night-1000 p-2">
        {[0.25, 0.5, 0.75, 1].map((percent) => (
          <button
            key={percent}
            className="rounded-lg px-3 py-1.5 text-sm text-night-400 transition-colors hover:bg-night-900 hover:text-night-100"
            onClick={() =>
              onUpdateAmount(
                percent === 1
                  ? formatEther(balance)
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
