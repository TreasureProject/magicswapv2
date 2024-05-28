import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import { fetchUserCollectionBalance } from "~/api/tokens.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { slug } = params;
  invariant(slug, "Missing slug");

  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  invariant(address, "Missing address");

  try {
    const balance = await fetchUserCollectionBalance(slug, address);
    return json({ ok: true, balance } as const);
  } catch (e: any) {
    return json({ ok: false, error: e.message } as const);
  }
};

export type FetchNFTBalanceLoader = typeof loader;
