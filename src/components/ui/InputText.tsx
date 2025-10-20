"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";
import Label from "./Label";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  onChangeValue?: (value: string) => void;
  name?: string;
}

const InputText = forwardRef<HTMLInputElement, Props>(
  ({ label, className, onChangeValue, name, ...props }, ref) => {
    const styles = {
      ctn: `bg-white px-[20px] py-[16.5px]  rounded-[5px] border-[1px] border-solid border-neutral-300 w-full`,
      text: {
        value: `font-medium text-[17px] text-neutral-900`,
        placeholder: `placeholder:font-medium placeholder:text-[17px] placeholder:text-neutral-500`,
      },
    };
    return (
      <div className="flex flex-col items-start gap-2.5 w-full">
        {label && <Label label={label} required={props.required} name={name} />}
        <input
          ref={ref}
          className={cn(styles.ctn, className)}
          onChange={(e) => onChangeValue && onChangeValue(e.target.value)}
          required={props.required}
          name={name}
          {...props}
        />
      </div>
    );
  }
);

InputText.displayName = "InputText";
export default InputText;
