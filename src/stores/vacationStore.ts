"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
import { employee, Vacation } from "@/types/types";

type VacationState = {
  employees: employee[];
  vacation: Vacation[];
  loading: boolean;
};

type VacationActions = {
  refresh: () => Promise<void>;
  setVacation: (updater: (prev: Vacation[]) => Vacation[]) => void;
};

export const useVacationStore = create<VacationState & VacationActions>()(
  subscribeWithSelector((set, get) => ({
    employees: [],
    vacation: [],
    loading: false,
    refresh: async () => {
      if (get().loading) return;
      set({ loading: true });

      const [empRes, vacRes] = await Promise.all([
        supabase.from("employees").select("name, user_id"),
        supabase
          .from("vacation")
          .select(
            "type, category, special, start_date, end_date, reason, status, id, user_id, refuse_reason, date_num"
          ),
      ]);

      if (!empRes.error && empRes.data) {
        set({ employees: empRes.data });
      }

      if (!vacRes.error && vacRes.data) {
        set({ vacation: vacRes.data });
      }

      set({ loading: false });
    },
    setVacation: (updater) =>
      set((state) => ({
        vacation: updater(state.vacation),
      })),
  }))
);
