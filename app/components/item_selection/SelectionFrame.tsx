import { ChevronDown as ChevronDownIcon } from "lucide-react";
import React from "react";

import { Button } from "../ui/Button";
import type { PoolToken } from "~/lib/tokens.server";
import { cn } from "~/lib/utils";

const SelectionFrame = ({
  title,
  token,
  mode = "transparent",
  inputLabel,
  type = "select",
}: {
  title?: string;
  token: PoolToken;
  mode: "solid" | "transparent";
  inputLabel?: React.ReactNode;
  type?: "select" | "input";
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-night-900">
      {!!title && (
        <>
          <div className="border-b border-b-night-900 bg-night-1100 px-4 py-2 ">
            <h1 className=" text-sm font-medium leading-[160%] text-night-100">
              {title}
            </h1>
          </div>
        </>
      )}
      {type === "select" && (
        <div className="flex items-center justify-between border-b border-night-900 p-4">
          <div className="flex items-center gap-4">
            <div className="flex">
              {token.image ? (
                <img
                  src={token.image}
                  alt={token.name}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-night-1000" />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-medium ">{token.name}</h1>
              <p className="text-sm text-night-400">{token.symbol}</p>
            </div>
          </div>
          <Button variant="dark" size="md">
            Select Items
          </Button>
        </div>
      )}
      {type === "input" && (
        <div className="flex items-center justify-between p-6">
          <input
            className="w-full border-none bg-transparent text-xl font-medium text-night-100 outline-none"
            placeholder="0.00"
          />
          <label className="w-max whitespace-nowrap">{inputLabel}</label>
        </div>
      )}
      <div
        className={cn(
          "flex h-12 items-center justify-between bg-night-1000 p-2 pr-4",
          type === "input" && "justify-end"
        )}
      >
        {type === "select" &&
          (token.isNft ? (
            <div className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-night-900">
              <p className="text-sm text-night-500">Inventory</p>
              <p className="text-sm font-medium text-night-100">23</p>
              <ChevronDownIcon className="h-5 w-5 text-night-100" />
            </div>
          ) : (
            <p className="pl-2 text-sm text-night-400">
              Balance:
              <span className="pl-1 font-medium text-night-100">24,000.00</span>
            </p>
          ))}
        {token.isNft ? (
          <div className="flex">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                className="rounded-lg px-3 py-1.5 text-sm text-night-400 transition-colors hover:bg-night-900 hover:text-night-100"
              >
                {percent}%
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-night-400">
            Tokens are proportionally added
          </p>
        )}
      </div>
    </div>
  );
};

export default SelectionFrame;
