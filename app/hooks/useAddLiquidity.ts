import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import { useWaitForTransaction } from "./useWaitForTransaction";
import { useAccount } from "~/contexts/account";
import {
  useSimulateMagicSwapV2RouterAddLiquidity,
  useSimulateMagicSwapV2RouterAddLiquidityNft,
  useSimulateMagicSwapV2RouterAddLiquidityNftnft,
  useWriteMagicSwapV2RouterAddLiquidity,
  useWriteMagicSwapV2RouterAddLiquidityNft,
  useWriteMagicSwapV2RouterAddLiquidityNftnft,
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
  const { data: tokenAddLiquidityConfig } =
    useSimulateMagicSwapV2RouterAddLiquidity({
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
      query: {
        enabled: isEnabled && !pool.hasNFT,
      },
    });
  const tokenAddLiquidity = useWriteMagicSwapV2RouterAddLiquidity();

  useWaitForTransaction(
    { hash: tokenAddLiquidity.data },
    tokenAddLiquidity.status,
    statusHeader
  );

  // NFT-ERC20
  const { data: nftAddLiquidityConfig } =
    useSimulateMagicSwapV2RouterAddLiquidityNft({
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
      query: {
        enabled: isEnabled && !pool.isNFTNFT && pool.hasNFT,
      },
    });
  const nftAddLiquidity = useWriteMagicSwapV2RouterAddLiquidityNft();

  useWaitForTransaction(
    { hash: nftAddLiquidity.data },
    nftAddLiquidity.status,
    statusHeader
  );

  // NFT-NFT
  const { data: nftNFTAddLiquidityConfig } =
    useSimulateMagicSwapV2RouterAddLiquidityNftnft({
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
      query: {
        enabled: isEnabled && pool.isNFTNFT,
      },
    });
  const nftNFTAddLiquidity = useWriteMagicSwapV2RouterAddLiquidityNftnft();
  useWaitForTransaction(
    { hash: nftNFTAddLiquidity.data },
    nftNFTAddLiquidity.status,
    statusHeader
  );

  return {
    addLiquidity: () => {
      if (pool.isNFTNFT && nftNFTAddLiquidityConfig?.request) {
        nftNFTAddLiquidity.writeContract(nftNFTAddLiquidityConfig?.request);
      } else if (pool.hasNFT && nftAddLiquidityConfig?.request) {
        nftAddLiquidity.writeContract(nftAddLiquidityConfig?.request);
      } else if (tokenAddLiquidityConfig?.request) {
        tokenAddLiquidity.writeContract(tokenAddLiquidityConfig?.request);
      }
    },
  };
};
