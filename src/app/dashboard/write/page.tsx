"use client";

import { useState } from "react";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Label from "@/components/ui/Label";
import DatePicker from "@/components/ui/datepicker/DatePicker";
import DateRangePicker from "@/components/ui/datepicker/DateRangePicker";
import RadioGroup from "@/components/ui/RdioGroup";
import DropDown from "@/components/ui/dropdown/DropDown";

export default function Page() {
  const [type, setType] = useState<"연차" | "반차">("연차");
  const [category, setCategory] = useState<"일반" | "특수">("일반");
  const [special, setSpecial] = useState("선택");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reason, setReason] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const user = await supabase.auth.getUser();
    const employeeId = user.data.user?.id;
    if (!employeeId) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    const { error } = await supabase.from("leaves").insert([
      {
        employee_id: employeeId,
        type: type === "연차" ? "annual" : "half",
        category: category === "일반" ? "general" : "special",
        // date,
        reason,
        status: "대기",
      },
    ]);

    if (error) {
      alert("신청 실패: " + error.message);
    } else {
      alert("신청이 완료되었습니다.");
      router.push("/dashboard/list");
    }
  };

  const DROPDOWN_ITEMS_CONDITION_1 = [
    "건강검진",
    "예비군/민방위",
    "본인의 조부모·형제 자매 사망",
    "본인/배우자의 부모·배우자·자녀 사망",
    "배우자 출산",
    "본인 결혼",
    "본인/배우자의 형제자매 결혼",
  ];

  const labelHandler = (label: string, currentValue: string) => {
    return `${currentValue !== "선택" ? currentValue : label}`;
  };

  return (
    <div className="mt-10 flex flex-col gap-5">
      <PageTitle title="write" />
      <div className="flex gap-2">
        <Label label="일수" />
        <RadioGroup
          name="type"
          options={[
            { label: "연차", value: "연차" },
            { label: "반차", value: "반차" },
          ]}
          selected={type}
          onChange={setType}
        />
      </div>

      <div className="flex gap-2">
        <Label label="종류" />

        <RadioGroup
          name="category"
          options={[
            { label: "일반 연차", value: "일반" },
            { label: "특수 연차", value: "특수" },
          ]}
          selected={category}
          onChange={setCategory}
        />
      </div>
      {category === "특수" && (
        <div className="flex gap-2">
          <Label label="특수" />

          <DropDown
            label={labelHandler("선택", special)}
            items={DROPDOWN_ITEMS_CONDITION_1}
            currentValue={special}
            onChangeValue={setSpecial}
          />
        </div>
      )}

      <div className="flex gap-2">
        <Label label="날짜" />
        {type === "연차" ? (
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
          />
        ) : (
          <DatePicker selected={startDate} onSelect={setStartDate} />
        )}
      </div>

      <InputText
        label="사유"
        value={reason}
        placeholder="ex. 개인사정"
        onChangeValue={setReason}
      />

      <Button
        text="신청하기"
        variant="blue"
        className="w-full mt-4"
        onClick={handleSubmit}
      />
    </div>
  );
}
