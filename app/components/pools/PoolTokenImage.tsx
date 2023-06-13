import type { HTMLAttributes } from "react";

import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";
import type { Optional } from "~/types";

type Props = HTMLAttributes<HTMLDivElement> & {
  token: Optional<PoolToken>;
};

export const PoolTokenImage = ({ token, className, ...divProps }: Props) => (
  <div
    className={cn(
      "h-9 w-9 overflow-hidden border border-night-1000 bg-night-1000",
      token?.isNFT ? "rounded-lg" : "rounded-full",
      className
    )}
    {...divProps}
  >
    {token && token.image ? (
      <img src={token.image} title={token.name} alt="" />
    ) : null}
  </div>
);
