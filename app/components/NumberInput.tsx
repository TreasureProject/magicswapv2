import { useLocale } from "@react-aria/i18n";
import { useNumberField } from "@react-aria/numberfield";
import { useNumberFieldState } from "@react-stately/numberfield";
import React from "react";

import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { cn } from "~/lib/utils";

export const NumberInput = ({
  className,
  children,
  errorCondition,
  ...props
}: Parameters<typeof useNumberField>[0] & {
  errorCondition: (value: number) => boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const { locale } = useLocale();
  const state = useNumberFieldState({ ...props, locale });
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const { inputProps } = useNumberField(props, state, inputRef);

  const sanitizedValue = parseFloat(state.inputValue.replace(/[^0-9.]/g, ""));

  return (
    <>
      <div className={cn("relative", className)}>
        <Input
          {...inputProps}
          ref={inputRef}
          className={cn(
            sanitizedValue > 49
              ? "focus:border-ruby-500 focus:ring-ruby-500"
              : "focus:border-night-500 focus:ring-night-500",
            "block w-full rounded-md bg-night-800/60 text-sm focus:border-night-500"
          )}
          placeholder={props.placeholder}
        />
        {children}
      </div>
      {props.errorMessage && errorCondition(sanitizedValue) ? (
        <p className="col-span-4 text-xs text-ruby-900">{props.errorMessage}</p>
      ) : null}
    </>
  );
};
