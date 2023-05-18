import React from "react";

import { cn } from "~/lib/utils";

interface Tab {
  id: string;
  name: string;
  amount?: number;
  icon?: React.ElementType;
}

export const MultiSelect = ({
  activeTab,
  setActiveTab,
  tabs,
}: {
  activeTab: string;
  setActiveTab: (arg0: string) => void;
  tabs: Tab[];
}) => {
  return (
    <div className="flex h-max w-full items-center justify-between rounded-full bg-night-1100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "flex w-full items-center  justify-center gap-4 rounded-full  py-2 font-medium leading-[160%] text-night-400 transition-colors",
            activeTab === tab.id && "bg-night-800 text-night-100"
          )}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.icon && <tab.icon className="w-5" />}
          {tab.name}
          {!!tab.amount && tab.amount > 0 && (
            <p className="rounded-full bg-night-700 px-3 py-1 text-xs font-medium">
              {tab.amount}
            </p>
          )}
        </button>
      ))}
    </div>
  );
};
