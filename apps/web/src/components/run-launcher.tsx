"use client";

import { useState, useEffect } from "react";
import { Rocket, CheckCircle, AlertCircle, Sparkles, Users, GitBranch } from "lucide-react";
import { cn } from "../lib/cn";
import { buttonVariants, inputVariants, panelVariants } from "../lib/variants";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface RunPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
  agentName?: string;
}

interface SessionPreset {
  id: string;
  label: string;
  description: string;
  name: string;
  agents: { agentName: string; prompt: string; dependsOn?: string[] }[];
}

type Tab = "single" | "pipeline";

export function RunLauncher({ onClose }: { onClose?: () => void } = {}) {
  const [tab, setTab] = useState<Tab>("single");
  const [prompt, setPrompt] = useState("");
  const [cwd, setCwd] = useState("");
  const [agentName, setAgentName] = useState("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLaunch, setLastLaunch] = useState<string | null>(null);
  const [presets, setPresets] = useState<RunPreset[]>([]);
  const [sessionPresets, setSessionPresets] = useState<SessionPreset[]>([]);
  const [showPresets, setShowPresets] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/presets/runs`)
      .then((r) => r.json())
      .then(setPresets)
      .catch(() => {});
    fetch(`${API_URL}/api/presets/sessions`)
      .then((r) => r.json())
      .then(setSessionPresets)
      .catch(() => {});
  }, []);

  function applyPreset(preset: RunPreset) {
    setPrompt(preset.prompt);
    setAgentName(preset.agentName ?? "");
    setShowPresets(false);
  }

  async function quickLaunchPreset(preset: RunPreset) {
    setLaunching(true);
    setError(null);
    setLastLaunch(null);
    try {
      const res = await fetch(`${API_URL}/api/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: preset.prompt,
          agentName: preset.agentName ?? undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setLastLaunch(`Launched: ${data.agentId}`);
      onClose?.();
    } catch (err: any) {
      setError(err.message ?? "Failed to launch");
    } finally {
      setLaunching(false);
    }
  }

  async function launchSession(preset: SessionPreset) {
    setLaunching(true);
    setError(null);
    setLastLaunch(null);
    try {
      const res = await fetch(`${API_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: preset.name,
          agents: preset.agents,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setLastLaunch(`Pipeline launched: ${preset.agents.length} agents`);
      onClose?.();
    } catch (err: any) {
      setError(err.message ?? "Failed to launch pipeline");
    } finally {
      setLaunching(false);
    }
  }

  async function handleLaunch(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLaunching(true);
    setError(null);
    setLastLaunch(null);

    try {
      const res = await fetch(`${API_URL}/api/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          cwd: cwd.trim() || undefined,
          agentName: agentName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      setLastLaunch(`Launched: ${data.agentId}`);
      setPrompt("");
      setAgentName("");
      setShowPresets(true);
      onClose?.();
    } catch (err: any) {
      setError(err.message ?? "Failed to launch run");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-surface/50 border border-border-subtle w-fit">
        <button
          onClick={() => setTab("single")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wider transition-colors",
            tab === "single"
              ? "bg-muted text-foreground border border-border-base"
              : "text-muted-fg hover:text-foreground"
          )}
        >
          <Rocket size={11} /> Single Agent
        </button>
        <button
          onClick={() => setTab("pipeline")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium uppercase tracking-wider transition-colors",
            tab === "pipeline"
              ? "bg-muted text-foreground border border-border-base"
              : "text-muted-fg hover:text-foreground"
          )}
        >
          <GitBranch size={11} /> Pipeline
        </button>
      </div>

      {/* Single agent tab */}
      {tab === "single" && (
        <>
          {/* Preset quick-launch buttons */}
          {showPresets && presets.length > 0 && !prompt && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={11} className="text-muted-fg" />
                <span className="text-[10px] text-muted-fg font-medium uppercase tracking-wider">Quick Launch</span>
              </div>
                <div className="flex gap-2 flex-wrap">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className={cn(
                        panelVariants({ variant: "inset" }),
                        "rounded-xl px-3 py-2 text-left hover:bg-muted/60 hover:border-border-base transition-colors group"
                      )}
                    >
                      <button
                        onClick={() => applyPreset(preset)}
                        className="w-full text-left cursor-pointer"
                      >
                        <div className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                          {preset.label}
                        </div>
                        <div className="text-[10px] text-muted-fg mt-0.5">{preset.description}</div>
                      </button>
                      <button
                        onClick={() => quickLaunchPreset(preset)}
                        disabled={launching}
                        className={cn(buttonVariants({ variant: "primary", size: "xs" }), "mt-1.5 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity")}
                      >
                        <Rocket size={10} /> Quick Launch
                      </button>
                    </div>
                  ))}
                </div>
            </div>
          )}

          {/* Launch form */}
          <form onSubmit={handleLaunch} className="space-y-3">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt for the agent..."
              rows={3}
              className={cn(inputVariants({ size: "md" }), "resize-none")}
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={cwd}
                onChange={(e) => setCwd(e.target.value)}
                placeholder="Working directory (optional)"
                className={cn(inputVariants({ size: "sm" }), "flex-1")}
              />
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Agent name"
                className={cn(inputVariants({ size: "sm" }), "w-36")}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={launching || !prompt.trim()}
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                <Rocket size={13} />
                {launching ? "Launching..." : "Launch"}
              </button>
              {prompt && (
                <button
                  type="button"
                  onClick={() => { setPrompt(""); setAgentName(""); setShowPresets(true); }}
                  className={buttonVariants({ variant: "ghost", size: "xs" })}
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </>
      )}

      {/* Pipeline tab */}
      {tab === "pipeline" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Users size={11} className="text-muted-fg" />
            <span className="text-[10px] text-muted-fg font-medium uppercase tracking-wider">Pipeline Presets</span>
          </div>
          <div className="space-y-2">
            {sessionPresets.map((preset) => {
              const parallelAgents = preset.agents.filter((a) => !a.dependsOn?.length);
              const dependentAgents = preset.agents.filter((a) => a.dependsOn?.length);
              return (
                <div
                  key={preset.id}
                  className={cn(
                    panelVariants({ variant: "inset" }),
                    "rounded-xl px-4 py-3 hover:bg-muted/60 hover:border-border-base transition-colors group"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{preset.label}</div>
                      <div className="text-[11px] text-muted-fg mt-0.5">{preset.description}</div>
                      {/* Agent flow visualization */}
                      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                        {parallelAgents.map((a, i) => (
                          <span key={a.agentName} className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
                              {a.agentName}
                            </span>
                            {i < parallelAgents.length - 1 && (
                              <span className="text-muted-fg/50 text-[10px]">|</span>
                            )}
                          </span>
                        ))}
                        {dependentAgents.length > 0 && (
                          <>
                            <span className="text-muted-fg text-[10px]">→</span>
                            {dependentAgents.map((a, i) => (
                              <span key={a.agentName} className="flex items-center gap-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/[0.08] border border-amber-500/15 text-[10px] text-amber-400 font-medium">
                                  {a.agentName}
                                </span>
                                {i < dependentAgents.length - 1 && (
                                  <span className="text-muted-fg text-[10px]">→</span>
                                )}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => launchSession(preset)}
                      disabled={launching}
                      className={cn(
                        buttonVariants({ variant: "primary", size: "sm" }),
                        "shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                      )}
                    >
                      <Rocket size={12} />
                      {launching ? "..." : "Launch"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status messages */}
      {(error || lastLaunch) && (
        <div className="flex items-center gap-2">
          {error && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <AlertCircle size={11} /> {error}
            </span>
          )}
          {lastLaunch && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle size={11} /> {lastLaunch}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
