import { GlobeIcon } from "lucide-react";

import { useBlockExplorer } from "~/hooks/useBlockExplorer";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";

type Props = {
  token: PoolToken;
};

export const PoolTokenInfo = ({ token }: Props) => {
  const blockExplorer = useBlockExplorer();
  return (
    <div className="flex items-center gap-6">
      <div
        className={cn(
          "overflow-hidden",
          token.isNft ? "h-20 w-20 rounded" : "h-14 w-14 rounded-full"
        )}
      >
        <img src={token.image} alt="" />
      </div>
      <div>
        <span className="text-lg font-bold uppercase">{token.symbol}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-night-400">
          {token.isNft ? "NFT" : "Token"} | {token.name}{" "}
          <a
            // href={`${blockExplorer}/address/${
            //   token.collections?.[0]?.id ?? token.id
            // }`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            <GlobeIcon className="h-4 w-4" />
          </a>
        </span>
      </div>
    </div>
  );
};
