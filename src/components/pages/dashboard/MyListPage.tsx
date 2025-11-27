"use client";
import { cn, isDeepEqual } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { employee, Status, Vacation } from "@/types/types";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import TableTitle from "@/components/table/TableTitle";

export default function MyListPage() {
  const { user } = useAuthStore();
  const [employee, setEmployee] = useState<employee | null>(null);
  const [vacation, setVacation] = useState<Vacation[] | null>(null);

  const setEmployeeIfChanged = (next: employee | null) =>
    setEmployee((prev) => (isDeepEqual(prev, next) ? prev : next));

  const setVacationIfChanged = (next: Vacation[] | null) =>
    setVacation((prev) => (isDeepEqual(prev, next) ? prev : next));

  const styles = {
    ctn: `w-[1600px] my-[80px] flex flex-col gap-[34px]`,
    tableCtn: `w-full`,
  };

  const columns: ThProps[] = useMemo(
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

  const fetchEmployee = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setEmployeeIfChanged(data?.[0] ?? null);
    }
  };

  const fetchVacation = async () => {
    const { data, error } = await supabase
      .from("vacation")
      .select(
        "type, category, time, special, start_date, end_date, reason, status, normal_num, special_num, date_num, id"
      )
      .eq("user_id", user?.id);

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setVacationIfChanged(data ?? null);
    }
  };

  function onMakeRow(status: Status) {
    return vacation
      ?.filter((item) => item.status === status)
      .map((filtered, idx) => {
        const row = [
          { key: "no", content: idx + 1 },
          ...Object.entries(filtered)
            .map(([key, value]) => {
              if (key !== "created_at" && key !== "user_id" && key !== "id") {
                return { key, content: value === null ? `` : value };
              }
            })
            .filter((cell) => cell !== undefined),
        ];

        return <TdTr key={String(filtered.id)} columns={columns} row={row} />;
      });
  }

  useEffect(() => {
    if (user?.id) {
      fetchEmployee();
      fetchVacation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!employee) return <LoadingSpinner />;

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title={employee.name + "님"} type="big" />
      <div className={cn(styles.tableCtn)}>
        <TableTitle title={"대기중"} />
        <TableContainer>
          <thead>
            <ThTr columns={columns} />
          </thead>
          <tbody>{onMakeRow("대기")}</tbody>
        </TableContainer>
      </div>
      <div className={cn(styles.tableCtn)}>
        <TableTitle title={"승인"} />
        <TableContainer>
          <thead>
            <ThTr columns={columns} />
          </thead>
          <tbody>{onMakeRow("승인")}</tbody>
        </TableContainer>
      </div>
      <div className={cn(styles.tableCtn)}>
        <TableTitle title={"반려"} />
        <TableContainer>
          <thead>
            <ThTr columns={columns} />
          </thead>
          <tbody>{onMakeRow("반려")}</tbody>
        </TableContainer>
      </div>
    </PageContainer>
  );
}
