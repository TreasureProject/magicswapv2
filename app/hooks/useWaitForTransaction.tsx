import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import Balancer from "react-wrap-balancer";
import type { useContractWrite } from "wagmi";
import { useWaitForTransaction as useWaitForTransactionWagmi } from "wagmi";
import type { SendTransactionResult } from "wagmi/dist/actions";

import type { Optional } from "~/types";

const renderStatusWithHeader = (
  message: string,
  headerMessage?: React.ReactNode
) => (
  <>
    {headerMessage ? <Balancer>{headerMessage}</Balancer> : null}
    <p className="text-sm font-medium text-night-400">{message}</p>
  </>
);

export const useWaitForTransaction = (
  transaction: SendTransactionResult | undefined,
  status: ReturnType<typeof useContractWrite>["status"],
  statusHeader?: React.ReactNode
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
          renderStatusWithHeader("Transaction in progress...", statusHeader),
          {
            id: toastId.current,
          }
        );
      } else {
        toastId.current = toast.loading(
          renderStatusWithHeader("Transaction in progress...", statusHeader)
        );
      }
    } else if (isSuccess) {
      toast.success(
        renderStatusWithHeader("Transaction successful", statusHeader),
        {
          id: toastId.current,
        }
      );
    } else if (isError) {
      toast.error(renderStatusWithHeader("Transaction failed", statusHeader), {
        id: toastId.current,
      });
    }

    return () => {
      if (toastId.current) {
        toast.dismiss(toastId.current);
      }
    };
  }, [isLoading, isError, isSuccess, statusHeader]);

  return transactionResult;
};
