"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";
import Label from "./Label";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
  onChangeValue?: (value: string) => void;
  name?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, className, onChangeValue, name, ...props }, ref) => {
    const styles = {
      ctn: `bg-white px-[20px] py-[16.5px] h-[120px]  rounded-[5px] border-[1px] border-solid border-neutral-300 w-full resize-none`,
      text: {
        value: `font-medium text-[17px] text-neutral-900`,
        placeholder: `placeholder:font-medium placeholder:text-[17px] placeholder:text-neutral-500`,
      },
    };
    return (
      <div className="flex flex-col items-start gap-2.5 w-full">
        {label && <Label label={label} required={props.required} name={name} />}
        <textarea
          ref={ref}
          className={cn(
            styles.ctn,
            className,
            styles.text.value,
            styles.text.placeholder
          )}
          onChange={(e) => onChangeValue && onChangeValue(e.target.value)}
          required={props.required}
          name={name}
          {...props}
        />
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
