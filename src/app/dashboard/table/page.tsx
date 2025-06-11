"use client";

import { redirect } from "next/navigation";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const Page = () => {
  const { isAuthenticated } = useAuthRedirect();
  if (!isAuthenticated) redirect("/login");

  return (
    <div>
      <h1>직원 연차 현황 페이지</h1>
      {/* 여기에 본문 내용 */}
    </div>
  );
};

export default Page;
