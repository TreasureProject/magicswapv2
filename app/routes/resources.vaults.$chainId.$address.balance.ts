import { data } from "react-router";
import invariant from "tiny-invariant";

import { fetchPoolTokenBalance, fetchToken } from "~/api/tokens.server";
import type { Token } from "~/types";
import type { Route } from "./+types/resources.vaults.$chainId.$address.balance";

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const { chainId, address: vaultAddress } = params;
  invariant(chainId, "Chain ID required");
  invariant(vaultAddress, "Vault address is required");

  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  invariant(address, "User address required");

  const createErrorResponse = (error: string) =>
    data({ ok: false, error } as const);

  let token: Token | undefined;
  try {
    token = await fetchToken({
      chainId: Number(chainId),
      address: vaultAddress,
    });
  } catch (err) {
    return createErrorResponse((err as Error).message);
  }

  if (!token) {
    return createErrorResponse("Token not found");
  }

  if (!token.isVault) {
    return createErrorResponse("Token must be an NFT vault");
  }

  try {
    const balance = await fetchPoolTokenBalance(token, address);
    return data({ ok: true, balance } as const);
  } catch (err) {
    return createErrorResponse((err as Error).message);
  }
};

export type FetchNFTVaultBalance = typeof loader;
