import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumSepolia.id]: {
    MagicSwapV2Router: "0xc8d7261feb0b648bc489224a18d6cdc905a0c5ab",
  },
  [arbitrum.id]: {
    MagicSwapV2Router: "0xb740d5804ea2061432469119cfa40cbb4586dd17",
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

export const useMagicSwapV2RouterAddress = () =>
  useContractAddress("MagicSwapV2Router");
