import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(
    `https://${arbitrumSepolia.id}.rpc.thirdweb.com/${import.meta.env.VITE_THIRDWEB_CLIENT_ID}`
  ),
});
