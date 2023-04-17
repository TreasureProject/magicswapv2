import type { HTMLAttributes } from "react";
import { CloseIcon } from "~/components/Icons";
import { cn } from "~/lib/utils";

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  mode?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
};

export const Button = ({
  mode = "primary",
  size = "sm",
  className,
  ...buttonProps
}: ButtonProps) => {
  return (
    <button
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-md bg-ruby-900 text-sm font-medium leading-[160%] text-white transition-colors hover:bg-ruby-800",
        mode === "secondary" && "bg-night-800 hover:bg-night-900",
        size === "sm" && "p-2",
        size === "md" && "px-4 py-3",
        size === "lg" && "px-5 py-4",
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
    className="h-[38px] cursor-pointer rounded-full bg-night-1000 p-2"
    onClick={onClick}
  >
    <CloseIcon className="w-3 text-night-600" />
  </button>
);
