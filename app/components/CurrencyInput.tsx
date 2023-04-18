import type { InputHTMLAttributes } from "react";
import { cn } from "~/lib/utils";

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
};

export const CurrencyInput = ({
  className,
  value,
  onChange,
  ...inputProps
}: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let periodMatches = 0;
    const nextValue = e.target.value
      .replace(/,/g, ".") // Replace commas with periods
      .replace(/[^0-9.]/g, "") // Replace all non-numeric and non-period characters
      .replace(/\./g, (match) => (++periodMatches > 1 ? "" : match)); // Replace all periods after the first one
    onChange(nextValue || "0");
  };

  return (
    <input
      type="text"
      className={cn("bg-transparent text-right", className)}
      placeholder="0.00"
      value={value === "0" ? "" : value}
      onChange={handleChange}
      {...inputProps}
    />
  );
};
