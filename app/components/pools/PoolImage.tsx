import type { HTMLAttributes } from "react";

import { PoolTokenImage } from "./PoolTokenImage";
import type { Pool } from "~/lib/pools.server";
import { cn } from "~/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  pool: Pool;
};

export const PoolImage = ({ pool, className, ...divProps }: Props) => {
  return (
    <div className="flex items-center -space-x-6">
      <PoolTokenImage
        token={pool.baseToken}
        className={cn(
          "border-2 border-night-1100",
          pool.baseToken.isNFT ? "rounded-lg" : "rounded-full",
          className
        )}
        {...divProps}
      />
      <PoolTokenImage
        token={pool.quoteToken}
        className={cn(
          "border-2 border-night-1100",
          pool.quoteToken.isNFT ? "rounded-lg" : "rounded-full",
          className
        )}
        {...divProps}
      />
    </div>
  );
};
