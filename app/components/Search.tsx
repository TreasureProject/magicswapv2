import { SearchIcon } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
}

export const Search = ({ className }: Props) => {
  return (
    <div className={twMerge("flex  cursor-pointer items-center", className)}>
      <SearchIcon className="w-5 text-night-600" />
      <p className="ml-2 text-sm text-night-600">Quick Search</p>
    </div>
  );
};
