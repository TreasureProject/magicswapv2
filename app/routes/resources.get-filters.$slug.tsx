import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchFilters } from "~/api/tokens.server";

export const loader = async (args: LoaderArgs) => {
  const { slug } = args.params;

  invariant(slug, "Missing slug");

  try {
    const filterList = await fetchFilters(slug.toLowerCase());

    return json(filterList, {
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    throw notFound({
      message: "Collection not found",
    });
  }
};
