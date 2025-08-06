"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import PageContainer from "@/components/container/PageContainer";

const JoinPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [level, setLevel] = useState("");
  const router = useRouter();

  const handleJoin = async () => {
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("올바른 이메일 형식이 아닙니다.");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("회원가입 실패: " + error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      alert("회원가입 후 사용자 정보를 가져오는 데 실패했습니다.");
      return;
    }

    const { error: insertError } = await supabase.from("employees").insert([
      {
        user_id: userId,
        name,
        position,
        level,
        joined_date: new Date().toISOString().split("T")[0],
      },
    ]);

    if (insertError) {
      alert("직원 정보 저장 실패: " + insertError.message);
      return;
    }

    alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
    router.push("/login");
  };

  return (
    <PageContainer>
      <PageTitle title="회원가입" />
      <div className="space-y-4">
        <InputText
          label="name"
          type="text"
          value={name}
          placeholder="jane"
          onChangeValue={setName}
        />
        <InputText
          label="position"
          type="text"
          value={position}
          placeholder="팀원"
          onChangeValue={setPosition}
        />
        <InputText
          label="level"
          type="text"
          value={level}
          placeholder="사원"
          onChangeValue={setLevel}
        />
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
        <InputText
          label="confirm pw"
          type="password"
          value={confirmPassword}
          placeholder="*******"
          onChangeValue={setConfirmPassword}
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="blue"
            text="회원가입"
            className="w-full cursor-pointer"
            onClick={handleJoin}
          />
        </div>
      </div>
    </PageContainer>
  );
};

export default JoinPage;
