import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  title: string;
}

const PageTitle = ({ className, title }: Props) => {
  const baseStyle = `text-xl font-semibold uppercase`;
  return <p className={cn(baseStyle, className)}>{title}</p>;
};

export default PageTitle;
