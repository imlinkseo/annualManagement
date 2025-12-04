"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { refreshAuth, startAuthListener } = useAuthStore();

  useEffect(() => {
    // 앱 진입 시 1회 현재 세션 & employee 동기화
    refreshAuth();

    // supabase auth 이벤트를 전역으로 구독
    const unsubscribe = startAuthListener();
    return () => unsubscribe();
  }, [refreshAuth, startAuthListener]);

  return <>{children}</>;
}
