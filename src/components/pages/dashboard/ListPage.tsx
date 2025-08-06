"use client";

import { useState, useEffect } from "react";
import { useId } from "react";
import { useAuth } from "@/hooks/useAuthRedirect";
import { redirect, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import RowContainer from "@/components/container/RowContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Label from "@/components/ui/Label";
import { employee, vacation } from "@/types/types";
import TableHeadContainer from "@/components/container/TableHeadContainer";
import TableContentContainer from "@/components/container/TableContentContainer";

// status 추가
// 관리자 이메일로 로그인하면 status 변경 가능 (토글 버튼)

export default function ListPage() {
  const id = useId();
  const { user } = useAuth();
  const router = useRouter();
  const [employee, setEmployee] = useState<employee | null>(null);
  const [vacation, setVacation] = useState<vacation[] | null>(null);

  const fetchEmployee = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setEmployee(data?.[0]);
    }
  };

  const fetchVacation = async () => {
    const { data, error } = await supabase
      .from("vacation")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setVacation(data);
    }
  };

  const onMoveViewPage = (vacation: vacation) => {
    const query = new URLSearchParams({
      id: vacation.id || "",
      type: vacation.type || "",
      time: vacation.time || "",
      category: vacation.category || "",
      special: vacation.special || "",
      start_date: vacation.start_date || "",
      end_date: vacation.end_date || "",
      reason: vacation.reason || "",
      created_at: vacation.created_at || "",
      user_id: vacation.user_id || "",
    }).toString();

    router.push(`/dashboard/view?${query}`);
  };

  useEffect(() => {
    if (!user) {
      redirect("/login");
    } else {
      if (user?.id) {
        fetchEmployee();
        fetchVacation();
      }
    }
  }, [user]);

  if (!employee) return <LoadingSpinner />;

  return (
    <PageContainer>
      <PageTitle title={employee.name + "님 사용 연차 목록"} />
      <TableContainer>
        <TableHeadContainer>
          <Label label="No" />
          <Label
            label="시작일"
            className="max-w-full w-[calc((100%_-_120px)/2)]"
          />
          <Label label="~" className="max-w-full w-[60px]" />
          <Label
            label="종료일"
            className="max-w-full w-[calc((100%_-_120px)/2)]"
          />
        </TableHeadContainer>
      </TableContainer>
      <TableContainer>
        {vacation?.map((item, idx) => (
          <RowContainer
            label={{ label: String(idx + 1) }}
            key={id + idx}
            className="cursor-pointer"
          >
            <TableContentContainer onClick={() => onMoveViewPage(item)}>
              <Label
                label={item.start_date}
                className="max-w-auto w-[calc((100%_-_60px)/2)] cursor-pointer"
                type="transparent"
              />
              <Label
                label="~"
                className="max-w-auto w-[60px] cursor-pointer"
                type="transparent"
              />
              <Label
                label={item.end_date}
                className=" max-w-auto w-[calc((100%_-_60px)/2)] cursor-pointer"
                type="transparent"
              />
            </TableContentContainer>
          </RowContainer>
        ))}
      </TableContainer>
    </PageContainer>
  );
}
