import { useWaitForTransaction } from "./useWaitForTransaction";
import { useAccount } from "~/contexts/account";
import {
  useMagicSwapV2RouterRemoveLiquidity,
  useMagicSwapV2RouterRemoveLiquidityNft,
  usePrepareMagicSwapV2RouterRemoveLiquidity,
  usePrepareMagicSwapV2RouterRemoveLiquidityNft,
} from "~/generated";
import { useStore } from "~/hooks/useStore";
import type { Pool } from "~/lib/pools.server";
import { DEFAULT_DEADLINE, useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountLP: bigint;
  amountBaseMin: bigint;
  amountQuoteMin: bigint;
  nfts: TroveTokenWithQuantity[];
  enabled?: boolean;
  statusHeader?: React.ReactNode;
};

export const useRemoveLiquidity = ({
  pool,
  amountLP,
  amountBaseMin,
  amountQuoteMin,
  nfts,
  enabled = true,
  statusHeader: propsStatusHeader,
}: Props) => {
  const { address, addressArg } = useAccount();
  const deadline = useStore(useSettingsStore, (state) => state.deadline);

  const isEnabled = enabled && !!address;
  const deadlineBN = BigInt(
    Math.floor(Date.now() / 1000) + (deadline || DEFAULT_DEADLINE) * 60
  );
  const isNFT = pool.baseToken.isNFT || pool.quoteToken.isNFT;
  const statusHeader = propsStatusHeader ?? `Withdraw from ${pool.name} LP`;

  const { config: tokenRemoveLiquidityConfig } =
    usePrepareMagicSwapV2RouterRemoveLiquidity({
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountLP,
        amountBaseMin,
        amountQuoteMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !isNFT,
    });
  const tokenRemoveLiquidity = useMagicSwapV2RouterRemoveLiquidity(
    tokenRemoveLiquidityConfig
  );
  const { isSuccess: isTokenRemoveLiquiditySuccess } = useWaitForTransaction(
    tokenRemoveLiquidity.data,
    tokenRemoveLiquidity.status,
    statusHeader
  );

  const { config: nftRemoveLiquidityConfig } =
    usePrepareMagicSwapV2RouterRemoveLiquidityNft({
      args: [
        nfts.map(({ collectionAddr }) => collectionAddr as AddressString),
        nfts.map(({ tokenId }) => BigInt(tokenId)),
        nfts.map(({ quantity }) => BigInt(quantity)),
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountLP,
        amountBaseMin,
        amountQuoteMin,
        addressArg,
        deadlineBN,
        true, // swapLeftover
      ],
      enabled: isEnabled && isNFT,
    });
  const nftRemoveLiquidity = useMagicSwapV2RouterRemoveLiquidityNft(
    nftRemoveLiquidityConfig
  );
  const { isSuccess: isNFTRemoveLiquiditySuccess } = useWaitForTransaction(
    nftRemoveLiquidity.data,
    nftRemoveLiquidity.status,
    statusHeader
  );

  return {
    removeLiquidity: () => {
      if (isNFT) {
        nftRemoveLiquidity.write?.();
      } else {
        tokenRemoveLiquidity.write?.();
      }
    },
    isSuccess: isTokenRemoveLiquiditySuccess || isNFTRemoveLiquiditySuccess,
  };
};
