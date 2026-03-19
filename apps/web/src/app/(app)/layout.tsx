"use client";

import { Shell } from "../../components/shell";
import { Building2, Layers, Play, ListChecks, Activity, Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";

const navItems = [
  { href: "/office", label: "Office", icon: Building2 },
  { href: "/sessions", label: "Sessions", icon: Layers },
  { href: "/runs", label: "Runs", icon: Play },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/timeline", label: "Timeline", icon: Activity },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      <Shell>
        {/* Sidebar */}
        <aside className="w-56 bg-zinc-900/80 border-r border-white/[0.06] p-4 flex flex-col gap-6 shrink-0 h-screen sticky top-0 backdrop-blur-sm">
          <a href="/" className="flex items-center gap-2.5 px-1 group">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Building2 size={14} className="text-white" />
            </div>
            <h1 className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white transition-colors">AgentFlow</h1>
          </a>
          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/office" && pathname.startsWith(item.href));
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "text-zinc-100 bg-white/[0.08]"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06]"
                  )}
                >
                  <Icon size={15} className={cn("shrink-0", isActive ? "opacity-100" : "opacity-60")} />
                  {item.label}
                </a>
              );
            })}
          </nav>
          <div className="mt-auto">
            <a href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-colors">
              <Home size={14} className="shrink-0 opacity-60" />
              Home
            </a>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </Shell>
    </div>
  );
}
