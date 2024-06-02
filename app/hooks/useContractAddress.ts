import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumSepolia.id]: {
    MagicSwapV2Router: "0xd0a4fbcc5cde863a2be50c75b564efd942b03154",
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
