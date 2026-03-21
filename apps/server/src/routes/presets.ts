import { Router } from "express";

/** Demo preset definitions — no runtime state, just templates */

export interface RunPreset {
  id: string;
  label: string;
  description: string;
  prompt: string;
  agentName?: string;
}

export interface SessionPreset {
  id: string;
  label: string;
  description: string;
  name: string;
  agents: { agentName: string; prompt: string; dependsOn?: string[] }[];
}

const runPresets: RunPreset[] = [
  {
    id: "read-project",
    label: "Explore Project",
    description: "Read project files and summarize structure — read-only, no changes",
    prompt: "Read the top-level files in this project (package.json, README, etc.) and give me a brief summary of what this project is and how it is structured. Do not modify any files.",
    agentName: "Explorer",
  },
  {
    id: "lint-check",
    label: "Run Lint & Type Check",
    description: "Run linter and TypeScript checks — reports errors, no fixes",
    prompt: "Run 'npm run lint' and 'npm run type-check' in this project. Report any errors or warnings. Do not fix anything, just report what you find.",
    agentName: "Linter",
  },
  {
    id: "review-code",
    label: "Code Review",
    description: "Review recent changes for bugs, security issues, and improvements",
    prompt: "Review the most recently changed files in this project. Look for bugs, security issues, and suggest improvements. Write your findings as a brief report. Do not modify any files.",
    agentName: "Reviewer",
  },
];

const sessionPresets: SessionPreset[] = [
  {
    id: "parallel-analysis",
    label: "Parallel Analysis Pipeline",
    description: "5 analysts run in parallel → aggregator combines results into a single report",
    name: "Analysis Pipeline",
    agents: [
      {
        agentName: "Analytics",
        prompt: "Analyze key metrics in this project: test coverage, build times, bundle size, dependency count. Compute a health score. Write findings to analytics-report.md. Do not modify source code.",
      },
      {
        agentName: "Diagnostics",
        prompt: "Run diagnostics on this project: check for common issues, dead code, unused exports, circular dependencies. Write findings to diagnostics-report.md. Do not modify source code.",
      },
      {
        agentName: "Config Auditor",
        prompt: "Audit all configuration files (tsconfig, eslint, package.json, env files). Identify risky or suboptimal settings. Write findings to config-audit.md. Do not modify source code.",
      },
      {
        agentName: "Code Analyst",
        prompt: "Analyze the codebase for weak spots: complex functions, large files, missing error handling, poor naming. Write findings to code-analysis.md. Do not modify source code.",
      },
      {
        agentName: "Improvement Planner",
        prompt: "Based on a quick review of the project, propose 5-7 concrete improvements with effort estimates. Write findings to improvement-plan.md. Do not modify source code.",
      },
      {
        agentName: "Report Aggregator",
        prompt: "Read all report files (*-report.md, *-audit.md, *-analysis.md, *-plan.md). Combine them into a single executive summary with prioritized recommendations. Write to final-report.md. Do not modify source code.",
        dependsOn: ["Analytics", "Diagnostics", "Config Auditor", "Code Analyst", "Improvement Planner"],
      },
    ],
  },
  {
    id: "parallel-duo",
    label: "Parallel Duo",
    description: "Two agents working independently in parallel",
    name: "Parallel Duo",
    agents: [
      {
        agentName: "Alice",
        prompt: "Read the project structure and list all source files. Summarize the architecture briefly. Do not modify any files.",
      },
      {
        agentName: "Bob",
        prompt: "Read package.json and list all dependencies. Identify any outdated or unused packages. Do not modify any files.",
      },
    ],
  },
  {
    id: "staged-pipeline",
    label: "Staged Pipeline",
    description: "Three agents in a dependency chain: research → plan → report",
    name: "Research Pipeline",
    agents: [
      {
        agentName: "Researcher",
        prompt: "Read the project source files and identify the main components, their responsibilities, and how they communicate. Write a brief summary. Do not modify any files.",
      },
      {
        agentName: "Analyst",
        prompt: "Read the project docs/ folder and the source code. Identify any gaps between documentation and actual implementation. Do not modify any files.",
        dependsOn: ["Researcher"],
      },
      {
        agentName: "Reporter",
        prompt: "Summarize your findings about this project in a brief report: what it does, how it works, and what could be improved. Do not modify any files.",
        dependsOn: ["Analyst"],
      },
    ],
  },
  {
    id: "review-team",
    label: "Review Team",
    description: "Two reviewers run in parallel, then a summarizer synthesizes",
    name: "Code Review Team",
    agents: [
      {
        agentName: "Security Reviewer",
        prompt: "Review this project for security concerns: API keys, injection risks, unsafe patterns. Report findings briefly. Do not modify any files.",
      },
      {
        agentName: "Quality Reviewer",
        prompt: "Review this project for code quality: error handling, type safety, test coverage, naming conventions. Report findings briefly. Do not modify any files.",
      },
      {
        agentName: "Summarizer",
        prompt: "Produce a one-paragraph summary of the project health based on what previous reviewers found. Do not modify any files.",
        dependsOn: ["Security Reviewer", "Quality Reviewer"],
      },
    ],
  },
];

export function presetsRouter(): Router {
  const router = Router();

  router.get("/presets/runs", (_req, res) => {
    res.json(runPresets);
  });

  router.get("/presets/sessions", (_req, res) => {
    res.json(sessionPresets);
  });

  return router;
}
