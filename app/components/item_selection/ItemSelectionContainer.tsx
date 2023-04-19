import React from "react";

import { cn } from "~/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const ItemSelectionContainer = ({ children, className }: Props) => (
  <div className={cn("mx-auto mt-12 flex max-w-xl flex-col gap-6", className)}>
    {children}
  </div>
);
