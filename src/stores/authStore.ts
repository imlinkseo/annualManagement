"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
import type { employee } from "@/types/types";

export type User = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];
export type SessionLike = Awaited<
  ReturnType<typeof supabase.auth.getSession>
>["data"]["session"];
export type Employee = employee;

type AuthState = {
  user: User | null;
  session: SessionLike | null;
  employee: Employee | null;
  loading: boolean;
  hydrated: boolean;
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
    hydrated: false,

    init: ({ initialUser = null, initialEmployee = null } = {}) => {
      set({
        user: initialUser,
        session: null,
        employee: initialEmployee,
        loading: false,
        hydrated: true,
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

      if (!user && prevUser) {
        set({
          user: prevUser,
          session,
          employee: prevEmployee,
          loading: false,
        });
        return;
      }

      if (!user) {
        set({
          user: null,
          session: null,
          employee: null,
          loading: false,
        });
        return;
      }

      let employee: Employee | null = prevEmployee ?? null;

      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        employee = data as Employee;
      } else if (error) {
        console.error("refreshAuth employees error", error);
        employee = prevEmployee ?? null;
      } else if (!data) {
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
      const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === "SIGNED_OUT") {
          get().clear();
          return;
        }

        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
          await get().refreshAuth();
        }
      });

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
