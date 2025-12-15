"use client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useEmployeesStore } from "@/stores/employeesStore";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";
import { employee as EmployeeType } from "@/types/types";

const TITLE = `전체 멤버`;

export default function MemberAllPage() {
  const { user, employee } = useAuthStore();
  const { employees, loading, refresh } = useEmployeesStore();
  const router = useRouter();

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
  };

  const columns: ThProps[] = [
    { key: `name`, label: `이름`, width: `w-[100px]` },
    { key: `team`, label: `팀`, width: `w-[100px]` },
    { key: `level`, label: `직책`, width: `w-[80px]` },
    { key: `joined_date`, label: `입사일`, width: `flex-1` },
    { key: `vacation_generated_date`, label: `연차 생성일`, width: `flex-1` },
    { key: `vacation_expiry_date`, label: `연차 소멸일`, width: `flex-1` },
    { key: `vacation_total`, label: `총 갯수`, width: `w-[100px]` },
    { key: `vacation_used`, label: `사용 갯수`, width: `w-[100px]` },
    { key: `vacation_rest`, label: `잔여 갯수`, width: `w-[100px]` },
  ];

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    if (!user) return;
    refresh();
  }, [user, refresh]);

  function onLinkMyList() {
    router.push("/myList");
  }

  function onMakeRow(myName?: string) {
    return employees.map((item: EmployeeType, idx) => {
      const isMe = myName ? item.name === myName : false;

      const row = Object.entries(item)
        .map(([key, value]) => {
          if (
            key !== "created_at" &&
            key !== "id" &&
            key !== "user_id" &&
            key !== "full_used_date" &&
            key !== "half_used_date"
          ) {
            return {
              key,
              content: value === null ? `` : value.toString(),
            };
          }
        })
        .filter((cell) => cell !== undefined) as {
        key: string;
        content: string;
      }[];

      return (
        <TdTr
          key={String(item.id ?? item.user_id ?? idx)}
          columns={columns}
          row={row}
          isMe={isMe}
          onClick={isMe ? onLinkMyList : undefined}
        />
      );
    });
  }

  const isPageLoading = loading && !employees.length;

  useEffect(() => {
    if (!isPageLoading) return;

    const timer = setTimeout(() => {
      router.refresh();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isPageLoading, router]);

  if (isPageLoading) return <LoadingSpinner />;

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title={TITLE} type="big" />
      <TableContainer>
        <thead>
          <ThTr columns={columns} />
        </thead>
        <tbody>{onMakeRow(employee?.name)}</tbody>
      </TableContainer>
    </PageContainer>
  );
}
