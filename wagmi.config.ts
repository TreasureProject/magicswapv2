import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import { erc20Abi, erc721Abi } from "viem";

import { erc1155ABI } from "./artifacts/ERC1155";
import { magicSwapV2RouterABI } from "./artifacts/MagicSwapV2Router";
import { uniswapV2PairABI } from "./artifacts/UniswapV2Pair";

export default defineConfig({
  out: "app/generated.ts",
  contracts: [
    {
      name: "ERC20",
      abi: erc20Abi,
    },
    {
      name: "ERC721",
      abi: erc721Abi,
    },
    {
      name: "ERC1155",
      abi: erc1155ABI,
    },
    {
      name: "UniswapV2Pair",
      abi: uniswapV2PairABI,
    },
    {
      name: "MagicSwapV2Router",
      abi: magicSwapV2RouterABI,
    },
  ],
  plugins: [react()],
});
