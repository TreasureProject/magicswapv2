import type { HTMLAttributes } from "react";
import type { Pool } from "~/types";
import { cn } from "~/lib/utils";
import { PoolTokenImage } from "./PoolTokenImage";

type Props = HTMLAttributes<HTMLDivElement> & {
  pool: Pool;
};

export const PoolImage = ({ pool, className, ...divProps }: Props) => {
  return (
    <div className="flex items-center ">
      <PoolTokenImage
        token={pool.baseToken}
        className={cn("border-2 border-night-1100", className)}
        {...divProps}
      />
      <PoolTokenImage
        token={pool.quoteToken}
        className={cn(
          "-translate-x-1/2",
          "border-2 border-night-1100 ",
          className
        )}
        {...divProps}
      />
    </div>
  );
};
