import { zeroAddress } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";

import type { Version } from ".graphclient";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumSepolia.id]: {
    magicswapV1Router: "0xf9e197aa9fa7c3b27a1a1313cad5851b55f2fd71",
    magicswapV2Router: "0xa8654a8097b78daf740c1e2ada8a6bf3cd60da50",
  },
  [arbitrum.id]: {
    magicswapV1Router: "0xf3573bf4ca41b039bc596354870973d34fdb618b",
    magicswapV2Router: "0xf7c8f888720d5af7c54dfc04afe876673d7f5f43",
  },
  978658: {
    magicswapV1Router: zeroAddress,
    magicswapV2Router: "0xad781ed13b5966e7c620b896b6340abb4dd2ca86",
  },
  61166: {
    magicswapV1Router: zeroAddress,
    magicswapV2Router: zeroAddress,
  },
} as const;

type Contract = keyof (typeof CONTRACT_ADDRESSES)[42161];

const useContractAddress = (contract: Contract) => {
  const chainId = useChainId();
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES][
    contract
  ] as AddressString;
};

export const useRouterAddress = (version: Version) =>
  useContractAddress(
    version === "V2" ? "magicswapV2Router" : "magicswapV1Router",
  );
