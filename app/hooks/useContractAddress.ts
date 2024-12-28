import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";
import type { Version } from ".graphclient";

import { CONTRACT_ADDRESSES, type Contract } from "~/consts";
import type { AddressString } from "~/types";

export const useContractAddress = (contract: Contract) => {
  const chainId = useChainId();
  const addresses =
    CONTRACT_ADDRESSES[
      chainId === arbitrumSepolia.id ? arbitrumSepolia.id : arbitrum.id
    ];
  return addresses[contract] as AddressString;
};

export const useRouterAddress = (version: Version) =>
  useContractAddress(
    version === "V2" ? "magicswapV2Router" : "magicswapV1Router",
  );
