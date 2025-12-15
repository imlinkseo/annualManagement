"use client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import { Vacation, employee } from "@/types/types";
import Tab from "@/components/ui/Tab";
import Textarea from "@/components/ui/Textarea";
import { useToast } from "@/components/ui/Toast";
import { useVacationStore } from "@/stores/vacationStore";
import DropDown from "@/components/ui/dropdown/DropDown";
import Label from "@/components/ui/Label";

const TITLE = `전체 목록`;

export type TabStatus = "대기" | "처리";

interface DateFilter {
  year: string;
  month: string;
}

const initialDate: DateFilter = { year: "선택", month: "선택" };

const EmptyTableRow = ({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) => {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="py-[40px] text-center text-neutral-500 text-sm"
      >
        {text}
      </td>
    </tr>
  );
};

export default function ListAllPage() {
  const { employees, vacation, loading, refresh, setVacation } =
    useVacationStore();
  const router = useRouter();
  const [date, setDate] = useState<DateFilter>(initialDate);
  const [isFiltered, setIsFiltered] = useState(false);
  const [tabStatus, setTabStatus] = useState<TabStatus>("대기");
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | string | null>(null);
  const [refuseReason, setRefuseReason] = useState("");
  const { showToast } = useToast();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSelected, setCancelSelected] = useState<Vacation | null>(null);

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
    dateSectionCtn: `flex border-[1px] border-solid border-[#ddd] rounded-sm w-full justify-between p-[16px]`,
    dateSectionInnerCtn: `flex gap-[12px] w-full items-center`,
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  const TAB_ITEMS = [
    { label: `대기중`, value: `대기` as TabStatus },
    { label: `처리`, value: `처리` as TabStatus },
  ];

  function onChangeStatus(value: TabStatus) {
    setTabStatus(value);
  }

  const DROPDOWN_YEAR_ITEMS: { [key: string]: string | number }[] = Array.from(
    { length: 31 },
    (_, idx) => {
      const year = 2020 + idx;
      return { [year]: year };
    }
  );

  const DROPDOWN_MONTH_ITEMS: { [key: string]: string | number }[] = Array.from(
    { length: 12 },
    (_, idx) => {
      const month = idx + 1;
      const monthStr = String(month).padStart(2, "0");
      return { [monthStr]: monthStr };
    }
  );

  function filterByDate(list: Vacation[]) {
    if (date.year === "선택") return list;
    const year = date.year;
    const month = date.month === "선택" ? null : date.month;
    return list.filter((item) => {
      const start = String(item.start_date ?? "");
      if (!start) return false;
      const [y, m] = start.split("-");
      if (y !== year) return false;
      if (month && m !== month) return false;
      return true;
    });
  }

  const filteredVacation = isFiltered ? filterByDate(vacation) : vacation;

  const sortedVacation = useMemo(() => {
    const getTime = (v: Vacation) => {
      const start = v.start_date ? new Date(String(v.start_date)).getTime() : 0;
      const end = v.end_date ? new Date(String(v.end_date)).getTime() : 0;
      return Math.max(start, end);
    };
    return [...(filteredVacation ?? [])].sort(
      (a, b) => getTime(b) - getTime(a)
    );
  }, [filteredVacation]);

  const DateSection = () => {
    function onClickSearchButton() {
      if (date.year === "선택") {
        showToast("연도를 선택해 주세요.");
        return;
      }
      setIsFiltered(true);
    }

    function onClickViewAllButton() {
      setDate(initialDate);
      setIsFiltered(false);
    }

    return (
      <div className={cn(styles.dateSectionCtn)}>
        <div className={cn(styles.dateSectionInnerCtn)}>
          <Label label="연도" />
          <DropDown
            label={date.year}
            items={DROPDOWN_YEAR_ITEMS}
            currentValue={date.year}
            onChangeKey={(key: string) =>
              setDate((prev) => ({
                ...prev,
                year: String(key),
              }))
            }
            onChangeValue={(value: string | number) =>
              setDate((prev) => ({
                ...prev,
                year: String(value),
              }))
            }
            className="max-w-[240px]"
          />
          <Label label="월" />
          <DropDown
            label={date.month}
            items={DROPDOWN_MONTH_ITEMS}
            currentValue={date.month}
            onChangeKey={(key: string) =>
              setDate((prev) => ({
                ...prev,
                month: String(key).padStart(2, "0"),
              }))
            }
            onChangeValue={(value: string | number) =>
              setDate((prev) => ({
                ...prev,
                month: String(value).padStart(2, "0"),
              }))
            }
            className="max-w-[240px]"
          />
          <Button
            variant="blue"
            text="검색"
            onClick={onClickSearchButton}
            className="px-[32px] py-[14px] shrink-0"
          />
        </div>
        <Button
          variant="white"
          text="전체 보기"
          onClick={onClickViewAllButton}
          className="px-[32px] py-[14px] shrink-0"
        />
      </div>
    );
  };

  function getDateRange(startStr?: string | null, endStr?: string | null) {
    if (!startStr) return [];
    const start = new Date(startStr);
    const end = endStr ? new Date(endStr) : new Date(startStr);
    const result: string[] = [];

    const d = new Date(start);
    while (d.getTime() <= end.getTime()) {
      const mm = d.getMonth() + 1;
      const dd = d.getDate();
      result.push(`${mm}/${dd}`);
      d.setDate(d.getDate() + 1);
    }

    return result;
  }

  function mergeDates(prev: string | null, dates: string[]) {
    const prevArr = prev
      ? prev
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
    const merged = Array.from(new Set([...prevArr, ...dates]));
    return merged.join(",");
  }

  function removeDates(prev: string | null, dates: string[]) {
    const prevArr = prev
      ? prev
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];
    const removeSet = new Set(dates.map((v) => v.trim()).filter(Boolean));
    const next = prevArr.filter((d) => !removeSet.has(d));
    return next.length ? next.join(",") : null;
  }

  async function applyApprovalEffects(item: Vacation) {
    const dateNum =
      item.date_num === undefined ? 0 : parseFloat(String(item.date_num));

    const usedDates = getDateRange(
      item.start_date ? String(item.start_date) : null,
      item.end_date ? String(item.end_date) : null
    );

    const isHalf = item.type === "반차";

    if (!(dateNum > 0)) return { ok: true as const };

    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .select("vacation_used, vacation_rest, full_used_date, half_used_date")
      .eq("user_id", item.user_id)
      .single();

    if (empErr) return { ok: false as const, message: empErr.message };

    const nextUsed = Number(emp.vacation_used ?? 0) + dateNum;
    const nextRest = Number(emp.vacation_rest ?? 0) - dateNum;

    let nextFullUsedDate = emp.full_used_date as string | null;
    let nextHalfUsedDate = emp.half_used_date as string | null;

    if (isHalf) {
      nextHalfUsedDate = mergeDates(nextHalfUsedDate, usedDates);
    } else {
      nextFullUsedDate = mergeDates(nextFullUsedDate, usedDates);
    }

    const { error: updEmpErr } = await supabase
      .from("employees")
      .update({
        vacation_used: nextUsed,
        vacation_rest: nextRest,
        full_used_date: nextFullUsedDate,
        half_used_date: nextHalfUsedDate,
      })
      .eq("user_id", item.user_id);

    if (updEmpErr) return { ok: false as const, message: updEmpErr.message };

    return { ok: true as const };
  }

  async function rollbackEmployeeUsage(item: Vacation) {
    const dateNum =
      item.date_num === undefined ? 0 : parseFloat(String(item.date_num));
    if (!(dateNum > 0)) return { ok: true as const };

    const usedDates = getDateRange(
      item.start_date ? String(item.start_date) : null,
      item.end_date ? String(item.end_date) : null
    );

    const isHalf = item.type === "반차";

    const { data: emp, error: empErr } = await supabase
      .from("employees")
      .select("vacation_used, vacation_rest, full_used_date, half_used_date")
      .eq("user_id", item.user_id)
      .single();

    if (empErr) return { ok: false as const, message: empErr.message };

    const nextUsed = Number(emp.vacation_used ?? 0) - dateNum;
    const nextRest = Number(emp.vacation_rest ?? 0) + dateNum;

    let nextFullUsedDate = emp.full_used_date as string | null;
    let nextHalfUsedDate = emp.half_used_date as string | null;

    if (isHalf) {
      nextHalfUsedDate = removeDates(nextHalfUsedDate, usedDates);
    } else {
      nextFullUsedDate = removeDates(nextFullUsedDate, usedDates);
    }

    const { error: updEmpErr } = await supabase
      .from("employees")
      .update({
        vacation_used: nextUsed < 0 ? 0 : nextUsed,
        vacation_rest: nextRest,
        full_used_date: nextFullUsedDate,
        half_used_date: nextHalfUsedDate,
      })
      .eq("user_id", item.user_id);

    if (updEmpErr) return { ok: false as const, message: updEmpErr.message };

    return { ok: true as const };
  }

  async function onConfirmCancelProcessed() {
    if (!cancelSelected) return;

    const item = cancelSelected;

    if (item.status === "승인") {
      const r = await rollbackEmployeeUsage(item);
      if (!r.ok) {
        showToast(`취소(롤백) 실패: ${r.message}`);
        return;
      }
    }

    const { error: delErr } = await supabase
      .from("vacation")
      .delete()
      .eq("id", item.id);

    if (delErr) {
      showToast(`삭제 실패: ${delErr.message}`);
      return;
    }

    setVacation((prev) => prev.filter((v) => v.id !== item.id));
    setCancelSelected(null);
    setCancelOpen(false);
    showToast("취소(삭제) 처리 되었습니다.");
  }

  const WaitTable = () => {
    const columns: ThProps[] = [
      { key: `no`, label: `No`, width: `w-[100px]` },
      { key: `name`, label: `이름`, width: `flex-1` },
      { key: `type`, label: `연/반차`, width: `flex-1` },
      { key: `category`, label: `특수 여부`, width: `flex-1` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
      { key: `approval`, label: `승인`, width: `w-[100px]` },
      { key: `refuse`, label: `반려`, width: `w-[100px]` },
    ];

    async function onClickApprovalButton(item: Vacation) {
      const { data: updated, error: upErr } = await supabase
        .from("vacation")
        .update({ status: "승인", refuse_reason: null })
        .eq("id", item.id)
        .eq("status", "대기")
        .select("*")
        .maybeSingle();

      if (upErr) {
        showToast(`승인 실패: ${upErr.message}`);
        return;
      }
      if (!updated) {
        showToast("이미 처리된 신청서입니다.");
        return;
      }

      const eff = await applyApprovalEffects(updated);
      if (!eff.ok) {
        showToast(`직원 연차 반영 실패: ${eff.message}`);
        return;
      }

      setVacation((prev) =>
        prev.map((v) =>
          v.id === item.id ? ({ ...v, status: "승인" } as Vacation) : v
        )
      );
      showToast("승인 처리되었습니다.");
    }

    function onClickRefuseButton(id: string) {
      setSelectedId(id);
      setOpen(true);
    }

    function getNameByUserId(userId: string | number) {
      const found = employees.find(
        (employee: employee) => employee.user_id === userId
      );
      return found ? found.name : "";
    }

    function onMakeRow() {
      const list = sortedVacation.filter((item) => item.status === "대기");

      const rows = list.map((filtered, idx) => {
        const row = [
          { key: "no", content: idx + 1 },
          {
            key: "name",
            content: getNameByUserId(filtered?.user_id as string),
          },
          ...Object.entries(filtered)
            .map(([key, value]) => {
              if (
                key !== "status" &&
                key !== "user_id" &&
                key !== "id" &&
                key !== "refuse_reason" &&
                key !== "date_num"
              ) {
                return { key, content: value === null ? `` : value };
              }
            })
            .filter((cell) => cell !== undefined),
          {
            key: "approval",
            content: (
              <Button
                variant="green"
                text="승인"
                onClick={() => onClickApprovalButton(filtered)}
              />
            ),
          },
          {
            key: "refuse",
            content: (
              <Button
                variant="red"
                text="반려"
                onClick={() => onClickRefuseButton(filtered.id as string)}
              />
            ),
          },
        ];

        return <TdTr key={String(filtered.id)} columns={columns} row={row} />;
      });

      if (!rows.length) {
        const text = isFiltered
          ? "선택한 기간에 해당하는 대기 중 신청서가 없습니다."
          : "대기 중인 신청서가 없습니다.";
        return <EmptyTableRow colSpan={columns.length} text={text} />;
      }

      return rows;
    }

    return (
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{onMakeRow()}</tbody>
      </TableContainer>
    );
  };

  const DoneTable = () => {
    const columns: ThProps[] = [
      { key: `no`, label: `No`, width: `w-[100px]` },
      { key: `name`, label: `이름`, width: `flex-1` },
      { key: `type`, label: `연/반차`, width: `flex-1` },
      { key: `category`, label: `특수 여부`, width: `flex-1` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
      { key: `status`, label: `상태`, width: `flex-1` },
      { key: `refuse_reason`, label: `반려 사유`, width: `flex-1` },
      { key: `cancel`, label: `취소/승인`, width: `w-[120px]` },
    ];

    async function approveFromRefused(item: Vacation) {
      const { data: updated, error: upErr } = await supabase
        .from("vacation")
        .update({ status: "승인", refuse_reason: null })
        .eq("id", item.id)
        .eq("status", "반려")
        .select("*")
        .maybeSingle();

      if (upErr) {
        showToast(`승인 실패: ${upErr.message}`);
        return;
      }
      if (!updated) {
        showToast("이미 처리된 신청서입니다.");
        return;
      }

      const eff = await applyApprovalEffects(updated);
      if (!eff.ok) {
        showToast(`직원 연차 반영 실패: ${eff.message}`);
        return;
      }

      setVacation((prev) =>
        prev.map((v) =>
          v.id === item.id
            ? ({ ...v, status: "승인", refuse_reason: "" } as Vacation)
            : v
        )
      );
      showToast("승인 처리되었습니다.");
    }

    function getNameByUserId(userId: string | number) {
      const found = employees.find(
        (employee: employee) => employee.user_id === userId
      );
      return found ? found.name : "";
    }

    function onClickCancelRow(item: Vacation) {
      setCancelSelected(item);
      setCancelOpen(true);
    }

    function onMakeRow() {
      const list = sortedVacation.filter((item) => item.status !== "대기");

      const rows = list.map((filtered, idx) => {
        const row = [
          { key: "no", content: idx + 1 },
          {
            key: "name",
            content: getNameByUserId(filtered?.user_id as string),
          },
          ...Object.entries(filtered)
            .map(([key, value]) => {
              if (
                key !== "status" &&
                key !== "user_id" &&
                key !== "id" &&
                key !== "normal_num" &&
                key !== "date_num" &&
                key !== "special_num" &&
                key !== "special_file_path"
              ) {
                return { key, content: value === null ? `` : value };
              } else if (key === "status") {
                return {
                  key: "status",
                  content:
                    value === "승인" ? (
                      <Button variant="green" text="승인" onClick={() => {}} />
                    ) : (
                      <Button variant="red" text="반려" onClick={() => {}} />
                    ),
                };
              }
            })
            .filter((cell) => cell !== undefined),
          {
            key: "cancel",
            content:
              filtered.status === "승인" ? (
                <Button
                  variant="red"
                  text="취소"
                  onClick={() => onClickCancelRow(filtered)}
                />
              ) : (
                <Button
                  variant="green"
                  text="승인"
                  onClick={() => approveFromRefused(filtered)}
                />
              ),
          },
        ];

        return <TdTr key={String(filtered.id)} columns={columns} row={row} />;
      });

      if (!rows.length) {
        const text = isFiltered
          ? "선택한 기간에 해당하는 처리된 신청서가 없습니다."
          : "처리된 신청서가 없습니다.";
        return <EmptyTableRow colSpan={columns.length} text={text} />;
      }

      return rows;
    }

    return (
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{onMakeRow()}</tbody>
      </TableContainer>
    );
  };

  function onRenderTable(tabStatus: TabStatus) {
    switch (tabStatus) {
      case "대기":
        return <WaitTable />;
      default:
        return <DoneTable />;
    }
  }

  async function onClickRefuseModalButton() {
    if (!selectedId) return;
    const { error } = await supabase
      .from("vacation")
      .update({ status: "반려", refuse_reason: refuseReason })
      .eq("id", selectedId);
    if (error) {
      showToast(`반려 실패: ${error.message}`);
      return;
    }
    setVacation((prev) =>
      prev.map((v) =>
        v.id === selectedId
          ? { ...v, status: "반려", refuse_reason: refuseReason }
          : v
      )
    );
    setRefuseReason("");
    setSelectedId(null);
    setOpen(false);
    showToast("반려 처리 되었습니다.");
  }

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      router.refresh();
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading, router]);

  if (loading && !employees.length && !vacation) return <LoadingSpinner />;

  return (
    <>
      <PageContainer className={cn(styles.ctn)}>
        <PageTitle title={TITLE} type="big" />
        <DateSection />
        <Tab
          items={TAB_ITEMS}
          currentValue={tabStatus}
          onChange={onChangeStatus}
        />
        {onRenderTable(tabStatus)}
      </PageContainer>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="반려 사유 입력"
        actions={
          <>
            <Button
              variant="white"
              text="뒤로가기"
              onClick={() => setOpen(false)}
            />
            <Button
              variant="blue"
              text="반려처리"
              onClick={onClickRefuseModalButton}
              className="px-[32px] py-[14px]"
            />
          </>
        }
      >
        <Textarea
          className="h-[240px]"
          value={refuseReason}
          onChange={(e) => setRefuseReason(e.currentTarget.value)}
        />
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="처리된 신청서 취소"
        actions={
          <>
            <Button
              variant="white"
              text="뒤로가기"
              onClick={() => setCancelOpen(false)}
            />
            <Button
              variant="red"
              text="취소(삭제)"
              onClick={onConfirmCancelProcessed}
              className="px-[32px] py-[14px]"
            />
          </>
        }
      >
        <div className="flex flex-col gap-2 text-[14px] text-neutral-700">
          <div>
            {cancelSelected?.status === "승인"
              ? "승인된 신청서입니다. 취소 시 직원의 사용/잔여 연차 및 사용일자가 함께 롤백됩니다."
              : "반려된 신청서입니다. 취소 시 신청서가 삭제됩니다."}
          </div>
          <div className="text-neutral-500">
            <p>
              대상: {cancelSelected?.start_date ?? ""} ~{" "}
              {cancelSelected?.end_date ?? ""}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
