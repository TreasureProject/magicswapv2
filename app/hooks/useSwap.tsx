import { formatUnits } from "@ethersproject/units";
import { useWaitForTransaction } from "wagmi";

import { useAccount } from "~/contexts/account";
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
import { useWaitForTransaction as useWaitForT } from "~/hooks/useWaitForTransaction";
import { getAmountMaxBN, getAmountMinBN } from "~/lib/pools";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  tokenIn: PoolToken;
  tokenOut?: PoolToken;
  amountIn: bigint;
  amountOut: bigint;
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
  const { address, addressArg } = useAccount();
  const { slippage, deadline } = useSettings();

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
  const tokenIdsIn = nftsIn.map(({ tokenId }) => BigInt(tokenId));
  const quantitiesIn = nftsIn.map(({ quantity }) => BigInt(quantity));
  const collectionsOut = nftsOut.map(
    ({ collectionAddr }) => collectionAddr as AddressString
  );
  const tokenIdsOut = nftsOut.map(({ tokenId }) => BigInt(tokenId));
  const quantitiesOut = nftsOut.map(({ quantity }) => BigInt(quantity));
  const deadlineBN = BigInt(Math.floor(Date.now() / 1000) + deadline * 60);

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
      enabled: isEnabled && !tokenIn.isNFT && !tokenOut.isNFT && !isExactOut,
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
      enabled: isEnabled && !tokenIn.isNFT && !tokenOut.isNFT && isExactOut,
    });
  const {
    data: swapTokensForExactTokensData,
    write: swapTokensForExactTokens,
  } = useMagicSwapV2RouterSwapTokensForExactTokens(
    swapTokensForExactTokensConfig
  );
  const { isSuccess: isSwapTokensForExactTokensSuccess } =
    useWaitForTransaction(swapTokensForExactTokensData);

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
      enabled: isEnabled && !tokenIn.isNFT && tokenOut.isNFT,
    });
  const {
    data: swapTokensForNftData,
    write: swapTokensForNft,
    status: swapTokensForNftStatus,
  } = useMagicSwapV2RouterSwapTokensForNft(swapTokensForNftConfig);
  const { isSuccess: isSwapTokensForNftSuccess } = useWaitForT(
    swapTokensForNftData,
    swapTokensForNftStatus,
    {
      loading: (
        <>
          Swapping {parseFloat(formatUnits(amountInMax)).toFixed(3)}{" "}
          {tokenIn?.symbol} <span className="text-night-600">for</span>{" "}
          {quantitiesOut.length} {tokenOut?.symbol}
          {quantitiesOut.length > 1 ? "S" : ""}
        </>
      ),
      success: "Success!",
      error: "Error!",
    }
  );

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
      enabled: isEnabled && tokenIn.isNFT && !tokenOut.isNFT,
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
      enabled: isEnabled && tokenIn.isNFT && tokenOut.isNFT,
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

      if (tokenIn.isNFT && tokenOut.isNFT) {
        swapNftForNft?.();
      } else if (tokenIn.isNFT) {
        swapNftForTokens?.();
      } else if (tokenOut.isNFT) {
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
