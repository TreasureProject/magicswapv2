import React from "react";
import { twMerge } from "tailwind-merge";

interface Props {
  className?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({ icon, placeholder, onChange, className, value }: Props) => {
  return (
    <div className={twMerge("relative h-10", className)}>
      {!!icon && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-base-700">
          {icon}
        </div>
      )}
      <input
        className={twMerge(
          "h-full rounded-md bg-base-900 px-3 text-sm text-base-600 placeholder:text-base-600 focus:border-none focus:outline-none focus:ring-0",
          icon && "pl-8",
          className
        )}
        placeholder={placeholder}
        onChange={(e) => onChange(e)}
        value={value}
      />
    </div>
  );
};

export default Input;
