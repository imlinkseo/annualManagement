"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface Props {
  type: string;
  href: string;
  name: string;
  icon?: LucideIcon;
}

const LinkButton = ({ type, href, name, icon: Icon }: Props) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  switch (type) {
    case "default":
      return (
        <Link
          href={href}
          className={cn(
            "flex items-center rounded-lg pt-1 pb-1 pr-2 pl-2 space-x-2 text-sm font-medium transition-colors hover:text-gray-700 hover:bg-gray-300",
            isActive ? "bg-blue-500 text-black" : "bg-gray-100"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span className="hidden sm:inline-block">{name}</span>
        </Link>
      );
    case "black":
      return (
        <Link
          href={href}
          className={cn(
            "flex items-center rounded-lg pt-1 pb-1 pr-2 pl-2 space-x-2 text-sm font-medium transition-colors text-white hover:text-gray-50 hover:bg-gray-900",
            isActive ? "bg-blue-500 text-black" : "bg-gray-950"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span className="hidden sm:inline-block">{name}</span>
        </Link>
      );
    default:
      return (
        <Link
          href={href}
          className={cn(
            "flex items-center rounded-lg pt-1 pb-1 pr-2 pl-2 space-x-2 text-sm font-medium transition-colors hover:text-gray-700 hover:bg-gray-300",
            isActive ? "bg-blue-500 text-black" : "bg-gray-100"
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span className="hidden sm:inline-block">{name}</span>
        </Link>
      );
  }
};

export default LinkButton;
