import { useEffect } from "react";
import { useWaitForTransactionReceipt } from "wagmi";

import { useAccount } from "~/contexts/account";
import {
  useReadNftVaultAllowance,
  useWriteNftVaultApprove,
  useWriteNftVaultManagerWithdrawBatch,
} from "~/generated";

import { type Address, parseEther, zeroAddress } from "viem";
import { getContractAddress } from "~/lib/address";
import { useToast } from "./useToast";

type Props = {
  chainId: number;
  vaultAddress?: Address;
  enabled?: boolean;
  onSuccess?: () => void;
};

export const useWithdrawBatch = ({
  chainId,
  vaultAddress,
  enabled = true,
  onSuccess,
}: Props) => {
  const { isConnected, address } = useAccount();
  const nftVaultManagerAddress = getContractAddress({
    chainId,
    contract: "nftVaultManager",
  });
  const isEnabled = enabled && isConnected && address && !!vaultAddress;

  const nftVaultAllowance = useReadNftVaultAllowance({
    chainId,
    address: vaultAddress,
    args: [address || zeroAddress, nftVaultManagerAddress],
    query: {
      enabled: isEnabled,
    },
  });
  const nftVaultApprove = useWriteNftVaultApprove();
  const nftVaultApproveReceipt = useWaitForTransactionReceipt({
    hash: nftVaultApprove.data,
  });

  const withdrawBatch = useWriteNftVaultManagerWithdrawBatch();
  const withdrawBatchReceipt = useWaitForTransactionReceipt({
    hash: withdrawBatch.data,
  });

  const isSuccess = withdrawBatch.isSuccess;
  const isLoading =
    withdrawBatch.isPending ||
    withdrawBatchReceipt.isLoading ||
    nftVaultApprove.isPending ||
    nftVaultApproveReceipt.isLoading;

  useToast({
    title: "Withdraw rewards",
    isLoading,
    isSuccess,
    isError:
      withdrawBatch.isError ||
      withdrawBatchReceipt.isError ||
      nftVaultApprove.isError ||
      nftVaultApproveReceipt.isError,
    errorDescription: (
      withdrawBatch.error ||
      withdrawBatchReceipt.error ||
      nftVaultApprove.error ||
      nftVaultApproveReceipt.error
    )?.message,
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
    }
  }, [isSuccess, onSuccess]);

  return {
    isLoading,
    withdrawBatch: async (
      tokens: { id: bigint; amount: bigint; collectionId: Address }[],
    ) => {
      if (!isEnabled) {
        return;
      }

      const totalAmount = tokens.reduce(
        (acc, { amount }) => acc + amount,
        BigInt(0),
      );
      const totalAmountWei = parseEther(totalAmount.toString());

      if (!nftVaultAllowance.data || totalAmountWei > nftVaultAllowance.data) {
        await nftVaultApprove.writeContractAsync({
          address: vaultAddress,
          args: [nftVaultManagerAddress, totalAmountWei],
        });
      }

      return withdrawBatch.writeContractAsync({
        address: nftVaultManagerAddress,
        args: [
          vaultAddress,
          tokens.map(({ collectionId }) => collectionId),
          tokens.map(({ id }) => id),
          tokens.map(({ amount }) => amount),
        ],
      });
    },
  };
};
