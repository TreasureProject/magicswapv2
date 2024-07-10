import { ExternalLinkIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Balancer } from "react-wrap-balancer";
import type { useWriteContract } from "wagmi";
import { useWaitForTransactionReceipt as useWaitForTransactionWagmi } from "wagmi";

import type { Optional } from "~/types";
import { useBlockExplorer } from "./useBlockExplorer";

const TOAST_DURATION = 5_000;

const renderStatusWithHeader = (
  message: React.ReactNode,
  headerMessage?: React.ReactNode,
) => (
  <>
    {headerMessage ? <Balancer>{headerMessage}</Balancer> : null}
    <p className="font-medium text-night-400 text-sm">{message}</p>
  </>
);

export const useWaitForTransaction = (
  transaction: Parameters<typeof useWaitForTransactionWagmi>[0],
  status: ReturnType<typeof useWriteContract>["status"],
  statusHeader?: React.ReactNode,
) => {
  const toastId = useRef<Optional<string>>(undefined);
  const [toastStatus, setToastStatus] = useState<
    "error" | "success" | "loading" | "hidden"
  >("hidden");
  const { name: blockExplorerName, url: blockExporerUrl } = useBlockExplorer();

  const transactionResult = useWaitForTransactionWagmi(transaction);

  const transactionHash = transaction?.hash;

  const dismissToast = useCallback(() => {
    if (toastId.current) {
      toast.dismiss(toastId.current);
      toastId.current = undefined;
    }

    setToastStatus("hidden");
  }, []);

  useEffect(() => {
    if (status === "pending" && transactionResult.status === "pending") {
      setToastStatus("loading");
    } else if (status === "error" || transactionResult.status === "error") {
      setToastStatus("error");
    } else if (transactionResult.status === "success") {
      setToastStatus("success");
    } else {
      dismissToast();
    }
  }, [status, transactionResult.status, dismissToast]);

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (toastStatus === "success" || toastStatus === "error") {
      timeout = setTimeout(dismissToast, TOAST_DURATION);
    }

    return () => {
      if (timeout) {
        dismissToast();
        clearTimeout(timeout);
      }
    };
  }, [toastStatus, dismissToast]);

  useEffect(() => {
    if (toastStatus === "loading") {
      const message = renderStatusWithHeader(
        "Transaction in progress...",
        statusHeader,
      );
      if (toastId.current) {
        toast.loading(message, {
          id: toastId.current,
        });
      } else {
        toastId.current = toast.loading(message);
      }
    } else if (toastStatus === "success") {
      toast.success(
        renderStatusWithHeader(
          <div className="space-y-1">
            <p>Transaction successful</p>
            {transactionHash ? (
              <a
                href={`${blockExporerUrl}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-night-300 text-xs transition-colors hover:text-honey-25"
              >
                View on {blockExplorerName}{" "}
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            ) : null}
          </div>,
          statusHeader,
        ),
        {
          id: toastId.current,
        },
      );
    } else if (toastStatus === "error") {
      toast.error(renderStatusWithHeader("Transaction failed", statusHeader), {
        id: toastId.current,
      });
    }
  }, [
    toastStatus,
    transactionHash,
    blockExplorerName,
    blockExporerUrl,
    statusHeader,
  ]);

  return transactionResult;
};
