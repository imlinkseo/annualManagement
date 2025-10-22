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
  const defaultStyles = `text-[17px]`;
  const variantStyles: { [key: string]: string } = {
    black: `text-neutral-900`,
    white: `text-white`,
    red: `text-red-600`,
    blue: `text-blue-700`,
  };
  return (
    <p className={cn(defaultStyles, className, variantStyles[variant])}>
      {children}
    </p>
  );
}
