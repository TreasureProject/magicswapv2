import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Badge = ({ children }: Props) => (
  <div className="rounded-3xl bg-night-600 py-0.5 px-3.5 text-xs font-medium text-white">
    {children}
  </div>
);
