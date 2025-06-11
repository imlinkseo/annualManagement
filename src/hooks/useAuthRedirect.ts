"use client";

import { useEffect, useState } from "react";

export const useAuthRedirect = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
    const token = localStorage.getItem(`sb-${projectId}-auth-token`);

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return { isAuthenticated };
};
