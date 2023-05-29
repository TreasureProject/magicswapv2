import { create } from "zustand";

interface SettingsState {
  slippage: number;
  deadline: number;
  update: (settings: { slippage: number; deadline: number }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  slippage: 0.005,
  deadline: 30,
  update: ({ slippage, deadline }) => set({ slippage, deadline }),
}));
