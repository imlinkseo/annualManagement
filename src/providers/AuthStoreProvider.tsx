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
    init({ initialUser, initialEmployee });
    refreshAuth();
    const stop = startAuthListener();

    const onFocus = () => refreshAuth();
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshAuth();
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
