import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import { useWaitForTransaction } from "./useWaitForTransaction";
import { useAccount } from "~/contexts/account";
import {
  useSimulateMagicSwapV2RouterRemoveLiquidity,
  useSimulateMagicSwapV2RouterRemoveLiquidityNft,
  useSimulateMagicSwapV2RouterRemoveLiquidityNftnft,
  useWriteMagicSwapV2RouterRemoveLiquidity,
  useWriteMagicSwapV2RouterRemoveLiquidityNft,
  useWriteMagicSwapV2RouterRemoveLiquidityNftnft,
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
  const deadline = useSettingsStore((state) => state.deadline);

  const isEnabled = enabled && !!address;
  const deadlineBN = BigInt(
    Math.floor(Date.now() / 1000) + (deadline || DEFAULT_DEADLINE) * 60
  );
  const statusHeader = propsStatusHeader ?? `Withdraw from ${pool.name} LP`;

  // ERC20-ERC20
  const { data: tokenRemoveLiquidityConfig } =
    useSimulateMagicSwapV2RouterRemoveLiquidity({
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
      query: {
        enabled: isEnabled && !pool.hasNFT,
      },
    });
  const tokenRemoveLiquidity = useWriteMagicSwapV2RouterRemoveLiquidity();
  useWaitForTransaction(
    { hash: tokenRemoveLiquidity.data },
    tokenRemoveLiquidity.status,
    statusHeader
  );

  // NFT-ERC20
  const { data: nftRemoveLiquidityConfig } =
    useSimulateMagicSwapV2RouterRemoveLiquidityNft({
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
      query: {
        enabled: isEnabled && !pool.isNFTNFT && pool.hasNFT,
      },
    });
  const nftRemoveLiquidity = useWriteMagicSwapV2RouterRemoveLiquidityNft();
  useWaitForTransaction(
    { hash: nftRemoveLiquidity.data },
    nftRemoveLiquidity.status,
    statusHeader
  );

  // NFT-NFT
  const { data: nftNFTRemoveLiquidityConfig } =
    useSimulateMagicSwapV2RouterRemoveLiquidityNftnft({
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
      query: {
        enabled: isEnabled && pool.isNFTNFT,
      },
    });
  const nftNFTRemoveLiquidity =
    useWriteMagicSwapV2RouterRemoveLiquidityNftnft();
  useWaitForTransaction(
    { hash: nftNFTRemoveLiquidity.data },
    nftNFTRemoveLiquidity.status,
    statusHeader
  );

  return {
    removeLiquidity: () => {
      if (pool.isNFTNFT && nftNFTRemoveLiquidityConfig?.request) {
        nftNFTRemoveLiquidity.writeContract(
          nftNFTRemoveLiquidityConfig?.request
        );
      } else if (pool.hasNFT && nftRemoveLiquidityConfig?.request) {
        nftRemoveLiquidity.writeContract(nftRemoveLiquidityConfig?.request);
      } else if (tokenRemoveLiquidityConfig?.request) {
        tokenRemoveLiquidity.writeContract(tokenRemoveLiquidityConfig?.request);
      }
    },
  };
};
