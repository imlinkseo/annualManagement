// stores/authStore.ts
"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
import type { employee } from "@/types/types";

type User = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
type SessionLike = Awaited<
  ReturnType<typeof supabase.auth.getSession>
>["data"]["session"];
type Employee = employee;

type AuthState = {
  user: User | null;
  session: SessionLike | null;
  employee: Employee | null;
  loading: boolean;
};

type AuthActions = {
  init: (opts?: {
    initialUser?: User | null;
    initialEmployee?: Employee | null;
  }) => void;
  refreshAuth: () => Promise<void>;
  startAuthListener: () => () => void;
  startEmployeeRealtime: () => () => void;
  setEmployee: (e: Employee | null) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    session: null,
    employee: null,
    loading: true,

    init: ({ initialUser = null, initialEmployee = null } = {}) => {
      set({
        user: initialUser,
        session: null,
        employee: initialEmployee,
        loading: false,
      });
    },

    setEmployee: (e) => set({ employee: e }),

    refreshAuth: async () => {
      set({ loading: true });

      const prevUser = get().user;
      const prevEmployee = get().employee;

      const [{ data: userData }, { data: sessionData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      const user = userData.user ?? null;
      const session = sessionData.session ?? null;

      // 1) getUser()가 null 이지만 이전에 user가 있던 경우:
      //    Supabase 쪽 lag 로 보고 기존 상태를 유지한다.
      if (!user && prevUser) {
        set({
          user: prevUser,
          session,
          employee: prevEmployee,
          loading: false,
        });
        return;
      }

      // 2) 실제로 user 가 없는 경우 = 로그아웃된 상태
      if (!user) {
        set({
          user: null,
          session: null,
          employee: null,
          loading: false,
        });
        return;
      }

      // 3) user 는 있는데, employee 를 갱신해야 하는 경우
      let employee: Employee | null = prevEmployee ?? null;

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        // 새 데이터가 있으면 무조건 덮어씀
        employee = data as Employee;
      } else if (error) {
        // 에러가 난 경우: 기존 employee 유지
        console.error("refreshAuth employees_with_unused error", error);
        employee = prevEmployee ?? null;
        // employee = prevEmployee
      } else if (!data) {
        // rows 가 0인 경우
        // - user가 바뀐 경우에는 null 로 초기화 (새 계정인데 row가 없다고 판단)
        // - 같은 user라면 기존 employee 유지
        if (!prevUser || prevUser.id !== user.id) {
          employee = null;
        }
      }

      set({
        user,
        session,
        employee,
        loading: false,
      });
    },

    startAuthListener: () => {
      const { data: sub } = supabase.auth.onAuthStateChange(
        async (event) => {
          if (event === "SIGNED_OUT") {
            // 명확한 로그아웃 이벤트에서만 전부 비운다
            get().clear();
            return;
          }

          // SIGNED_IN / TOKEN_REFRESHED 등에서만 실제 리프레시
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            await get().refreshAuth();
          }

          // INITIAL_SESSION 은 무시 (SSR에서 이미 초기값 전달받았다고 가정)
        }
      );

      return () => sub.subscription.unsubscribe();
    },

    startEmployeeRealtime: () => {
      const empId = get().employee?.id;
      if (!empId) return () => {};

      const ch = supabase
        .channel("realtime:employees")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "employees",
            filter: `id=eq.${empId}`,
          },
          (payload) => {
            const current = get().employee;
            if (!current) return;

            set({
              employee: {
                ...current,
                ...(payload.new as Partial<Employee>),
              },
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ch);
      };
    },

    clear: () => {
      set({
        user: null,
        session: null,
        employee: null,
        loading: false,
      });
    },
  }))
);
