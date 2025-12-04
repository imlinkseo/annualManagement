"use client";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { uploadFormData } from "@/lib/uploadFormData";
import Button from "@/components/ui/Button";
import PageTitle from "@/components/ui/PageTitle";
import DateRangePicker from "@/components/ui/datepicker/DateRangePicker";
import RadioGroup from "@/components/ui/RdioGroup";
import DropDown from "@/components/ui/dropdown/DropDown";
import PageContainer from "@/components/container/PageContainer";
import TableContainer from "@/components/container/TableContainer";
import ThTr from "@/components/table/ThTr";
import { formData, special } from "@/types/types";
import Text from "@/components/common/Text";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import Textarea from "@/components/ui/Textarea";
import SingleFileInput from "@/components/ui/SingleFileInput";
import { getHolidaySetInRange, isWeekend } from "@/lib/krHolidays";
import { useSpecialStore } from "@/stores/specialStore";

const initialReason = "개인사유";
const ERROR_MSG = `*특수연차 일수가 소비할 일수보다 많습니다.*`;

export default function WritePage() {
  const { user, employee } = useAuthStore();
  const {
    specials,
    loading: specialsLoading,
    refresh: refreshSpecials,
  } = useSpecialStore();
  const router = useRouter();
  const [holidaySet, setHolidaySet] = useState<Set<string>>(new Set());

  const ymd = (d: Date) => {
    const z = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const yyyy = z.getFullYear();
    const mm = String(z.getMonth() + 1).padStart(2, "0");
    const dd = String(z.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const isBusinessDay = (d: Date) => !isWeekend(d) && !holidaySet.has(ymd(d));

  const countBusinessDays = (start: Date, end: Date) => {
    let s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    let e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (e < s) [s, e] = [e, s];
    let c = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (isBusinessDay(d)) c++;
    }
    return c;
  };

  const [formData, setFormData] = useState<formData>({
    userId: null,
    type: "연차",
    time: null,
    category: "일반",
    special: null,
    startDate: new Date(),
    endDate: new Date(),
    reason: initialReason,
    status: "대기",
    normal_num: 1,
    special_num: 0,
    date_num: 1,
    file: null,
  });

  const reCalc = (draft: formData): formData => {
    const start = draft.startDate as Date;
    const end = draft.endDate as Date;
    const normal =
      draft.type === "반차"
        ? isBusinessDay(start)
          ? 0.5
          : 0
        : countBusinessDays(start, end);
    const sp = draft.category === "특수" ? Number(draft.special_num || 0) : 0;
    const total = Math.max(0, Number(normal) - sp);
    return {
      ...draft,
      normal_num: Number(normal),
      special_num: sp,
      date_num: Number(total),
    };
  };

  const update = <K extends keyof formData>(key: K, value: formData[K]) => {
    setFormData((prev) => {
      const next: formData = {
        ...prev,
        [key]: value,
        ...(key === "type" && value === "연차" ? { time: null } : {}),
        ...(key === "type" || key === "category"
          ? { special: null, reason: initialReason, special_num: 0 }
          : {}),
        ...(key === "special" && value ? { reason: value as string } : {}),
        ...(key === "startDate" && prev.type === "반차"
          ? { endDate: value }
          : {}),
      } as formData;
      return reCalc(next);
    });
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.id) {
      update("userId", user.id);
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.id) return;
    if (!specials.length && !specialsLoading) {
      refreshSpecials();
    }
  }, [user?.id, specials.length, specialsLoading, refreshSpecials]);

  useEffect(() => {
    const s = formData.startDate as Date;
    const e = (
      formData.type === "반차" ? formData.startDate : formData.endDate
    ) as Date;
    const set = getHolidaySetInRange(s, e);
    setHolidaySet(set);
  }, [formData.startDate, formData.endDate, formData.type]);

  const handleSubmit = async () => {
    try {
      await uploadFormData(formData);
      alert("신청서가 제출되었습니다.");
      router.push("/myList");
    } catch (e) {
      alert("제출 중 오류가 발생했습니다.");
      console.log(e);
    }
  };

  const handleIsAllDone = (): boolean => {
    if (formData.category === "특수") {
      if (formData.special === null) return false;
      return formData.normal_num >= formData.special_num;
    }
    return true;
  };

  const styles = {
    ctn: `w-[1600px] flex flex-col gap-[34px] my-[80px]`,
    formCtn: `flex flex-col items-center gap-[24px] w-full`,
    tableCtn: `flex gap-[60px] w-full`,
    th: `hidden`,
  };

  const isPageLoading = !user || (specialsLoading && specials.length === 0);

  // ✅ 로딩이 5초 이상 지속되면 자동 새로고침
  useEffect(() => {
    if (!isPageLoading) return;

    const timer = setTimeout(() => {
      // soft refresh (데이터 refetch용)
      router.refresh();
      // 만약 완전 새로고침이 더 안전하다면:
      // window.location.reload();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isPageLoading, router]);

  if (isPageLoading) return <LoadingSpinner />;

  const MainTable = () => {
    const columns: ThProps[] = useMemo(
      () => [
        { key: `title`, label: `제목`, width: `w-[140px]` },
        { key: `node`, label: `내용`, width: `flex-1` },
      ],
      []
    );

    const typeRow = [
      { key: `title`, content: `연/반차` },
      {
        key: `node`,
        content: (
          <RadioGroup
            name="type"
            options={[
              { label: "연차", value: "연차" },
              { label: "반차", value: "반차" },
            ]}
            selected={formData.type}
            onChange={(v) => update("type", v)}
            eachWidth="w-[125px]"
          />
        ),
      },
    ];

    const timeRow = [
      { key: `title`, content: `시간` },
      {
        key: `node`,
        content: (
          <RadioGroup
            name="time"
            options={[
              { label: "오전", value: "오전" },
              { label: "오후", value: "오후" },
            ]}
            selected={formData.time}
            onChange={(v) => update("time", v)}
            eachWidth="w-[125px]"
          />
        ),
      },
    ];

    const categoryRow = [
      { key: `title`, content: `종류` },
      {
        key: `node`,
        content: (
          <RadioGroup
            name="category"
            options={[
              { label: "일반 연차", value: "일반" },
              { label: "특수 연차 포함", value: "특수" },
            ]}
            selected={formData.category}
            onChange={(v) => update("category", v)}
            eachWidth="w-[125px]"
          />
        ),
      },
    ];

    const dateRow = [
      { key: `title`, content: `날짜` },
      {
        key: `node`,
        content:
          formData.type === "연차" ? (
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.endDate}
              onChangeStart={(v) => update("startDate", v)}
              onChangeEnd={(v) => update("endDate", v)}
            />
          ) : (
            <DateRangePicker
              startDate={formData.startDate}
              endDate={formData.startDate}
              onChangeStart={(v) => update("startDate", v)}
              isEndDateDisabled={true}
            />
          ),
      },
    ];

    const DROPDOWN_ITEMS_VALUE_LABEL = specials.map((item) => {
      return { [`${item.name}: ${item.num}일`]: String(item.num) };
    });

    const specialRow = [
      { key: `title`, content: `특수` },
      {
        key: `node`,
        content: (
          <DropDown
            label={
              formData.special === null
                ? "선택해주세요."
                : String(formData.special)
            }
            items={
              formData.type === "반차" && DROPDOWN_ITEMS_VALUE_LABEL.length
                ? [DROPDOWN_ITEMS_VALUE_LABEL[0]]
                : DROPDOWN_ITEMS_VALUE_LABEL
            }
            currentValue={String(formData.special)}
            onChangeKey={(key: string) => update("special", key as special)}
            onChangeValue={(value: string | number) =>
              setFormData((prev) =>
                reCalc({
                  ...prev,
                  special_num:
                    typeof value === "number" ? value : parseFloat(value),
                } as formData)
              )
            }
          />
        ),
      },
    ];

    const reasonRow = [
      { key: `title`, content: `사유` },
      {
        key: `node`,
        content: (
          <Textarea
            value={formData.reason}
            placeholder="ex. 개인사정"
            onChangeValue={(v) => update("reason", v)}
          />
        ),
      },
    ];

    const useRow = [
      { key: `title`, content: `소비` },
      {
        key: `node`,
        content:
          formData.category === "일반"
            ? `${formData.date_num}일`
            : `${formData.normal_num}일 - 특수 ${formData.special_num}일 = ${formData.date_num}일`,
      },
    ];

    const fileRow = [
      { key: `title`, content: `증빙` },
      {
        key: `node`,
        content: (
          <SingleFileInput
            id="file"
            name="file"
            value={formData.file}
            onChange={(v) => update("file", v)}
            placeholder="선택된 파일 없음"
          />
        ),
      },
    ];

    return (
      <TableContainer>
        <thead>
          <ThTr columns={columns} className={cn(styles.th)} />
        </thead>
        <tbody>
          <TdTr columns={columns} row={typeRow} />
          {formData.type === "반차" && <TdTr columns={columns} row={timeRow} />}
          <TdTr columns={columns} row={categoryRow} />
          {formData.category === "특수" && (
            <TdTr columns={columns} row={specialRow} />
          )}
          {formData.category === "특수" && (
            <TdTr columns={columns} row={fileRow} />
          )}
          <TdTr columns={columns} row={dateRow} />
          <TdTr columns={columns} row={reasonRow} />
          <TdTr columns={columns} row={useRow} />
        </tbody>
      </TableContainer>
    );
  };

  const SideTable = () => {
    const columns: ThProps[] = useMemo(
      () => [
        { key: `title`, label: `제목`, width: `w-[140px]` },
        { key: `node`, label: `내용`, width: `w-[300px]` },
      ],
      []
    );

    if (!employee) return null;

    const rows = [
      [
        { key: `title`, content: `총` },
        { key: `node`, content: <Text>{employee.vacation_total}일</Text> },
      ],
      [
        { key: `title`, content: `사용` },
        {
          key: `node`,
          content: (
            <Text>
              기존 ({employee.vacation_used}) + 소비 ({formData.date_num}) = 총(
              {(parseInt(employee.vacation_used as string) || 0) +
                formData.date_num}
              )일
            </Text>
          ),
        },
      ],
      [
        { key: `title`, content: `잔여` },
        {
          key: `node`,
          content: (
            <Text>
              {parseInt(employee.vacation_rest as string) - formData.date_num}일
            </Text>
          ),
        },
      ],
    ];

    return (
      <TableContainer className="w-auto">
        <thead>
          <ThTr columns={columns} className={cn(styles.th)} />
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <TdTr key={i} columns={columns} row={row} />
          ))}
        </tbody>
      </TableContainer>
    );
  };

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title="연차 신청서 작성" type="big" />
      <div className={cn(styles.formCtn)}>
        <div className={cn(styles.tableCtn)}>
          <MainTable />
          <SideTable />
        </div>
        <Button
          text="신청하기"
          variant="blue"
          onClick={handleSubmit}
          disabled={!handleIsAllDone()}
          className="w-[200px]"
        />
      </div>
      {formData.normal_num < formData.special_num && (
        <Text variant="red" className="text-center">
          {ERROR_MSG}
        </Text>
      )}
    </PageContainer>
  );
}
