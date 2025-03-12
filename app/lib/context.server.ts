import { type } from "arktype";
import { GraphQLClient } from "graphql-request";
import type { Context } from "hono";
import { getContext as getContextStorage } from "hono/context-storage";
import { type SessionStorage, createCookieSessionStorage } from "react-router";
import type { Address } from "viem";

import { type Env, envSchema } from "./env.server";

type SessionData = {
  userAddress: Address | undefined;
};

type SessionFlashData = {
  error: string;
};

export type HonoContext = {
  Variables: {
    env: Env;
    graphClient: GraphQLClient;
    sessionStorage: SessionStorage<SessionData, SessionFlashData>;
  };
};

export const createContext = (ctx: Context<HonoContext>) => {
  const env = envSchema({
    ...process.env,
    ...(ctx.env as Env),
  });

  if (env instanceof type.errors) {
    throw new Error(`Invalid environment variables: ${env.summary}`);
  }

  // Set environment variables
  ctx.set("env", env);

  // Create GraphQL client
  ctx.set("graphClient", new GraphQLClient(env.MAGICSWAPV2_API_URL));

  // Create session storage
  ctx.set(
    "sessionStorage",
    createCookieSessionStorage<SessionData, SessionFlashData>({
      cookie: {
        name: "__session",
        secure: true,
        secrets: [env.SESSION_SECRET],
      },
    }),
  );
};

export const getContext = () => getContextStorage<HonoContext>().var;
