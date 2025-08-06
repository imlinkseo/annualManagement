import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps {
  label: string;
  className?: string;
  type?: string;
}

const Label = ({ className, label, type = "black" }: LabelProps) => {
  const defaultStyles = `text-md justify-center items-center flex font-semibold p-2 whitespace-nowrap  min-w-[60px] max-w-[100px] shrink-0 min-h-10`;
  const variantStyles: { [key: string]: string } = {
    black: `bg-gray-900 text-white`,
    transparent: `text-gray-950`,
  };
  return (
    <label className={cn(defaultStyles, variantStyles[type], className)}>
      {label}
    </label>
  );
};

export default Label;
