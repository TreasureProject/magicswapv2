import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";

import { type HonoEnv, createEnv } from "~/lib/env.server";

const app = new Hono<HonoEnv>();

app.use(contextStorage());

app.use(async (ctx, next) => {
  createEnv(ctx);
  await next();
});

export default app;
