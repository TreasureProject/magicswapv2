import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import {
  fetchCollectionOwnedByAddress,
  fetchIdsFromCollection,
} from "~/api/tokens.server";
import type { TroveToken } from "~/types";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const address = url.searchParams.get("address");
  const slug = url.searchParams.get("slug");
  const traits = url.searchParams.get("traits");
  const type = url.searchParams.get("type");
  const tokenIds = url.searchParams.get("tokenIds");
  const query = url.searchParams.get("query");

  invariant(type, "Missing type");

  const isVault = type === "vault";

  invariant(slug, "Missing slug");

  try {
    let tokens: TroveToken[];

    if (isVault) {
      invariant(tokenIds, "Missing tokenIds");
      tokens = await fetchIdsFromCollection(
        tokenIds,
        slug.toLowerCase(),
        traits,
        query
      );
    } else {
      invariant(address, "Missing address");

      tokens = await fetchCollectionOwnedByAddress(
        address,
        slug.toLowerCase(),
        traits,
        query
      );
    }

    return json({ tokens, traits: traits ? traits.split(",") : [] });
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};

export type CollectionLoader = typeof loader;
