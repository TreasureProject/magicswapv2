import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchCollectionOwnedByAddress } from "~/api/tokens.server";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const address = url.searchParams.get("address");
  const slug = url.searchParams.get("slug");

  invariant(address, "Missing address");

  invariant(slug, "Missing slug");

  try {
    const tokens = await fetchCollectionOwnedByAddress(
      address,
      slug.toLowerCase()
    );

    return json(tokens);
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};
