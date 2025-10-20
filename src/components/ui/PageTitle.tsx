import React from "react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  title: string;
  type?: "default" | "big";
}

const PageTitle = ({ className, title, type = "default" }: Props) => {
  const styles = {
    default: `text-muted text-[17px] font-normal uppercase`,
    big: `text-neutral-900 font-bold text-[36px]`,
  };

  return <p className={cn(styles[type], className)}>{title}</p>;
};

export default PageTitle;
