"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shell, StatusBar } from "../../components/shell";
import { DemoBanner } from "../../components/demo-banner";
import { BuildingOffice2Icon, Square3Stack3DIcon, PlayIcon, ClipboardDocumentListIcon, ChartBarIcon, HomeIcon, ChevronLeftIcon, ChevronRightIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
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

const skipLanding = process.env.NEXT_PUBLIC_SKIP_LANDING === "true";
const logoHref = skipLanding ? "/office" : "/";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden">
      <DemoBanner />
      <Shell>
      <div className="flex flex-1 min-h-0 h-full">
        {/* Mobile top bar */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-3 py-2 bg-surface border-b border-border-base backdrop-blur-sm">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1.5 rounded-md text-muted-fg hover:text-foreground hover:bg-foreground/[0.06] transition-colors">
              {mobileOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
            </button>
            <Link href={logoHref} className="flex items-center gap-1">
              <img src="/logo.svg" alt="ClauBoard" className="w-5 h-5" />
              <span className="text-sm font-semibold tracking-tight text-foreground">ClauBoard</span>
            </Link>
            <ThemeToggle className="scale-75" />
          </div>
        )}

        {/* Mobile overlay */}
        {isMobile && mobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "bg-surface border-r border-border-base p-3 flex flex-col gap-6 shrink-0 h-full backdrop-blur-sm transition-all duration-200",
          isMobile
            ? cn("fixed top-11 left-0 bottom-0 z-40 w-56 transform transition-transform duration-200", mobileOpen ? "translate-x-0" : "-translate-x-full")
            : collapsed ? "w-14" : "w-56",
        )}>
          {!isMobile && (
            <div className="flex items-center justify-between">
              <Link href={logoHref} className={cn("flex items-center gap-1 px-1 group", collapsed && "justify-center px-0")}>
                <img src="/logo.svg" alt="ClauBoard" className="w-6 h-6 shrink-0" />
                {!collapsed && <h1 className="text-sm font-semibold tracking-tight text-foreground group-hover:opacity-80 transition-colors">ClauBoard</h1>}
              </Link>
              {!collapsed && (
                <button onClick={() => setCollapsed(true)} className="p-1 rounded-md text-muted-fg hover:text-foreground hover:bg-foreground/[0.06] transition-colors" title="Collapse sidebar">
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {!isMobile && collapsed && (
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
                  title={(!isMobile && collapsed) ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg text-sm transition-colors",
                    (!isMobile && collapsed) ? "justify-center p-2" : "px-3 py-2",
                    isActive
                      ? "text-foreground bg-foreground/[0.08]"
                      : "text-muted-fg hover:text-foreground hover:bg-foreground/[0.06]"
                  )}
                >
                  <Icon className={cn("w-[15px] h-[15px] shrink-0", isActive ? "opacity-100" : "opacity-60")} />
                  {(isMobile || !collapsed) && item.label}
                </Link>
              );
            })}
          </nav>

          <div className={cn("mt-auto flex flex-col items-center gap-3", !isMobile && collapsed && "gap-2")}>
            {(isMobile || !collapsed) && <StatusBar />}
            {!skipLanding && (isMobile || !collapsed) && (
              <Link href="/" className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-fg hover:text-foreground hover:bg-foreground/[0.04] transition-colors w-full">
                <HomeIcon className="w-[14px] h-[14px] shrink-0 opacity-60" />
                Home
              </Link>
            )}
            {!skipLanding && !isMobile && collapsed && (
              <Link href="/" title="Home" className="p-2 rounded-lg text-muted-fg hover:text-foreground hover:bg-foreground/[0.04] transition-colors">
                <HomeIcon className="w-[14px] h-[14px] opacity-60" />
              </Link>
            )}
            {!isMobile && (!collapsed ? <ThemeToggle /> : <ThemeToggle className="scale-75" />)}
          </div>
        </aside>

        {/* Main content */}
        <main className={cn("flex-1 min-h-0 overflow-hidden", isMobile && "pt-11")}>{children}</main>
      </div>
      </Shell>
    </div>
  );
}
