import { useChainId } from "wagmi";

import type { Contract } from "~/consts";
import { getContractAddress } from "~/lib/address";
import type { version as Version } from ".graphclient";

export const useContractAddress = (contract: Contract, chainId?: number) => {
  const currentChainId = useChainId();
  return getContractAddress({ chainId: chainId ?? currentChainId, contract });
};

export const useRouterAddress = (version: Version, chainId?: number) =>
  useContractAddress(
    version === "V2" ? "magicswapV2Router" : "magicswapV1Router",
    chainId,
  );
