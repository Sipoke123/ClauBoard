"use client"

import { useSyncExternalStore } from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { cn } from "../../lib/cn"
import { useTheme } from "../../lib/use-theme"

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const isDark = theme === "dark"

  if (!mounted) {
    return (
      <div className={cn("flex w-16 h-8 p-1 rounded-full bg-surface border border-border-base opacity-0", className)} />
    )
  }

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 bg-surface border border-border-base",
        className
      )}
      onClick={toggle}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } }}
      role="button"
      tabIndex={0}
      aria-label="Toggle theme"
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark
              ? "translate-x-0 bg-card"
              : "translate-x-8 bg-card"
          )}
        >
          {isDark ? (
            <MoonIcon className="w-4 h-4 text-foreground" />
          ) : (
            <SunIcon className="w-4 h-4 text-foreground" />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark ? "bg-transparent" : "-translate-x-8"
          )}
        >
          {isDark ? (
            <SunIcon className="w-4 h-4 text-muted-fg" />
          ) : (
            <MoonIcon className="w-4 h-4 text-muted-fg" />
          )}
        </div>
      </div>
    </div>
  )
}
