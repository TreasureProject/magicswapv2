import type { HTMLAttributes } from "react";

import { cn } from "~/lib/utils";
import {
  PoolTokenImage,
  type Token as PoolTokenImageToken,
} from "./PoolTokenImage";

type Props = HTMLAttributes<HTMLDivElement> & {
  chainId?: number;
  pool: {
    token0: PoolTokenImageToken;
    token1: PoolTokenImageToken;
  };
};

export const PoolImage = ({ pool, chainId, className, ...divProps }: Props) => {
  const isToken1Base =
    (pool.token0.isVault && !pool.token1.isVault) || pool.token1.isMagic;
  return (
    <div className="flex items-center">
      <PoolTokenImage
        token={isToken1Base ? pool.token1 : pool.token0}
        className={cn("border-2 border-night-1100", className)}
        {...divProps}
      />
      <PoolTokenImage
        chainId={chainId}
        token={isToken1Base ? pool.token0 : pool.token1}
        className={cn("border-2 border-night-1100", className)}
        containerClassName={"-translate-x-1/3"}
        {...divProps}
      />
    </div>
  );
};
