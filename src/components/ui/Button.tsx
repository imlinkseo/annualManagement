"use client";

import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "black" | "blue" | "red" | "lightBlue" | "gray";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
  className?: string;
  text: string;
  leftIcon?: React.ReactNode;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ onClick, className, variant, text, leftIcon, ...props }, ref) => {
    const baseStyle =
      "gap-[10px] cursor-pointer inline-flex items-center font-semibold justify-center transition-all disabled:opacity-50 disabled:pointer-events-none";

    const variants: Record<Variant, string> = {
      black:
        "bg-gray-950 text-white  hover:bg-blue-500 hover:text-black transition-colors",
      blue: "bg-blue-700 text-white hover:bg-blue-600 py-[12px] rounded-[5px]",
      red: `bg-red-50 text-red-600 text-[17px] rounded-[5px] px-[35px] py-[16px] leading-[100%]`,
      lightBlue: `bg-blue-50 text-blue-700 text-[17px] rounded-[5px] px-[35px] py-[16px] leading-[100%]`,
      gray: `bg-neutral-500 text-white hover:bg-neutral-700 py-[12px] rounded-[5px]`,
    };
    const disabled = `bg-gray-300`;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyle,
          variants[variant],
          props.disabled && disabled,
          className
        )}
        onClick={onClick}
        {...props}
        disabled={props.disabled}
      >
        {leftIcon && leftIcon}
        {text}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
