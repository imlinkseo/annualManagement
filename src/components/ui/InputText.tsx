"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";
import Label from "./Label";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  onChangeValue: (value: string) => void;
}

const InputText = forwardRef<HTMLInputElement, Props>(
  ({ label, className, onChangeValue, ...props }, ref) => {
    return (
      <div className="flex items-center gap-2 w-full">
        {label && <Label label={label} />}
        <input
          ref={ref}
          className={cn(
            "h-10 w-full rounded-md bg-gray-50 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1",
            className
          )}
          onChange={(e) => onChangeValue(e.target.value)}
          {...props}
        />
      </div>
    );
  }
);

InputText.displayName = "InputText";
export default InputText;
