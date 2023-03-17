import type { HTMLAttributes } from "react";
import type { PoolToken } from "~/types";
import { cn } from "~/utils/lib";

type Props = HTMLAttributes<HTMLDivElement> & {
  token: PoolToken;
};

export const PoolTokenImage = ({ token, className, ...divProps }: Props) => (
  <div
    className={cn(
      "h-9 w-9 overflow-hidden rounded-full border border-steel-1000 bg-steel-1000",
      className
    )}
    {...divProps}
  >
    {!!token.image && <img src={token.image} title={token.name} alt="" />}
  </div>
);
