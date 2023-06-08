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
import { useWaitForTransaction as useWaitForT } from "~/hooks/useWaitForTransaction";
import type { PoolToken } from "~/lib/tokens.server";
import type { AddressString } from "~/types";

type Props = {
  token: PoolToken | string;
  amount?: bigint;
  enabled?: boolean;
};

export const useApprove = ({
  token,
  amount = BigInt(0),
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
  const {
    data: erc20ApproveData,
    write: erc20Approve,
    status: erc20Status,
  } = useErc20Approve(erc20ApproveConfig);
  const { isSuccess: isERC20ApproveSuccess } = useWaitForT(
    erc20ApproveData,
    erc20Status,
    {
      loading: "Approving...",
      success: "Approved!",
      error: "Approval failed",
    }
  );

  const { config: erc721ApproveConfig } = usePrepareErc721SetApprovalForAll({
    address: collectionAddress,
    args: [magicSwapV2RouterAddress[421613], true],
    enabled: enabled && isERC721,
  });
  const {
    data: erc721ApproveData,
    write: erc721Approve,
    status: erc721Status,
  } = useErc721SetApprovalForAll(erc721ApproveConfig);
  const { isSuccess: isERC721ApproveSuccess } = useWaitForT(
    erc721ApproveData,
    erc721Status,
    {
      loading: "Approving...",
      success: "Approved!",
      error: "Approval failed",
    }
  );

  const { config: erc1155ApproveConfig } = usePrepareErc1155SetApprovalForAll({
    address: collectionAddress,
    args: [magicSwapV2RouterAddress[421613], true],
    enabled: enabled && isERC1155,
  });
  const {
    data: erc1155ApproveData,
    write: erc1155Approve,
    status: erc1155Status,
  } = useErc1155SetApprovalForAll(erc1155ApproveConfig);
  const { isSuccess: isERC1155ApproveSuccess } = useWaitForT(
    erc1155ApproveData,
    erc1155Status,
    {
      loading: "Approving...",
      success: "Approved!",
      error: "Approval failed",
    }
  );

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
