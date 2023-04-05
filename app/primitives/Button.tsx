import type { HTMLAttributes } from "react";
import { CloseIcon } from "~/assets/Icons";
import { cn } from "~/utils/lib";

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  mode?: "primary" | "secondary";
};

export const Button = ({
  mode = "primary",
  className,
  ...buttonProps
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "rounded-md bg-treasure-red-900 p-2 text-sm font-medium leading-[160%] text-white transition-colors hover:bg-treasure-red-800",
        mode === "secondary" && "bg-night-800 hover:bg-night-900",
        className
      )}
      {...buttonProps}
    />
  );
};

interface CloseButtonProps {
  onClick?: () => void;
}

export const CloseButton = ({ onClick }: CloseButtonProps) => (
  <button
    className="h-[38px] cursor-pointer rounded-full bg-base-1000 p-2"
    onClick={onClick}
  >
    <CloseIcon className="w-3 text-base-600" />
  </button>
);
