import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "black" | "white" | "red" | "blue";
}

export default function Text({
  children,
  className,
  variant = "black",
}: Props) {
  const defaultStyles = `text-[14px] xxs:text-[16px]`;
  const variantStyles: { [key: string]: string } = {
    black: `text-gray-950`,
    white: `text-white`,
    red: `text-red-500`,
    blue: `text-blue-500`,
  };
  return (
    <p className={cn(defaultStyles, className, variantStyles[variant])}>
      {children}
    </p>
  );
}
