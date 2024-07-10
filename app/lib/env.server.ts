import { arbitrum, arbitrumSepolia } from "viem/chains";

const CHAIN_ID_TO_DEFAULT_TOKEN_ADDRESS = {
  [arbitrumSepolia.id]: "0x23be0504127475387a459fe4b01e54f1e336ffae",
  [arbitrum.id]: "0x0caadd427a6feb5b5fc1137eb05aa7ddd9c08ce9",
} as const;

const CHAIN_ID_TO_TROVE_API_URL = {
  [arbitrumSepolia.id]: "https://trove-api-dev.treasure.lol",
  [arbitrum.id]: "https://trove-api.treasure.lol",
} as const;

const CHAIN_ID_TO_TROVE_API_NETWORK = {
  [arbitrumSepolia.id]: "arbsepolia",
  [arbitrum.id]: "arb",
} as const;

type SupportedChainId = keyof typeof CHAIN_ID_TO_TROVE_API_URL;

const CHAIN_ID = Number(process.env.PUBLIC_CHAIN_ID) as SupportedChainId;

export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_CHAIN_ID: CHAIN_ID,
  PUBLIC_DEFAULT_TOKEN_ADDRESS: CHAIN_ID_TO_DEFAULT_TOKEN_ADDRESS[CHAIN_ID],
  PUBLIC_THIRDWEB_CLIENT_ID: process.env.PUBLIC_THIRDWEB_CLIENT_ID,
  PUBLIC_WALLET_CONNECT_PROJECT_ID:
    process.env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
  TROVE_API_URL: CHAIN_ID_TO_TROVE_API_URL[CHAIN_ID],
  TROVE_API_NETWORK: CHAIN_ID_TO_TROVE_API_NETWORK[CHAIN_ID],
  TROVE_API_KEY: process.env.TROVE_API_KEY,
};
