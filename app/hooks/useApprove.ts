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
  token: PoolToken;
  amount?: BigNumber;
  enabled?: boolean;
};

export const useApprove = ({
  token,
  amount = BigNumber.from(0),
  enabled = true,
}: Props) => {
  const isErc721 = token.type === "ERC721";
  const isErc1155 = token.type === "ERC1155";

  const { config: erc20ApproveConfig } = usePrepareErc20Approve({
    address: token.id as AddressString,
    args: [magicSwapV2RouterAddress[421613], amount],
    enabled: enabled && !token.isNft,
  });
  const { data: erc20ApproveData, write: erc20Approve } =
    useErc20Approve(erc20ApproveConfig);
  const { isSuccess: isErc20ApproveSuccess } =
    useWaitForTransaction(erc20ApproveData);

  const { config: erc721ApproveConfig } = usePrepareErc721SetApprovalForAll({
    address: token.collectionId as AddressString,
    args: [magicSwapV2RouterAddress[421613], true],
    enabled: enabled && isErc721,
  });
  const { data: erc721ApproveData, write: erc721Approve } =
    useErc721SetApprovalForAll(erc721ApproveConfig);
  const { isSuccess: isErc721ApproveSuccess } =
    useWaitForTransaction(erc721ApproveData);

  const { config: erc1155ApproveConfig } = usePrepareErc1155SetApprovalForAll({
    address: token.collectionId as AddressString,
    args: [magicSwapV2RouterAddress[421613], true],
    enabled: enabled && isErc1155,
  });
  const { data: erc1155ApproveData, write: erc1155Approve } =
    useErc1155SetApprovalForAll(erc1155ApproveConfig);
  const { isSuccess: isErc1155ApproveSuccess } =
    useWaitForTransaction(erc1155ApproveData);

  return {
    approve: () => {
      if (!token.isNft) {
        erc20Approve?.();
      } else if (isErc721) {
        erc721Approve?.();
      } else if (isErc1155) {
        erc1155Approve?.();
      }
    },
    isSuccess:
      isErc20ApproveSuccess ||
      isErc721ApproveSuccess ||
      isErc1155ApproveSuccess,
  };
};
