"use client";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useAuthStore } from "@/stores/authStore";
import Tr from "@/components/table/Tr";
import Th from "@/components/table/Th";
import Td from "@/components/table/Td";

const TITLE = `전체 멤버`;

export default function MemberAllPage() {
  const { user, employee } = useAuthStore();

  const styles = {
    ctn: `my-[80px] flex flex-col gap-[34px] w-[1600px]`,
  };

  useEffect(() => {
    if (!user) {
      redirect("/login");
    } else {
      if (user?.id) {
      }
    }
  }, [user]);

  const columns = [
    { label: `이름`, width: `w-[100px]` },
    { label: `팀`, width: `w-[100px]` },
    { label: `직책`, width: `w-[80px]` },
    { label: `입사일`, width: `flex-1` },
    { label: `연차 생성일`, width: `flex-1` },
    { label: `연차 소멸일`, width: `flex-1` },
    { label: `총 갯수`, width: `w-[100px]` },
    { label: `사용 갯수`, width: `w-[100px]` },
    { label: `잔여 갯수`, width: `w-[100px]` },
    { label: `연차 사용 날짜`, width: `flex-1` },
    { label: `반차 사용 날짜`, width: `flex-1` },
  ];

  const data = [{ key: ``, content: `` }];

  if (!employee) return <LoadingSpinner />;

  return (
    <PageContainer className={cn(styles.ctn)}>
      <PageTitle title={TITLE} type="big" />
      <TableContainer>
        <thead>
          <Tr>
            {columns.map((item, idx) => (
              <Th key={idx + `th`} {...item} />
            ))}
          </Tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <Tr key={idx + `tr`}>
              <Td content={row.content} width={} />
            </Tr>
          ))}
        </tbody>
      </TableContainer>
    </PageContainer>
  );
}
