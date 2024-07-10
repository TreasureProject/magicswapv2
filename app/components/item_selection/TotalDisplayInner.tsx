import type { Optional, PoolToken } from "~/types";
import { PoolTokenImage } from "../pools/PoolTokenImage";

export const TotalDisplayInner = ({
  token,
  total,
}: {
  token: Optional<PoolToken>;
  total: string;
}) => (
  <span className="flex items-center gap-1">
    <PoolTokenImage token={token} className="h-4 w-4 flex-shrink-0" />
    <span className="truncate font-medium text-honey-25 text-sm">{total}</span>
  </span>
);
