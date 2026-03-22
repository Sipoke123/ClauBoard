"use client";

import { useState, useEffect } from "react";
import { API_URL } from "./api-url";

/**
 * Returns true when the server is running in demo mode.
 * Polls /api/health once on mount.
 */
export function useDemoMode(): boolean {
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/health`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled && d.demoMode) setDemo(true); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return demo;
}
