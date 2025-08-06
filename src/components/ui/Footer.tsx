"use client";

import LinkButton from "@/components/ui/LinkButton";
import { User } from "lucide-react";
import { useAuth } from "@/hooks/useAuthRedirect";
import Text from "../common/Text";

const navItems = [
  { type: "black", name: "로그인", href: "/login", icon: User },
];

const Footer = () => {
  const { user } = useAuth();

  return (
    <footer className="sticky bg-gray-950 bottom-0 rounded-lg z-50 w-full backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="flex justify-end items-center p-3">
        {user ? (
          <Text variant="white">{user.email}</Text>
        ) : (
          navItems.map((item) => <LinkButton {...item} key={item.href} />)
        )}
      </div>
    </footer>
  );
};

export default Footer;
