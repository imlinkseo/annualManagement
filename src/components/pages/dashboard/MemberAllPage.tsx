"use client";
import { cn, isDeepEqual } from "@/lib/utils";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabaseClient";

import { employee } from "@/types/types";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { ThProps } from "@/components/table/Th";
import TdTr from "@/components/table/TdTr";
import ThTr from "@/components/table/ThTr";

const TITLE = `전체 멤버`;

export default function MemberAllPage() {
  const { user, employee } = useAuthStore();
  const [employees, setEmployees] = useState<employee[] | null>(null);
  const router = useRouter();
  const id = useId();

  const setEmployeeIfChanged = (next: employee[] | null) =>
    setEmployees((prev) => (isDeepEqual(prev, next) ? prev : next));

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select(
        "name, team, level, joined_date, vacation_generated_date, vacation_expiry_date, vacation_total, vacation_used, vacation_rest, full_used_date, half_used_date"
      );

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setEmployeeIfChanged(data ?? null);
    }
  };

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
  };

  useEffect(() => {
    if (!user) {
    } else {
      if (user?.id) {
        fetchEmployees();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
    { key: `full_used_date`, label: `연차 사용 날짜`, width: `flex-1` },
    { key: `half_used_date`, label: `반차 사용 날짜`, width: `flex-1` },
  ];

  function onMakeRow(name: string) {
    if (!employees) return;
    return employees.map((item, idx) => {
      const isMe = item.name === name;
      const row = Object.entries(item)
        .map(([key, value]) => {
          if (key !== "created_at" && key !== "id" && key !== "user_id")
            return {
              key: key,
              content: value === null ? `` : value.toString(),
            };
        })
        .filter((cell) => cell !== undefined);

      return (
        <TdTr
          key={id + `tr` + idx}
          columns={columns}
          row={row}
          isMe={isMe}
          onClick={onLinkMyList}
        />
      );
    });
  }

  function onLinkMyList() {
    router.push("/myList");
  }

  if (!employees || !employee) return <LoadingSpinner />;

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
