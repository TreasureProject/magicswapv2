import { BigNumber } from "@ethersproject/bignumber";
import { useWaitForTransaction } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useSettings } from "~/contexts/settings";
import {
  useMagicSwapV2RouterAddLiquidity,
  useMagicSwapV2RouterAddLiquidityNft,
  usePrepareMagicSwapV2RouterAddLiquidity,
  usePrepareMagicSwapV2RouterAddLiquidityNft,
} from "~/generated";
import type { Pool } from "~/lib/pools.server";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountBase: BigNumber;
  amountQuote: BigNumber;
  amountBaseMin: BigNumber;
  amountQuoteMin: BigNumber;
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
  const { deadline } = useSettings();

  const isEnabled = enabled && !!address;
  const deadlineBN = BigNumber.from(
    Math.floor(Date.now() / 1000) + deadline * 60
  );
  const isNft = pool.baseToken.isNft || pool.quoteToken.isNft;

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
      enabled: isEnabled && !isNft,
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
        nfts.map(({ tokenId }) => BigNumber.from(tokenId)),
        nfts.map(({ quantity }) => BigNumber.from(quantity)),
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountQuote,
        amountQuoteMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && isNft,
    });
  const { data: nftAddLiquidityData, write: nftAddLiquidity } =
    useMagicSwapV2RouterAddLiquidityNft(nftAddLiquidityConfig);
  const { isSuccess: isNftAddLiquiditySuccess } =
    useWaitForTransaction(nftAddLiquidityData);

  return {
    addLiquidity: () => {
      if (isNft) {
        nftAddLiquidity?.();
      } else {
        tokenAddLiquidity?.();
      }
    },
    isSuccess: isTokenAddLiquiditySuccess || isNftAddLiquiditySuccess,
  };
};
