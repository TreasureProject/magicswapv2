import React, { useState } from "react";

import { cn } from "~/lib/utils";

interface IconToggleProps {
  icons: {
    id: string;
    icon: React.ElementType;
  }[];
}

const IconToggle = ({ icons }: IconToggleProps) => {
  const [selected, setSelected] = useState<number>(0);
  return (
    <div className="relative flex h-9 items-center rounded-md bg-night-1000 p-1">
      <div
        className="z-5 absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-[4px] bg-night-700 transition-all"
        style={{ left: selected * 28 + 4 }}
      />
      {icons.map((icon, index) => (
        <button
          className={cn(
            "relative z-10 flex h-7  w-7 items-center justify-center text-night-600 hover:text-night-100",
            selected === index && "text-night-100"
          )}
          key={icon.id}
          onClick={() => setSelected(index)}
        >
          <icon.icon className="h-4 w-4 " />
        </button>
      ))}
    </div>
  );
};

export default IconToggle;
