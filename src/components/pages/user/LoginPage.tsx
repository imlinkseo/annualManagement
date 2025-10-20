"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import LoginForm from "@/components/form/LoginForm";

const LoginPage = () => {
  const { user, loading } = useAuthStore();

  useEffect(() => {
    if (user) {
      // redirect("/dashboard");
    }
  }, [loading, user]);

  return (
    <>
      <LoginForm />
    </>
  );
};

export default LoginPage;
