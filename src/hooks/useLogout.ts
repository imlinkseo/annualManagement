// hooks/useLogout.ts
"use client";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/authStore";

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);

  return async () => {
    const { error } = await supabase.auth.signOut({ scope: "global" });

    if (error && !error.message.includes("Auth session missing")) {
      alert("로그아웃 실패: " + error.message);
      return;
    }

    clear();
  };
}
