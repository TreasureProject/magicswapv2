import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchCollectionOwnedByAddress } from "~/api/tokens.server";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const address = url.searchParams.get("address");
  const slug = url.searchParams.get("slug");
  const traits = url.searchParams.get("traits");
  const query = url.searchParams.get("query");
  const nextPageKey = url.searchParams.get("nextPageKey");
  const offset = url.searchParams.get("offset");
  const tokenIds = url.searchParams.get("tokenIds");
  const tokenIdsArray = tokenIds ? tokenIds.split(",") : [];

  invariant(slug, "Missing slug");

  const traitsArray = traits ? traits.split(",") : [];

  try {
    invariant(address, "Missing address");

    const tokens = await fetchCollectionOwnedByAddress(
      address,
      slug.toLowerCase(),
      traitsArray,
      tokenIdsArray,
      query,
      nextPageKey,
      Number(offset ?? 0)
    );

    return json({ tokens, traits: traitsArray, query });
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};

export type CollectionLoader = typeof loader;
