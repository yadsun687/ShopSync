import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getTheme, saveTheme } from "../utils/storage";

type ThemeMode = "light" | "dark";

type ThemeConfig = {
  theme: ThemeMode;
  primaryColor: string;
};

type ThemeContextValue = {
  config: ThemeConfig;
  toggleTheme: () => void;
  setPrimaryColor: (color: string) => void;
  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
    danger: string;
    success: string;
  };
};

const defaultConfig: ThemeConfig = { theme: "light", primaryColor: "#3B82F6" };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [config, setConfig] = useState<ThemeConfig>(defaultConfig);

  useEffect(() => {
    (async () => {
      const stored = await getTheme();
      if (stored?.theme && stored?.primaryColor) {
        setConfig(stored);
      }
    })();
  }, []);

  useEffect(() => {
    void saveTheme(config);
  }, [config]);

  const value = useMemo<ThemeContextValue>(() => {
    const isDark = config.theme === "dark";
    return {
      config,
      toggleTheme: () => setConfig((prev) => ({ ...prev, theme: prev.theme === "dark" ? "light" : "dark" })),
      setPrimaryColor: (color: string) => setConfig((prev) => ({ ...prev, primaryColor: color })),
      colors: {
        background: isDark ? "#111827" : "#F3F4F6",
        card: isDark ? "#1F2937" : "#FFFFFF",
        text: isDark ? "#F9FAFB" : "#111827",
        muted: isDark ? "#9CA3AF" : "#6B7280",
        border: isDark ? "#374151" : "#E5E7EB",
        primary: config.primaryColor,
        danger: "#DC2626",
        success: "#16A34A",
      },
    };
  }, [config]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
