import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchFilters } from "~/api/tokens.server";

export const loader = async (args: LoaderArgs) => {
  const url = new URL(args.request.url);

  const slug = url.searchParams.get("slug");

  invariant(slug, "Missing slug");

  try {
    const filterList = await fetchFilters(slug.toLowerCase());

    return json(filterList);
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};
