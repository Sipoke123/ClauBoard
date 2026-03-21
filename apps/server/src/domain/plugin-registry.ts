import type { AgentEvent } from "@repo/shared";
import type { EmitFn } from "../adapter/types.js";

// ---------------------------------------------------------------------------
// Plugin interface
// ---------------------------------------------------------------------------

export interface PluginEventType {
  /** e.g. "plugin.metrics.collected" */
  type: string;
  /** Human-readable label for UI */
  label: string;
  /** Color hint for timeline (CSS color or Tailwind class) */
  color?: string;
  /** JSON schema description for payload (informational) */
  payloadDescription?: string;
}

export interface PluginNotificationRule {
  id: string;
  name: string;
  triggers: string[];
  evaluate: (event: AgentEvent) => { severity: "info" | "warning" | "critical"; title: string; detail: string } | null;
}

export interface PluginDefinition {
  /** Unique plugin ID, e.g. "metrics" */
  id: string;
  /** Display name */
  name: string;
  /** Version string */
  version: string;
  /** Custom event types this plugin introduces */
  eventTypes?: PluginEventType[];
  /** Custom notification rules */
  notificationRules?: PluginNotificationRule[];
  /** Called when the plugin is registered — can set up intervals, watchers, etc. */
  onRegister?: (ctx: PluginContext) => void;
  /** Called on every event passing through the pipeline */
  onEvent?: (event: AgentEvent) => void;
  /** Called when the plugin is unregistered / server shuts down */
  onDestroy?: () => void;
}

export interface PluginContext {
  /** Emit a custom event into the pipeline */
  emit: EmitFn;
  /** Get plugin config (from env or registration) */
  config: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export class PluginRegistry {
  private plugins = new Map<string, PluginDefinition>();
  private contexts = new Map<string, PluginContext>();

  constructor(private emit: EmitFn) {}

  /**
   * Register a plugin. Returns false if already registered.
   */
  register(plugin: PluginDefinition, config: Record<string, unknown> = {}): boolean {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[plugins] plugin "${plugin.id}" already registered`);
      return false;
    }

    this.plugins.set(plugin.id, plugin);

    const ctx: PluginContext = { emit: this.emit, config };
    this.contexts.set(plugin.id, ctx);

    if (plugin.onRegister) {
      try {
        plugin.onRegister(ctx);
        console.log(`[plugins] registered "${plugin.name}" v${plugin.version} (${plugin.eventTypes?.length ?? 0} event types)`);
      } catch (err: any) {
        console.error(`[plugins] "${plugin.id}" onRegister error: ${err.message}`);
      }
    } else {
      console.log(`[plugins] registered "${plugin.name}" v${plugin.version}`);
    }

    return true;
  }

  /**
   * Unregister a plugin.
   */
  unregister(pluginId: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      plugin.onDestroy?.();
    } catch {}

    this.plugins.delete(pluginId);
    this.contexts.delete(pluginId);
    console.log(`[plugins] unregistered "${pluginId}"`);
    return true;
  }

  /**
   * Notify all plugins of an event.
   */
  onEvent(event: AgentEvent): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.onEvent) {
        try {
          plugin.onEvent(event);
        } catch (err: any) {
          console.error(`[plugins] "${plugin.id}" onEvent error: ${err.message}`);
        }
      }
    }
  }

  /**
   * Get all registered plugins (for API/UI).
   */
  list(): { id: string; name: string; version: string; eventTypes: PluginEventType[] }[] {
    return [...this.plugins.values()].map((p) => ({
      id: p.id,
      name: p.name,
      version: p.version,
      eventTypes: p.eventTypes ?? [],
    }));
  }

  /**
   * Get all custom event types across all plugins.
   */
  allEventTypes(): PluginEventType[] {
    const types: PluginEventType[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.eventTypes) types.push(...plugin.eventTypes);
    }
    return types;
  }

  /**
   * Get all custom notification rules across all plugins.
   */
  allNotificationRules(): PluginNotificationRule[] {
    const rules: PluginNotificationRule[] = [];
    for (const plugin of this.plugins.values()) {
      if (plugin.notificationRules) rules.push(...plugin.notificationRules);
    }
    return rules;
  }

  /**
   * Get a specific plugin.
   */
  get(pluginId: string): PluginDefinition | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Destroy all plugins (server shutdown).
   */
  destroyAll(): void {
    for (const [id] of this.plugins) {
      this.unregister(id);
    }
  }
}
