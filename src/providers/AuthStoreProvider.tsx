/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

type Props = {
  initialUser: any | null;
  initialEmployee: any | null;
  children: React.ReactNode;
};

export default function AuthStoreProvider({
  initialUser,
  initialEmployee,
  children,
}: Props) {
  const init = useAuthStore((s) => s.init);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);
  const startAuthListener = useAuthStore((s) => s.startAuthListener);

  useEffect(() => {
    // 1) SSR에서 내려준 값으로 초기 상태 세팅 (한 번만)
    init({ initialUser, initialEmployee });

    // 2) auth 이벤트 리스너 시작 (SIGNED_IN / TOKEN_REFRESHED 등)
    const stop = startAuthListener();

    // 3) 탭 포커스 / 페이지 다시 보일 때만 세션 재검증
    const onFocus = () => {
      refreshAuth();
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refreshAuth();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      stop();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [init, initialUser, initialEmployee, refreshAuth, startAuthListener]);

  return <>{children}</>;
}
