"use client"

import { Moon, Sun } from "lucide-react"
import { cn } from "../../lib/cn"
import { useTheme } from "../../lib/use-theme"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  const isDark = theme === "dark"

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 bg-surface border border-border-base",
        className
      )}
      onClick={toggle}
      role="button"
      tabIndex={0}
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
            <Moon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark ? "bg-transparent" : "-translate-x-8"
          )}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-muted-fg" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4 text-muted-fg" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
