import { defineConfig } from "@wagmi/cli";
import { etherscan, react } from "@wagmi/cli/plugins";
import { erc1155ABI } from "./artifacts/ERC1155";
import { erc20ABI, erc721ABI } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";
import { uniswapV2PairABI } from "./artifacts/UniswapV2Pair";
import { magicSwapV2RouterABI } from "./artifacts/MagicSwapV2Router";

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
    {
      name: "UniswapV2Pair",
      abi: uniswapV2PairABI,
    },
    {
      name: "MagicSwapV2Router",
      abi: magicSwapV2RouterABI,
    }
  ],
  plugins: [
    // Unable to use this right now due to unverified contracts
    // etherscan({
    //   apiKey: process.env.ARBISCAN_API_KEY ?? "",
    //   chainId: arbitrumGoerli.id,
    //   contracts: [
    //     {
    //       name: "MagicSwapV2Router",
    //       address: {
    //         [arbitrumGoerli.id]: "0x37fc6b8b979beeaa969ef1c15ba23bce0cd50dae",
    //       },
    //     },
    //   ],
    // }),
    react(),
  ],
});
