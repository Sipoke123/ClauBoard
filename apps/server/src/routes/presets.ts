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
    id: "hello",
    label: "Hello World",
    description: "Quick test — ask Claude to respond with a greeting",
    prompt: "Say hello and confirm you are running inside Claude Code. Keep it brief.",
    agentName: "Greeter",
  },
  {
    id: "read-project",
    label: "Explore Project",
    description: "Read the project structure and summarize it",
    prompt: "Read the top-level files in this project (package.json, README, etc.) and give me a brief summary of what this project is and how it is structured. Do not modify any files.",
    agentName: "Explorer",
  },
  {
    id: "lint-check",
    label: "Run Lint Check",
    description: "Run the linter and report results",
    prompt: "Run 'npm run lint' and 'npm run type-check' in this project. Report any errors or warnings. Do not fix anything, just report what you find.",
    agentName: "Linter",
  },
];

const sessionPresets: SessionPreset[] = [
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
