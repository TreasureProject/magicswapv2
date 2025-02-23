import { formatAmount } from "~/lib/currency";
import type { Pool } from "~/types";
import { PoolImage } from "./PoolImage";

type Props = {
  pool: Pool;
  amount: number | string | bigint;
};

export const PoolLpAmount = ({ pool, amount }: Props) => (
  <div className="-space-x-1 flex items-center py-1.5">
    <PoolImage pool={pool} className="h-10 w-10" />
    <p className="flex items-center gap-1.5 text-silver-400">
      <span className="text-silver-100">{formatAmount(amount)}</span> MLP
    </p>
  </div>
);
