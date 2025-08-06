import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  variant?: "black" | "white";
}

export default function Text({ children, variant = "black" }: Props) {
  const defaultStyles = `text-[16px] xxs:text-[16px]`;
  const variantStyles: { [key: string]: string } = {
    black: `text-gray-950`,
    white: `text-white`,
  };
  return (
    <p className={cn(defaultStyles, variantStyles[variant])}>{children}</p>
  );
}
