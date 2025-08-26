"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
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
import Text from "@/components/common/Text";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface calcDate {
  common: number;
  special: number;
  total: number;
}

const initialCalcData: calcDate = {
  common: 0,
  special: 0,
  total: 0,
};
const initialReason = "개인사유";

const ERROR_MSG = `*특수연차 일수가 소비할 일수보다 많습니다.*`;

export default function WritePage() {
  const { user, employee } = useAuthStore();
  const [calcDate, setCalcDate] = useState<calcDate>(initialCalcData);
  const [formData, setFormData] = useState<formData>({
    userId: null,
    type: "연차",
    category: "일반",
    time: null,
    special: null,
    startDate: new Date(),
    endDate: new Date(),
    reason: initialReason,
    status: "대기",
    date_num: 0,
  });

  const handleChangeFormData = <K extends keyof formData>(
    key: K,
    value: formData[K]
  ) => {
    if (key === "special" && value) {
      setFormData((prev) => ({
        ...prev,
        [key]: value,
        reason: value as string,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [key]: value }));
    }
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

      setCalcDate({ common: 1, special: 0, total: 1 });
    } else {
      setCalcDate({ common: 0.5, special: 0, total: 1 });
    }
    handleChangeFormData("special", null);
    handleChangeFormData("reason", initialReason);
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

  const handleCalcTotalDate = useMemo(() => {
    return calcDate.common - calcDate.special;
  }, [calcDate.common, calcDate.special]);

  useEffect(() => {
    setCalcDate((prev) => ({ ...prev, total: handleCalcTotalDate }));
  }, [calcDate.common, calcDate.special]);

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
    { 건강검진: 0.5 },
    { "예비군/민방위": 1 },
    { "본인의 조부모·형제 자매 사망": 2 },
    { "본인/배우자의 부모·배우자·자녀 사망": 5 },
    { "배우자 출산": 3 },
    { "본인 결혼": 5 },
    { "본인/배우자의 형제자매 결혼": 1 },
  ];

  const DROPDOWN_ITEMS_VALUE_LABEL = DROPDOWN_ITEMS_VALUE.map((item) => {
    const [key, value] = Object.entries(item)[0];
    return { [`${key}: ${value}일`]: value };
  });

  const labelHandler = (label: string, currentValue: string | null) => {
    return `${currentValue !== label ? currentValue : label}`;
  };

  const handleIsAllDone = (): boolean => {
    if (formData.category === "특수") {
      if (formData.special !== null) {
        if (calcDate.common < calcDate.special) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  if (!employee) {
    return <LoadingSpinner />;
  }

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
              { label: "특수 연차 포함", value: "특수" },
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
              items={
                formData.type === "반차"
                  ? [DROPDOWN_ITEMS_VALUE_LABEL[0]]
                  : DROPDOWN_ITEMS_VALUE_LABEL
              }
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
        <RowContainer label={{ label: "소비" }}>
          <Text variant={calcDate.common < calcDate.special ? "red" : "black"}>
            {formData.category === "일반"
              ? calcDate.total + "일"
              : calcDate.common +
                "일" +
                " - " +
                "특수 " +
                calcDate.special +
                "일" +
                " = " +
                calcDate.total +
                "일"}
          </Text>
        </RowContainer>
      </TableContainer>
      <TableContainer>
        <RowContainer label={{ label: "총" }}>
          <Text>{employee.vacation_total}일</Text>
        </RowContainer>
        <RowContainer label={{ label: "사용" }}>
          <Text>
            기존&nbsp;({employee.vacation_used})&nbsp;+&nbsp;소비&nbsp;(
            {calcDate.total}) &nbsp;=&nbsp; 총&nbsp;(
            {employee.vacation_used + calcDate.total})일
          </Text>
        </RowContainer>
        <RowContainer label={{ label: "잔여" }}>
          <Text>{parseInt(employee.vacation_unused) - calcDate.total}일</Text>
        </RowContainer>
      </TableContainer>
      <Button
        text="신청하기"
        variant="blue"
        className="w-full mt-4"
        onClick={handleSubmit}
        disabled={!handleIsAllDone()}
      />
      {calcDate.common < calcDate.special && (
        <Text variant="red" className="text-center">
          {ERROR_MSG}
        </Text>
      )}
    </PageContainer>
  );
}
