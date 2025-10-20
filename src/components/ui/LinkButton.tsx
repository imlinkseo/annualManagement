"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Props {
  href: string;
  label: string;
}

const LinkButton = ({ href, label }: Props) => {
  const pathlabel = usePathname();
  const isActive = pathlabel === href;
  const styles = {
    transition: `transition-all dutration-100`,
    ctn: {
      default: `bg-white border-[1px] group flex items-center justify-center px-[36px] py-[16px] rounded-[5px]`,
      off: `border-[transparent]`,
      on: `border-blue-700`,
      hover: `hover:bg-blue-25`,
    },
    text: {
      default: `text-[17px] leading-[100%]`,
      off: `text-neutral-700`,
      on: `text-blue-700`,
      hover: `group-hover:text-blue-700`,
    },
  };

  return (
    <Link
      href={href}
      className={cn(
        styles.transition,
        styles.ctn.default,
        isActive ? styles.ctn.on : styles.ctn.off,
        styles.ctn.hover
      )}
    >
      <span
        className={cn(
          styles.transition,
          styles.text.default,
          isActive ? styles.text.on : styles.text.off,
          styles.text.hover
        )}
      >
        {label}
      </span>
    </Link>
  );
};

export default LinkButton;
