import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  open: boolean;
  className?: string;
  onClick?: () => void;
}

export const HamburgerIcon = ({ open = false, className, onClick }: Props) => {
  return (
    <button
      className={twMerge(
        "z-50 flex h-9 w-9 cursor-pointer items-center rounded-md bg-base-900 transition-colors hover:bg-base-800 lg:h-[38px] lg:w-[38px] ",
        className
      )}
      onClick={onClick}
    ></button>
  );
};
