import type { HTMLAttributes } from "react";

import { cn } from "~/lib/utils";
import {
  PoolTokenImage,
  type Token as PoolTokenImageToken,
} from "./PoolTokenImage";

type Props = HTMLAttributes<HTMLDivElement> & {
  pool: {
    token0: PoolTokenImageToken;
    token1: PoolTokenImageToken;
  };
  showChainIcon?: boolean;
};

export const PoolImage = ({
  pool,
  showChainIcon,
  className,
  ...divProps
}: Props) => {
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
        token={isToken1Base ? pool.token0 : pool.token1}
        className={cn("border-2 border-night-1100", className)}
        showChainIcon={showChainIcon}
        containerClassName="-translate-x-1/3"
        {...divProps}
      />
    </div>
  );
};
