"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuthRedirect";
import { uploadFormData } from "@/lib/uploadFormData";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import DateRangePicker from "@/components/ui/datepicker/DateRangePicker";
import RadioGroup from "@/components/ui/RdioGroup";
import DropDown from "@/components/ui/dropdown/DropDown";
import PageContainer from "@/components/container/PageContainer";
import RowContainer from "@/components/container/RowContainer";
import TableContainer from "@/components/container/TableContainer";
import { formData, special, special_item } from "@/types/types";

interface calcDate {
  common: number;
  special: number;
  total: number;
}

export default function WritePage() {
  const { user } = useAuth();
  const [calcDate, setCalcDate] = useState<calcDate>({
    common: 0,
    special: 0,
    total: 0,
  });
  const [formData, setFormData] = useState<formData>({
    userId: null,
    type: "연차",
    category: "일반",
    time: null,
    special: null,
    startDate: new Date(),
    endDate: new Date(),
    reason: "개인사유",
    status: "대기",
    date_num: 0,
  });

  const handleChangeFormData = <K extends keyof formData>(
    key: K,
    value: formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };
  const handleChangeCalcDate = <K extends keyof calcDate>(
    key: K,
    value: calcDate[K]
  ) => {
    setCalcDate((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!user) {
      redirect("/login");
    }
  }, []);
  useEffect(() => {
    if (!user) {
      redirect("/login");
    } else {
      if (user.id) handleChangeFormData("userId", user.id);
    }
  }, [user]);

  const router = useRouter();

  useEffect(() => {
    if (formData.type === "연차") {
      handleChangeFormData("time", null);
    }
    if (formData.category === "일반") {
      handleChangeFormData("special", null);
    }
  }, [formData.type, formData.category]);

  useEffect(() => {
    const diffTime =
      (formData.endDate as Date).getTime() -
      (formData.startDate as Date).getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (formData.type === "반차") {
      handleChangeCalcDate("common", 0.5);
      return;
    }

    if (diffDays === 0) {
      handleChangeCalcDate("common", 1);
    } else {
      handleChangeCalcDate("common", diffDays + 1);
    }
  }, [formData.startDate, formData.endDate, formData.type]);

  const handleSubmit = async () => {
    try {
      await uploadFormData(formData);
      alert("신청서가 제출되었습니다.");
      router.push("/dashboard/list");
    } catch (e) {
      alert("제출 중 오류가 발생했습니다.");
      console.log(e);
    }
  };

  const DROPDOWN_ITEMS_VALUE: special_item[] = [
    { "건강검진 (0.5일)": 0.5 },
    { "예비군/민방위 (1일)": 1 },
    { "본인의 조부모·형제 자매 사망 (2일)": 2 },
    { "본인/배우자의 부모·배우자·자녀 사망 (5일)": 5 },
    { "배우자 출산 (3일)": 3 },
    { "본인 결혼 (5일)": 5 },
    { "본인/배우자의 형제자매 결혼 (1일)": 1 },
  ];

  const labelHandler = (label: string, currentValue: string | null) => {
    return `${currentValue !== label ? currentValue : label}`;
  };

  return (
    <PageContainer>
      <PageTitle title="연차 신청서 작성" />
      <TableContainer>
        <RowContainer label={{ label: "일수" }}>
          <RadioGroup
            name="type"
            options={[
              { label: "연차", value: "연차" },
              { label: "반차", value: "반차" },
            ]}
            selected={formData.type}
            onChange={(value) => {
              handleChangeFormData("type", value);
            }}
          />
        </RowContainer>
        {formData.type === "반차" && (
          <RowContainer label={{ label: "시간" }}>
            <RadioGroup
              name="time"
              options={[
                { label: "오전", value: "오전" },
                { label: "오후", value: "오후" },
              ]}
              selected={formData.time}
              onChange={(value) => {
                handleChangeFormData("time", value);
              }}
            />
          </RowContainer>
        )}
        <RowContainer label={{ label: "종류" }}>
          <RadioGroup
            name="category"
            options={[
              { label: "일반 연차", value: "일반" },
              { label: "특수 연차", value: "특수" },
            ]}
            selected={formData.category}
            onChange={(value) => {
              handleChangeFormData("category", value);
            }}
          />
        </RowContainer>

        <RowContainer label={{ label: "날짜" }}>
          {formData.type === "연차" ? (
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.endDate}
              onChangeStart={(value) => {
                handleChangeFormData("startDate", value);
              }}
              onChangeEnd={(value) => {
                handleChangeFormData("endDate", value);
              }}
            />
          ) : (
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.startDate}
              onChangeStart={(value) => {
                handleChangeFormData("startDate", value);
                handleChangeFormData("endDate", value);
              }}
              isEndDateDisabled={true}
            />
          )}
        </RowContainer>
        {formData.category === "특수" && (
          <RowContainer label={{ label: "특수" }}>
            <DropDown
              label={labelHandler(
                "선택",
                formData.special === null ? "선택" : formData.special
              )}
              items={DROPDOWN_ITEMS_VALUE}
              currentValue={String(formData.special)}
              onChangeKey={(key: string) => {
                handleChangeFormData("special", key as special);
              }}
              onChangeValue={(value: string | number) => {
                if (typeof value === "number") {
                  handleChangeCalcDate("special", value);
                } else {
                  handleChangeCalcDate("special", parseInt(value));
                }
              }}
            />
          </RowContainer>
        )}
        <RowContainer label={{ label: "사유" }}>
          <InputText
            value={formData.reason}
            placeholder="ex. 개인사정"
            onChangeValue={(value) => {
              handleChangeFormData("reason", value);
            }}
          />
        </RowContainer>
      </TableContainer>
      <Button
        text="신청하기"
        variant="blue"
        className="w-full mt-4"
        onClick={handleSubmit}
      />
    </PageContainer>
  );
}
