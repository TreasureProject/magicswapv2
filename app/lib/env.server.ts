import { type } from "arktype";
import { GraphQLClient } from "graphql-request";
import type { Context } from "hono";
import { getContext as getContextStorage } from "hono/context-storage";

const envSchema = type({
  PUBLIC_ENVIRONMENT: ["'development' | 'production'", "=", "production"],
  PUBLIC_DEFAULT_CHAIN_ID: type("number").or("string.numeric.parse"),
  PUBLIC_DEFAULT_TOKEN_ADDRESS: "string",
  PUBLIC_THIRDWEB_CLIENT_ID: "string",
  PUBLIC_WALLET_CONNECT_PROJECT_ID: "string",
  "PUBLIC_GTAG_ID?": "string",
  MAGICSWAPV2_API_URL: "string",
  TROVE_API_KEY: "string",
  BACKEND_THIRDWEB_CLIENT_ID: "string",
});

type Env = typeof envSchema.infer;
export type HonoEnv = {
  Variables: {
    env: Env;
    graphClient: GraphQLClient;
  };
};

export const createEnv = (ctx: Context<HonoEnv>) => {
  const env = envSchema({
    ...process.env,
    ...(ctx.env as Env),
  });

  if (env instanceof type.errors) {
    throw new Error(`Invalid environment variables: ${env.summary}`);
  }

  ctx.set("env", env);
  ctx.set("graphClient", new GraphQLClient(env.MAGICSWAPV2_API_URL));

  return env;
};

export const getContext = () => getContextStorage<HonoEnv>().var;
