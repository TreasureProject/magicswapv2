import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Balancer from "react-wrap-balancer";
// import { toast } from "sonner";
import type { useContractWrite } from "wagmi";
import { useWaitForTransaction as useWaitForTransactionWagmi } from "wagmi";
import type { SendTransactionResult } from "wagmi/dist/actions";

import type { Optional } from "~/types";

const renderStatusWithHeader = (
  message: string,
  headerMessage?: React.ReactNode
) => {
  if (!headerMessage) {
    return message;
  }

  return (
    <>
      <p className="text-sm text-night-400">{message}</p>
      <p className="mt-1 text-sm font-medium text-night-100">
        <Balancer>{headerMessage}</Balancer>
      </p>
    </>
  );
};

export const useWaitForTransaction = (
  transaction: SendTransactionResult | undefined,
  status: ReturnType<typeof useContractWrite>["status"],
  statusMessage: {
    loading: React.ReactNode;
    error: React.ReactNode;
    success: React.ReactNode;
  }
) => {
  const toastId = useRef<Optional<string>>(undefined);

  const transactionResult = useWaitForTransactionWagmi(transaction);

  const isLoading =
    transactionResult.status === "loading" || status === "loading";

  const isError = transactionResult.status === "error" || status === "error";

  const isSuccess = transactionResult.status === "success";

  useEffect(() => {
    if (isLoading) {
      if (toastId.current) {
        toast.loading(
          renderStatusWithHeader(
            "Transaction in progress...",
            statusMessage.loading
          ),
          {
            id: toastId.current,
          }
        );
      } else {
        toastId.current = toast.custom(
          renderStatusWithHeader(
            "Transaction in progress...",
            statusMessage.loading
          )
        );
      }
    } else if (isSuccess) {
      toast.success(
        renderStatusWithHeader("Transaction successful", statusMessage.success),
        {
          id: toastId.current,
        }
      );
    } else if (isError) {
      toast.error(
        renderStatusWithHeader("Transaction failed", statusMessage.error),
        {
          id: toastId.current,
        }
      );
    }
  });

  return transactionResult;
};