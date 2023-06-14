import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { fetchDomain } from "~/api/user.server";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const address = url.searchParams.get("address");

  invariant(address, "Missing address");

  try {
    const domain = await fetchDomain(address);
    return json({ domain, ok: true });
  } catch (e: unknown) {
    return json({
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
      domain: null,
    });
  }
};

export type DomainLoader = typeof loader;
