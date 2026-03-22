"use client";

import { useDemoMode } from "../lib/use-demo-mode";
import { BeakerIcon } from "@heroicons/react/24/outline";

/**
 * Slim banner shown at top of app when server is in demo mode.
 * Informs visitors this is a live interactive demo with auto-recovery.
 */
export function DemoBanner() {
  const demo = useDemoMode();
  if (!demo) return null;

  return (
    <div className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
      <BeakerIcon className="w-3.5 h-3.5" />
      <span>Live Demo — interactive, auto-resets every 30s</span>
    </div>
  );
}
