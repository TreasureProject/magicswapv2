import { type Address, type Chain, zeroAddress } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  treasure,
  treasureTopaz,
} from "viem/chains";

export const PRIVACY_POLICY_URL = "https://app.treasure.lol/privacy-policy";
export const TERMS_OF_SERVICE_URL = "https://app.treasure.lol/terms-of-service";

export const DOCS_URL = "https://docs.treasure.lol/magicswap";
export const GOVERNANCE_FORUM_URL =
  "https://forum.treasure.lol/discussions/3.1.%20Magicswap%20-%20Active";
export const BUY_MAGIC_URL = "https://market.treasure.lol/manage-funds";

export const DISCORD_URL = "https://discord.com/invite/treasuredao";
export const TWITTER_URL = "https://twitter.com/MagicSwap_";

export const CONTRACT_ADDRESSES = {
  [treasure.id]: {
    magicswapV1Router: "0x95aff54273275f2d9623f12a7e689dfaa5eba311",
    magicswapV2Router: "0xf7c8f888720d5af7c54dfc04afe876673d7f5f43",
    stakingContract: "0xb331c6ee51e1af84aeae6f363feac3596201ee76",
    nftVaultManager: zeroAddress,
  },
  [treasureTopaz.id]: {
    magicswapV1Router: zeroAddress,
    magicswapV2Router: "0xad781ed13b5966e7c620b896b6340abb4dd2ca86",
    stakingContract: zeroAddress,
    nftVaultManager: zeroAddress,
  },
  [arbitrum.id]: {
    magicswapV1Router: "0xf3573bf4ca41b039bc596354870973d34fdb618b",
    magicswapV2Router: "0xf7c8f888720d5af7c54dfc04afe876673d7f5f43",
    stakingContract: zeroAddress,
    nftVaultManager: zeroAddress,
  },
  [arbitrumSepolia.id]: {
    magicswapV1Router: "0xf9e197aa9fa7c3b27a1a1313cad5851b55f2fd71",
    magicswapV2Router: "0xa8654a8097b78daf740c1e2ada8a6bf3cd60da50",
    stakingContract: "0x106E5C6aD0602C4c09eD4C3Fb96e937E9D5Bf6C7",
    nftVaultManager: "0x6aa7d31bd26251f09c3c4f8fa1942e654dfbcd1f",
  },
} as const;

export type Contract = keyof (typeof CONTRACT_ADDRESSES)[42161];

export const CHAIN_ID_TO_CHAIN: Record<number, Chain> = {
  [treasure.id]: treasure,
  [treasureTopaz.id]: treasureTopaz,
  [arbitrum.id]: arbitrum,
  [arbitrumSepolia.id]: arbitrumSepolia,
};

export const CHAIN_ID_TO_TROVE_API_URL: Record<number, string> = {
  [treasure.id]: "https://trove-api.treasure.lol",
  [treasureTopaz.id]: "https://trove-api-dev.treasure.lol",
  [arbitrum.id]: "https://trove-api.treasure.lol",
  [arbitrumSepolia.id]: "https://trove-api-dev.treasure.lol",
};

export const CHAIN_ID_TO_TROVE_API_NETWORK: Record<number, string> = {
  [treasure.id]: "treasure",
  [treasureTopaz.id]: "topaz",
  [arbitrum.id]: "arb",
  [arbitrumSepolia.id]: "arbsepolia",
};

export const UINT112_MAX = 5192296858534827628530496329220095n;
