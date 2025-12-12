import type { Metadata } from "next";
import "@/styles/globals.css";
import pretendard from "@/fonts/pretendard";
import { ReactNode } from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import AuthStoreProvider from "@/providers/AuthStoreProvider";
import AuthEventsProvider from "@/providers/AuthEventsProvider";
import Header from "@/components/ui/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { employee } from "@/types/types";

export const metadata: Metadata = {
  title: "연차 관리",
  description: "연차 관리 프로그램",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user ?? null;

  let employee: employee | null = null;

  if (user) {
    const { data } = await supabase
      .from("employees")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) employee = data;
  }

  return (
    <html lang="ko" className={pretendard.className}>
      <body>
        <ToastProvider>
          <AuthStoreProvider initialUser={user} initialEmployee={employee}>
            <AuthEventsProvider>
              <div id="wrapper">
                <Header />
                <section id="contents">{children}</section>
              </div>
            </AuthEventsProvider>
          </AuthStoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
