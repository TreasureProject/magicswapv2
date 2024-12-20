import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";

import {
  fetchVaultReserveItems,
  fetchVaultUserInventory,
} from "~/api/tokens.server";

const createErrorResponse = (error: string) =>
  json({ ok: false, error } as const);

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { chainId, address: vaultAddress } = params;
  invariant(chainId, "Chain ID required");
  invariant(vaultAddress, "Vault address is required");

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "reserves";
  const address = url.searchParams.get("address");
  const page = url.searchParams.get("page");
  const resultsPerPage = url.searchParams.get("resultsPerPage");

  if (type === "inventory") {
    if (!address) {
      return createErrorResponse("Address required to fetch inventory");
    }

    try {
      const results = await fetchVaultUserInventory({
        chainId: Number(chainId),
        vaultAddress,
        userAddress: address,
      });
      return json({ ok: true, results } as const);
    } catch (err) {
      return createErrorResponse((err as Error).message);
    }
  }

  try {
    const results = await fetchVaultReserveItems({
      chainId: Number(chainId),
      address: vaultAddress,
      page: page ? Number(page) : undefined,
      resultsPerPage: resultsPerPage ? Number(resultsPerPage) : undefined,
    });
    return json({ ok: true, results } as const);
  } catch (err) {
    return createErrorResponse((err as Error).message);
  }
};

export type FetchVaultItems = typeof loader;
