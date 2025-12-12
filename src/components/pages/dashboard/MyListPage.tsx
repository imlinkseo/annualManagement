"use client";
import { cn } from "@/lib/utils";
// import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Status, employee as EmployeeType } from "@/types/types";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import TableTitle from "@/components/table/TableTitle";
import { useEmployeesStore } from "@/stores/employeesStore";
import { useMyVacationsStore } from "@/stores/myVacationStore";

export default function MyListPage() {
  const { user } = useAuthStore();
  // const router = useRouter();
  const {
    employees,
    // loading: employeesLoading,
    refresh: refreshEmployees,
  } = useEmployeesStore();
  const {
    vacations,
    // loading: vacationsLoading,
    refresh: refreshVacations,
  } = useMyVacationsStore();

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

  useEffect(() => {
    if (!user?.id) return;
    refreshEmployees();
  }, [user?.id, refreshEmployees]);

  useEffect(() => {
    if (!user?.id) return;
    refreshVacations(user.id);
  }, [user?.id, refreshVacations]);

  const me: EmployeeType | null = useMemo(() => {
    if (!user?.id) return null;
    return employees.find((e) => e.user_id === user.id) ?? null;
  }, [employees, user?.id]);

  const filteredVacations = useMemo(() => {
    if (!me) return vacations;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { vacation_generated_date, vacation_expiry_date } = me as any;

    if (!vacation_generated_date || !vacation_expiry_date) return vacations;

    const start = new Date(vacation_generated_date as string);
    const end = new Date(vacation_expiry_date as string);

    return vacations.filter((v) => {
      if (!v.start_date) return false;
      const s = new Date(v.start_date as string);
      return s >= start && s <= end;
    });
  }, [vacations, me]);

  function onMakeRow(status: Status) {
    return filteredVacations
      .filter((item) => item.status === status)
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

  const isPageLoading = !user || !me || !employees || !vacations;

  if (isPageLoading) return <LoadingSpinner />;

  if (!me) return <LoadingSpinner />;

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title={me.name + "님"} type="big" />
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
