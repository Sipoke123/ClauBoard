"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("clauboard-theme") as Theme) ?? "dark";
}

function applyTheme(t: Theme) {
  const d = document.documentElement;
  d.classList.remove("dark", "light");
  d.classList.add(t);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getTheme);

  // Apply on mount (client only)
  if (typeof window !== "undefined") {
    applyTheme(theme);
  }

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("clauboard-theme", next);
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
