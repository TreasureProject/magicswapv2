import type { HTMLAttributes } from "react";
import { cn } from "~/utils/lib";

type Props = HTMLAttributes<HTMLDivElement>;

export const Container = ({ className, ...divProps }: Props) => (
  <main
    className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
    {...divProps}
  />
);
