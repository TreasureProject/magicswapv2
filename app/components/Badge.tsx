import type { ReactNode } from "react";

import { cn } from "~/lib/utils";

type Props = {
  children: ReactNode;
  color?: "default" | "primary" | "secondary";
  rounded?: "full" | "partially";
  size?: "xs" | "sm";
  title?: string;
};

export const Badge = ({
  children,
  color = "default",
  rounded = "full",
  size = "sm",
  title,
}: Props) => (
  <div
    className={cn(
      "rounded-3xl bg-night-200 px-3.5 py-0.5 font-medium text-white text-xs leading-[160%]",
      color === "primary" && "bg-ruby-300/20 text-ruby-300",
      color === "secondary" && "bg-honey-400/20 text-honey-400",
      rounded === "partially" && "rounded-md",
      size === "xs" && "px-1.5 font-normal text-[0.6rem]",
    )}
    title={title}
  >
    {children}
  </div>
);
