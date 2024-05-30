import { useMagicSwapV2RouterAddress } from "./useContractAddress";
import {
  useSimulateErc20Approve,
  useSimulateErc721SetApprovalForAll,
  useSimulateErc1155SetApprovalForAll,
  useWriteErc20Approve,
  useWriteErc721SetApprovalForAll,
  useWriteErc1155SetApprovalForAll,
} from "~/generated";
import { useWaitForTransaction } from "~/hooks/useWaitForTransaction";
import type { PoolToken , AddressString } from "~/types";

type Props = {
  token: PoolToken | string;
  amount?: bigint;
  enabled?: boolean;
  statusHeader?: React.ReactNode;
};

export const useApprove = ({
  token,
  amount = BigInt(0),
  enabled = true,
  statusHeader: propsStatusHeader,
}: Props) => {
  const operator = useMagicSwapV2RouterAddress();
  const isFullToken = typeof token !== "string";
  const tokenAddress = (isFullToken ? token.id : token) as AddressString;
  const collectionAddress = isFullToken
    ? (token.collectionId as AddressString)
    : undefined;

  const isERC721 = isFullToken && token.type === "ERC721";
  const isERC1155 = isFullToken && token.type === "ERC1155";
  const statusHeader =
    propsStatusHeader ??
    (isFullToken ? `Approve ${token.symbol}` : "Approve token");

  const { data: erc20ApproveConfig } = useSimulateErc20Approve({
    address: tokenAddress,
    args: [operator, amount],
    query: {
      enabled: enabled && !isERC721 && !isERC1155,
    },
  });
  const erc20Approve = useWriteErc20Approve();
  const { isSuccess: isERC20ApproveSuccess } = useWaitForTransaction(
    { hash: erc20Approve.data },
    erc20Approve.status,
    statusHeader
  );

  const { data: erc721ApproveConfig } = useSimulateErc721SetApprovalForAll({
    address: collectionAddress,
    args: [operator, true],
    query: {
      enabled: enabled && isERC721,
    },
  });
  const erc721Approve = useWriteErc721SetApprovalForAll();
  const { isSuccess: isERC721ApproveSuccess } = useWaitForTransaction(
    { hash: erc721Approve.data },
    erc721Approve.status,
    statusHeader
  );

  const { data: erc1155ApproveConfig } = useSimulateErc1155SetApprovalForAll({
    address: collectionAddress,
    args: [operator, true],
    query: {
      enabled: enabled && isERC1155,
    },
  });
  const erc1155Approve = useWriteErc1155SetApprovalForAll();
  const { isSuccess: isERC1155ApproveSuccess } = useWaitForTransaction(
    { hash: erc1155Approve.data },
    erc1155Approve.status,
    statusHeader
  );

  return {
    approve: () => {
      if (isERC721 && erc721ApproveConfig?.request) {
        erc721Approve.writeContract(erc721ApproveConfig?.request);
      } else if (isERC1155 && erc1155ApproveConfig?.request) {
        erc1155Approve.writeContract(erc1155ApproveConfig?.request);
      } else if (erc20ApproveConfig?.request) {
        erc20Approve.writeContract(erc20ApproveConfig?.request);
      }
    },
    isSuccess:
      isERC20ApproveSuccess ||
      isERC721ApproveSuccess ||
      isERC1155ApproveSuccess,
  };
};
