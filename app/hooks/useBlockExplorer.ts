import { useAccount } from "wagmi";
import { arbitrum } from "wagmi/chains";
import { CHAIN_ID_TO_CHAIN } from "~/consts";

type Props = {
  chainId?: number;
};

export const useBlockExplorer = (props?: Props) => {
  const account = useAccount();
  const chain = props?.chainId
    ? CHAIN_ID_TO_CHAIN[props.chainId]
    : account.chain;
  return chain?.blockExplorers?.default ?? arbitrum.blockExplorers.default;
};
