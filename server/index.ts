import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";

import { type HonoContext, createContext } from "~/lib/context.server";

const app = new Hono<HonoContext>();

app.use(contextStorage());

app.use(async (ctx, next) => {
  createContext(ctx);
  await next();
});

export default app;
