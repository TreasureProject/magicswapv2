import { useCallback } from "react";

import { useAccount } from "~/contexts/account";
import {
  magicSwapV2RouterAddress,
  useErc20Allowance,
  useErc721IsApprovedForAll,
  useErc1155IsApprovedForAll,
} from "~/generated";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString } from "~/types";

type Props = {
  token: PoolToken | string;
  amount?: bigint;
  enabled?: boolean;
};

export const useIsApproved = ({
  token,
  amount = BigInt(0),
  enabled = true,
}: Props) => {
  const { address, addressArg } = useAccount();

  const isFullToken = typeof token !== "string";
  const tokenAddress = (isFullToken ? token.id : token) as AddressString;
  const collectionAddress = isFullToken
    ? (token.collectionId as AddressString)
    : undefined;
  const isERC721 = isFullToken && token.type === "ERC721";
  const isERC1155 = isFullToken && token.type === "ERC1155";
  const isEnabled = !!address && enabled;

  const { data: allowance, refetch: refetchAllowance } = useErc20Allowance({
    address: tokenAddress,
    args: [addressArg, magicSwapV2RouterAddress[421613]],
    enabled: isEnabled && !isERC721 && !isERC1155,
  });

  const {
    data: erc721IsApprovedForAll,
    refetch: refetchERC721IsApprovedForAll,
  } = useErc721IsApprovedForAll({
    address: collectionAddress,
    args: [addressArg, magicSwapV2RouterAddress[421613]],
    enabled: isEnabled && !!collectionAddress && isERC721,
  });

  const {
    data: erc1155IsApprovedForAll,
    refetch: refetchERC1155IsApprovedForAll,
  } = useErc1155IsApprovedForAll({
    address: collectionAddress,
    args: [addressArg, magicSwapV2RouterAddress[421613]],
    enabled: isEnabled && !!collectionAddress && isERC1155,
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
      (!!allowance && allowance >= amount),
    approvedAlready: !!allowance && allowance > BigInt(0),
    refetch,
  };
};
