import type { HTMLAttributes } from "react";

import type { Pool } from "~/lib/pools.server";
import { cn } from "~/lib/utils";
import { PoolTokenImage } from "./PoolTokenImage";

type Props = HTMLAttributes<HTMLDivElement> & {
  pool: Pool;
  includeChain?: boolean;
};

export const PoolImage = ({
  pool,
  includeChain,
  className,
  ...divProps
}: Props) => {
  const isToken1Base =
    (pool.token0.isNFT && !pool.token1.isNFT) || pool.token1.isMAGIC;
  return (
    <div className="flex items-center">
      <PoolTokenImage
        token={isToken1Base ? pool.token1 : pool.token0}
        className={cn("border-2 border-night-1100", className)}
        {...divProps}
      />
      <PoolTokenImage
        includeChain={includeChain}
        token={isToken1Base ? pool.token0 : pool.token1}
        className={cn("border-2 border-night-1100", className)}
        containerClassName={"-translate-x-1/3"}
        {...divProps}
      />
    </div>
  );
};
