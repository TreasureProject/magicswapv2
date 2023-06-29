import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import { useWaitForTransaction } from "./useWaitForTransaction";
import { useAccount } from "~/contexts/account";
import {
  useMagicSwapV2RouterAddLiquidity,
  useMagicSwapV2RouterAddLiquidityNft,
  useMagicSwapV2RouterAddLiquidityNftnft,
  usePrepareMagicSwapV2RouterAddLiquidity,
  usePrepareMagicSwapV2RouterAddLiquidityNft,
  usePrepareMagicSwapV2RouterAddLiquidityNftnft,
} from "~/generated";
import { useStore } from "~/hooks/useStore";
import type { Pool } from "~/lib/pools.server";
import { DEFAULT_DEADLINE, useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountA: bigint;
  amountB: bigint;
  amountAMin: bigint;
  amountBMin: bigint;
  nftsA: TroveTokenWithQuantity[];
  nftsB: TroveTokenWithQuantity[];
  enabled?: boolean;
  statusHeader?: React.ReactNode;
  onSuccess: () => void;
};

export const useAddLiquidity = ({
  pool,
  amountA,
  amountB,
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
  const statusHeader = propsStatusHeader ?? `Deposit for ${pool.name} LP`;

  // ERC20-ERC20
  const { config: tokenAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidity({
      address: routerAddress,
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !pool.hasNFT,
    });
  const tokenAddLiquidity = useMagicSwapV2RouterAddLiquidity(
    tokenAddLiquidityConfig
  );
  useWaitForTransaction(
    { ...tokenAddLiquidity.data, onSuccess },
    tokenAddLiquidity.status,
    statusHeader
  );

  // NFT-ERC20
  const { config: nftAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidityNft({
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
        amountB,
        amountBMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !pool.isNFTNFT && pool.hasNFT,
    });
  const nftAddLiquidity = useMagicSwapV2RouterAddLiquidityNft(
    nftAddLiquidityConfig
  );
  useWaitForTransaction(
    { ...nftAddLiquidity.data, onSuccess },
    nftAddLiquidity.status,
    statusHeader
  );

  // NFT-NFT
  const { config: nftNFTAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidityNftnft({
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
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && pool.isNFTNFT,
    });
  const nftNFTAddLiquidity = useMagicSwapV2RouterAddLiquidityNftnft(
    nftNFTAddLiquidityConfig
  );
  useWaitForTransaction(
    { ...nftNFTAddLiquidity.data, onSuccess },
    nftNFTAddLiquidity.status,
    statusHeader
  );

  return {
    addLiquidity: () => {
      if (pool.isNFTNFT) {
        nftNFTAddLiquidity.write?.();
      } else if (pool.hasNFT) {
        nftAddLiquidity.write?.();
      } else {
        tokenAddLiquidity.write?.();
      }
    },
  };
};
