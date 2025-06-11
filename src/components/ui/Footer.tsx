"use client";

import LinkButton from "@/components/ui/LinkButton";
import { User } from "lucide-react";

const navItems = [{ type: "black", name: "login", href: "/login", icon: User }];

const Footer = () => {
  return (
    <footer className="sticky bg-gray-950 bottom-2 rounded-lg z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="flex justify-end items-center p-3">
        {navItems.map((item) => (
          <LinkButton {...item} key={item.href} />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
