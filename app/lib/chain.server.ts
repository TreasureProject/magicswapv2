import { http, createPublicClient, fallback } from "viem";
import { arbitrum } from "viem/chains";

import { CHAIN_ID_TO_CHAIN } from "~/consts";
import { getContext } from "./env.server";

const CACHED_VIEM_CLIENTS: Record<
  number,
  ReturnType<typeof createPublicClient>
> = {};

export const getViemClient = (chainId: number) => {
  if (!CACHED_VIEM_CLIENTS[chainId]) {
    const { env } = getContext();
    CACHED_VIEM_CLIENTS[chainId] = createPublicClient({
      chain: CHAIN_ID_TO_CHAIN[chainId] ?? arbitrum,
      transport: fallback([
        http(
          `https://${chainId}.rpc.thirdweb.com/${env.BACKEND_THIRDWEB_CLIENT_ID}`,
          { batch: true },
        ),
        http(undefined, { batch: true }),
      ]),
    });
  }

  return CACHED_VIEM_CLIENTS[chainId];
};
