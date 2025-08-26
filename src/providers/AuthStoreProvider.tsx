"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

// getState()가 반환하는 상태/액션 전체 타입
type StoreState = ReturnType<typeof useAuthStore.getState>;

type Props = {
  children: React.ReactNode;
  initialUser?: StoreState["user"] | null;
  initialEmployee?: StoreState["employee"] | null;
};

export default function AuthStoreProvider({
  children,
  initialUser = null,
  initialEmployee = null,
}: Props) {
  const init = useAuthStore((s) => s.init);
  const refreshAuth = useAuthStore((s) => s.refreshAuth);
  const startAuthListener = useAuthStore((s) => s.startAuthListener);
  const startEmployeeRealtime = useAuthStore((s) => s.startEmployeeRealtime);

  useEffect(() => {
    // SSR 초기 주입
    init({ initialUser, initialEmployee });

    // 진입 시 한 번 검증/최신화
    refreshAuth();

    // auth 변화 구독
    const unsubAuth = startAuthListener();

    // employee 실시간 구독(처음/변경 시 재구독)
    let unsubRealtime = startEmployeeRealtime();

    // employee.id만 구독해 변경 시 재연결
    const unsubWatch = useAuthStore.subscribe(
      (s) => s.employee?.id,
      () => {
        unsubRealtime?.();
        unsubRealtime = startEmployeeRealtime();
      }
    );

    return () => {
      unsubAuth?.();
      unsubRealtime?.();
      unsubWatch?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
