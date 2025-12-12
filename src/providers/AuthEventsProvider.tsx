"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";

interface Props {
  children: ReactNode;
}

export default function AuthEventsProvider({ children }: Props) {
  const startAuthListener = useAuthStore((s) => s.startAuthListener);
  const startEmployeeRealtime = useAuthStore((s) => s.startEmployeeRealtime);
  const employeeId = useAuthStore((s) => s.employee?.id);

  useEffect(() => {
    const stop = startAuthListener();
    return () => {
      stop();
    };
  }, [startAuthListener]);

  useEffect(() => {
    if (!employeeId) return;
    const stop = startEmployeeRealtime();
    return () => {
      stop();
    };
  }, [employeeId, startEmployeeRealtime]);

  return <>{children}</>;
}
