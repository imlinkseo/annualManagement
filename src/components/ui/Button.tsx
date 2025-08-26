"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "black" | "blue";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: Variant;
  className?: string;
  text: string;
  onClick?: () => void;
}

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ onClick, className, variant, text, ...props }, ref) => {
    const baseStyle =
      "cursor-pointer inline-flex items-center font-semibold justify-center rounded-md text-sm  transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

    const variants: Record<Variant, string> = {
      black:
        "bg-gray-950 text-white  hover:bg-blue-500 hover:text-black transition-colors",
      blue: "bg-blue-500 text-black hover:text-gray-50 hover:bg-gray-900  transition-colors",
    };
    const disabled = `bg-gray-300`;

    return (
      <button
        ref={ref}
        className={cn(
          baseStyle,
          variants[variant],
          props.disabled && disabled,
          className,
          "h-10 px-4 py-2"
        )}
        onClick={onClick}
        {...props}
        disabled={props.disabled}
      >
        {text}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
