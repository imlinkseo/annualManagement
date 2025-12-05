"use client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import PageTitle from "./PageTitle";
import Nav from "./Nav";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import SizeContainer from "@/components/container/SizeContainer";
import Button from "./Button";
import Image from "next/image";
// import {  useEffect } from "react";
import { useLogout } from "@/hooks/useLogout";
const Header = () => {
  const { user, employee } = useAuthStore();
  // const [isLogin, setIsLogin] = useState(false);
  const logout = useLogout();
  const router = useRouter();
  const styles = {
    ctn: `sticky top-0 z-50 w-full flex py-[15px] px-[30px] justify-center bg-white border-b-[1px] border-b-neutral-300`,
    innerCtn: `flex justify-between items-center`,
    titleCtn: `flex items-center gap-[20px] cursor-pointer`,
  };

  function onLinkMain() {
    router.push("/");
  }

  async function onLogout() {
    const ok = await logout();
    console.log(ok);
    if (!ok) return;
    router.replace("/login");
    // router.refresh();
  }
  function onLogin() {
    router.push("/login");
  }

  return (
    <header className={cn(styles.ctn)}>
      <SizeContainer>
        <div className={cn(styles.innerCtn)}>
          <div className={cn(styles.titleCtn)} onClick={onLinkMain}>
            <Logo width={130} height={26.26} />
            <PageTitle title="연차관리" />
          </div>
          <div className={cn(styles.titleCtn)}>
            <Nav isAdmin={employee?.is_admin || false} />
            <Button
              variant={user ? "lightRed" : "lightBlue"}
              text={user ? "로그아웃" : "로그인"}
              leftIcon={
                user ? (
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
              onClick={user ? onLogout : onLogin}
            />
          </div>
        </div>
      </SizeContainer>
    </header>
  );
};

export default Header;
