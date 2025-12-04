"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";
import { Vacation } from "@/types/types";

type MyVacationsState = {
  vacations: Vacation[];
  loading: boolean;
};

type MyVacationsActions = {
  refresh: (userId: string) => Promise<void>;
  setVacations: (updater: (prev: Vacation[]) => Vacation[]) => void;
  clear: () => void;
};

export const useMyVacationsStore = create<
  MyVacationsState & MyVacationsActions
>()(
  subscribeWithSelector((set, get) => ({
    vacations: [],
    loading: false,
    refresh: async (userId: string) => {
      if (get().loading) return;
      set({ loading: true });

      const { data, error } = await supabase
        .from("vacation")
        .select(
          "type, category, time, special, start_date, end_date, reason, status, normal_num, special_num, date_num, id, user_id"
        )
        .eq("user_id", userId);

      if (!error && data) {
        set({ vacations: data });
      }

      set({ loading: false });
    },
    setVacations: (updater) =>
      set((state) => ({
        vacations: updater(state.vacations),
      })),
    clear: () => set({ vacations: [], loading: false }),
  }))
);
