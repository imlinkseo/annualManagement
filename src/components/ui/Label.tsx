import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps {
  label: string;
  className?: string;
  required?: boolean;
  name?: string;
}

const Label = ({ className, label, name, required }: LabelProps) => {
  const styles = {
    ctn: `inline-flex items-start gap-[2px]`,
    text: {
      default: `text-[17px] text-neutral-900 font-semibold whitespace-nowrap`,
      sup: `text-red-600 text-[0.75em] leading-none `,
    },
  };

  return (
    <label className={cn(styles.ctn)} htmlFor={name}>
      {required === true && <span className={cn(styles.text.sup)}> * </span>}
      <span className={cn(styles.text.default, className)}>{label}</span>
    </label>
  );
};

export default Label;
