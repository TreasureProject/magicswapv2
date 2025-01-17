import { SearchIcon } from "lucide-react";
import * as React from "react";
import { useDebounce } from "react-use";

import { cn } from "~/lib/utils";
import { Input } from "./ui/Input";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  onChange: (value: string) => void;
};

export const SearchFilter = React.forwardRef<HTMLInputElement, Props>(
  ({ className, onChange, ...props }, ref) => {
    const [value, setValue] = React.useState("");

    useDebounce(() => onChange?.(value), 500, [value]);

    return (
      <div className="flex items-center rounded-md border border-night-900 bg-night-1100 pl-2">
        <SearchIcon className="h-5 w-5 text-night-500" />
        <Input
          ref={ref}
          type="search"
          className={cn(
            "h-9 w-auto border-none ring-offset-transparent focus-visible:ring-0 focus-visible:ring-transparent",
            className,
          )}
          placeholder="Search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          {...props}
        />
      </div>
    );
  },
);