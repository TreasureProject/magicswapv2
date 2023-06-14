import { createPublicClient, http } from "viem";
import { arbitrumGoerli } from "viem/chains";

export const client = createPublicClient({
  chain: arbitrumGoerli,
  transport: http(
    `${arbitrumGoerli.rpcUrls.alchemy.http[0]}/${process.env.PUBLIC_ALCHEMY_KEY}`
  ),
});
