import { motion } from "framer-motion";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "~/utils/lib";

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
        <li key={id} className="relative">
          <button
            onClick={() => onChange(id)}
            className={cn(
              "px-8 py-3 text-sm font-semibold text-night-200 transition-colors",
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
