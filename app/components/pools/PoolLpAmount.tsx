import { formatAmount } from "~/lib/currency";
import type { Pool } from "~/lib/pools.server";
import { PoolImage } from "./PoolImage";

type Props = {
  pool: Pool;
  amount: number | string | bigint;
};

export const PoolLpAmount = ({ pool, amount }: Props) => (
  <div className="-space-x-1 flex items-center py-1.5">
    <PoolImage pool={pool} className="h-10 w-10" />
    <p className="flex items-center gap-1.5 text-night-400">
      <span className="text-night-100">{formatAmount(amount)}</span> MLP
    </p>
  </div>
);
