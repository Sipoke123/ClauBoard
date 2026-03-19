import { cva } from "class-variance-authority";

// ---------------------------------------------------------------------------
// Status dot — pulsing indicator for agent/run status
// ---------------------------------------------------------------------------

export const statusDotVariants = cva("rounded-full shrink-0", {
  variants: {
    status: {
      working: "bg-emerald-400 animate-pulse",
      idle: "bg-emerald-400",
      error: "bg-red-500",
      blocked: "bg-amber-400 animate-pulse",
      offline: "bg-zinc-600",
      paused: "bg-amber-400",
      waiting: "bg-zinc-600",
      running: "bg-emerald-400 animate-pulse",
      completed: "bg-zinc-500",
      failed: "bg-red-500",
      stopped: "bg-amber-500",
      skipped: "bg-zinc-700",
    },
    size: {
      sm: "w-2 h-2",
      md: "w-2.5 h-2.5",
      lg: "w-3 h-3",
    },
  },
  defaultVariants: { size: "md", status: "idle" },
});

// ---------------------------------------------------------------------------
// Status pill — compact label with background
// ---------------------------------------------------------------------------

export const statusPillVariants = cva(
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium leading-none",
  {
    variants: {
      status: {
        working: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
        idle: "bg-zinc-500/10 text-zinc-400",
        error: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
        blocked: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
        offline: "bg-zinc-800 text-zinc-500",
        paused: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
        running: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
        completed: "bg-zinc-500/10 text-zinc-500",
        failed: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20",
        stopped: "bg-amber-500/10 text-amber-400",
        skipped: "bg-zinc-800 text-zinc-600",
        active: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
        waiting: "bg-zinc-500/10 text-zinc-500",
      },
    },
    defaultVariants: { status: "idle" },
  },
);

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-blue-600 text-white hover:bg-blue-500 shadow-sm shadow-blue-900/30",
        danger: "bg-red-600/80 text-red-100 hover:bg-red-500 shadow-sm shadow-red-900/20",
        ghost: "text-zinc-400 hover:text-zinc-200 hover:bg-white/5",
        outline: "border border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20",
      },
      size: {
        xs: "h-6 px-2 text-[11px] rounded-md",
        sm: "h-7 px-3 text-xs",
        md: "h-8 px-4 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "sm" },
  },
);

// ---------------------------------------------------------------------------
// Panel / card surface
// ---------------------------------------------------------------------------

export const panelVariants = cva("rounded-2xl border", {
  variants: {
    variant: {
      surface: "bg-zinc-900/80 border-white/[0.06]",
      inset: "bg-zinc-950/60 border-white/[0.04]",
      elevated: "bg-zinc-900 border-white/[0.08] shadow-xl shadow-black/20",
      room: "bg-zinc-900/40 border-dashed border-white/[0.06]",
    },
  },
  defaultVariants: { variant: "surface" },
});

// ---------------------------------------------------------------------------
// Input / textarea
// ---------------------------------------------------------------------------

export const inputVariants = cva(
  "w-full bg-zinc-950/60 border border-white/[0.08] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors",
  {
    variants: {
      size: {
        sm: "rounded-lg px-3 py-1.5 text-xs",
        md: "rounded-xl px-3 py-2 text-sm",
      },
    },
    defaultVariants: { size: "sm" },
  },
);

// ---------------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------------

export const tabVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
  {
    variants: {
      active: {
        true: "bg-white/[0.08] text-zinc-100",
        false: "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]",
      },
    },
    defaultVariants: { active: false },
  },
);

// ---------------------------------------------------------------------------
// Event type color mapping (for timeline and event rows)
// ---------------------------------------------------------------------------

export const eventTypeColor: Record<string, string> = {
  "agent.": "text-blue-400",
  "run.": "text-purple-400",
  "task.": "text-emerald-400",
  "tool.": "text-orange-400",
  "terminal.": "text-zinc-400",
  "file.": "text-cyan-400",
};

export function getEventColor(type: string): string {
  const prefix = Object.keys(eventTypeColor).find((p) => type.startsWith(p));
  return prefix ? eventTypeColor[prefix] : "text-zinc-500";
}

// ---------------------------------------------------------------------------
// Status label text mapping
// ---------------------------------------------------------------------------

export const statusLabels: Record<string, string> = {
  working: "Working",
  idle: "Ready",
  error: "Error",
  blocked: "Blocked",
  offline: "Offline",
  paused: "Paused",
  running: "Running",
  completed: "Done",
  failed: "Failed",
  stopped: "Stopped",
  skipped: "Skipped",
  waiting: "Waiting",
  active: "Active",
};
