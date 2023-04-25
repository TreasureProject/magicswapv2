import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc1155ABI } from "./artifacts/ERC1155";
import { erc20ABI, erc721ABI } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";

export default defineConfig({
  out: "app/generated.ts",
  contracts: [
    {
      name: "ERC20",
      abi: erc20ABI,
    },
    {
      name: "ERC721",
      abi: erc721ABI,
    },
    {
      name: "ERC1155",
      abi: erc1155ABI,
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
