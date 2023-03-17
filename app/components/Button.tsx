import type { HTMLAttributes } from "react";
import { cn } from "~/utils/lib";

type Props = HTMLAttributes<HTMLButtonElement> & {
  mode?: "primary" | "secondary";
};

export const Button = ({
  mode = "primary",
  className,
  ...buttonProps
}: Props) => {
  return (
    <button
      className={cn(
        "rounded-lg bg-ruby-900 py-2.5 px-4 text-sm font-medium text-white transition-colors hover:bg-ruby-1000",
        mode === "secondary" && "bg-night-800 hover:bg-night-900",
        className
      )}
      {...buttonProps}
    />
  );
};
