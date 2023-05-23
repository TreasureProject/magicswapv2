import { SettingsIcon } from "lucide-react";

import { NumberInput } from "./NumberInput";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/Popover";
import { useSettings } from "~/contexts/settings";

export const SettingsDropdownMenu = () => {
  const { slippage, deadline, updateSlippage, updateDeadline } = useSettings();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost">
          <SettingsIcon className="h-6 w-6 text-night-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <h4 className="font-medium leading-none">Transaction Settings</h4>
          <div className="grid grid-cols-4 items-center gap-x-2 gap-y-1">
            <Label htmlFor="settingsSlippage" className="col-span-2">
              Slippage tolerance
            </Label>
            <NumberInput
              id="settingsSlippage"
              className="col-span-2 px-2 py-1.5"
              value={slippage}
              onChange={updateSlippage}
              minValue={0.001}
              maxValue={0.49}
              placeholder="0.5%"
              formatOptions={{
                style: "percent",
                minimumFractionDigits: 1,
                maximumFractionDigits: 2,
              }}
              errorMessage="Slippage must be between 0.1% and 49%"
              errorCondition={(value) => value > 49}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-x-2 gap-y-1">
            <Label htmlFor="settingsDeadline" className="col-span-2">
              Transaction Deadline
            </Label>
            <NumberInput
              id="settingsDeadline"
              className="col-span-2 px-2 py-1.5"
              value={deadline}
              onChange={updateDeadline}
              minValue={1}
              maxValue={60}
              placeholder="20"
              errorMessage="Deadline must be between 1 and 60"
              errorCondition={(value) => value > 60}
            >
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pr-3">
                <span className="text-sm text-night-400">Minutes</span>
              </div>
            </NumberInput>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
