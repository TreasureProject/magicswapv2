"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import * as React from "react";

import { Label } from "./Label";
import { cn } from "~/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "border-input peer h-4 w-4 shrink-0 rounded-[4px] border-[1.5px] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-none data-[state=checked]:bg-night-100",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-background")}
    >
      <CheckIcon className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const LabeledCheckbox = ({
  children,
  className,
  description,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  description?: string;
} & React.ComponentProps<typeof CheckboxPrimitive.Root>) => (
  <div
    className={cn(
      "flex items-center space-x-2",
      {
        "items-start": description,
      },
      className
    )}
  >
    <Checkbox className={cn(description && "mt-[1px]")} {...props} />
    <div className="grid gap-1.5 leading-none">
      <Label htmlFor={props.id}>{children}</Label>
      {description && (
        <p className="text-xs leading-[140%] text-muted-foreground sm:text-sm">
          {description}
        </p>
      )}
    </div>
  </div>
);

export { Checkbox, LabeledCheckbox };
