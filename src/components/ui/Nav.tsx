"use client";

import { Home, List, Pen } from "lucide-react";
import LinkButton from "@/components/ui/LinkButton";

const navItems = [
  { type: "black", name: "메인", href: "/dashboard", icon: Home },
  { type: "black", name: "목록", href: "/dashboard/list", icon: List },
  { type: "black", name: "작성", href: "/dashboard/write", icon: Pen },
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
