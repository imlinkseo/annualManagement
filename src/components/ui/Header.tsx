import { cn } from "@/lib/utils";
import PageTitle from "./PageTitle";
import Nav from "./Nav";
import Link from "next/link";
import Logo from "./Logo";
import SizeContainer from "@/components/container/SizeContainer";
import Button from "./Button";
import Image from "next/image";
const Header = () => {
  const isLogin: boolean = false;
  const styles = {
    ctn: `sticky top-0 z-50 w-full flex py-[15px] px-[30px] justify-center bg-white border-b-[1px] border-b-neutral-300`,
    innerCtn: `flex justify-between items-center`,
    titleCtn: `flex items-center gap-[20px] `,
  };
  return (
    <header className={cn(styles.ctn)}>
      <SizeContainer>
        <div className={cn(styles.innerCtn)}>
          <div className={cn(styles.titleCtn)}>
            <Logo width={130} height={26.26} />
            <Link href="/dashboard">
              <PageTitle title="연차관리" />
            </Link>
          </div>
          <div className={cn(styles.titleCtn)}>
            <Nav />
            <Button
              variant="lightBlue"
              text={isLogin ? "로그아웃" : "로그인"}
              leftIcon={
                isLogin ? (
                  <Image
                    src={"/icon/logout.svg"}
                    alt="logout"
                    width={25.6}
                    height={24}
                  />
                ) : (
                  <Image
                    src={"/icon/login.svg"}
                    alt="login"
                    width={25.6}
                    height={24}
                  />
                )
              }
            />
          </div>
        </div>
      </SizeContainer>
    </header>
  );
};

export default Header;
