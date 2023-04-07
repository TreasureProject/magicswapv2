import type { HTMLAttributes } from "react";
import { cn } from "~/lib/utils";

type Props = HTMLAttributes<HTMLDivElement>;

export const Container = ({ className, ...divProps }: Props) => (
  <main
    className={cn("mx-auto w-full max-w-7xl px-4 md:px-12 xl:px-2", className)}
    {...divProps}
  />
);
