"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import type { User, Employee } from "@/stores/authStore";

interface Props {
  children: ReactNode;
  initialUser: User | null;
  initialEmployee: Employee | null;
}

export default function AuthStoreProvider({
  children,
  initialUser,
  initialEmployee,
}: Props) {
  const init = useAuthStore((s) => s.init);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      init({ initialUser, initialEmployee });
    }
  }, [hydrated, init, initialUser, initialEmployee]);

  return <>{children}</>;
}
