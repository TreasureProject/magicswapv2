import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc20ABI } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";

export default defineConfig({
  out: "app/generated.ts",
  contracts: [
    {
      name: "ERC20",
      abi: erc20ABI,
    },
  ],
  plugins: [
    etherscan({
      apiKey: process.env.ARBISCAN_API_KEY ?? "",
      chainId: arbitrumGoerli.id,
      contracts: [
        {
          name: "MagicSwapV2Router",
          address: {
            [arbitrumGoerli.id]: "0x37fc6b8b979beeaa969ef1c15ba23bce0cd50dae",
          },
        },
      ],
    }),
    react(),
  ],
});
