"use client";

import { Home, List, Pen } from "lucide-react";
import LinkButton from "@/components/ui/LinkButton";

const navItems = [
  { type: "black", name: "home", href: "/dashboard/table", icon: Home },
  { type: "black", name: "list", href: "/dashboard/list", icon: List },
  { type: "black", name: "write", href: "/dashboard/write", icon: Pen },
];

const Nav = () => {
  return (
    <nav className="flex items-center space-x-2">
      {navItems.map((item) => (
        <LinkButton {...item} key={item.href} />
      ))}
    </nav>
  );
};

export default Nav;
