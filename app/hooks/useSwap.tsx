import { useState } from "react";

import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import { useAccount } from "~/contexts/account";
import {
  useSimulateMagicSwapV2RouterSwapExactTokensForTokens,
  useSimulateMagicSwapV2RouterSwapNftForNft,
  useSimulateMagicSwapV2RouterSwapNftForTokens,
  useSimulateMagicSwapV2RouterSwapTokensForExactTokens,
  useSimulateMagicSwapV2RouterSwapTokensForNft,
  useWriteMagicSwapV2RouterSwapExactTokensForTokens,
  useWriteMagicSwapV2RouterSwapNftForNft,
  useWriteMagicSwapV2RouterSwapNftForTokens,
  useWriteMagicSwapV2RouterSwapTokensForExactTokens,
  useWriteMagicSwapV2RouterSwapTokensForNft,
} from "~/generated";
import { useWaitForTransaction } from "~/hooks/useWaitForTransaction";
import { formatAmount } from "~/lib/currency";
import { bigIntToNumber } from "~/lib/number";
import { getAmountMax, getAmountMin } from "~/lib/pools";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type {
  AddressString,
  Optional,
  PoolToken,
  TroveTokenWithQuantity,
} from "~/types";

type Props = {
  tokenIn: PoolToken;
  tokenOut: Optional<PoolToken>;
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
  const routerAddress = useMagicSwapV2RouterAddress();
  const state = useSettingsStore();
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
  const deadline = BigInt(
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
  const { data: swapExactTokensForTokensConfig } =
    useSimulateMagicSwapV2RouterSwapExactTokensForTokens({
      address: routerAddress,
      args: [amountIn, amountOutMin, path, addressArg, deadline],
      query: {
        enabled: isEnabled && !tokenIn.isNFT && !tokenOut.isNFT && !isExactOut,
      },
    });
  const swapExactTokensForTokens =
    useWriteMagicSwapV2RouterSwapExactTokensForTokens();
  const { isSuccess: isSwapExactTokensForTokensSuccess } =
    useWaitForTransaction(
      { hash: swapExactTokensForTokens.data },
      swapExactTokensForTokens.status,
      statusHeader
    );

  // ERC20-ERC20, exact out
  const { data: swapTokensForExactTokensConfig } =
    useSimulateMagicSwapV2RouterSwapTokensForExactTokens({
      address: routerAddress,
      args: [amountOut, amountInMax, path, addressArg, deadline],
      query: {
        enabled: isEnabled && !tokenIn.isNFT && !tokenOut.isNFT && isExactOut,
      },
    });
  const swapTokensForExactTokens =
    useWriteMagicSwapV2RouterSwapTokensForExactTokens();
  const { isSuccess: isSwapTokensForExactTokensSuccess } =
    useWaitForTransaction(
      { hash: swapTokensForExactTokens.data },
      swapTokensForExactTokens.status,
      statusHeader
    );

  // ERC20-NFT
  const { data: swapTokensForNftConfig } =
    useSimulateMagicSwapV2RouterSwapTokensForNft({
      address: routerAddress,
      args: [
        collectionsOut,
        tokenIdsOut,
        quantitiesOut,
        amountInMax,
        path,
        addressArg,
        deadline,
      ],
      query: {
        enabled: isEnabled && !tokenIn.isNFT && tokenOut.isNFT,
      },
    });
  const swapTokensForNft = useWriteMagicSwapV2RouterSwapTokensForNft();
  const { isSuccess: isSwapTokensForNftSuccess } = useWaitForTransaction(
    { hash: swapTokensForNft.data },
    swapTokensForNft.status,
    statusHeader
  );

  // NFT-ERC20
  const { data: swapNftForTokensConfig } =
    useSimulateMagicSwapV2RouterSwapNftForTokens({
      address: routerAddress,
      args: [
        collectionsIn,
        tokenIdsIn,
        quantitiesIn,
        amountOutMin,
        path,
        addressArg,
        deadline,
      ],
      query: {
        enabled: isEnabled && tokenIn.isNFT && !tokenOut.isNFT,
      },
    });
  const swapNftForTokens = useWriteMagicSwapV2RouterSwapNftForTokens();
  const { isSuccess: isSwapNftForTokensSuccess } = useWaitForTransaction(
    { hash: swapNftForTokens.data },
    swapNftForTokens.status,
    statusHeader
  );

  // NFT-NFT
  const { data: swapNftForNftConfig } =
    useSimulateMagicSwapV2RouterSwapNftForNft({
      address: routerAddress,
      args: [
        collectionsIn,
        tokenIdsIn,
        quantitiesIn,
        collectionsOut,
        tokenIdsOut,
        quantitiesOut,
        path,
        addressArg,
        deadline,
      ],
      query: {
        enabled: isEnabled && tokenIn.isNFT && tokenOut.isNFT,
      },
    });
  const swapNftForNft = useWriteMagicSwapV2RouterSwapNftForNft();
  const { isSuccess: isSwapNftForNftSuccess } = useWaitForTransaction(
    { hash: swapNftForNft.data },
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

      if (tokenIn.isNFT && tokenOut.isNFT && swapNftForNftConfig?.request) {
        swapNftForNft.writeContract(swapNftForNftConfig?.request);
      } else if (tokenIn.isNFT && swapNftForTokensConfig?.request) {
        swapNftForTokens.writeContract(swapNftForTokensConfig?.request);
      } else if (tokenOut.isNFT && swapTokensForNftConfig?.request) {
        swapTokensForNft.writeContract(swapTokensForNftConfig?.request);
      } else if (isExactOut && swapTokensForExactTokensConfig?.request) {
        swapTokensForExactTokens.writeContract(
          swapTokensForExactTokensConfig?.request
        );
      } else if (swapExactTokensForTokensConfig?.request) {
        swapExactTokensForTokens.writeContract(
          swapExactTokensForTokensConfig?.request
        );
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
