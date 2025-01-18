import { useEffect } from "react";

import { useWaitForTransactionReceipt } from "wagmi";
import { useAccount } from "~/contexts/account";
import {
  useWriteMagicSwapV2RouterRemoveLiquidity,
  useWriteMagicSwapV2RouterRemoveLiquidityEth,
  useWriteMagicSwapV2RouterRemoveLiquidityNft,
  useWriteMagicSwapV2RouterRemoveLiquidityNfteth,
  useWriteMagicSwapV2RouterRemoveLiquidityNftnft,
} from "~/generated";
import { getRouterContractAddress } from "~/lib/address";
import { useSettingsStore } from "~/store/settings";
import type { AddressString, Pool, TokenWithAmount } from "~/types";
import { useToast } from "./useToast";

type Props = {
  pool: Pool;
  amountLP: bigint;
  amount0Min: bigint;
  amount1Min: bigint;
  nfts0: TokenWithAmount[];
  nfts1: TokenWithAmount[];
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useRemoveLiquidity = ({
  pool,
  amountLP,
  amount0Min,
  amount1Min,
  nfts0,
  nfts1,
  enabled = true,
  onSuccess,
}: Props) => {
  const { address, addressArg } = useAccount();
  const routerAddress = getRouterContractAddress({
    chainId: pool.chainId,
    version: pool.version,
  });
  const deadlineMinutes = useSettingsStore((state) => state.deadline);

  const isEnabled = enabled && !!address;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);

  const removeLiquidity = useWriteMagicSwapV2RouterRemoveLiquidity();
  const removeLiquidityReceipt = useWaitForTransactionReceipt({
    hash: removeLiquidity.data,
  });

  const removeLiquidityETH = useWriteMagicSwapV2RouterRemoveLiquidityEth();
  const removeLiquidityETHReceipt = useWaitForTransactionReceipt({
    hash: removeLiquidityETH.data,
  });

  const removeLiquidityNFT = useWriteMagicSwapV2RouterRemoveLiquidityNft();
  const removeLiquidityNFTReceipt = useWaitForTransactionReceipt({
    hash: removeLiquidityNFT.data,
  });

  const removeLiquidityNFTETH =
    useWriteMagicSwapV2RouterRemoveLiquidityNfteth();
  const removeLiquidityNFTETHReceipt = useWaitForTransactionReceipt({
    hash: removeLiquidityNFTETH.data,
  });

  const removeLiquidityNFTNFT =
    useWriteMagicSwapV2RouterRemoveLiquidityNftnft();
  const removeLiquidityNFTNFTReceipt = useWaitForTransactionReceipt({
    hash: removeLiquidityNFTNFT.data,
  });

  const isSuccess =
    removeLiquidityReceipt.isSuccess ||
    removeLiquidityETHReceipt.isSuccess ||
    removeLiquidityNFTReceipt.isSuccess ||
    removeLiquidityNFTETHReceipt.isSuccess ||
    removeLiquidityNFTNFTReceipt.isSuccess;

  useToast({
    title: `Remove liquidity from ${pool.name}`,
    isLoading:
      removeLiquidity.isPending ||
      removeLiquidityReceipt.isLoading ||
      removeLiquidityETH.isPending ||
      removeLiquidityETHReceipt.isLoading ||
      removeLiquidityNFT.isPending ||
      removeLiquidityNFTReceipt.isLoading ||
      removeLiquidityNFTETH.isPending ||
      removeLiquidityNFTETHReceipt.isLoading ||
      removeLiquidityNFTNFT.isPending ||
      removeLiquidityNFTNFTReceipt.isLoading,
    isSuccess,
    isError:
      removeLiquidity.isError ||
      removeLiquidityReceipt.isError ||
      removeLiquidityETH.isError ||
      removeLiquidityETHReceipt.isError ||
      removeLiquidityNFT.isError ||
      removeLiquidityNFTReceipt.isError ||
      removeLiquidityNFTETH.isError ||
      removeLiquidityNFTETHReceipt.isError ||
      removeLiquidityNFTNFT.isError ||
      removeLiquidityNFTNFTReceipt.isError,
    errorDescription: (
      removeLiquidity.error ||
      removeLiquidityReceipt.error ||
      removeLiquidityETH.error ||
      removeLiquidityETHReceipt.error ||
      removeLiquidityNFT.error ||
      removeLiquidityNFTReceipt.error ||
      removeLiquidityNFTETH.error ||
      removeLiquidityNFTETHReceipt.error ||
      removeLiquidityNFTNFT.error ||
      removeLiquidityNFTNFTReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  const isTokenAToken1 =
    pool.token1.isEth ||
    (pool.token1.isVault && !pool.isVaultVault && !pool.token0.isEth);
  const tokenA = (
    isTokenAToken1 ? pool.token1Address : pool.token0Address
  ) as AddressString;
  const tokenB = (
    isTokenAToken1 ? pool.token0Address : pool.token1Address
  ) as AddressString;
  const amountAMin = isTokenAToken1 ? amount1Min : amount0Min;
  const amountBMin = isTokenAToken1 ? amount0Min : amount1Min;
  const nftsA = isTokenAToken1 ? nfts1 : nfts0;
  const nftsB = isTokenAToken1 ? nfts0 : nfts1;

  return {
    removeLiquidity: () => {
      if (!isEnabled) {
        return;
      }

      if (pool.isVaultVault) {
        // NFT-NFT
        return removeLiquidityNFTNFT.writeContractAsync({
          address: routerAddress,
          args: [
            {
              token: tokenA,
              collection: nftsA.map(
                ({ collectionAddress }) => collectionAddress as AddressString,
              ),
              tokenId: nftsA.map(({ tokenId }) => BigInt(tokenId)),
              amount: nftsA.map(({ amount }) => BigInt(amount)),
            },
            {
              token: tokenB,
              collection: nftsB.map(
                ({ collectionAddress }) => collectionAddress as AddressString,
              ),
              tokenId: nftsB.map(({ tokenId }) => BigInt(tokenId)),
              amount: nftsB.map(({ amount }) => BigInt(amount)),
            },
            amountLP,
            amountAMin,
            amountBMin,
            addressArg,
            deadline,
          ],
        });
      }

      if (pool.hasVault) {
        if (pool.token0.isEth || pool.token1.isEth) {
          // NFT-ETH
          return removeLiquidityNFTETH.writeContractAsync({
            address: routerAddress,
            args: [
              {
                token: tokenB,
                collection: nftsB.map(
                  ({ collectionAddress }) => collectionAddress as AddressString,
                ),
                tokenId: nftsB.map(({ tokenId }) => BigInt(tokenId)),
                amount: nftsB.map(({ amount }) => BigInt(amount)),
              },
              amountLP,
              amountBMin,
              amountAMin,
              addressArg,
              deadline,
              true, // swapLeftover
            ],
          });
        }

        // NFT-ERC20
        return removeLiquidityNFT.writeContractAsync({
          address: routerAddress,
          args: [
            {
              token: tokenA,
              collection: nftsA.map(
                ({ collectionAddress }) => collectionAddress as AddressString,
              ),
              tokenId: nftsA.map(({ tokenId }) => BigInt(tokenId)),
              amount: nftsA.map(({ amount }) => BigInt(amount)),
            },
            tokenB,
            amountLP,
            amountAMin,
            amountBMin,
            addressArg,
            deadline,
            true, // swapLeftover
          ],
        });
      }

      if (pool.token0.isEth || pool.token1.isEth) {
        // ERC20-ETH
        return removeLiquidityETH.writeContractAsync({
          address: routerAddress,
          args: [
            tokenB,
            amountLP,
            amountBMin,
            amountAMin,
            addressArg,
            deadline,
          ],
        });
      }

      // ERC20-ERC20
      return removeLiquidity.writeContractAsync({
        address: routerAddress,
        args: [
          tokenA,
          tokenB,
          amountLP,
          amountAMin,
          amountBMin,
          addressArg,
          deadline,
        ],
      });
    },
  };
};
