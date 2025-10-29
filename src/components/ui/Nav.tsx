"use client";

import LinkButton from "@/components/ui/LinkButton";

interface Props {
  isAdmin: boolean;
}

const navItems = [
  { label: "전체 멤버", href: "/" },
  { label: "내 목록", href: "/myList" },
  { label: "전체 목록", href: "/listAll" },
  { label: "특수 연차 관리", href: "/manageSpecial" },
  { label: "작성하기", href: "/write" },
];

const Nav = ({ isAdmin }: Props) => {
  return (
    <nav className="flex items-center space-x-2">
      {isAdmin === true
        ? navItems.map((item) => <LinkButton {...item} key={item.href} />)
        : navItems
            .filter(
              (item) =>
                item.label !== "전체 목록" && item.label !== "특수 연차 관리"
            )
            .map((item) => <LinkButton {...item} key={item.href} />)}
    </nav>
  );
};

export default Nav;
