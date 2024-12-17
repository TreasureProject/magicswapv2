import { ChainIcon } from "connectkit";
import type { HTMLAttributes } from "react";

import { cn } from "~/lib/utils";
import type { Optional, PoolToken } from "~/types";

type Props = HTMLAttributes<HTMLDivElement> & {
  token: Optional<PoolToken>;
  chainId?: number;
  containerClassName?: string;
};

export const PoolTokenImage = ({
  token,
  className,
  containerClassName,
  chainId,
  ...divProps
}: Props) => {
  // TODO: replace with actual chain ID
  return (
    <div className={cn("relative", containerClassName)}>
      {chainId && (
        <div
          className={cn(
            "-right-1 -bottom-1 absolute flex h-full w-full items-end justify-end",
          )}
        >
          <ChainIcon id={chainId} unsupported={false} size="40%" />
        </div>
      )}
      <div
        className={cn(
          "h-9 w-9 overflow-hidden border border-night-1000 bg-night-1000",
          token?.isNFT ? "rounded-lg" : "rounded-full",
          className,
        )}
        {...divProps}
      >
        {token?.image ? (
          <img src={token.image} title={token.name} alt={token.symbol} />
        ) : null}
      </div>
    </div>
  );
};
