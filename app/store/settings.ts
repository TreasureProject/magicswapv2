import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  slippage: number;
  deadline: number;
  update: (settings: { slippage: number; deadline: number }) => void;
}

export const DEFAULT_SLIPPAGE = 0.005;
export const DEFAULT_DEADLINE = 30;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      slippage: DEFAULT_SLIPPAGE,
      deadline: DEFAULT_DEADLINE,
      update: ({ slippage, deadline }) => set({ slippage, deadline }),
    }),
    {
      name: "settings",
    }
  )
);
