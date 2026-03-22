"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shell, StatusBar } from "../../components/shell";
import { BuildingOffice2Icon, Square3Stack3DIcon, PlayIcon, ClipboardDocumentListIcon, ChartBarIcon, HomeIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/cn";
import { ThemeToggle } from "../../components/ui/theme-toggle";

const navItems = [
  { href: "/office", label: "Office", icon: BuildingOffice2Icon },
  { href: "/sessions", label: "Sessions", icon: Square3Stack3DIcon },
  { href: "/runs", label: "Runs", icon: PlayIcon },
  { href: "/tasks", label: "Tasks", icon: ClipboardDocumentListIcon },
  { href: "/timeline", label: "Timeline", icon: ChartBarIcon },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed, mounted]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Shell>
        {/* Sidebar */}
        <aside className={cn(
          "bg-surface border-r border-border-base p-3 flex flex-col gap-6 shrink-0 h-screen sticky top-0 backdrop-blur-sm transition-all duration-200",
          collapsed ? "w-14" : "w-56",
        )}>
          <div className="flex items-center justify-between">
            <Link href="/" className={cn("flex items-center gap-2.5 px-1 group", collapsed && "justify-center px-0")}>
              <img src="/logo.svg" alt="AgentFlow" className="w-6 h-6 shrink-0" />
              {!collapsed && <h1 className="text-sm font-semibold tracking-tight text-foreground group-hover:opacity-80 transition-colors">AgentFlow</h1>}
            </Link>
            {!collapsed && (
              <button onClick={() => setCollapsed(true)} className="p-1 rounded-md text-muted-fg hover:text-foreground hover:bg-foreground/[0.06] transition-colors" title="Collapse sidebar">
                <ChevronLeftIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {collapsed && (
            <button onClick={() => setCollapsed(false)} className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-foreground/[0.06] transition-colors mx-auto" title="Expand sidebar">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          )}

          <nav className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/office" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg text-sm transition-colors",
                    collapsed ? "justify-center p-2" : "px-3 py-2",
                    isActive
                      ? "text-foreground bg-foreground/[0.08]"
                      : "text-muted-fg hover:text-foreground hover:bg-foreground/[0.06]"
                  )}
                >
                  <Icon className={cn("w-[15px] h-[15px] shrink-0", isActive ? "opacity-100" : "opacity-60")} />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </nav>

          <div className={cn("mt-auto flex flex-col items-center gap-3", collapsed && "gap-2")}>
            {!collapsed && <StatusBar />}
            {!collapsed ? <ThemeToggle /> : <ThemeToggle className="scale-75" />}
            {!collapsed && (
              <Link href="/" className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-foreground hover:bg-foreground/[0.04] transition-colors w-full">
                <HomeIcon className="w-[14px] h-[14px] shrink-0 opacity-60" />
                Home
              </Link>
            )}
            {collapsed && (
              <Link href="/" title="Home" className="p-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-foreground/[0.04] transition-colors">
                <HomeIcon className="w-[14px] h-[14px] opacity-60" />
              </Link>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
      </Shell>
    </div>
  );
}
