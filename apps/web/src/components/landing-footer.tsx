"use client";

import React from "react";
import Link from "next/link";
import { CodeBracketIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";


export function LandingFooter() {
  const [email, setEmail] = React.useState("");

  return (
    <footer className="relative border-t border-border-base bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-12 md:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Newsletter */}
          <div className="relative">
            <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">Stay in the loop</h2>
            <p className="mb-6 text-sm text-muted-fg">
              Get notified about new features, agent patterns, and product updates.
            </p>
            <form className="relative" onSubmit={(e) => { e.preventDefault(); setEmail(""); }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full h-10 rounded-lg border border-border-base bg-surface-inset px-3 pr-12 text-sm text-foreground placeholder:text-muted-fg/50 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/15 transition-colors"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-transparent border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-all hover:bg-emerald-500/10 hover:border-emerald-500/60 hover:scale-105"
              >
                <PaperAirplaneIcon className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-emerald-600/5 blur-2xl" />
          </div>

          <div className="md:flex md:justify-end md:text-right">
            <div>
              <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Product</h3>
              <nav className="space-y-2.5 text-sm">
                <Link href="/#features" className="block text-muted-fg hover:text-foreground transition-colors">Features</Link>
                <Link href="/docs" className="block text-muted-fg hover:text-foreground transition-colors">Documentation</Link>
                <Link href="/#getting-started" className="block text-muted-fg hover:text-foreground transition-colors">Get Started</Link>
                <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener noreferrer" className="block text-muted-fg hover:text-foreground transition-colors">Claude Code Docs</a>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border-base pt-8 text-center md:flex-row">
          <span className="text-sm text-muted-fg/50">&copy; 2026 ClauBoard. Free &amp; Open Source.</span>
          <nav className="flex gap-4 text-sm text-muted-fg/50">
            <a href="https://github.com/Sipoke123/ClauBoard" target="_blank" rel="noopener noreferrer" className="hover:text-muted-fg transition-colors">GitHub</a>
            <span>AGPL-3.0</span>
          </nav>
        </div>
      </div>
    </footer>
  );
}
