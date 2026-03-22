"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

function applyTheme(t: Theme) {
  const d = document.documentElement;
  d.classList.remove("dark", "light");
  d.classList.add(t);
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("clauboard-theme") as Theme) ?? "dark";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("clauboard-theme", next);
      return next;
    });
  }, []);

  return { theme, toggle };
}
