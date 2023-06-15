import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { notFound } from "remix-utils";
import invariant from "tiny-invariant";

import { fetchFilters } from "~/api/tokens.server";

export const loader = async ({ params }: LoaderArgs) => {
  const { slug } = params;
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

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};
