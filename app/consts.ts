import { type Chain, zeroAddress } from "viem";
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

export const GAME_METADATA: Record<
  string,
  {
    name: string;
    image: string;
    tokens: Record<number, string[]>;
    collections: Record<number, string[]>;
  }
> = {
  bitmates: {
    name: "Bitmates",
    image: "/img/games/bitmates.png",
    tokens: {},
    collections: {
      [arbitrumSepolia.id]: ["0x7e0ac4fd9ce457c4dfc903804d96b1eb5a34000e"],
    },
  },
  realm: {
    name: "Realm",
    image: "/img/games/realm.png",
    tokens: {
      [arbitrum.id]: ["0xccd05a0fcfc1380e9da27862adb2198e58e0d66f"],
    },
    collections: {},
  },
  smol: {
    name: "SMOL",
    image: "/img/games/smol.png",
    tokens: {
      [arbitrum.id]: ["0x9e64d3b9e8ec387a9a58ced80b71ed815f8d82b5"],
      [arbitrumSepolia.id]: ["0x568b900f596c183e68fe9d773a7afb93156c9db3"],
    },
    collections: {},
  },
  zeeverse: {
    name: "Zeeverse",
    image: "/img/games/zeeverse.png",
    tokens: {
      [arbitrum.id]: [
        "0x0caadd427a6feb5b5fc1137eb05aa7ddd9c08ce9",
        "0x74abf11b5f7bf057000e411a7130b46911792709",
      ],
      [arbitrumSepolia.id]: [
        "0x23be0504127475387a459fe4b01e54f1e336ffae",
        "0x5a3247e764ee0e71cef22802d189815fad6f1257",
      ],
    },
    collections: {
      [arbitrum.id]: ["0x58318bceaa0d249b62fad57d134da7475e551b47"],
      [arbitrumSepolia.id]: ["0xfaad5aa3209ab1b25ede22ed4da5521538b649fa"],
    },
  },
};

export const BLOCKED_TOKENS = [
  "0x45d55eadf0ed5495b369e040af0717eafae3b731", // ELM v1
];

export const UINT112_MAX = 5192296858534827628530496329220095n;
