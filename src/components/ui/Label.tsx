import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps {
  label: string;
  className?: string;
  type?: string;
}

const Label = ({ className, label, type = "black" }: LabelProps) => {
  const defaultStyles = `text-[14px] xxs:text-md justify-center items-center flex font-semibold p-2 whitespace-nowrap min-w-[50px]  xxs:min-w-[60px] max-w-[100px] shrink-0 min-h-6`;
  const variantStyles: { [key: string]: string } = {
    black: `bg-gray-900 text-white`,
    transparent: `text-gray-950`,
    red: `bg-red-500`,
    blue: `bg-blue-500`,
  };
  return (
    <label className={cn(defaultStyles, variantStyles[type], className)}>
      {label}
    </label>
  );
};

export default Label;
