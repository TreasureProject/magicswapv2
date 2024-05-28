import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(
    `https://${arbitrumSepolia.id}.rpc.thirdweb.com/${process.env.PUBLIC_THIRDWEB_CLIENT_ID}`
  ),
});
