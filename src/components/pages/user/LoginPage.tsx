"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import LoginForm from "@/components/form/LoginForm";

const LoginPage = () => {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      redirect("/");
    }
  }, [loading, user]);

  return (
    <>
      <LoginForm />
    </>
  );
};

export default LoginPage;
