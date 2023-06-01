import { HelpCircle } from "lucide-react";
import Balancer from "react-wrap-balancer";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover";

export const DisabledInputPopover = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="group">
        <HelpCircle className="h-4 w-4 text-night-200 transition-colors group-hover:text-night-500" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-72">
      <p className="text-xs text-night-300">
        <Balancer>
          Input is disabled because the amount will be auto-calculated based on
          the selected NFTs.
        </Balancer>
      </p>
    </PopoverContent>
  </Popover>
);
