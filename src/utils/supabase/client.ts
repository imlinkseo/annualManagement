// utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/utils/supabase/database.types";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookieOptions: {
      secure: false, // ✅ 개발 환경에서는 false로 설정
    },
  }
);
