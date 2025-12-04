"use client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const {
    employees,
    loading: employeesLoading,
    refresh: refreshEmployees,
  } = useEmployeesStore();
  const {
    vacations,
    loading: vacationsLoading,
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
    if (!employees.length && !employeesLoading) {
      refreshEmployees();
    }
  }, [user?.id, employees.length, employeesLoading, refreshEmployees]);

  useEffect(() => {
    if (!user?.id) return;
    if (!vacations.length && !vacationsLoading) {
      refreshVacations(user.id);
    }
  }, [user?.id, vacations.length, vacationsLoading, refreshVacations]);

  const me: EmployeeType | null = useMemo(() => {
    if (!user?.id) return null;
    return employees.find((e) => e.user_id === user.id) ?? null;
  }, [employees, user?.id]);

  function onMakeRow(status: Status) {
    return vacations
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

  const isPageLoading =
    !user ||
    (!me && employeesLoading) ||
    (!vacations.length && vacationsLoading);

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
