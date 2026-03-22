"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

function applyTheme(t: Theme) {
  const d = document.documentElement;
  d.classList.remove("dark", "light");
  d.classList.add(t);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("clauboard-theme") as Theme | null;
    const initial = saved ?? "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

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
