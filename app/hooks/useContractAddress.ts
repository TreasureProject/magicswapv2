import { zeroAddress } from "viem";
import { arbitrum, arbitrumSepolia } from "viem/chains";
import { useChainId } from "wagmi";
import type { Version } from ".graphclient";

import type { AddressString } from "~/types";

const CONTRACT_ADDRESSES = {
  [arbitrumSepolia.id]: {
    magicswapV1Router: "0xf9e197aa9fa7c3b27a1a1313cad5851b55f2fd71",
    magicswapV2Router: "0xa8654a8097b78daf740c1e2ada8a6bf3cd60da50",
    stakingContract: "0xb39b382b81aedd8c5003ff141b51c6398dba82ff",
    nftVaultManager: "0x29e3c51787ccd964914ce82cac26c41ea9b019eb",
  },
  [arbitrum.id]: {
    magicswapV1Router: "0xf3573bf4ca41b039bc596354870973d34fdb618b",
    magicswapV2Router: "0xf7c8f888720d5af7c54dfc04afe876673d7f5f43",
    stakingContract: zeroAddress,
    nftVaultManager: zeroAddress,
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

export const useRouterAddress = (version: Version) =>
  useContractAddress(
    version === "V2" ? "magicswapV2Router" : "magicswapV1Router",
  );
