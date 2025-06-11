"use client";

import { redirect } from "next/navigation";
import LoginForm from "@/components/form/LoginForm";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const LoginPage = () => {
  const { isAuthenticated } = useAuthRedirect();
  if (isAuthenticated) redirect("/dashboard/table");

  return (
    <>
      <LoginForm />
    </>
  );
};

export default LoginPage;
