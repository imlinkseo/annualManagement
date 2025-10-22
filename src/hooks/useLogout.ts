// hooks/useLogout.ts
"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/stores/authStore";

export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);

  return async () => {
    let done = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !done) {
        done = true;
        sub.subscription.unsubscribe();
        clear();
        router.replace("/login");
        router.refresh();
      }
    });

    const { error } = await supabase.auth.signOut({ scope: "global" });
    if (error) {
      sub.subscription.unsubscribe();
      alert("로그아웃 실패: " + error.message);
      return;
    }

    setTimeout(() => {
      if (!done) {
        done = true;
        sub.subscription.unsubscribe();
        clear();
        router.replace("/login");
        router.refresh();
      }
    }, 2000);
  };
}
