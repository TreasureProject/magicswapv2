import { SettingsIcon } from "lucide-react";
import { useState } from "react";

import { NumberInput } from "./NumberInput";
import { Button } from "./ui/Button";
import { Label } from "./ui/Label";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/Popover";
import { useStore } from "~/hooks/useStore";
import { DEFAULT_SLIPPAGE, useSettingsStore } from "~/store/settings";

export const SettingsDropdownMenu = () => {
  const state = useStore(useSettingsStore, (state) => state);

  const [current, localUpdate] = useState({
    slippage: state?.slippage,
    deadline: state?.deadline,
  });

  return (
    <Popover
      onOpenChange={() =>
        localUpdate({ slippage: state?.slippage, deadline: state?.deadline })
      }
    >
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
              className="col-span-2 py-1.5"
              value={current.slippage}
              onChange={(value) => localUpdate({ ...current, slippage: value })}
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
              className="col-span-2 py-1.5"
              value={current.deadline}
              onChange={(value) => localUpdate({ ...current, deadline: value })}
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
        <div className="ml-auto mt-4 flex w-max space-x-1">
          <Button
            variant="ghost"
            onClick={() =>
              localUpdate({
                slippage: state?.slippage,
                deadline: state?.deadline,
              })
            }
          >
            Reset
          </Button>
          <PopoverClose asChild>
            <Button
              variant="secondary"
              onClick={() =>
                state?.update({
                  slippage: current.slippage || DEFAULT_SLIPPAGE,
                  deadline: current.deadline || 30,
                })
              }
            >
              Save
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
};
