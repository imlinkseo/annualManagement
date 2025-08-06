"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { vacation } from "@/types/types";
import PageContainer from "@/components/container/PageContainer";
import PageTitle from "@/components/ui/PageTitle";
import TableContainer from "@/components/container/TableContainer";
import RowContainer from "@/components/container/RowContainer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Text from "@/components/common/Text";
import Button from "@/components/ui/Button";

export default function ViewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vacation, setVacation] = useState<vacation | null>(null);

  useEffect(() => {
    setVacation({
      id: searchParams.get("id") as string,
      type: searchParams.get("type") as string,
      time: searchParams.get("time") as string,
      category: searchParams.get("category") as string,
      special: searchParams.get("special"),
      start_date: searchParams.get("start_date") as string,
      end_date: searchParams.get("end_date") as string,
      reason: searchParams.get("reason") as string,
      created_at: searchParams.get("created_at") as string,
      user_id: searchParams.get("user_id") as string,
    });
  }, [searchParams]);

  const onClickListButton = () => {
    router.push("/dashboard/list");
  };

  if (!vacation) return <LoadingSpinner />;

  return (
    <PageContainer>
      <PageTitle title="상세 보기" />
      <TableContainer>
        <RowContainer label={{ label: "일수", className: "w-[80px]" }}>
          <Text>{vacation.type}</Text>
        </RowContainer>
        {vacation.type === "반차" && (
          <RowContainer label={{ label: "시간", className: "w-[80px]" }}>
            <Text>{vacation.time}</Text>
          </RowContainer>
        )}
        <RowContainer label={{ label: "종류", className: "w-[80px]" }}>
          <Text>{vacation.category}</Text>
        </RowContainer>
        {vacation.category === "특수" && (
          <RowContainer label={{ label: "특수", className: "w-[80px]" }}>
            <Text>{vacation.special}</Text>
          </RowContainer>
        )}
        <RowContainer label={{ label: "시작일", className: "w-[80px]" }}>
          <Text>{vacation.start_date}</Text>
        </RowContainer>
        <RowContainer label={{ label: "종료일", className: "w-[80px]" }}>
          <Text>{vacation.end_date}</Text>
        </RowContainer>
        <RowContainer label={{ label: "사유", className: "w-[80px]" }}>
          <Text>{vacation.reason}</Text>
        </RowContainer>
      </TableContainer>
      <Button variant="black" text="목록으로" onClick={onClickListButton} />
    </PageContainer>
  );
}
