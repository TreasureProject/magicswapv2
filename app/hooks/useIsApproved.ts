import { BigNumber } from "@ethersproject/bignumber";
import { useCallback } from "react";
import { useAccount } from "wagmi";

import {
  magicSwapV2RouterAddress,
  useErc20Allowance,
  useErc721IsApprovedForAll,
  useErc1155IsApprovedForAll,
} from "~/generated";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString } from "~/types";

type Props = {
  token: PoolToken;
  amount?: BigNumber;
  enabled?: boolean;
};

export const useIsApproved = ({
  token,
  amount = BigNumber.from(0),
  enabled = true,
}: Props) => {
  const { address } = useAccount();

  const isEnabled = !!address && enabled;
  const addressArg = address ?? "0x0";

  const { data: allowance, refetch: refetchAllowance } = useErc20Allowance({
    address: token.id as AddressString,
    args: [addressArg, magicSwapV2RouterAddress[421613]],
    enabled: isEnabled && !token.isNft,
  });

  const {
    data: erc721IsApprovedForAll,
    refetch: refetchERC721IsApprovedForAll,
  } = useErc721IsApprovedForAll({
    address: token.collectionId as AddressString,
    args: [addressArg, magicSwapV2RouterAddress[421613]],
    enabled: isEnabled && !!token.collectionId && token.type === "ERC721",
  });

  const {
    data: erc1155IsApprovedForAll,
    refetch: refetchERC1155IsApprovedForAll,
  } = useErc1155IsApprovedForAll({
    address: token.collectionId as AddressString,
    args: [addressArg, magicSwapV2RouterAddress[421613]],
    enabled: isEnabled && !!token.collectionId && token.type === "ERC1155",
  });

  const refetch = useCallback(() => {
    refetchAllowance();
    refetchERC721IsApprovedForAll();
    refetchERC1155IsApprovedForAll();
  }, [
    refetchAllowance,
    refetchERC721IsApprovedForAll,
    refetchERC1155IsApprovedForAll,
  ]);

  return {
    isApproved:
      !!erc721IsApprovedForAll ||
      !!erc1155IsApprovedForAll ||
      (!!allowance && allowance.gte(amount)),
    refetch,
  };
};
