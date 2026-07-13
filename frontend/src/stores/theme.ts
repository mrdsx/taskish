import { create } from "solid-zustand";
import { persist } from "zustand/middleware";

type IsDarkMode = boolean;

type ThemeState = {
  isDarkMode: IsDarkMode;
  setIsDarkMode: (isDarkMode: IsDarkMode) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      setIsDarkMode: (isDarkMode) => set({ isDarkMode }),
    }),
    { name: "theme-store" },
  ),
);
