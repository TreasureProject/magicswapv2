export const ENV = {
  NODE_ENV: process.env.NODE_ENV,
  PUBLIC_IS_DEV: process.env.PUBLIC_IS_DEV === "true",
  PUBLIC_DEFAULT_CHAIN_ID: Number(process.env.PUBLIC_DEFAULT_CHAIN_ID ?? 0),
  PUBLIC_DEFAULT_TOKEN_ADDRESS: process.env.PUBLIC_DEFAULT_TOKEN_ADDRESS ?? "",
  PUBLIC_THIRDWEB_CLIENT_ID: process.env.PUBLIC_THIRDWEB_CLIENT_ID,
  PUBLIC_WALLET_CONNECT_PROJECT_ID:
    process.env.PUBLIC_WALLET_CONNECT_PROJECT_ID,
  TROVE_API_KEY: process.env.TROVE_API_KEY,
  PUBLIC_GTAG_ID: process.env.PUBLIC_GTAG_ID,
};
