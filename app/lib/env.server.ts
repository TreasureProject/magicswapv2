import { type } from "arktype";

export const envSchema = type({
  PUBLIC_ENVIRONMENT: ["'development' | 'production'", "=", "production"],
  PUBLIC_DEFAULT_CHAIN_ID: type("number").or("string.numeric.parse"),
  PUBLIC_DEFAULT_TOKEN_ADDRESS: "string",
  PUBLIC_THIRDWEB_CLIENT_ID: "string",
  PUBLIC_WALLET_CONNECT_PROJECT_ID: "string",
  "PUBLIC_GTAG_ID?": "string",
  MAGICSWAPV2_API_URL: "string",
  TROVE_API_KEY: "string",
  BACKEND_THIRDWEB_CLIENT_ID: "string",
  SESSION_SECRET: "string",
});

export type Env = typeof envSchema.infer;
