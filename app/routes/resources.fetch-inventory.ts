import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchTotalInventoryForUser } from "~/api/tokens.server";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const address = url.searchParams.get("address");
  const slug = url.searchParams.get("slug");

  invariant(address, "Missing address");
  invariant(slug, "Missing slug");

  try {
    const res = await fetchTotalInventoryForUser(slug, address);

    return json({
      inventory: res,
    });
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};

export type FetchInventoryLoader = typeof loader;
