"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import PageContainer from "../container/PageContainer";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

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
    <PageContainer>
      <PageTitle title="로그인" />
      <div className="space-y-4">
        <InputText
          label="id"
          type="email"
          value={email}
          placeholder="sample@sample.com"
          onChangeValue={setEmail}
        />
        <InputText
          label="pw"
          type="password"
          value={password}
          placeholder="*******"
          onChangeValue={setPassword}
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="blue"
            onClick={handleLogin}
            text="로그인"
            className="w-full cursor-pointer"
          />
          <Link href="/join">
            <Button
              variant="black"
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
