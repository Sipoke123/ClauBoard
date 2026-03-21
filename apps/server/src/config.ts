import path from "node:path";

function getArgValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return undefined;
}

function parseAllowedRoots(): string[] {
  const fromEnv = process.env.ALLOWED_WORKSPACE_ROOTS;
  const fromArg = getArgValue("--allowed-roots");
  const raw = fromArg ?? fromEnv;
  if (!raw) return [];
  return raw.split(",").map((r) => path.resolve(r.trim())).filter(Boolean);
}

export const config = {
  port: parseInt(process.env.PORT ?? "3001", 10),
  dataDir: process.env.DATA_DIR ?? "./data",
  mockAgents: process.env.MOCK_AGENTS === "true" || process.argv.includes("--mock"),
  storage: (getArgValue("--storage") ?? process.env.STORAGE ?? "jsonl") as "jsonl" | "sqlite",
  /** Auto-compact when event count exceeds this threshold (0 = disabled) */
  autoCompactThreshold: parseInt(getArgValue("--auto-compact") ?? process.env.AUTO_COMPACT ?? "0", 10),

  // Claude Code adapter config (legacy CLI mode)
  claudePrompt: getArgValue("--claude") ?? process.env.CLAUDE_PROMPT,
  claudeCwd: getArgValue("--claude-cwd") ?? process.env.CLAUDE_CWD,
  claudeName: getArgValue("--claude-name") ?? process.env.CLAUDE_NAME ?? "Claude",

  // Safety: allowed workspace roots for cwd validation
  // If empty, all paths are allowed (local-only trust model)
  allowedWorkspaceRoots: parseAllowedRoots(),
};

/** Which adapter mode is active */
export function getAdapterMode(): "mock" | "claude" | "none" {
  if (config.claudePrompt) return "claude";
  if (config.mockAgents) return "mock";
  return "none";
}

/**
 * Validate a working directory against allowed roots.
 * Returns null if valid, or an error message if rejected.
 */
export function validateCwd(cwd: string | undefined): string | null {
  if (!cwd) return null; // no cwd = use server default, always ok

  const resolved = path.resolve(cwd);

  // If no roots configured, all paths allowed (local trust model)
  if (config.allowedWorkspaceRoots.length === 0) return null;

  const isUnderRoot = config.allowedWorkspaceRoots.some(
    (root) => resolved === root || resolved.startsWith(root + path.sep),
  );

  if (!isUnderRoot) {
    return `cwd "${cwd}" is not under any allowed workspace root. Allowed: ${config.allowedWorkspaceRoots.join(", ")}`;
  }

  return null;
}
