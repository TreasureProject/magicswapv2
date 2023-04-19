import React from "react";
import { cn } from "~/lib/utils";
import { Check as CheckIcon } from "lucide-react";

interface CheckBoxProps {
  className?: string;
  setChecked: (arg0: boolean) => void;
  checked?: boolean;
}

export const CheckBox = ({
  className,
  setChecked,
  checked = false,
}: CheckBoxProps) => {
  return (
    <div
      className={cn(
        " flex h-4 w-4 min-w-[16px] cursor-pointer items-center justify-center rounded-[4px] border-[1.5px] border-night-600",
        checked && "border-none bg-ruby-800",
        className
      )}
      onClick={() => setChecked(!checked)}
    >
      {checked && <CheckIcon className="w-3 text-night-1200" />}
    </div>
  );
};

interface CheckBoxLabeledProps extends CheckBoxProps {
  className?: string;
  children: React.ReactNode;
}

export const CheckBoxLabeled = ({
  className,
  children,
  setChecked,
  checked = false,
}: CheckBoxLabeledProps) => (
  <div className={cn("flex gap-3", className)}>
    <CheckBox checked={checked} setChecked={setChecked} className="mt-1" />
    <p className="text-sm leading-[140%] text-night-400">{children}</p>
  </div>
);
