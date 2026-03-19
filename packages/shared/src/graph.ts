import type { AgentSpec } from "./events";

// ---------------------------------------------------------------------------
// Dependency graph validation and topological sorting
// Shared between server (route validation) and client (visualization)
// ---------------------------------------------------------------------------

export interface GraphValidationResult {
  valid: boolean;
  /** Human-readable error if invalid */
  error?: string;
  /** Agents involved in the cycle, if any */
  cycle?: string[];
  /**
   * Topological stages — agents grouped by execution depth.
   * Stage 0 = no deps, stage 1 = depends only on stage 0, etc.
   * Only populated when valid.
   */
  stages?: string[][];
}

/**
 * Validate a dependency graph defined by AgentSpecs.
 * Checks: duplicate names, self-deps, unknown deps, cycles.
 * On success, returns topological stages for visualization.
 */
export function validateDependencyGraph(specs: AgentSpec[]): GraphValidationResult {
  const names = new Set<string>();

  // Check duplicates
  for (const spec of specs) {
    if (names.has(spec.agentName)) {
      return { valid: false, error: `Duplicate agent name: "${spec.agentName}"` };
    }
    names.add(spec.agentName);
  }

  // Check self-deps and unknown deps
  for (const spec of specs) {
    for (const dep of spec.dependsOn ?? []) {
      if (dep === spec.agentName) {
        return { valid: false, error: `"${spec.agentName}" cannot depend on itself` };
      }
      if (!names.has(dep)) {
        return { valid: false, error: `"${spec.agentName}" depends on "${dep}" which is not in the session` };
      }
    }
  }

  // Build adjacency for cycle detection + topological sort (Kahn's algorithm)
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>(); // dep -> agents that depend on it

  for (const spec of specs) {
    inDegree.set(spec.agentName, 0);
    dependents.set(spec.agentName, []);
  }

  for (const spec of specs) {
    const deps = spec.dependsOn ?? [];
    inDegree.set(spec.agentName, deps.length);
    for (const dep of deps) {
      dependents.get(dep)!.push(spec.agentName);
    }
  }

  // Kahn's: process nodes with in-degree 0 in waves (= stages)
  const stages: string[][] = [];
  const resolved = new Set<string>();

  let currentWave = [...names].filter((n) => inDegree.get(n) === 0);

  while (currentWave.length > 0) {
    stages.push(currentWave);
    const nextWave: string[] = [];

    for (const name of currentWave) {
      resolved.add(name);
      for (const dependent of dependents.get(name)!) {
        const newDeg = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, newDeg);
        if (newDeg === 0) {
          nextWave.push(dependent);
        }
      }
    }

    currentWave = nextWave;
  }

  // If not all nodes resolved, there's a cycle
  if (resolved.size !== names.size) {
    const inCycle = [...names].filter((n) => !resolved.has(n));
    return {
      valid: false,
      error: `Dependency cycle detected: ${inCycle.join(" → ")} → ...`,
      cycle: inCycle,
    };
  }

  return { valid: true, stages };
}

/**
 * Compute the topological stage (depth) of each agent.
 * Returns a Map from agentName to stage index.
 * Useful for positioning in a staged lane view.
 */
export function computeStages(specs: AgentSpec[]): Map<string, number> {
  const result = validateDependencyGraph(specs);
  const stageMap = new Map<string, number>();
  if (result.stages) {
    for (let i = 0; i < result.stages.length; i++) {
      for (const name of result.stages[i]) {
        stageMap.set(name, i);
      }
    }
  }
  return stageMap;
}
