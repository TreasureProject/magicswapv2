import type { HTMLAttributes } from "react";
import type { Pool } from "~/types";
import { cn } from "~/utils/lib";
import { PoolTokenImage } from "./PoolTokenImage";

type Props = HTMLAttributes<HTMLDivElement> & {
  pool: Pool;
};

export const PoolImage = ({ pool, className, ...divProps }: Props) => {
  return (
    <div className="flex items-center">
      <PoolTokenImage
        token={pool.token1.isNft ? pool.token1 : pool.token0}
        className={className}
        {...divProps}
      />
      <PoolTokenImage
        token={pool.token1.isNft ? pool.token0 : pool.token1}
        className={cn("-translate-x-1/2", className)}
        {...divProps}
      />
    </div>
  );
};
