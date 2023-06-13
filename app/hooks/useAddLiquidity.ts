import { useWaitForTransaction } from "./useWaitForTransaction";
import { useAccount } from "~/contexts/account";
import {
  useMagicSwapV2RouterAddLiquidity,
  useMagicSwapV2RouterAddLiquidityNft,
  usePrepareMagicSwapV2RouterAddLiquidity,
  usePrepareMagicSwapV2RouterAddLiquidityNft,
} from "~/generated";
import { useStore } from "~/hooks/useStore";
import type { Pool } from "~/lib/pools.server";
import { DEFAULT_DEADLINE, useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountBase: bigint;
  amountQuote: bigint;
  amountBaseMin: bigint;
  amountQuoteMin: bigint;
  nfts: TroveTokenWithQuantity[];
  enabled?: boolean;
  statusHeader?: React.ReactNode;
};

export const useAddLiquidity = ({
  pool,
  amountBase,
  amountQuote,
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
  const statusHeader = propsStatusHeader ?? `Deposit for ${pool.name} LP`;

  const { config: tokenAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidity({
      args: [
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountBase,
        amountQuote,
        amountBaseMin,
        amountQuoteMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && !isNFT,
    });
  const tokenAddLiquidity = useMagicSwapV2RouterAddLiquidity(
    tokenAddLiquidityConfig
  );
  const { isSuccess: isTokenAddLiquiditySuccess } = useWaitForTransaction(
    tokenAddLiquidity.data,
    tokenAddLiquidity.status,
    statusHeader
  );

  const { config: nftAddLiquidityConfig } =
    usePrepareMagicSwapV2RouterAddLiquidityNft({
      args: [
        nfts.map(({ collectionAddr }) => collectionAddr as AddressString),
        nfts.map(({ tokenId }) => BigInt(tokenId)),
        nfts.map(({ quantity }) => BigInt(quantity)),
        pool.baseToken.id as AddressString,
        pool.quoteToken.id as AddressString,
        amountQuote,
        amountQuoteMin,
        addressArg,
        deadlineBN,
      ],
      enabled: isEnabled && isNFT,
    });
  const nftAddLiquidity = useMagicSwapV2RouterAddLiquidityNft(
    nftAddLiquidityConfig
  );
  const { isSuccess: isNFTAddLiquiditySuccess } = useWaitForTransaction(
    nftAddLiquidity.data,
    nftAddLiquidity.status,
    statusHeader
  );

  return {
    addLiquidity: () => {
      if (isNFT) {
        nftAddLiquidity.write?.();
      } else {
        tokenAddLiquidity.write?.();
      }
    },
    isSuccess: isTokenAddLiquiditySuccess || isNFTAddLiquiditySuccess,
  };
};
