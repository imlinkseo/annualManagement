"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/hooks/useAuthRedirect";
import LoginForm from "@/components/form/LoginForm";

const LoginPage = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      redirect("/dashboard");
    }
  }, [loading, user]);

  return (
    <>
      <LoginForm />
    </>
  );
};

export default LoginPage;
