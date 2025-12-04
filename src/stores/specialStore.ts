"use client";

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { Special } from "@/types/types";

type SpecialState = {
  specials: Special[];
  loading: boolean;
  error: string | null;
  hasLoaded: boolean; // 이 탭에서 한 번이라도 불러온 적 있는지
};

type SpecialActions = {
  refresh: () => Promise<void>;
  setSpecials: (updater: (prev: Special[]) => Special[]) => void;
  clear: () => void;
};

export const useSpecialStore = create<SpecialState & SpecialActions>()(
  (set, get) => ({
    specials: [],
    loading: false,
    error: null,
    hasLoaded: false,

    refresh: async () => {
      if (get().loading) return;

      set({ loading: true, error: null });

      try {
        const { data, error } = await supabase.from("special").select("*");

        if (error) {
          console.error("[specialStore] fetch error:", error.message);
          set({
            specials: [],
            error: error.message,
            hasLoaded: true,
          });
          return;
        }

        set({
          specials: (data ?? []) as Special[],
          error: null,
          hasLoaded: true,
        });
      } catch (e) {
        console.error("[specialStore] unknown error:", e);
        set({
          specials: [],
          error: "unknown error",
          hasLoaded: true,
        });
      } finally {
        set({ loading: false });
      }
    },

    setSpecials: (updater) =>
      set((state) => ({
        specials: updater(state.specials),
      })),

    clear: () =>
      set({
        specials: [],
        loading: false,
        error: null,
        hasLoaded: false,
      }),
  })
);
