import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumSepolia.id]: {
    MagicSwapV2Router: "0x5C22f12214b7e4A6b7FE3428595B90e2388DA26B",
  },
  [arbitrum.id]: {
    MagicSwapV2Router: "",
  },
} as const;

type Contract = keyof (typeof CONTRACT_ADDRESSES)[42161];

export const useContractAddress = (contract: Contract) => {
  const chainId = useChainId();
  const addresses =
    CONTRACT_ADDRESSES[
      chainId === arbitrumSepolia.id ? arbitrumSepolia.id : arbitrum.id
    ];
  return addresses[contract] as AddressString;
};

export const useMagicSwapV2RouterAddress = () =>
  useContractAddress("MagicSwapV2Router");
