"use client";

import { useState, useEffect } from "react";
import { Rocket, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

export function RunLauncher() {
  const [prompt, setPrompt] = useState("");
  const [cwd, setCwd] = useState("");
  const [agentName, setAgentName] = useState("");
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastLaunch, setLastLaunch] = useState<string | null>(null);
  const [presets, setPresets] = useState<RunPreset[]>([]);
  const [showPresets, setShowPresets] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/presets/runs`)
      .then((r) => r.json())
      .then(setPresets)
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
    } catch (err: any) {
      setError(err.message ?? "Failed to launch");
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
    } catch (err: any) {
      setError(err.message ?? "Failed to launch run");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Preset quick-launch buttons */}
      <AnimatePresence>
        {showPresets && presets.length > 0 && !prompt && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={11} className="text-zinc-600" />
              <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">Quick Launch</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className={cn(
                    panelVariants({ variant: "inset" }),
                    "rounded-xl px-3 py-2 text-left hover:bg-zinc-800/60 hover:border-white/[0.1] transition-colors group"
                  )}
                >
                  <button
                    onClick={() => applyPreset(preset)}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
                      {preset.label}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-0.5">{preset.description}</div>
                  </button>
                  <button
                    onClick={() => quickLaunchPreset(preset)}
                    disabled={launching}
                    className={cn(buttonVariants({ variant: "primary", size: "xs" }), "mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity")}
                  >
                    <Rocket size={10} /> Quick Launch
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      </form>
    </div>
  );
}
