"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeMode = "light" | "dark";
export type ColorMode = "amber" | "blue" | "pink" | "rose" | "emerald" | "black";

interface ThemeContextValue {
  mode: ThemeMode;
  color: ColorMode;
  setMode: (m: ThemeMode) => void;
  setColor: (c: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const MODE_KEY = "pyramid-theme-mode";
const COLOR_KEY = "pyramid-theme-color";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [color, setColorState] = useState<ColorMode>("blue");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedMode = (localStorage.getItem(MODE_KEY) as ThemeMode) || "light";
    const storedColor = (localStorage.getItem(COLOR_KEY) as ColorMode) || "blue";
    setModeState(storedMode);
    setColorState(storedColor);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.dataset.mode = mode;
    document.documentElement.dataset.accent = color;
    localStorage.setItem(MODE_KEY, mode);
    localStorage.setItem(COLOR_KEY, color);
  }, [mode, color, hydrated]);

  const setMode = (m: ThemeMode) => setModeState(m);
  const setColor = (c: ColorMode) => setColorState(c);

  return (
    <ThemeContext.Provider value={{ mode, color, setMode, setColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export const ACCENT_SWATCH: Record<ColorMode, string> = {
  amber: "#d97706",
  blue: "#7c3aed",
  pink: "#db2777",
  rose: "#e11d48",
  emerald: "#10b981",
  black: "#171717",
};
