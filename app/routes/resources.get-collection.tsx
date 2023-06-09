import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import {
  fetchCollectionOwnedByAddress,
  fetchIdsFromCollection,
} from "~/api/tokens.server";
import type { TroveApiResponse } from "~/types";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const address = url.searchParams.get("address");
  const slug = url.searchParams.get("slug");
  const traits = url.searchParams.get("traits");
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  const query = url.searchParams.get("query");
  const nextPageKey = url.searchParams.get("nextPageKey");
  const offset = url.searchParams.get("offset");

  invariant(type, "Missing type");

  const isVault = type === "vault";

  invariant(slug, "Missing slug");

  const traitsArray = traits ? traits.split(",") : [];

  try {
    let tokens: TroveApiResponse;

    if (isVault) {
      invariant(id, "Missing id");
      tokens = await fetchIdsFromCollection(
        id,
        slug.toLowerCase(),
        traitsArray,
        query,
        nextPageKey,
        Number(offset ?? 0)
      );
    } else {
      invariant(address, "Missing address");

      const tokenIds = url.searchParams.get("tokenIds");
      const tokenIdsArray = tokenIds ? tokenIds.split(",") : [];

      tokens = await fetchCollectionOwnedByAddress(
        address,
        slug.toLowerCase(),
        tokenIdsArray,
        traitsArray,
        query,
        nextPageKey,
        Number(offset ?? 0)
      );
    }

    return json({ tokens, traits: traitsArray, query });
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};

export type CollectionLoader = typeof loader;
