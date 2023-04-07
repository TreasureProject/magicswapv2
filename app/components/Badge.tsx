import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Badge = ({ children }: Props) => (
  <div className="bg-night-600 rounded-3xl px-3.5 py-0.5 text-xs font-medium text-white">
    {children}
  </div>
);
