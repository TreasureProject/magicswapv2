import { Search as SearchIcon } from "lucide-react";
import React from "react";

import { cn } from "~/lib/utils";

interface SearchbarProps {
  placeholder: string;
  className?: string;
}

const Searchbar = ({ placeholder, className }: SearchbarProps) => {
  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-lg bg-night-1000 px-2 text-night-600",
        className
      )}
    >
      <SearchIcon className="h-4 w-4 " />
      <input
        type="text"
        className="w-full border-none bg-transparent text-sm outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

export default Searchbar;
