import { arbitrum, arbitrumGoerli } from "viem/chains";
import { useChainId } from "wagmi";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumGoerli.id]: {
    MagicSwapV2Router: "0xe9a62dedde9ecc1527832fce2c8147481af0c1c3",
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
      chainId === arbitrumGoerli.id ? arbitrumGoerli.id : arbitrum.id
    ];
  return addresses[contract] as AddressString;
};

export const useMagicSwapV2RouterAddress = () =>
  useContractAddress("MagicSwapV2Router");
