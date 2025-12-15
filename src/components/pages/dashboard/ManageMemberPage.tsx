/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeesStore } from "@/stores/employeesStore";
import { supabase } from "@/lib/supabaseClient";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import { employee as EmployeeType } from "@/types/types";
import InputText from "@/components/ui/InputText";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/datepicker/DatePicker";

const TITLE = `멤버 관리`;

type Draft = Record<string, Record<string, string>>;

function toRowId(item: EmployeeType, idx: number) {
  return String(
    (item as EmployeeType).id ?? (item as EmployeeType).user_id ?? idx
  );
}

function isNumericKey(key: string) {
  return (
    key === "vacation_total" ||
    key === "vacation_used" ||
    key === "vacation_rest"
  );
}

function parseNullableNumber(v: string) {
  const t = v.trim();
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function toDateString(date?: Date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateString(v: string) {
  const t = v.trim();
  if (!t) return undefined;
  const d = new Date(t);
  return isNaN(d.getTime()) ? undefined : d;
}

function isDateKey(key: string) {
  return key.endsWith("_date");
}

function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function getLatestAnniversaryOnOrBeforeToday(joined: Date, today: Date) {
  const base = new Date(joined);
  base.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);

  if (base.getTime() > t.getTime()) return base;

  let cur = base;
  while (true) {
    const next = addYears(cur, 1);
    if (next.getTime() <= t.getTime()) {
      cur = next;
      continue;
    }
    break;
  }
  return cur;
}

export default function ManageMemberPage() {
  const { user, employee } = useAuthStore();
  const { employees, loading, refresh } = useEmployeesStore();
  const router = useRouter();

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
    actions: `flex items-center justify-center gap-2`,
    inputWrap: `w-full`,
    input: `py-[10px] px-[12px] h-[56px]`,
  };

  const columns: ThProps[] = useMemo(
    () => [
      { key: `name`, label: `이름`, width: `w-[140px]` },
      { key: `team`, label: `팀`, width: `w-[140px]` },
      { key: `level`, label: `직책`, width: `w-[120px]` },
      { key: `joined_date`, label: `입사일`, width: `w-[170px]` },
      {
        key: `vacation_generated_date`,
        label: `연차 생성일`,
        width: `w-[170px]`,
      },
      { key: `vacation_expiry_date`, label: `연차 소멸일`, width: `w-[170px]` },
      { key: `vacation_total`, label: `총 갯수`, width: `w-[120px]` },
      { key: `vacation_used`, label: `사용 갯수`, width: `w-[120px]` },
      { key: `vacation_rest`, label: `잔여 갯수`, width: `w-[120px]` },
      { key: `actions`, label: `관리`, width: `w-[220px]` },
    ],
    []
  );

  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user, refresh]);

  useEffect(() => {
    const next: Draft = {};
    employees.forEach((emp, idx) => {
      const rowId = toRowId(emp, idx);
      const record: Record<string, string> = {};

      columns.forEach((c) => {
        const key = c.key;
        if (!key) return;
        if (key === "actions") return;
        const v = (emp as any)[key];
        record[key] = v === null || v === undefined ? "" : String(v);
      });

      next[rowId] = record;
    });

    setDraft(next);
  }, [employees, columns]);

  const isPageLoading = loading && !employees.length;

  useEffect(() => {
    if (!isPageLoading) return;
    const timer = setTimeout(() => router.refresh(), 5000);
    return () => clearTimeout(timer);
  }, [isPageLoading, router]);

  function setCell(rowId: string, key: string, value: string) {
    setDraft((prev) => {
      const next = { ...prev, [rowId]: { ...(prev[rowId] ?? {}) } };
      next[rowId][key] = value;

      if (key === "joined_date") {
        const joined = parseDateString(value);
        if (joined) {
          const today = new Date();
          const gen = getLatestAnniversaryOnOrBeforeToday(joined, today);
          const exp = addYears(gen, 1);
          next[rowId]["vacation_generated_date"] = toDateString(gen);
          next[rowId]["vacation_expiry_date"] = toDateString(exp);
        } else {
          next[rowId]["vacation_generated_date"] = "";
          next[rowId]["vacation_expiry_date"] = "";
        }
      }

      if (key === "vacation_generated_date") {
        const gen = parseDateString(value);
        if (gen) {
          next[rowId]["vacation_expiry_date"] = toDateString(addYears(gen, 1));
        } else {
          next[rowId]["vacation_expiry_date"] = "";
        }
      }

      if (key === "vacation_total" || key === "vacation_used") {
        const total =
          parseNullableNumber(next[rowId]["vacation_total"] ?? "") ?? 0;
        const used =
          parseNullableNumber(next[rowId]["vacation_used"] ?? "") ?? 0;
        const rest = total - used;
        next[rowId]["vacation_rest"] = Number.isFinite(rest)
          ? String(rest)
          : "";
      }

      return next;
    });
  }

  async function onDeleteMember(emp: EmployeeType) {
    const ok = window.confirm(`정말 삭제할까요? (${emp.name ?? "이름없음"})`);
    if (!ok) return;

    const id = (emp as EmployeeType).id;
    const userId = (emp as EmployeeType).user_id;

    const base = supabase.from("employees").delete();
    const query =
      id !== null && id !== undefined
        ? base.eq("id", id)
        : base.eq("user_id", userId);

    const { error } = await query;
    if (error) {
      alert(`삭제 실패: ${error.message}`);
      return;
    }

    refresh();
  }

  async function onUpdateMember(emp: EmployeeType, idx: number) {
    const rowId = toRowId(emp, idx);
    const d = draft[rowId] ?? {};
    const payload: Record<string, any> = {};

    Object.entries(d).forEach(([k, v]) => {
      if (
        k === "created_at" ||
        k === "id" ||
        k === "user_id" ||
        k === "full_used_date" ||
        k === "half_used_date" ||
        k === "actions"
      )
        return;

      if (k === "vacation_rest") return;

      if (isNumericKey(k)) {
        payload[k] = parseNullableNumber(v);
        return;
      }

      if (isDateKey(k)) {
        payload[k] = v.trim() === "" ? null : v;
        return;
      }

      payload[k] = v.trim() === "" ? null : v;
    });

    const id = (emp as EmployeeType).id;
    const userId = (emp as EmployeeType).user_id;

    const base = supabase.from("employees").update(payload);
    const query =
      id !== null && id !== undefined
        ? base.eq("id", id)
        : base.eq("user_id", userId);

    const { error } = await query;
    if (error) {
      alert(`수정 실패: ${error.message}`);
      return;
    }

    refresh();
  }

  const rows = useMemo(() => {
    return employees.map((item: EmployeeType, idx) => {
      const isMe = employee?.name ? item.name === employee.name : false;
      const rowId = toRowId(item, idx);
      const d = draft[rowId] ?? {};

      const row = columns
        .filter((c) => c.key !== "actions")
        .map((c) => {
          const key = c.key as string;

          if (key === "vacation_rest") {
            return {
              key,
              content: (
                <div className={styles.inputWrap}>
                  <InputText
                    className={cn(styles.input)}
                    value={d[key] ?? ""}
                    disabled
                  />
                </div>
              ),
            };
          }

          if (isDateKey(key)) {
            const selected = parseDateString(d[key] ?? "");
            return {
              key,
              content: (
                <div className={styles.inputWrap}>
                  <DatePicker
                    selected={selected}
                    onSelect={(date) => setCell(rowId, key, toDateString(date))}
                  />
                </div>
              ),
            };
          }

          return {
            key,
            content: (
              <div className={styles.inputWrap}>
                <InputText
                  className={cn(styles.input)}
                  value={d[key] ?? ""}
                  type="text"
                  onChangeValue={(v) => setCell(rowId, key, v)}
                />
              </div>
            ),
          };
        });

      row.push({
        key: "actions",
        content: (
          <div className={styles.actions}>
            <Button
              variant="green"
              text="수정"
              onClick={() => onUpdateMember(item, idx)}
            />
            <Button
              variant="red"
              text="삭제"
              onClick={() => onDeleteMember(item)}
            />
          </div>
        ),
      });

      return (
        <TdTr
          key={String(
            (item as EmployeeType).id ?? (item as EmployeeType).user_id ?? idx
          )}
          columns={columns}
          row={row as any}
          isMe={isMe}
        />
      );
    });
  }, [employees, draft, columns, employee?.name]);

  if (isPageLoading) return <LoadingSpinner />;

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title={TITLE} type="big" />
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{rows}</tbody>
      </TableContainer>
    </PageContainer>
  );
}
