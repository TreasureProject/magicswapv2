import { useEffect } from "react";

import { useAccount } from "~/contexts/account";
import {
  useSimulateMagicSwapV2RouterAddLiquidity,
  useSimulateMagicSwapV2RouterAddLiquidityNft,
  useWriteMagicSwapV2RouterAddLiquidity,
  useWriteMagicSwapV2RouterAddLiquidityNft,
} from "~/generated";
import type { Pool } from "~/lib/pools.server";
import { useSettingsStore } from "~/store/settings";
import type { AddressString, TroveTokenWithQuantity } from "~/types";
import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import { useWaitForTransaction } from "./useWaitForTransaction";

type Props = {
  pool: Pool;
  tokenA: AddressString;
  tokenB: AddressString;
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
  tokenA,
  tokenB,
  amountA,
  amountB,
  amountAMin,
  amountBMin,
  nftsA,
  // nftsB,
  enabled = true,
  statusHeader: propsStatusHeader,
  onSuccess,
}: Props) => {
  const { address, addressArg } = useAccount();
  const routerAddress = useMagicSwapV2RouterAddress();
  const deadlineMinutes = useSettingsStore((state) => state.deadline);

  const isEnabled = enabled && !!address;
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineMinutes * 60);
  const statusHeader = propsStatusHeader ?? `Deposit for ${pool.name} LP`;

  // ERC20-ERC20
  const { data: tokenAddLiquidityConfig } =
    useSimulateMagicSwapV2RouterAddLiquidity({
      address: routerAddress,
      args: [
        tokenA,
        tokenB,
        amountA,
        amountB,
        amountAMin,
        amountBMin,
        addressArg,
        deadline,
      ],
      query: {
        enabled: isEnabled && !pool.hasNFT,
      },
    });
  const tokenAddLiquidity = useWriteMagicSwapV2RouterAddLiquidity();

  const { data: tokenAddLiquidityData, status: tokenAddLiquidityStatus } =
    useWaitForTransaction(
      { hash: tokenAddLiquidity.data },
      tokenAddLiquidity.status,
      statusHeader,
    );

  // NFT-ERC20
  const { data: nftAddLiquidityConfig } =
    useSimulateMagicSwapV2RouterAddLiquidityNft({
      address: routerAddress,
      args: [
        {
          token: tokenA,
          collection: nftsA.map(
            ({ collectionAddr }) => collectionAddr as AddressString,
          ),
          tokenId: nftsA.map(({ tokenId }) => BigInt(tokenId)),
          amount: nftsA.map(({ quantity }) => BigInt(quantity)),
        },
        tokenB,
        amountB,
        amountBMin,
        addressArg,
        deadline,
      ],
      query: {
        enabled: isEnabled && !pool.isNFTNFT && pool.hasNFT,
      },
    });
  const nftAddLiquidity = useWriteMagicSwapV2RouterAddLiquidityNft();

  const { data: nftAddLiquidityData, status: nftAddLiquidityStatus } =
    useWaitForTransaction(
      { hash: nftAddLiquidity.data },
      nftAddLiquidity.status,
      statusHeader,
    );

  useEffect(() => {
    if (
      (tokenAddLiquidityData && tokenAddLiquidityStatus === "success") ||
      (nftAddLiquidityData && nftAddLiquidityStatus === "success")
    ) {
      onSuccess();
    }
  }, [
    tokenAddLiquidityData,
    tokenAddLiquidityStatus,
    nftAddLiquidityData,
    nftAddLiquidityStatus,
    onSuccess,
  ]);

  // NFT-NFT
  // const { data: nftNFTAddLiquidityConfig } =
  //   useSimulateMagicSwapV2RouterAddLiquidityNftnft({
  //     address: routerAddress,
  //     args: [
  //       {
  //         token: pool.token0.id as AddressString,
  //         collection: nftsA.map(
  //           ({ collectionAddr }) => collectionAddr as AddressString
  //         ),
  //         tokenId: nftsA.map(({ tokenId }) => BigInt(tokenId)),
  //         amount: nftsA.map(({ quantity }) => BigInt(quantity)),
  //       },
  //       {
  //         token: pool.token1.id as AddressString,
  //         collection: nftsB.map(
  //           ({ collectionAddr }) => collectionAddr as AddressString
  //         ),
  //         tokenId: nftsB.map(({ tokenId }) => BigInt(tokenId)),
  //         amount: nftsB.map(({ quantity }) => BigInt(quantity)),
  //       },
  //       addressArg,
  //       deadline,
  //     ],
  //     query: {
  //       enabled: isEnabled && pool.isNFTNFT,
  //     },
  //   });
  // const nftNFTAddLiquidity = useWriteMagicSwapV2RouterAddLiquidityNftnft();
  // useWaitForTransaction(
  //   { hash: nftNFTAddLiquidity.data },
  //   nftNFTAddLiquidity.status,
  //   statusHeader
  // );

  return {
    addLiquidity: () => {
      // if (pool.isNFTNFT && nftNFTAddLiquidityConfig?.request) {
      //   nftNFTAddLiquidity.writeContract(nftNFTAddLiquidityConfig?.request);
      // } else
      if (pool.hasNFT && nftAddLiquidityConfig?.request) {
        nftAddLiquidity.writeContract(nftAddLiquidityConfig.request);
      } else if (tokenAddLiquidityConfig?.request) {
        tokenAddLiquidity.writeContract(tokenAddLiquidityConfig.request);
      }
    },
  };
};
