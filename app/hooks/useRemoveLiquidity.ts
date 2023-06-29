import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import { useWaitForTransaction } from "./useWaitForTransaction";
import { useAccount } from "~/contexts/account";
import {
  useMagicSwapV2RouterRemoveLiquidity,
  useMagicSwapV2RouterRemoveLiquidityNft,
  useMagicSwapV2RouterRemoveLiquidityNftnft,
  usePrepareMagicSwapV2RouterRemoveLiquidity,
  usePrepareMagicSwapV2RouterRemoveLiquidityNft,
  usePrepareMagicSwapV2RouterRemoveLiquidityNftnft,
} from "~/generated";
import { useStore } from "~/hooks/useStore";
import type { Pool } from "~/lib/pools.server";
import { DEFAULT_DEADLINE, useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountLP: bigint;
  amountAMin: bigint;
  amountBMin: bigint;
  nftsA: TroveTokenWithQuantity[];
  nftsB: TroveTokenWithQuantity[];
  enabled?: boolean;
  statusHeader?: React.ReactNode;
  onSuccess: () => void;
};

export const useRemoveLiquidity = ({
  pool,
  amountLP,
  amountAMin,
  amountBMin,
  nftsA,
  nftsB,
  enabled = true,
  statusHeader: propsStatusHeader,
  onSuccess,
}: Props) => {
  const { address, addressArg } = useAccount();
  const routerAddress = useMagicSwapV2RouterAddress();
  const deadline = useStore(useSettingsStore, (state) => state.deadline);

  const isEnabled = enabled && !!address;
  const deadlineBN = BigInt(
    Math.floor(Date.now() / 1000) + (deadline || DEFAULT_DEADLINE) * 60
  );
  const statusHeader = propsStatusHeader ?? `Withdraw from ${pool.name} LP`;

  // ERC20-ERC20
  const { config: tokenRemoveLiquidityConfig } =
    usePrepareMagicSwapV2RouterRemoveLiquidity({
      address: routerAddress,
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountLP,
        amountAMin,
        amountBMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !pool.hasNFT,
    });
  const tokenRemoveLiquidity = useMagicSwapV2RouterRemoveLiquidity(
    tokenRemoveLiquidityConfig
  );
  useWaitForTransaction(
    { ...tokenRemoveLiquidity.data, onSuccess },
    tokenRemoveLiquidity.status,
    statusHeader
  );

  // NFT-ERC20
  const { config: nftRemoveLiquidityConfig } =
    usePrepareMagicSwapV2RouterRemoveLiquidityNft({
      address: routerAddress,
      args: [
        {
          token: pool.baseToken.id as AddressString,
          collection: nftsA.map(
            ({ collectionAddr }) => collectionAddr as AddressString
          ),
          tokenId: nftsA.map(({ tokenId }) => BigInt(tokenId)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        pool.quoteToken.id as AddressString,
        amountLP,
        amountAMin,
        amountBMin,
        addressArg,
        deadlineBN,
        true, // swapLeftover
      ],
      enabled: isEnabled && !pool.isNFTNFT && pool.hasNFT,
    });
  const nftRemoveLiquidity = useMagicSwapV2RouterRemoveLiquidityNft(
    nftRemoveLiquidityConfig
  );
  useWaitForTransaction(
    { ...nftRemoveLiquidity.data, onSuccess },
    nftRemoveLiquidity.status,
    statusHeader
  );

  // NFT-NFT
  const { config: nftNFTRemoveLiquidityConfig } =
    usePrepareMagicSwapV2RouterRemoveLiquidityNftnft({
      address: routerAddress,
      args: [
        {
          token: pool.baseToken.id as AddressString,
          collection: nftsA.map(
            ({ collectionAddr }) => collectionAddr as AddressString
          ),
          tokenId: nftsA.map(({ tokenId }) => BigInt(tokenId)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        {
          token: pool.quoteToken.id as AddressString,
          collection: nftsB.map(
            ({ collectionAddr }) => collectionAddr as AddressString
          ),
          tokenId: nftsB.map(({ tokenId }) => BigInt(tokenId)),
          amount: nftsB.map(({ quantity }) => BigInt(quantity)),
        },
        amountLP,
        amountAMin,
        amountBMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && pool.isNFTNFT,
    });
  const nftNFTRemoveLiquidity = useMagicSwapV2RouterRemoveLiquidityNftnft(
    nftNFTRemoveLiquidityConfig
  );
  useWaitForTransaction(
    { ...nftNFTRemoveLiquidity.data, onSuccess },
    nftNFTRemoveLiquidity.status,
    statusHeader
  );

  return {
    removeLiquidity: () => {
      if (pool.isNFTNFT) {
        nftNFTRemoveLiquidity.write?.();
      } else if (pool.hasNFT) {
        nftRemoveLiquidity.write?.();
      } else {
        tokenRemoveLiquidity.write?.();
      }
    },
  };
};
