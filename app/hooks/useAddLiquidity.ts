import { useWaitForTransaction } from "wagmi";

import { useAccount } from "~/contexts/account";
import {
  useMagicSwapV2RouterAddLiquidity,
  useMagicSwapV2RouterAddLiquidityNft,
  usePrepareMagicSwapV2RouterAddLiquidity,
  usePrepareMagicSwapV2RouterAddLiquidityNft,
} from "~/generated";
import type { Pool } from "~/lib/pools.server";
import { useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountBase: bigint;
  amountQuote: bigint;
  amountBaseMin: bigint;
  amountQuoteMin: bigint;
  nfts: TroveTokenWithQuantity[];
  enabled?: boolean;
};

export const useAddLiquidity = ({
  pool,
  amountBase,
  amountQuote,
  amountBaseMin,
  amountQuoteMin,
  nfts,
  enabled = true,
}: Props) => {
  const { address, addressArg } = useAccount();
  const { deadline } = useSettingsStore();

  const isEnabled = enabled && !!address;
  const deadlineBN = BigInt(Math.floor(Date.now() / 1000) + deadline * 60);
  const isNFT = pool.baseToken.isNFT || pool.quoteToken.isNFT;

  const { config: tokenAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidity({
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountBase,
        amountQuote,
        amountBaseMin,
        amountQuoteMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !isNFT,
    });
  const { data: tokenAddLiquidityData, write: tokenAddLiquidity } =
    useMagicSwapV2RouterAddLiquidity(tokenAddLiquidityConfig);
  const { isSuccess: isTokenAddLiquiditySuccess } = useWaitForTransaction(
    tokenAddLiquidityData
  );

  const { config: nftAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidityNft({
      args: [
        nfts.map(({ collectionAddr }) => collectionAddr as AddressString),
        nfts.map(({ tokenId }) => BigInt(tokenId)),
        nfts.map(({ quantity }) => BigInt(quantity)),
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountQuote,
        amountQuoteMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && isNFT,
    });
  const { data: nftAddLiquidityData, write: nftAddLiquidity } =
    useMagicSwapV2RouterAddLiquidityNft(nftAddLiquidityConfig);
  const { isSuccess: isNFTAddLiquiditySuccess } =
    useWaitForTransaction(nftAddLiquidityData);

  return {
    addLiquidity: () => {
      if (isNFT) {
        nftAddLiquidity?.();
      } else {
        tokenAddLiquidity?.();
      }
    },
    isSuccess: isTokenAddLiquiditySuccess || isNFTAddLiquiditySuccess,
  };
};
