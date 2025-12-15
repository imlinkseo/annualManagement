import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function toNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

serve(async () => {
  try {
    const { data: employees, error } = await supabase
      .from("employees")
      .select(
        "id, joined_date, vacation_total, vacation_used, vacation_rest"
      );

    if (error || !employees) {
      console.error("STEP1 직원 데이터 불러오기 실패:", error);
      return new Response("직원 데이터 조회 실패", { status: 500 });
    }

    const today = new Date();

    let successCount = 0;
    let skippedCount = 0;
    const failed: { id: string; reason: string }[] = [];

    for (const emp of employees) {
      if (!emp.joined_date) {
        skippedCount++;
        continue;
      }

      const id: string = emp.id;
      const joinedDate = new Date(emp.joined_date as string);

      if (isNaN(joinedDate.getTime()) || joinedDate > today) {
        skippedCount++;
        continue;
      }

      const diffTime = today.getTime() - joinedDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30.4375);
      const diffYears = Math.floor(diffDays / 365.25);

      let expectedTotal = 0;
      let vacationGeneratedDate = new Date(joinedDate);
      let vacationExpiryDate: Date;

      if (diffMonths < 12) {
        // 입사 1년 미만: 지난 개월 수만큼 월차
        expectedTotal = diffMonths;
        vacationGeneratedDate = joinedDate;
        vacationExpiryDate = new Date(joinedDate);
        vacationExpiryDate.setFullYear(vacationExpiryDate.getFullYear() + 1);
      } else {
        // 입사 1년 이상
        // 만 3년 근로까지는 15개,
        // 만 3년 초과분부터 2년마다 +1개 (4~5년차: 16, 6~7년차: 17, ...)
        if (diffYears <= 3) {
          expectedTotal = 15;
        } else {
          const extra = Math.floor((diffYears - 2) / 2); // 4,5년차 →1 / 6,7년차 →2 ...
          expectedTotal = 15 + extra;
        }

        vacationGeneratedDate.setFullYear(
          vacationGeneratedDate.getFullYear() + diffYears
        );
        vacationExpiryDate = new Date(vacationGeneratedDate);
        vacationExpiryDate.setFullYear(vacationExpiryDate.getFullYear() + 1);
      }

      const used = toNumber(emp.vacation_used);
      let rest = expectedTotal - used;
      if (rest < 0) rest = 0;

      const { error: updateError } = await supabase
        .from("employees")
        .update({
          vacation_total: expectedTotal,
          vacation_rest: String(rest),
          vacation_generated_date: formatDate(vacationGeneratedDate),
          vacation_expiry_date: formatDate(vacationExpiryDate),
        })
        .eq("id", id);

      if (updateError) {
        console.error("STEP2 업데이트 실패 id=", id, updateError);
        failed.push({
          id,
          reason:
            [
              updateError.message && `message=${updateError.message}`,
              updateError.code && `code=${updateError.code}`,
              updateError.details && `details=${updateError.details}`,
            ]
              .filter(Boolean)
              .join(" | ") || "unknown",
        });
      } else {
        successCount++;
      }
    }

    const body = [
      "AUTO_VACATION_DONE",
      `success=${successCount}`,
      `skipped=${skippedCount}`,
      `failed=${failed.length}`,
    ].join(" | ");

    return new Response(body, {
      status: failed.length > 0 ? 207 : 200,
    });
  } catch (e) {
    console.error("STEP0 서버 에러:", e);
    return new Response(`서버 에러: ${String(e)}`, { status: 500 });
  }
});
