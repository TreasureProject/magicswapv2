import { BigNumber } from "@ethersproject/bignumber";
import { useAccount, useWaitForTransaction } from "wagmi";

import { useSettings } from "~/contexts/settings";
import {
  useMagicSwapV2RouterSwapExactTokensForTokens,
  useMagicSwapV2RouterSwapNftForNft,
  useMagicSwapV2RouterSwapNftForTokens,
  useMagicSwapV2RouterSwapTokensForExactTokens,
  useMagicSwapV2RouterSwapTokensForNft,
  usePrepareMagicSwapV2RouterSwapExactTokensForTokens,
  usePrepareMagicSwapV2RouterSwapNftForNft,
  usePrepareMagicSwapV2RouterSwapNftForTokens,
  usePrepareMagicSwapV2RouterSwapTokensForExactTokens,
  usePrepareMagicSwapV2RouterSwapTokensForNft,
} from "~/generated";
import { getAmountMaxBN, getAmountMinBN } from "~/lib/pools";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  tokenIn: PoolToken;
  tokenOut?: PoolToken;
  amountIn: BigNumber;
  amountOut: BigNumber;
  nftsIn: TroveTokenWithQuantity[];
  nftsOut: TroveTokenWithQuantity[];
  isExactOut: boolean;
  enabled?: boolean;
};

export const useSwap = ({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  isExactOut,
  nftsIn,
  nftsOut,
  enabled = true,
}: Props) => {
  const { address } = useAccount();
  const { slippage, deadline } = useSettings();

  const addressArg = address ?? "0x0";
  const isEnabled = enabled && !!address && !!tokenOut;
  const amountInMax = isExactOut
    ? getAmountMaxBN(amountIn, slippage)
    : amountIn;
  const amountOutMin = isExactOut
    ? amountOut
    : getAmountMinBN(amountOut, slippage);
  const collectionsIn = nftsIn.map(
    ({ collectionAddr }) => collectionAddr as AddressString
  );
  const tokenIdsIn = nftsIn.map(({ tokenId }) => BigNumber.from(tokenId));
  const quantitiesIn = nftsIn.map(({ quantity }) => BigNumber.from(quantity));
  const collectionsOut = nftsOut.map(
    ({ collectionAddr }) => collectionAddr as AddressString
  );
  const tokenIdsOut = nftsOut.map(({ tokenId }) => BigNumber.from(tokenId));
  const quantitiesOut = nftsOut.map(({ quantity }) => BigNumber.from(quantity));
  const deadlineBN = BigNumber.from(
    Math.floor(Date.now() / 1000) + deadline * 60
  );

  // ERC20-ERC20, exact in
  const { config: swapExactTokensForTokensConfig } =
    usePrepareMagicSwapV2RouterSwapExactTokensForTokens({
      args: [
        amountIn,
        amountOutMin,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !tokenIn.isNft && !tokenOut.isNft && !isExactOut,
    });
  const {
    data: swapExactTokensForTokensData,
    write: swapExactTokensForTokens,
  } = useMagicSwapV2RouterSwapExactTokensForTokens(
    swapExactTokensForTokensConfig
  );
  const { isSuccess: isSwapExactTokensForTokensSuccess } =
    useWaitForTransaction(swapExactTokensForTokensData);

  // ERC20-ERC20, exact out
  const { config: swapTokensForExactTokensConfig } =
    usePrepareMagicSwapV2RouterSwapTokensForExactTokens({
      args: [
        amountOut,
        amountInMax,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !tokenIn.isNft && !tokenOut.isNft && isExactOut,
    });
  const {
    data: swapTokensForExactTokensData,
    write: swapTokensForExactTokens,
  } = useMagicSwapV2RouterSwapTokensForExactTokens(
    swapTokensForExactTokensConfig
  );
  const { isSuccess: isSwapTokensForExactTokensSuccess } =
    useWaitForTransaction(swapTokensForExactTokensData);

  // ERC20-NFT
  const { config: swapTokensForNftConfig } =
    usePrepareMagicSwapV2RouterSwapTokensForNft({
      args: [
        collectionsOut,
        tokenIdsOut,
        quantitiesOut,
        amountInMax,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !tokenIn.isNft && tokenOut.isNft,
    });
  const { data: swapTokensForNftData, write: swapTokensForNft } =
    useMagicSwapV2RouterSwapTokensForNft(swapTokensForNftConfig);
  const { isSuccess: isSwapTokensForNftSuccess } =
    useWaitForTransaction(swapTokensForNftData);

  // NFT-ERC20
  const { config: swapNftForTokensConfig } =
    usePrepareMagicSwapV2RouterSwapNftForTokens({
      args: [
        collectionsIn,
        tokenIdsIn,
        quantitiesIn,
        amountOutMin,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && tokenIn.isNft && !tokenOut.isNft,
    });
  const { data: swapNftForTokensData, write: swapNftForTokens } =
    useMagicSwapV2RouterSwapNftForTokens(swapNftForTokensConfig);
  const { isSuccess: isSwapNftForTokensSuccess } =
    useWaitForTransaction(swapNftForTokensData);

  // NFT-NFT
  const { config: swapNftForNftConfig } =
    usePrepareMagicSwapV2RouterSwapNftForNft({
      args: [
        collectionsIn,
        tokenIdsIn,
        quantitiesIn,
        collectionsOut,
        tokenIdsOut,
        quantitiesOut,
        [tokenIn.id as AddressString, tokenOut?.id as AddressString],
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && tokenIn.isNft && tokenOut.isNft,
    });
  const { data: swapNftForNftData, write: swapNftForNft } =
    useMagicSwapV2RouterSwapNftForNft(swapNftForNftConfig);
  const { isSuccess: isSwapNftForNftSuccess } =
    useWaitForTransaction(swapNftForNftData);

  return {
    amountInMax,
    amountOutMin,
    swap: () => {
      if (!isEnabled) {
        return;
      }

      if (tokenIn.isNft && tokenOut.isNft) {
        swapNftForNft?.();
      } else if (tokenIn.isNft) {
        swapNftForTokens?.();
      } else if (tokenOut.isNft) {
        swapTokensForNft?.();
      } else if (isExactOut) {
        swapTokensForExactTokens?.();
      } else {
        swapExactTokensForTokens?.();
      }
    },
    isSuccess:
      isSwapExactTokensForTokensSuccess ||
      isSwapTokensForExactTokensSuccess ||
      isSwapTokensForNftSuccess ||
      isSwapNftForTokensSuccess ||
      isSwapNftForNftSuccess,
  };
};
