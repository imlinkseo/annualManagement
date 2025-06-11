// src/utils/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/utils/supabase/database.types";

export async function createServerSupabase() {
  const cookieStore = await cookies(); // ✅ 이제 Promise니까 await 사용!

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        secure: false, // ✅ 개발 환경에서는 false로 설정
      },
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({
            name: c.name,
            value: c.value,
          }));
        },
        setAll() {
          // 서버에서는 set 생략 가능
        },
      },
    }
  );
}
