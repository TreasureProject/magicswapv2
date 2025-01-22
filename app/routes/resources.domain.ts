import { type LoaderFunctionArgs, data } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";
import invariant from "tiny-invariant";

import { fetchDomain } from "~/api/user.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  invariant(address, "Missing address");

  try {
    const domain = await fetchDomain(address);
    return data({ domain, ok: true } as const);
  } catch (e: unknown) {
    return data({
      ok: false,
      error: e instanceof Error ? e.message : "Unknown error",
      domain: null,
    } as const);
  }
};

export const shouldRevalidate: ShouldRevalidateFunction = () => {
  return false;
};

export type DomainLoader = typeof loader;
