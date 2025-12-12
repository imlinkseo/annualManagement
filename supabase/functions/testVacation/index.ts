import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

serve(async () => {
  try {
    // 1) 직원 목록 조회
    const { data: employees, error } = await supabase
      .from("employees")
      .select("id, vacation_rest");

    if (error) {
      console.error("직원 조회 실패:", error);
      return new Response(
        [
          "직원 조회 실패",
          error.message && `message=${error.message}`,
          error.code && `code=${error.code}`,
          error.details && `details=${error.details}`,
        ]
          .filter(Boolean)
          .join(" | "),
        { status: 500 }
      );
    }

    if (!employees || employees.length === 0) {
      return new Response("직원이 없습니다.", { status: 200 });
    }

    // 2) 한 명씩 vacation_rest +1 업데이트
    let successCount = 0;
    const failed: { id: string; error: unknown }[] = [];

    for (const emp of employees) {
      const current =
        typeof emp.vacation_rest === "string"
          ? parseFloat(emp.vacation_rest)
          : (emp.vacation_rest ?? 0);

      const next = (isNaN(current) ? 0 : current) + 1;

      const { error: updateError } = await supabase
        .from("employees")
        .update({ vacation_rest: String(next) }) // text 컬럼이라고 가정
        .eq("id", emp.id);

      if (updateError) {
        console.error("업데이트 실패 id=", emp.id, updateError);
        failed.push({ id: emp.id, error: updateError });
      } else {
        successCount++;
      }
    }

    if (failed.length > 0) {
      return new Response(
        `총 ${employees.length}명 중 ${successCount}명 업데이트 성공, ${
          failed.length
        }명 실패`,
        { status: 207 } // multi-status 느낌으로
      );
    }

    return new Response(
      `직원 ${successCount}명의 vacation_rest를 +1 했습니다.`,
      { status: 200 }
    );
  } catch (e) {
    console.error("서버 에러:", e);
    return new Response(`서버 에러: ${String(e)}`, { status: 500 });
  }
});
