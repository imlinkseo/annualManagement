"use client";

import LinkButton from "@/components/ui/LinkButton";

const navItems = [
  { label: "전체 멤버", href: "/" },
  { label: "내 목록", href: "/myList" },
  { label: "전체 목록", href: "/listAll" },
  { label: "작성하기", href: "/write" },
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
