import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import invariant from "tiny-invariant";

import { fetchFilters } from "~/api/tokens.server";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;
  invariant(slug, "Missing slug");

  try {
    const filterList = await fetchFilters(slug.toLowerCase());

    return json(
      {
        ok: true,
        filterList,
      } as const,
      {
        headers: {
          "Cache-Control": "public, max-age=86400",
        },
      }
    );
  } catch (err) {
    return json({ ok: false, error: (err as Error).message } as const);
  }
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export type CollectionFiltersLoader = typeof loader;
