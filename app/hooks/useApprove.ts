import { useEffect } from "react";
import type { Address } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import type { Token } from "~/api/tokens.server";
import {
  useWriteErc20Approve,
  useWriteErc721SetApprovalForAll,
  useWriteErc1155SetApprovalForAll,
} from "~/generated";
import { useToast } from "./useToast";

type Props = {
  chainId: number;
  operator: Address;
  token: Token | string;
  amount?: bigint;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useApprove = ({
  chainId,
  operator,
  token,
  amount = 0n,
  enabled = true,
  onSuccess,
}: Props) => {
  const erc20Approve = useWriteErc20Approve();
  const erc20ApproveReceipt = useWaitForTransactionReceipt({
    hash: erc20Approve.data,
  });

  const erc721Approve = useWriteErc721SetApprovalForAll();
  const erc721ApproveReceipt = useWaitForTransactionReceipt({
    hash: erc721Approve.data,
  });

  const erc1155Approve = useWriteErc1155SetApprovalForAll();
  const erc1155ApproveReceipt = useWaitForTransactionReceipt({
    hash: erc1155Approve.data,
  });

  const isSuccess =
    erc20Approve.isSuccess ||
    erc721Approve.isSuccess ||
    erc1155Approve.isSuccess;

  useToast({
    title:
      typeof token === "string" ? "Approve token" : `Approve ${token.symbol}`,
    isLoading:
      erc20Approve.isPending ||
      erc20ApproveReceipt.isLoading ||
      erc721Approve.isPending ||
      erc721ApproveReceipt.isLoading ||
      erc1155Approve.isPending ||
      erc1155ApproveReceipt.isLoading,
    isSuccess,
    isError:
      erc20ApproveReceipt.isError ||
      erc721ApproveReceipt.isError ||
      erc1155ApproveReceipt.isError,
    errorDescription: (
      erc20ApproveReceipt.error ||
      erc721ApproveReceipt.error ||
      erc1155ApproveReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    approve: () => {
      if (!enabled) {
        return;
      }

      if (typeof token !== "string" && token.collectionType === "ERC721") {
        return erc721Approve.writeContractAsync({
          chainId,
          address: token.collectionAddress as Address,
          args: [operator, true],
        });
      }

      if (typeof token !== "string" && token.collectionType === "ERC1155") {
        return erc1155Approve.writeContractAsync({
          chainId,
          address: token.collectionAddress as Address,
          args: [operator, true],
        });
      }

      return erc20Approve.writeContractAsync({
        chainId,
        address: (typeof token === "string" ? token : token.address) as Address,
        args: [operator, amount],
      });
    },
  };
};
