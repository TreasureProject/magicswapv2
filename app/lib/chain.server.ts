import { createPublicClient, http } from "viem";
import { arbitrumSepolia } from "viem/chains";

export const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(
    `${arbitrumSepolia.rpcUrls.default.http[0]}/${process.env.PUBLIC_ALCHEMY_KEY}`
  ),
});
