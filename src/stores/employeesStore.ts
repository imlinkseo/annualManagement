"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
import { employee } from "@/types/types";

type EmployeesState = {
  employees: employee[];
  loading: boolean;
};

type EmployeesActions = {
  refresh: () => Promise<void>;
  setEmployees: (updater: (prev: employee[]) => employee[]) => void;
  clear: () => void;
};

export const useEmployeesStore = create<EmployeesState & EmployeesActions>()(
  persist(
    (set, get) => ({
      employees: [],
      loading: false,
      refresh: async () => {
        if (get().loading) return;
        set({ loading: true });

        const { data, error } = await supabase
          .from("employees")
          .select(
            "id, user_id, name, team, level, joined_date, vacation_generated_date, vacation_expiry_date, vacation_total, vacation_used, vacation_rest, full_used_date, half_used_date"
          );

        if (!error && data) {
          set({ employees: data as employee[] });
        }

        set({ loading: false });
      },
      setEmployees: (updater) =>
        set((state) => ({
          employees: updater(state.employees),
        })),
      clear: () => set({ employees: [], loading: false }),
    }),
    {
      name: "employees-store",
      partialize: (state) => ({
        employees: state.employees,
      }),
    }
  )
);
