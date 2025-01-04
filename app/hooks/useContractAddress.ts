import { useChainId } from "wagmi";

import type { Contract } from "~/consts";
import { getContractAddress } from "~/lib/address";
import type { version as Version } from ".graphclient";

export const useContractAddress = (contract: Contract) => {
  const chainId = useChainId();
  return getContractAddress({ chainId, contract });
};

export const useRouterAddress = (version: Version) =>
  useContractAddress(
    version === "V2" ? "magicswapV2Router" : "magicswapV1Router",
  );
