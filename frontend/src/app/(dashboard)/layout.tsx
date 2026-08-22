"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { RoleProvider, useDashboardRole } from "@/context/role-context";
import {
  Sparkles,
  LayoutDashboard,
  FolderOpen,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  Briefcase,
  Award,
  CreditCard,
  Repeat,
} from "lucide-react";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toggleRole, setRole, isClient, isFreelancer } = useDashboardRole();

  const clientLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/projects", label: "My Projects", icon: FolderOpen },
    { href: "/dashboard/talent", label: "Find Talent", icon: Users },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const freelancerLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/explore", label: "Explore Quests", icon: Compass },
    { href: "/dashboard/my-work", label: "My Active Work", icon: Briefcase },
    { href: "/dashboard/skills", label: "Skill Quizzes & Badges", icon: Award },
    { href: "/dashboard/earnings", label: "Earnings & Wallet", icon: CreditCard },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const sidebarLinks = isClient ? clientLinks : freelancerLinks;

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-base font-normal tracking-tight">
              Doable<span className="text-primary">!</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Switcher Segmented Control */}
        <div className="p-3 border-b border-border/40">
          <div className="flex rounded-xl bg-muted/60 p-1 text-xs font-semibold">
            <button
              onClick={() => setRole("customer")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                isClient
                  ? "bg-card text-foreground shadow-sm shadow-black/5"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Client</span>
            </button>
            <button
              onClick={() => setRole("freelancer")}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all ${
                isFreelancer
                  ? "bg-primary text-white shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Freelancer</span>
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {isClient ? "Client Menu" : "Freelancer Menu"}
          </div>
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-muted/30">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-tertiary text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    isClient ? "bg-blue-500" : "bg-emerald-500"
                  }`}
                />
                <span className="capitalize">{isClient ? "Client" : "Freelancer"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between gap-4 border-b border-border/50 px-6 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:text-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Current View Badge */}
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                  isClient
                    ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}
              >
                {isClient ? (
                  <>
                    <Briefcase className="h-3 w-3" />
                    <span>Client View</span>
                  </>
                ) : (
                  <>
                    <Compass className="h-3 w-3" />
                    <span>Freelancer View</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Role Switcher Action in Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRole}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-sm"
              title="Ganti mode dashboard antara Client dan Freelancer"
            >
              <Repeat className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Switch to {isClient ? "Freelancer Mode" : "Client Mode"}</span>
              <span className="sm:hidden">Switch Mode</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-muted/10">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </RoleProvider>
  );
}
