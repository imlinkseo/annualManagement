"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import PageTitle from "@/components/ui/PageTitle";
import PageContainer from "@/components/container/PageContainer";
import Logo from "@/components/ui/Logo";
import DatePicker from "@/components/ui/datepicker/DatePicker";
import Label from "@/components/ui/Label";

const JoinPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [joinedDate, setJoinedDate] = useState<Date | undefined>(undefined);
  const [level, setLevel] = useState("");
  const router = useRouter();

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[40px] items-center w-[600px]`,
    titleCtn: `flex flex-col items-center gap-2.5`,
    formCtn: `w-full flex flex-col gap-[24px]`,
    buttonCtn: `w-full flex flex-col gap-2.5`,
  };

  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleJoin = async () => {
    if (joinedDate === undefined) {
      alert("입사일을 선택해주세요.");
      return;
    }
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

    const today = new Date();

    const diffYears =
      today.getFullYear() -
      joinedDate.getFullYear() -
      (today <
      new Date(today.getFullYear(), joinedDate.getMonth(), joinedDate.getDate())
        ? 1
        : 0);

    const isOverOneYear = diffYears >= 1;
    const vacationTotal = isOverOneYear ? 15 : 11;

    const getRecentVacationGeneratedDate = (baseDate: Date) => {
      const current = new Date(baseDate);
      while (current <= today) {
        const next = new Date(current);
        next.setFullYear(next.getFullYear() + 1);
        if (next > today) break;
        current.setFullYear(current.getFullYear() + 1);
      }
      return current;
    };

    const vacationGeneratedDate = getRecentVacationGeneratedDate(joinedDate);
    const vacationExpiryDate = new Date(vacationGeneratedDate);
    vacationExpiryDate.setFullYear(vacationExpiryDate.getFullYear() + 1);

    const { error: insertError } = await supabase.from("employees").insert([
      {
        user_id: userId,
        name,
        team,
        level,
        joined_date: formatDateToYYYYMMDD(joinedDate),
        vacation_generated_date: formatDateToYYYYMMDD(vacationGeneratedDate),
        vacation_expiry_date: formatDateToYYYYMMDD(vacationExpiryDate),
        vacation_total: vacationTotal,
        vacation_used: 0,
        vacation_rest: vacationTotal,
        is_admin: false,
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
    <PageContainer className={cn(styles.ctn)}>
      <div className={cn(styles.titleCtn)}>
        <Logo width={250} height={50} />
        <PageTitle title="회원가입" />
      </div>
      <div className={cn(styles.formCtn)}>
        <InputText
          label="이름"
          type="text"
          value={name}
          placeholder="이름을 입력해주세요."
          onChangeValue={setName}
          required={true}
        />
        <InputText
          label="팀"
          type="text"
          value={team}
          placeholder="팀 이름을 입력해주세요."
          onChangeValue={setTeam}
        />
        <InputText
          label="직책"
          type="text"
          value={level}
          placeholder="직책을 입력해주세요."
          onChangeValue={setLevel}
        />
        <div className={cn(styles.buttonCtn)}>
          <Label label={"입사일"} required={true} name={name} />
          <DatePicker
            selected={joinedDate}
            onSelect={(date) => setJoinedDate(date)}
          />
        </div>
        <InputText
          label="아이디"
          type="email"
          value={email}
          placeholder="sample@sample.com"
          onChangeValue={setEmail}
          required={true}
        />
        <InputText
          label="비밀번호"
          type="password"
          value={password}
          placeholder="비밀번호를 입력해주세요. (숫자 6자리)"
          onChangeValue={setPassword}
          required={true}
        />
        <InputText
          label="비밀번호 확인"
          type="password"
          value={confirmPassword}
          placeholder="비밀번호를 재입력해주세요. (숫자 6자리)"
          onChangeValue={setConfirmPassword}
          required={true}
        />
        <div className={cn(styles.buttonCtn)}>
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
