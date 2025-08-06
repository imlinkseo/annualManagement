"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthRedirect";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import RowContainer from "@/components/container/RowContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { employee_with_unused } from "@/types/types";
import TableContentContainer from "@/components/container/TableContentContainer";
import Text from "@/components/common/Text";

export default function DashboardPage() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState<employee_with_unused | null>(null);

  const fetchEmployee = async () => {
    const { data, error } = await supabase
      .from("employees_with_unused")
      .select("*")
      .eq("user_id", user?.id);

    if (error) {
      console.error("데이터 가져오기 오류:", error.message);
    } else {
      setEmployee(data?.[0]);
    }
  };

  useEffect(() => {
    if (!user) {
      redirect("/login");
    } else {
      if (user?.id) {
        fetchEmployee();
      }
    }
  }, [user]);

  if (!employee) return <LoadingSpinner />;

  return (
    <PageContainer>
      <PageTitle title={employee.name + "님 연차 현황"} />{" "}
      <TableContainer>
        <RowContainer label={{ label: "총 갯수", className: "w-[100px]" }}>
          <TableContentContainer>
            <Text>{employee.vacation_total}</Text>
          </TableContentContainer>
        </RowContainer>
        <RowContainer label={{ label: "사용 갯수", className: "w-[100px]" }}>
          <TableContentContainer>
            <Text>{employee.vacation_used}</Text>
          </TableContentContainer>
        </RowContainer>
        <RowContainer label={{ label: "남은 갯수", className: "w-[100px]" }}>
          <TableContentContainer>
            <Text>{employee.vacation_unused}</Text>
          </TableContentContainer>
        </RowContainer>
        <RowContainer label={{ label: "생성일", className: "w-[100px]" }}>
          <TableContentContainer>
            <Text>{employee.vacation_generated_date}</Text>
          </TableContentContainer>
        </RowContainer>
        <RowContainer label={{ label: "소멸일", className: "w-[100px]" }}>
          <TableContentContainer>
            <Text>{employee.vacation_expiry_date}</Text>
          </TableContentContainer>
        </RowContainer>
      </TableContainer>
    </PageContainer>
  );
}
