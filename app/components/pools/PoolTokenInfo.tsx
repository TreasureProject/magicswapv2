import { GlobeAltIcon } from "@heroicons/react/24/outline";
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
          "h-20 w-20 overflow-hidden",
          token.isNft ? "rounded" : "rounded-full"
        )}
      >
        <img src={token.image} alt="" />
      </div>
      <div>
        <span className="text-lg font-bold uppercase">{token.symbol}</span>
        <span className="flex items-center gap-1.5 text-sm font-medium text-night-400">
          {token.isNft ? "NFT" : "Token"} | {token.name}{" "}
          <a
            href={`${blockExplorer}/address/${
              token.collections?.[0]?.id ?? token.id
            }`}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            <GlobeAltIcon className="h-4 w-4" />
          </a>
        </span>
      </div>
    </div>
  );
};
