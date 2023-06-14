import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchCollectionOwnedByAddress } from "~/api/tokens.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const { slug } = params;
  invariant(slug, "Missing slug");

  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  invariant(address, "Missing address");

  const traits = url.searchParams.get("traits");
  const query = url.searchParams.get("query");
  const nextPageKey = url.searchParams.get("nextPageKey");
  const offset = url.searchParams.get("offset");
  const tokenIds = url.searchParams.get("tokenIds");
  const tokenIdsArray = tokenIds ? tokenIds.split(",") : [];
  const traitsArray = traits ? traits.split(",") : [];

  try {
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

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export type CollectionLoader = typeof loader;
