import { BigNumber } from "@ethersproject/bignumber";
import { useWaitForTransaction } from "wagmi";

import {
  magicSwapV2RouterAddress,
  useErc20Approve,
  useErc721SetApprovalForAll,
  useErc1155SetApprovalForAll,
  usePrepareErc20Approve,
  usePrepareErc721SetApprovalForAll,
  usePrepareErc1155SetApprovalForAll,
} from "~/generated";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString } from "~/types";

type Props = {
  token: PoolToken | string;
  amount?: BigNumber;
  enabled?: boolean;
};

export const useApprove = ({
  token,
  amount = BigNumber.from(0),
  enabled = true,
}: Props) => {
  const isFullToken = typeof token !== "string";
  const tokenAddress = (isFullToken ? token.id : token) as AddressString;
  const collectionAddress = isFullToken
    ? (token.collectionId as AddressString)
    : undefined;
  const isERC721 = isFullToken && token.type === "ERC721";
  const isERC1155 = isFullToken && token.type === "ERC1155";

  const { config: erc20ApproveConfig } = usePrepareErc20Approve({
    address: tokenAddress,
    args: [magicSwapV2RouterAddress[421613], amount],
    enabled: enabled && !isERC721 && !isERC1155,
  });
  const { data: erc20ApproveData, write: erc20Approve } =
    useErc20Approve(erc20ApproveConfig);
  const { isSuccess: isERC20ApproveSuccess } =
    useWaitForTransaction(erc20ApproveData);

  const { config: erc721ApproveConfig } = usePrepareErc721SetApprovalForAll({
    address: collectionAddress,
    args: [magicSwapV2RouterAddress[421613], true],
    enabled: enabled && isERC721,
  });
  const { data: erc721ApproveData, write: erc721Approve } =
    useErc721SetApprovalForAll(erc721ApproveConfig);
  const { isSuccess: isERC721ApproveSuccess } =
    useWaitForTransaction(erc721ApproveData);

  const { config: erc1155ApproveConfig } = usePrepareErc1155SetApprovalForAll({
    address: collectionAddress,
    args: [magicSwapV2RouterAddress[421613], true],
    enabled: enabled && isERC1155,
  });
  const { data: erc1155ApproveData, write: erc1155Approve } =
    useErc1155SetApprovalForAll(erc1155ApproveConfig);
  const { isSuccess: isERC1155ApproveSuccess } =
    useWaitForTransaction(erc1155ApproveData);

  return {
    approve: () => {
      if (isERC721) {
        erc721Approve?.();
      } else if (isERC1155) {
        erc1155Approve?.();
      } else {
        erc20Approve?.();
      }
    },
    isSuccess:
      isERC20ApproveSuccess ||
      isERC721ApproveSuccess ||
      isERC1155ApproveSuccess,
  };
};
