import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  slippage: number;
  deadline: number;
  updateSlippage: (slippage: number) => void;
  updateDeadline: (deadline: number) => void;
}

export const DEFAULT_SLIPPAGE = 0.005;
export const DEFAULT_DEADLINE = 30;

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      slippage: DEFAULT_SLIPPAGE,
      deadline: DEFAULT_DEADLINE,
      updateSlippage: (slippage: number) => set({ slippage }),
      updateDeadline: (deadline: number) => set({ deadline }),
    }),
    {
      name: "settings",
      skipHydration: true,
    }
  )
);
