import { serve } from "std/http/server.ts";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  const { data: employees, error } = await supabase
    .from("employees")
    .select("id, joined_date");

  if (error || !employees) {
    console.error("직원 데이터 불러오기 실패:", error);
    return new Response("에러 발생", { status: 500 });
  }

  const today = new Date();

  for (const emp of employees) {
    const id = emp.id;
    const joinedDate = new Date(emp.joined_date);
    const diffTime = today.getTime() - joinedDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30.4375);
    const diffYears = Math.floor(diffDays / 365.25);

    let vacation_total = 0;
    let vacation_generated_date = new Date(joinedDate);
    let vacation_expiry_date;

    if (diffMonths < 12) {
      vacation_total = diffMonths;
      vacation_generated_date = joinedDate;
      vacation_expiry_date = new Date(joinedDate);
      vacation_expiry_date.setFullYear(vacation_expiry_date.getFullYear() + 1);
    } else {
      vacation_total = 15 + (diffYears - 1);
      vacation_generated_date.setFullYear(vacation_generated_date.getFullYear() + diffYears);
      vacation_expiry_date = new Date(vacation_generated_date);
      vacation_expiry_date.setFullYear(vacation_generated_date.getFullYear() + 1);
    }

    await supabase
      .from("employees")
      .update({
        vacation_total,
        vacation_generated_date: vacation_generated_date.toISOString().slice(0, 10),
        vacation_expiry_date: vacation_expiry_date.toISOString().slice(0, 10),
      })
      .eq("id", id);
  }

  return new Response("자동 연차 계산 완료!", { status: 200 });
});
