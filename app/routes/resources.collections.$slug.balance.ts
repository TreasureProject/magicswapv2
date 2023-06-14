import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchUserCollectionBalance } from "~/api/tokens.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const { slug } = params;
  invariant(slug, "Missing slug");

  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  invariant(address, "Missing address");

  try {
    const balance = await fetchUserCollectionBalance(slug, address);
    return json({ balance });
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};

export type FetchNFTBalanceLoader = typeof loader;
