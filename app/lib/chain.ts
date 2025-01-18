import { arbitrum } from "viem/chains";
import { CHAIN_ID_TO_CHAIN } from "~/consts";

export const getBlockExplorerUrl = ({ chainId }: { chainId: number }) => {
  const chain = CHAIN_ID_TO_CHAIN[chainId] ?? arbitrum;
  return chain.blockExplorers?.default ?? arbitrum.blockExplorers.default;
};
