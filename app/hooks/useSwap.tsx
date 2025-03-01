import { useEffect } from "react";
import type { Address } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

import type { Token, TokenWithAmount } from "~/api/tokens.server";
import { useAccount } from "~/contexts/account";
import {
  useWriteMagicSwapV2RouterSwapEthForExactTokens,
  useWriteMagicSwapV2RouterSwapEthForNft,
  useWriteMagicSwapV2RouterSwapExactEthForTokens,
  useWriteMagicSwapV2RouterSwapExactTokensForEth,
  useWriteMagicSwapV2RouterSwapExactTokensForTokens,
  useWriteMagicSwapV2RouterSwapNftForEth,
  useWriteMagicSwapV2RouterSwapNftForNft,
  useWriteMagicSwapV2RouterSwapNftForTokens,
  useWriteMagicSwapV2RouterSwapTokensForExactEth,
  useWriteMagicSwapV2RouterSwapTokensForExactTokens,
  useWriteMagicSwapV2RouterSwapTokensForNft,
} from "~/generated";
import { getRouterContractAddress } from "~/lib/address";
import { formatAmount } from "~/lib/currency";
import { bigIntToNumber } from "~/lib/number";
import { getAmountMax, getAmountMin } from "~/lib/pools";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";
import type { Optional, Version } from "~/types";
import { useToast } from "./useToast";

type Props = {
  version: Version;
  tokenIn: Token;
  tokenOut: Optional<Token>;
  amountIn: bigint;
  amountOut: bigint;
  nftsIn: TokenWithAmount[];
  nftsOut: TokenWithAmount[];
  isExactOut: boolean;
  path: Address[];
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useSwap = ({
  version,
  tokenIn,
  tokenOut,
  amountIn,
  amountOut,
  nftsIn,
  nftsOut,
  isExactOut,
  path,
  enabled = true,
  onSuccess,
}: Props) => {
  const { address, addressArg } = useAccount();
  const routerAddress = getRouterContractAddress({
    chainId: tokenIn.chainId,
    version,
  });
  const state = useSettingsStore();

  const isEnabled = enabled && !!address && !!tokenOut;
  const amountInMax = isExactOut
    ? getAmountMax(amountIn, state?.slippage || DEFAULT_SLIPPAGE)
    : amountIn;
  const amountOutMin = isExactOut
    ? amountOut
    : getAmountMin(amountOut, state?.slippage || DEFAULT_SLIPPAGE);
  const collectionsIn = nftsIn.map(
    ({ collectionAddress }) => collectionAddress as Address,
  );
  const tokenIdsIn = nftsIn.map(({ tokenId }) => BigInt(tokenId));
  const quantitiesIn = nftsIn.map(({ amount }) => BigInt(amount));
  const collectionsOut = nftsOut.map(
    ({ collectionAddress }) => collectionAddress as Address,
  );
  const tokenIdsOut = nftsOut.map(({ tokenId }) => BigInt(tokenId));
  const quantitiesOut = nftsOut.map(({ amount }) => BigInt(amount));
  const deadline = BigInt(
    Math.floor(Date.now() / 1000) + (state?.deadline || 30) * 60,
  );

  const swapExactTokensForTokens =
    useWriteMagicSwapV2RouterSwapExactTokensForTokens();
  const swapExactTokensForTokensReceipt = useWaitForTransactionReceipt({
    hash: swapExactTokensForTokens.data,
  });

  const swapTokensForExactTokens =
    useWriteMagicSwapV2RouterSwapTokensForExactTokens();
  const swapTokensForExactTokensReceipt = useWaitForTransactionReceipt({
    hash: swapTokensForExactTokens.data,
  });

  const swapExactTokensForETH =
    useWriteMagicSwapV2RouterSwapExactTokensForEth();
  const swapExactTokensForETHReceipt = useWaitForTransactionReceipt({
    hash: swapExactTokensForETH.data,
  });

  const swapTokensForExactETH =
    useWriteMagicSwapV2RouterSwapTokensForExactEth();
  const swapTokensForExactETHReceipt = useWaitForTransactionReceipt({
    hash: swapTokensForExactETH.data,
  });

  const swapETHForExactTokens =
    useWriteMagicSwapV2RouterSwapEthForExactTokens();
  const swapETHForExactTokensReceipt = useWaitForTransactionReceipt({
    hash: swapETHForExactTokens.data,
  });

  const swapExactETHForTokens =
    useWriteMagicSwapV2RouterSwapExactEthForTokens();
  const swapExactETHForTokensReceipt = useWaitForTransactionReceipt({
    hash: swapExactETHForTokens.data,
  });

  const swapTokensForNFT = useWriteMagicSwapV2RouterSwapTokensForNft();
  const swapTokensForNFTReceipt = useWaitForTransactionReceipt({
    hash: swapTokensForNFT.data,
  });

  const swapNFTForTokens = useWriteMagicSwapV2RouterSwapNftForTokens();
  const swapNFTForTokensReceipt = useWaitForTransactionReceipt({
    hash: swapNFTForTokens.data,
  });

  const swapETHForNFT = useWriteMagicSwapV2RouterSwapEthForNft();
  const swapETHForNFTReceipt = useWaitForTransactionReceipt({
    hash: swapETHForNFT.data,
  });

  const swapNFTForETH = useWriteMagicSwapV2RouterSwapNftForEth();
  const swapNFTForETHReceipt = useWaitForTransactionReceipt({
    hash: swapNFTForETH.data,
  });

  const swapNFTForNFT = useWriteMagicSwapV2RouterSwapNftForNft();
  const swapNFTForNFTReceipt = useWaitForTransactionReceipt({
    hash: swapNFTForNFT.data,
  });

  const isSuccess =
    swapExactTokensForTokensReceipt.isSuccess ||
    swapTokensForExactTokensReceipt.isSuccess ||
    swapExactTokensForETHReceipt.isSuccess ||
    swapTokensForExactETHReceipt.isSuccess ||
    swapETHForExactTokensReceipt.isSuccess ||
    swapExactETHForTokensReceipt.isSuccess ||
    swapTokensForNFTReceipt.isSuccess ||
    swapNFTForTokensReceipt.isSuccess ||
    swapETHForNFTReceipt.isSuccess ||
    swapNFTForETHReceipt.isSuccess ||
    swapNFTForNFTReceipt.isSuccess;

  useToast({
    title: `Swap ${formatAmount(bigIntToNumber(amountIn))} ${
      tokenIn.symbol
    } for ${formatAmount(bigIntToNumber(amountOut))} ${tokenOut?.symbol}`,
    isLoading:
      swapExactTokensForTokens.isPending ||
      swapExactTokensForTokensReceipt.isLoading ||
      swapTokensForExactTokens.isPending ||
      swapTokensForExactTokensReceipt.isLoading ||
      swapExactTokensForETH.isPending ||
      swapExactTokensForETHReceipt.isLoading ||
      swapTokensForExactETH.isPending ||
      swapTokensForExactETHReceipt.isLoading ||
      swapETHForExactTokens.isPending ||
      swapETHForExactTokensReceipt.isLoading ||
      swapExactETHForTokens.isPending ||
      swapExactETHForTokensReceipt.isLoading ||
      swapTokensForNFT.isPending ||
      swapTokensForNFTReceipt.isLoading ||
      swapNFTForTokens.isPending ||
      swapNFTForTokensReceipt.isLoading ||
      swapETHForNFT.isPending ||
      swapETHForNFTReceipt.isLoading ||
      swapNFTForETH.isPending ||
      swapNFTForETHReceipt.isLoading ||
      swapNFTForNFT.isPending ||
      swapNFTForNFTReceipt.isLoading,
    isSuccess,
    isError:
      swapExactTokensForTokens.isError ||
      swapExactTokensForTokensReceipt.isError ||
      swapTokensForExactTokens.isError ||
      swapTokensForExactTokensReceipt.isError ||
      swapExactTokensForETH.isError ||
      swapExactTokensForETHReceipt.isError ||
      swapTokensForExactETH.isError ||
      swapTokensForExactETHReceipt.isError ||
      swapETHForExactTokens.isError ||
      swapETHForExactTokensReceipt.isError ||
      swapExactETHForTokens.isError ||
      swapExactETHForTokensReceipt.isError ||
      swapTokensForNFT.isError ||
      swapTokensForNFTReceipt.isError ||
      swapNFTForTokens.isError ||
      swapNFTForTokensReceipt.isError ||
      swapETHForNFT.isError ||
      swapETHForNFTReceipt.isError ||
      swapNFTForETH.isError ||
      swapNFTForETHReceipt.isError ||
      swapNFTForNFT.isError ||
      swapNFTForNFTReceipt.isError,
    errorDescription: (
      swapExactTokensForTokens.error ||
      swapExactTokensForTokensReceipt.error ||
      swapTokensForExactTokens.error ||
      swapTokensForExactTokensReceipt.error ||
      swapExactTokensForETH.error ||
      swapExactTokensForETHReceipt.error ||
      swapTokensForExactETH.error ||
      swapTokensForExactETHReceipt.error ||
      swapETHForExactTokens.error ||
      swapETHForExactTokensReceipt.error ||
      swapExactETHForTokens.error ||
      swapExactETHForTokensReceipt.error ||
      swapTokensForNFT.error ||
      swapTokensForNFTReceipt.error ||
      swapNFTForTokens.error ||
      swapNFTForTokensReceipt.error ||
      swapETHForNFT.error ||
      swapETHForNFTReceipt.error ||
      swapNFTForETH.error ||
      swapNFTForETHReceipt.error ||
      swapNFTForNFT.error ||
      swapNFTForNFTReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    amountInMax,
    amountOutMin,
    swap: () => {
      if (!isEnabled) {
        return;
      }

      if (tokenIn.isVault && tokenOut.isVault) {
        // NFT-NFT
        return swapNFTForNFT.writeContractAsync({
          chainId: tokenIn.chainId,
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
        });
      }

      if (tokenIn.isVault) {
        if (tokenOut.isEth) {
          // NFT-ETH
          return swapNFTForETH.writeContractAsync({
            chainId: tokenIn.chainId,
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
          });
        }

        // NFT-ERC20
        return swapNFTForTokens.writeContractAsync({
          chainId: tokenIn.chainId,
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
        });
      }

      if (tokenOut.isVault) {
        if (tokenIn.isEth) {
          // ETH-NFT
          return swapETHForNFT.writeContractAsync({
            chainId: tokenIn.chainId,
            address: routerAddress,
            args: [
              collectionsOut,
              tokenIdsOut,
              quantitiesOut,
              path,
              addressArg,
              deadline,
            ],
            value: amountInMax,
          });
        }

        // ERC20-NFT
        return swapTokensForNFT.writeContractAsync({
          chainId: tokenIn.chainId,
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
        });
      }

      if (tokenIn.isEth) {
        // ETH-ERC20 exact out
        if (isExactOut) {
          return swapETHForExactTokens.writeContractAsync({
            chainId: tokenIn.chainId,
            address: routerAddress,
            args: [amountOut, path, addressArg, deadline],
            value: amountInMax,
          });
        }

        // ETH-ERC20 exact in
        return swapExactETHForTokens.writeContractAsync({
          chainId: tokenIn.chainId,
          address: routerAddress,
          args: [amountOutMin, path, addressArg, deadline],
          value: amountIn,
        });
      }

      if (tokenOut.isEth) {
        // ERC20-ETH exact out
        if (isExactOut) {
          return swapTokensForExactETH.writeContractAsync({
            chainId: tokenIn.chainId,
            address: routerAddress,
            args: [amountOut, amountInMax, path, addressArg, deadline],
          });
        }

        // ERC20-ETH exact in
        return swapExactTokensForETH.writeContractAsync({
          chainId: tokenIn.chainId,
          address: routerAddress,
          args: [amountIn, amountOutMin, path, addressArg, deadline],
        });
      }

      // ERC20-ERC20 exact out
      if (isExactOut) {
        return swapTokensForExactTokens.writeContractAsync({
          chainId: tokenIn.chainId,
          address: routerAddress,
          args: [amountOut, amountInMax, path, addressArg, deadline],
        });
      }

      // ERC20-ERC20 exact in
      return swapExactTokensForTokens.writeContractAsync({
        chainId: tokenIn.chainId,
        address: routerAddress,
        args: [amountIn, amountOutMin, path, addressArg, deadline],
      });
    },
  };
};
