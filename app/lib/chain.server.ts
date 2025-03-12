import { http, createPublicClient, fallback } from "viem";
import { arbitrum } from "viem/chains";

import { CHAIN_ID_TO_CHAIN } from "~/consts";
import { getContext } from "./context.server";

export const createViemClient = (chainId: number) => {
  const { env } = getContext();
  return createPublicClient({
    chain: CHAIN_ID_TO_CHAIN[chainId] ?? arbitrum,
    transport: fallback([
      http(
        `https://${chainId}.rpc.thirdweb.com/${env.BACKEND_THIRDWEB_CLIENT_ID}`,
        { batch: true },
      ),
      http(undefined, { batch: true }),
    ]),
  });
};
