import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";
import type { Version } from ".graphclient";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumSepolia.id]: {
    magicswapV1Router: "0xf9e197aa9fa7c3b27a1a1313cad5851b55f2fd71",
    magicswapV2Router: "0xc8d7261feb0b648bc489224a18d6cdc905a0c5ab",
  },
  [arbitrum.id]: {
    magicswapV1Router: "0xf3573bf4ca41b039bc596354870973d34fdb618b",
    magicswapV2Router: "0xb740d5804ea2061432469119cfa40cbb4586dd17",
  },
} as const;

type Contract = keyof (typeof CONTRACT_ADDRESSES)[42161];

const useContractAddress = (contract: Contract) => {
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
