import { AnimatePresence, motion } from "framer-motion";
import { Check as CheckIcon, Copy as CopyIcon } from "lucide-react";
import React, { useState } from "react";

import { cn } from "~/lib/utils";

interface TableItem {
  label: string;
  icon?: string | { token0: string | undefined; token1: string | undefined };
  value: string | number;
}

interface TableProps {
  items: TableItem[];
  children?: React.ReactNode;
}

const Table = ({ children, items }: TableProps) => {
  return (
    <div className="rounded-md border border-night-800 ">
      <div className={cn("p-3", children && "border-b border-night-800")}>
        <table className="w-full space-y-3 ">
          {items.map((item) => (
            <tr
              className="flex w-full items-center justify-between"
              key={item.label}
            >
              <td className="text-sm text-night-400">{item.label}</td>
              <div className="flex">
                {item.icon &&
                  (typeof item.icon === "string" ? (
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="h-5 w-5 rounded-full"
                    />
                  ) : (
                    <div className="flex w-8 items-center">
                      {item.icon.token0 ? (
                        <img
                          src={item.icon.token0}
                          alt={item.label}
                          className="h-5 w-5 min-w-[20px] rounded-full border-2 border-night-1100"
                        />
                      ) : (
                        <div className="h-5 w-5 min-w-[20px] rounded-full border-2 border-night-1100 bg-night-900" />
                      )}

                      {item.icon.token1 ? (
                        <img
                          src={item.icon.token1}
                          alt={item.label}
                          className="min-w-5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-night-1100"
                        />
                      ) : (
                        <div className="h-5 w-5 -translate-x-1/2 rounded-full border-2 border-night-1100 bg-night-900" />
                      )}
                    </div>
                  ))}
                <td className="text-sm font-medium text-night-400">
                  {item.value}
                </td>
              </div>
            </tr>
          ))}
        </table>
      </div>
      {children && <div className="p-3">{children}</div>}
    </div>
  );
};

interface CopyTableProps {
  label: string;
  value: string;
}

export const CopyTable = ({ label, value }: CopyTableProps) => {
  const [showCopied, setShowCopied] = useState(false);
  const copyHandler = () => {
    navigator.clipboard.writeText(value);
    setShowCopied(true);
    setTimeout(() => {
      setShowCopied(false);
    }, 1000);
  };

  return (
    <div className="flex items-center justify-between rounded-md border border-night-800 p-3">
      <p className="text-sm text-night-400">{label}</p>
      <div
        className="relative flex cursor-pointer items-center gap-2"
        onClick={copyHandler}
      >
        <p className="text-sm text-night-100">{value}</p>
        <CopyIcon className="h-4 w-4 text-night-400" />
        <AnimatePresence>
          {showCopied && (
            <motion.div
              className="absolute -right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-night-900 px-4 py-2 text-sm font-medium text-night-400"
              initial={{ opacity: 0, right: -40 }}
              animate={{ opacity: 1, right: -80 }}
              exit={{ opacity: 0, right: -40 }}
            >
              Copied
              <CheckIcon className="h-3 w-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Table;
