import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

type Props = {
  children: ReactNode;
  color?: "default" | "primary" | "secondary" | "tertiary";
  rounded?: "full" | "partially";
};

export const Badge = ({ children, color, rounded }: Props) => (
  <div
    className={cn(
      "rounded-3xl bg-night-600 px-3.5 py-0.5 text-xs font-medium leading-[160%] text-white",
      color === "primary" && "bg-ruby-800/10 text-ruby-700",
      color === "secondary" && "bg-honey-500/25 text-honey-700",
      rounded === "partially" && "rounded-md"
    )}
  >
    {children}
  </div>
);
