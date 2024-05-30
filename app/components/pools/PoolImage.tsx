import type { HTMLAttributes } from "react";

import { PoolTokenImage } from "./PoolTokenImage";
import type { Pool } from "~/lib/pools.server";
import { cn } from "~/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  pool: Pool;
};

export const PoolImage = ({ pool, className, ...divProps }: Props) => {
  return (
    <div className="flex items-center">
      <PoolTokenImage
        token={pool.token0}
        className={cn("border-2 border-night-1100", className)}
        {...divProps}
      />
      <PoolTokenImage
        token={pool.token1}
        className={cn("-translate-x-1/3 border-2 border-night-1100", className)}
        {...divProps}
      />
    </div>
  );
};
