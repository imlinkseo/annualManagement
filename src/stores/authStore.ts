// stores/authStore.ts
"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient"; // createBrowserClient로 만든 클라 클라이언트여야 함
import type { employee_with_unused } from "@/types/types";
import { subscribeWithSelector } from "zustand/middleware";

// Supabase 타입 추론(프로젝트 supabaseClient에서 가져옴)
type User = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
type SessionLike = Awaited<
  ReturnType<typeof supabase.auth.getSession>
>["data"]["session"];
type Employee = employee_with_unused;

type AuthState = {
  user: User | null;
  session: SessionLike | null;
  employee: Employee | null;
  loading: boolean;
};

type AuthActions = {
  /** SSR에서 받은 초기값 주입 */
  init: (opts?: {
    initialUser?: User | null;
    initialEmployee?: Employee | null;
  }) => void;

  /** 인증/세션/employee 최신화(앱 진입 시 1회 + 필요 시 호출) */
  refreshAuth: () => Promise<void>;

  /** 로그인/로그아웃/토큰 갱신 이벤트 구독 시작 → 클린업 반환 */
  startAuthListener: () => () => void;

  /** 현재 employee.id에 대한 realtime 구독 시작 → 클린업 반환 */
  startEmployeeRealtime: () => () => void;

  /** 전역 employee 수동 갱신(낙관적 업데이트 등) */
  setEmployee: (e: Employee | null) => void;

  /** 전체 초기화 */
  clear: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(subscribeWithSelector((set, get) => ({
  user: null,
  session: null,
  employee: null,
  loading: true,

  init: ({  initialUser = null, initialEmployee = null } = {}) => {
    set({
      session: null,
      user: initialUser,
      employee: initialEmployee,
      loading: false,
    });
  },

  setEmployee: (e) => set({ employee: e }),

  refreshAuth: async () => {
    set({ loading: true });

     const { data: u } = await supabase.auth.getUser();  // 👈 서버와 대조

    const user = u.user ?? null;

    set({ user });

    if (user?.id) {
      const { data, error } = await supabase
        .from("employees_with_unused")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error) set({ employee: data ?? null });
      else set({ employee: null });
    } else {
      set({ employee: null });
    }

    set({ loading: false });
  },

  startAuthListener: () => {
    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
     const { data: u } = await supabase.auth.getUser();
        const user = u.user ?? null;
        set({ user });

        if (user?.id) {
          const { data, error } = await supabase
            .from("employees_with_unused")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();
          set({ employee: !error ? data ?? null : null });
        } else {
          set({ employee: null });
        }
    });

    return () => sub.subscription.unsubscribe();
  },

  startEmployeeRealtime: () => {
    const empId = get().employee?.id;
    if (!empId) return () => {};

    const ch = supabase
      .channel("realtime:employees_with_unused")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "employees_with_unused",
          filter: `id=eq.${empId}`,
        },
        (payload) => {
          // payload.new가 없을 수도 있어 기존값 보전
          set({ employee: (payload.new as Employee) ?? get().employee });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  },

  clear: () => {
    set({ user: null, session: null, employee: null, loading: true });
  },
})));
