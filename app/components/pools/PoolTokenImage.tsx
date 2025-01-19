import type { HTMLAttributes } from "react";

import { cn } from "~/lib/utils";
import type { Optional } from "~/types";
import { ChainIcon } from "../ChainIcon";

export type Token = {
  chainId: number;
  name: string;
  symbol: string;
  image?: string | null;
  isVault: boolean;
  isMagic: boolean;
};

type Props = HTMLAttributes<HTMLDivElement> & {
  token: Optional<Token>;
  showChainIcon?: boolean;
  containerClassName?: string;
};

export const PoolTokenImage = ({
  token,
  className,
  showChainIcon = false,
  containerClassName,
  ...divProps
}: Props) => (
  <div className={cn("relative", containerClassName)}>
    {showChainIcon && token?.chainId ? (
      <div
        className={cn(
          "-right-0.5 -bottom-0.5 absolute flex h-full w-full items-end justify-end",
        )}
      >
        <ChainIcon chainId={token.chainId} className="h-3 w-3" />
      </div>
    ) : null}
    <div
      className={cn(
        "h-9 w-9 overflow-hidden border border-night-1000 bg-night-1000",
        token?.isVault ? "rounded-lg" : "rounded-full",
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
