"use client";

import { useState, useEffect } from "react";
import { useSocket } from "../lib/use-socket";
import { useStoreSelector } from "../lib/use-store";
import { Wifi, WifiOff, FlaskConical, Radio, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "../lib/cn";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface HealthData {
  adapterMode?: string;
  cwdRestricted?: boolean;
  activeRuns?: number;
}

export function StatusBar() {
  const connected = useStoreSelector((s) => s.connected);
  const [health, setHealth] = useState<HealthData | null>(null);

  useEffect(() => {
    let cancelled = false;
    function fetchHealth() {
      fetch(`${API_URL}/api/health`)
        .then((r) => r.json())
        .then((d) => { if (!cancelled) setHealth(d); })
        .catch(() => { if (!cancelled) setHealth(null); });
    }
    fetchHealth();
    const id = setInterval(fetchHealth, 10000);
    return () => { cancelled = true; clearInterval(id); };
  }, [connected]);

  const adapterMode = health?.adapterMode;
  const modeLabel = adapterMode === "mock" ? "Mock" : adapterMode === "claude" ? "Claude" : null;
  const cwdRestricted = health?.cwdRestricted ?? false;

  return (
    <div className={cn(
      "flex items-center justify-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors",
      connected
        ? "bg-surface border-border-base text-muted-fg"
        : "bg-red-500/10 border-red-500/20 text-red-400"
    )}>
      {!connected && <><WifiOff size={12} className="animate-pulse" /> Reconnecting...</>}
      {connected && modeLabel && (
        <span className={cn(
          "flex items-center gap-1",
          adapterMode === "mock" ? "text-amber-500/70" : "text-blue-400/70"
        )}>
          {adapterMode === "mock" ? <FlaskConical size={10} /> : <Radio size={10} />}
          {modeLabel}
        </span>
      )}
      {connected && !modeLabel && <><Wifi size={12} className="text-emerald-500" /> Live</>}
      {connected && health && !cwdRestricted && adapterMode !== "mock" && (
        <>
          <span className="text-muted-fg/50">·</span>
          <span className="flex items-center gap-1 text-amber-500/60" title="No allowed workspace roots configured — all paths accepted">
            <ShieldAlert size={10} /> Open
          </span>
        </>
      )}
      {connected && cwdRestricted && (
        <>
          <span className="text-muted-fg/50">·</span>
          <span className="flex items-center gap-1 text-emerald-500/50" title="Working directory restricted to allowed roots">
            <ShieldCheck size={10} />
          </span>
        </>
      )}
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  useSocket();
  return <>{children}</>;
}
