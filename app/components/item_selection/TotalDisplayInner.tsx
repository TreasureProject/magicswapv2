import { PoolTokenImage } from "../pools/PoolTokenImage";
import type { PoolToken , Optional } from "~/types";

export const TotalDisplayInner = ({
  token,
  total,
}: {
  token: Optional<PoolToken>;
  total: string;
}) => (
  <>
    <PoolTokenImage token={token} className="h-4 w-4 flex-shrink-0" />

    <span className="mr-4 truncate text-sm font-medium text-honey-25">
      {total}
    </span>
  </>
);
