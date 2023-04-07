import type { HTMLAttributes } from "react";
import type { PoolToken } from "~/types";
import { cn } from "~/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & {
  token: PoolToken;
};

export const PoolTokenImage = ({ token, className, ...divProps }: Props) => (
  <div
    className={cn(
      "border-night-1000 bg-night-1000 h-9 w-9 overflow-hidden rounded-full border",
      className
    )}
    {...divProps}
  >
    {!!token.image && <img src={token.image} title={token.name} alt="" />}
  </div>
);
