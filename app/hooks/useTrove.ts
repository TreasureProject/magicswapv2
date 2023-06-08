import { useChainId } from "wagmi";
import { arbitrumGoerli } from "wagmi/chains";

const createCollectionUrl = (url: string, slug: string) =>
  `${url}/collection/${slug}`;

export const useTrove = () => {
  const chainId = useChainId();
  const url =
    chainId === arbitrumGoerli.id
      ? "https://trove-testnet.treasure.lol"
      : "https://trove.treasure.lol";
  return {
    url,
    createCollectionUrl: (slug: string) => createCollectionUrl(url, slug),
    createTokenUrl: (slug: string, tokenId: string) =>
      `${createCollectionUrl(url, slug)}/${tokenId}`,
  };
};
