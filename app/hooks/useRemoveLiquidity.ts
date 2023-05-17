import { useWaitForTransaction } from "wagmi";

import { useAccount } from "~/contexts/account";
import { useSettings } from "~/contexts/settings";
import {
  useMagicSwapV2RouterRemoveLiquidity,
  useMagicSwapV2RouterRemoveLiquidityNft,
  usePrepareMagicSwapV2RouterRemoveLiquidity,
  usePrepareMagicSwapV2RouterRemoveLiquidityNft,
} from "~/generated";
import type { Pool } from "~/lib/pools.server";
import type { AddressString, TroveTokenWithQuantity } from "~/types";

type Props = {
  pool: Pool;
  amountLP: bigint;
  amountBaseMin: bigint;
  amountQuoteMin: bigint;
  nfts: TroveTokenWithQuantity[];
  enabled?: boolean;
};

export const useRemoveLiquidity = ({
  pool,
  amountLP,
  amountBaseMin,
  amountQuoteMin,
  nfts,
  enabled = true,
}: Props) => {
  const { address, addressArg } = useAccount();
  const { deadline } = useSettings();

  const isEnabled = enabled && !!address;
  const deadlineBN = BigInt(Math.floor(Date.now() / 1000) + deadline * 60);
  const isNft = pool.baseToken.isNft || pool.quoteToken.isNft;

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
      enabled: isEnabled && !isNft,
    });
  const { data: tokenRemoveLiquidityData, write: tokenRemoveLiquidity } =
    useMagicSwapV2RouterRemoveLiquidity(tokenRemoveLiquidityConfig);
  const { isSuccess: isTokenRemoveLiquiditySuccess } = useWaitForTransaction(
    tokenRemoveLiquidityData
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
      enabled: isEnabled && isNft,
    });
  const { data: nftRemoveLiquidityData, write: nftRemoveLiquidity } =
    useMagicSwapV2RouterRemoveLiquidityNft(nftRemoveLiquidityConfig);
  const { isSuccess: isNftRemoveLiquiditySuccess } = useWaitForTransaction(
    nftRemoveLiquidityData
  );

  return {
    removeLiquidity: () => {
      if (isNft) {
        nftRemoveLiquidity?.();
      } else {
        tokenRemoveLiquidity?.();
      }
    },
    isSuccess: isTokenRemoveLiquiditySuccess || isNftRemoveLiquiditySuccess,
  };
};
