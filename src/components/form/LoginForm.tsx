"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import PageContainer from "../container/PageContainer";
import Logo from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const styles = {
    ctn: `w-[600px] my-[114px] flex flex-col items-center justify-center gap-[40px]`,
    titleCtn: `flex flex-col items-center gap-2.5`,
    formCtn: `w-full flex flex-col gap-[24px]`,
    buttonCtn: `w-full flex flex-col gap-2.5`,
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert("로그인 실패: " + error.message);
    } else {
      if (data.session) {
        supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
            router.push("/dashboard");
          }
        });
      }
    }
  };

  return (
    <PageContainer className={cn(styles.ctn)}>
      <div className={cn(styles.titleCtn)}>
        <Logo width={250} height={50} />
        <PageTitle title="연차계산기" />
      </div>
      <div className={cn(styles.formCtn)}>
        <InputText
          label="아이디"
          type="email"
          value={email}
          placeholder="sample@sample.com"
          onChangeValue={setEmail}
          required={true}
        />
        <InputText
          label="pw"
          type="password"
          value={password}
          placeholder="비밀번호를 입력해주세요. (숫자 6자리)"
          onChangeValue={setPassword}
          required={true}
        />
        <div className={cn(styles.buttonCtn)}>
          <Button
            variant="blue"
            onClick={handleLogin}
            text="로그인"
            className="w-full cursor-pointer"
          />
          <Link href="/join">
            <Button
              variant="gray"
              text="회원가입"
              className="w-full cursor-pointer"
            />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};

export default LoginForm;
