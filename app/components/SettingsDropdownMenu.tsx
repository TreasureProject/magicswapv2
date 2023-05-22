import { SettingsIcon } from "lucide-react";

import { NumberInput } from "./NumberInput";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "~/components/ui/Dropdown";
import { useSettings } from "~/contexts/settings";

export const SettingsDropdownMenu = () => {
  const { slippage, deadline, updateSlippage, updateDeadline } = useSettings();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button>
          <SettingsIcon className="h-6 w-6 text-night-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-night-900 p-3 text-sm text-honey-100"
        align="end"
      >
        <h3 className="text-base font-medium">Transaction Settings</h3>
        <DropdownMenuGroup className="mt-2 space-y-1">
          <label htmlFor="settingsSlippage">Slippage tolerance</label>
          <NumberInput
            id="settingsSlippage"
            className="px-2 py-1.5"
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
        </DropdownMenuGroup>
        <DropdownMenuGroup className="mt-4 space-y-1">
          <label htmlFor="settingsDeadline">Transaction Deadline</label>
          <NumberInput
            id="settingsDeadline"
            className="px-2 py-1.5"
            value={deadline}
            onChange={updateDeadline}
            minValue={1}
            maxValue={60}
            placeholder="20"
            errorMessage="Deadline must be between 1 and 60"
            errorCondition={(value) => value > 60}
          >
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-sm text-night-400">Minutes</span>
            </div>
          </NumberInput>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
