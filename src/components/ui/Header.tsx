import PageTitle from "./PageTitle";
import Nav from "./Nav";
import Link from "next/link";

const Header = () => {
  return (
    <header className="sticky rounded-lg  top-0 z-50 w-full bg-gray-950 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 justify-between items-center px-4">
        <Link href="/dashboard">
          <PageTitle title="연차관리" className="text-white pl-3" />
        </Link>
        <Nav />
      </div>
    </header>
  );
};

export default Header;
