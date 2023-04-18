import { motion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "~/lib/utils";

type Tab = {
  id: string;
  title: ReactNode;
};

type Props = Omit<HTMLAttributes<HTMLUListElement>, "onChange"> & {
  tabs: Tab[];
  activeTab: string;
  onChange: (activeTab: string) => void;
};

export const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className,
  ...ulProps
}: Props) => {
  return (
    <ul className={cn("flex items-center", className)} {...ulProps}>
      {tabs.map(({ id, title }) => (
        <li key={id} className="relative text-center">
          <button
            onClick={() => onChange(id)}
            className={cn(
              "w-full py-3 text-sm font-semibold text-night-200 transition-colors sm:w-auto sm:px-8",
              activeTab === id && "text-white"
            )}
          >
            {title}
          </button>
          {activeTab === id && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-white"
            />
          )}
        </li>
      ))}
    </ul>
  );
};
