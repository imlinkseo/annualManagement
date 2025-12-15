"use client";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Status, employee as EmployeeType, Vacation } from "@/types/types";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import TableTitle from "@/components/table/TableTitle";
import { useEmployeesStore } from "@/stores/employeesStore";
import { useMyVacationsStore } from "@/stores/myVacationStore";
import { supabase } from "@/lib/supabaseClient";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export default function MyListPage() {
  const { user } = useAuthStore();
  const { employees, refresh: refreshEmployees } = useEmployeesStore();
  const { vacations, refresh: refreshVacations } = useMyVacationsStore();
  const { showToast } = useToast();

  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [uiVacations, setUiVacations] = useState(vacations);

  const styles = {
    ctn: `w-[1600px] my-[80px] flex flex-col gap-[34px]`,
    tableCtn: `w-full`,
  };

  const columnsWaiting: ThProps[] = useMemo(
    () => [
      { key: `no`, label: `No`, width: `w-[90px]` },
      { key: `type`, label: `연/반차`, width: `w-[90px]` },
      { key: `category`, label: `특수 여부`, width: `w-[90px]` },
      { key: `time`, label: `시간`, width: `w-[90px]` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
      { key: `status`, label: `상태`, width: `w-[90px]` },
      { key: `normal_num`, label: `일반 연차 갯수`, width: `flex-1` },
      { key: `special_num`, label: `특수 연차 갯수`, width: `flex-1` },
      { key: `date_num`, label: `총 갯수`, width: `flex-1` },
      { key: `cancel`, label: `취소`, width: `w-[120px]` },
    ],
    []
  );

  const columnsDefault: ThProps[] = useMemo(
    () => [
      { key: `no`, label: `No`, width: `w-[90px]` },
      { key: `type`, label: `연/반차`, width: `w-[90px]` },
      { key: `category`, label: `특수 여부`, width: `w-[90px]` },
      { key: `time`, label: `시간`, width: `w-[90px]` },
      { key: `special`, label: `사용 특수 연차명`, width: `flex-1` },
      { key: `start_date`, label: `시작일`, width: `flex-1` },
      { key: `end_date`, label: `종료일`, width: `flex-1` },
      { key: `reason`, label: `사유`, width: `flex-1` },
      { key: `status`, label: `상태`, width: `w-[90px]` },
      { key: `normal_num`, label: `일반 연차 갯수`, width: `flex-1` },
      { key: `special_num`, label: `특수 연차 갯수`, width: `flex-1` },
      { key: `date_num`, label: `총 갯수`, width: `flex-1` },
    ],
    []
  );

  useEffect(() => {
    if (!user?.id) return;
    refreshEmployees();
  }, [user?.id, refreshEmployees]);

  useEffect(() => {
    if (!user?.id) return;
    refreshVacations(user.id);
  }, [user?.id, refreshVacations]);

  useEffect(() => {
    setUiVacations(vacations);
  }, [vacations]);

  const me: EmployeeType | null = useMemo(() => {
    if (!user?.id) return null;
    return employees.find((e) => e.user_id === user.id) ?? null;
  }, [employees, user?.id]);

  const filteredVacations = useMemo(() => {
    if (!me) return uiVacations;

    const { vacation_generated_date, vacation_expiry_date } = me as unknown as {
      vacation_generated_date?: string | null;
      vacation_expiry_date?: string | null;
    };

    if (!vacation_generated_date || !vacation_expiry_date) return uiVacations;

    const start = new Date(vacation_generated_date);
    const end = new Date(vacation_expiry_date);

    return uiVacations.filter((v: Vacation) => {
      if (!v.start_date) return false;
      const s = new Date(v.start_date as string);
      return s >= start && s <= end;
    });
  }, [uiVacations, me]);

  const onCancel = useCallback(
    async (id: string) => {
      if (!user?.id) return;
      if (!confirm("해당 신청을 취소(삭제)할까요?")) return;

      setCancelingId(id);

      const { error } = await supabase
        .from("vacation")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("status", "대기");

      if (error) {
        showToast(`취소 실패: ${error.message}`);
        setCancelingId(null);
        return;
      }

      setUiVacations((prev: Vacation[]) =>
        prev.filter((v) => String(v.id) !== id)
      );
      showToast("취소(삭제)되었습니다.");
      refreshVacations(user.id);
      setCancelingId(null);
    },
    [user?.id, showToast, refreshVacations]
  );

  function makeRow(status: Status) {
    const isWaiting = status === "대기";
    const currentColumns = isWaiting ? columnsWaiting : columnsDefault;

    return filteredVacations
      .filter((item: Vacation) => item.status === status)
      .map((item: Vacation, idx: number) => {
        const baseCells = [
          { key: "no", content: idx + 1 },
          ...Object.entries(item)
            .map(([key, value]) => {
              if (key !== "created_at" && key !== "user_id" && key !== "id") {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                return { key, content: value === null ? `` : (value as any) };
              }
            })
            .filter((cell) => cell !== undefined),
        ];

        const row = isWaiting
          ? [
              ...baseCells,
              {
                key: "cancel",
                content: (
                  <Button
                    variant="red"
                    text="취소"
                    disabled={cancelingId === String(item.id)}
                    onClick={() => onCancel(String(item.id))}
                  />
                ),
              },
            ]
          : baseCells;

        return (
          <TdTr key={String(item.id)} columns={currentColumns} row={row} />
        );
      });
  }

  const isPageLoading = !user || !me || !employees || !uiVacations;

  if (isPageLoading) return <LoadingSpinner />;
  if (!me) return <LoadingSpinner />;

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title={me.name + "님"} type="big" />

      <div className={cn(styles.tableCtn)}>
        <TableTitle title={"대기중"} />
        <TableContainer>
          <thead>
            <ThTr columns={columnsWaiting} />
          </thead>
          <tbody>{makeRow("대기")}</tbody>
        </TableContainer>
      </div>

      <div className={cn(styles.tableCtn)}>
        <TableTitle title={"승인"} />
        <TableContainer>
          <thead>
            <ThTr columns={columnsDefault} />
          </thead>
          <tbody>{makeRow("승인")}</tbody>
        </TableContainer>
      </div>

      <div className={cn(styles.tableCtn)}>
        <TableTitle title={"반려"} />
        <TableContainer>
          <thead>
            <ThTr columns={columnsDefault} />
          </thead>
          <tbody>{makeRow("반려")}</tbody>
        </TableContainer>
      </div>
    </PageContainer>
  );
}
