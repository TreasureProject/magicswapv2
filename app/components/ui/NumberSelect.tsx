import { Minus as MinusIcon, Plus as PlusIcon } from "lucide-react";
import React, { useState } from "react";

import { cn } from "~/lib/utils";

export const NumberSelect = ({ max = 99 }: { max: number }) => {
  const [number, setNumber] = useState<number>(0);

  const updateNumber = (direction: "add" | "sub") => {
    if (direction === "add" && number < max) {
      return setNumber(number + 1);
    }
    if (direction === "sub" && number > 0) {
      return setNumber(number - 1);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-md bg-night-1100 p-2">
      <button
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md  text-night-400  opacity-50 transition-colors",
          !(number === 0) &&
            "opacity-100 hover:bg-night-1000 hover:text-night-200"
        )}
        disabled={number === 0}
        onClick={() => updateNumber("sub")}
      >
        <MinusIcon className="w-4" />
      </button>
      <p className="w-6 text-center text-sm font-medium leading-[160%] text-night-100 ">
        {number}
      </p>
      <button
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-md  text-night-400  opacity-50 transition-colors",
          !(number === max) &&
            "opacity-100 hover:bg-night-1000 hover:text-night-200"
        )}
        onClick={() => updateNumber("add")}
      >
        <PlusIcon className="w-4" />
      </button>
    </div>
  );
};
