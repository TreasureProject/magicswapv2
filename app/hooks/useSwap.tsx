import { useState } from "react";

import { useAccount } from "~/contexts/account";
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
import { useStore } from "~/hooks/useStore";
import {
  useWaitForTransaction as useWaitForT,
  useWaitForTransaction,
} from "~/hooks/useWaitForTransaction";
import { formatAmount } from "~/lib/currency";
import { bigIntToNumber } from "~/lib/number";
import { getAmountMax, getAmountMin } from "~/lib/pools";
import type { PoolToken } from "~/lib/tokens.server";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  tokenIn: PoolToken;
  tokenOut: PoolToken | null;
  amountIn: bigint;
  amountOut: bigint;
  nftsIn: TroveTokenWithQuantity[];
  nftsOut: TroveTokenWithQuantity[];
  isExactOut: boolean;
  path: AddressString[];
  enabled?: boolean;
  statusHeader?: React.ReactNode;
};

export const useSwap = ({
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  nftsIn,
  nftsOut,
  isExactOut,
  path,
  enabled = true,
  statusHeader: propsStatusHeader,
}: Props) => {
  const { address, addressArg } = useAccount();
  const state = useStore(useSettingsStore, (state) => state);
  const [statusHeader, setStatusHeader] = useState<React.ReactNode>("");

  const isEnabled = enabled && !!address && !!tokenOut;
  const amountInMax = isExactOut
    ? getAmountMax(amountIn, state?.slippage || DEFAULT_SLIPPAGE)
    : amountIn;
  const amountOutMin = isExactOut
    ? amountOut
    : getAmountMin(amountOut, state?.slippage || DEFAULT_SLIPPAGE);
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
  const deadlineBN = BigInt(
    Math.floor(Date.now() / 1000) + (state?.deadline || 30) * 60
  );

  const updateStatusHeader = () => {
    setStatusHeader(
      propsStatusHeader ??
        `Swap ${formatAmount(bigIntToNumber(amountIn))} ${
          tokenIn.symbol
        } for ${formatAmount(bigIntToNumber(amountOut))} ${tokenOut?.symbol}`
    );
  };

  // ERC20-ERC20, exact in
  const { config: swapExactTokensForTokensConfig } =
    usePrepareMagicSwapV2RouterSwapExactTokensForTokens({
      args: [amountIn, amountOutMin, path, addressArg, deadlineBN],
      enabled: isEnabled && !tokenIn.isNFT && !tokenOut.isNFT && !isExactOut,
    });
  const swapExactTokensForTokens = useMagicSwapV2RouterSwapExactTokensForTokens(
    swapExactTokensForTokensConfig
  );
  const { isSuccess: isSwapExactTokensForTokensSuccess } =
    useWaitForTransaction(
      swapExactTokensForTokens.data,
      swapExactTokensForTokens.status,
      statusHeader
    );

  // ERC20-ERC20, exact out
  const { config: swapTokensForExactTokensConfig } =
    usePrepareMagicSwapV2RouterSwapTokensForExactTokens({
      args: [amountOut, amountInMax, path, addressArg, deadlineBN],
      enabled: isEnabled && !tokenIn.isNFT && !tokenOut.isNFT && isExactOut,
    });
  const swapTokensForExactTokens = useMagicSwapV2RouterSwapTokensForExactTokens(
    swapTokensForExactTokensConfig
  );
  const { isSuccess: isSwapTokensForExactTokensSuccess } =
    useWaitForTransaction(
      swapTokensForExactTokens.data,
      swapTokensForExactTokens.status,
      statusHeader
    );

  const { config: swapTokensForNftConfig } =
    usePrepareMagicSwapV2RouterSwapTokensForNft({
      args: [
        collectionsOut,
        tokenIdsOut,
        quantitiesOut,
        amountInMax,
        path,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !tokenIn.isNFT && tokenOut.isNFT,
    });
  const swapTokensForNft = useMagicSwapV2RouterSwapTokensForNft(
    swapTokensForNftConfig
  );
  const { isSuccess: isSwapTokensForNftSuccess } = useWaitForT(
    swapTokensForNft.data,
    swapTokensForNft.status,
    statusHeader
  );

  // NFT-ERC20
  const { config: swapNftForTokensConfig } =
    usePrepareMagicSwapV2RouterSwapNftForTokens({
      args: [
        collectionsIn,
        tokenIdsIn,
        quantitiesIn,
        amountOutMin,
        path,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && tokenIn.isNFT && !tokenOut.isNFT,
    });
  const swapNftForTokens = useMagicSwapV2RouterSwapNftForTokens(
    swapNftForTokensConfig
  );
  const { isSuccess: isSwapNftForTokensSuccess } = useWaitForTransaction(
    swapNftForTokens.data,
    swapNftForTokens.status,
    statusHeader
  );

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
        path,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && tokenIn.isNFT && tokenOut.isNFT,
    });
  const swapNftForNft = useMagicSwapV2RouterSwapNftForNft(swapNftForNftConfig);
  const { isSuccess: isSwapNftForNftSuccess } = useWaitForTransaction(
    swapNftForNft.data,
    swapNftForNft.status,
    statusHeader
  );

  return {
    amountInMax,
    amountOutMin,
    swap: () => {
      if (!isEnabled) {
        return;
      }

      updateStatusHeader();

      if (tokenIn.isNFT && tokenOut.isNFT) {
        swapNftForNft.write?.();
      } else if (tokenIn.isNFT) {
        swapNftForTokens.write?.();
      } else if (tokenOut.isNFT) {
        swapTokensForNft.write?.();
      } else if (isExactOut) {
        swapTokensForExactTokens.write?.();
      } else {
        swapExactTokensForTokens.write?.();
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
