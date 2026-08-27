"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { RoleProvider, useDashboardRole } from "@/context/role-context";
import logoWithText from "@/assets/logo_with_text.svg";
import logoWithoutText from "@/assets/logo_wo_text.svg";

// =========================================================================
// 🎨 LOGO SIZE CONFIGURATION (Edit height in pixels to customize size)
// =========================================================================
const CLIENT_NAVBAR_LOGO_HEIGHT = 48;       // Client Dashboard Navbar
const FREELANCER_SIDEBAR_LOGO_HEIGHT = 48;  // Freelancer Dashboard Sidebar
// =========================================================================

import {
  Sparkles,
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Compass,
  Briefcase,
  Award,
  CreditCard,
  Repeat,
  Search,
  Plus,
  ChevronDown,
} from "lucide-react";

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { role, setRole } = useDashboardRole();

  // Determine active view based on URL path or fallback to role state
  const isClientView = pathname.startsWith("/client") || (pathname === "/dashboard" && role === "customer");

  // Keep role state in sync with URL
  useEffect(() => {
    if (pathname.startsWith("/client") && role !== "customer") {
      setRole("customer");
    } else if (pathname.startsWith("/freelancer") && role !== "freelancer") {
      setRole("freelancer");
    }
  }, [pathname, role, setRole]);

  const freelancerLinks = [
    { href: "/freelancer/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/freelancer/explore", label: "Explore Quests", icon: Compass },
    { href: "/freelancer/my-work", label: "My Active Work", icon: Briefcase },
    { href: "/freelancer/skills", label: "Skill Quizzes & Badges", icon: Award },
    { href: "/freelancer/earnings", label: "Earnings & Wallet", icon: CreditCard },
    { href: "/freelancer/settings", label: "Settings", icon: Settings },
  ];

  const handleSwitchToClient = () => {
    setRole("customer");
    router.push("/client/dashboard");
  };

  const handleSwitchToFreelancer = () => {
    setRole("freelancer");
    router.push("/freelancer/dashboard");
  };

  // ==========================================
  // 1. CLIENT LAYOUT (TOP NAVIGATION BAR / FIVERR-STYLE)
  // ==========================================
  if (isClientView) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-50 border-b border-border/60 bg-card/80 backdrop-blur-md">
          {/* Main Top Header Bar */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            {/* Left: Brand Logo & Search */}
            <div className="flex items-center gap-5 flex-1">
              <Link href="/client/dashboard" className="flex items-center gap-3 shrink-0 group">
                <Image
                  src={logoWithText}
                  alt="Doable! Logo"
                  height={CLIENT_NAVBAR_LOGO_HEIGHT}
                  width={Math.round(CLIENT_NAVBAR_LOGO_HEIGHT * (1650 / 580))}
                  style={{
                    height: `${CLIENT_NAVBAR_LOGO_HEIGHT}px`,
                    width: "auto",
                    maxHeight: `${CLIENT_NAVBAR_LOGO_HEIGHT}px`,
                  }}
                  className="object-contain block select-none"
                  priority
                />
              </Link>

              {/* Quick Search in Navbar */}
              <div className="relative hidden md:block max-w-md w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari proyek, blueprint template, atau talent terverifikasi..."
                  className="h-9 w-full rounded-xl border border-border/80 bg-muted/40 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Right: Navigation Links & Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
                <Link
                  href="/client/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors ${pathname === "/client/dashboard"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                >
                  Project Hub
                </Link>
                <Link
                  href="/client/projects"
                  className={`px-3 py-2 rounded-lg transition-colors ${pathname === "/client/projects"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                >
                  My Projects
                </Link>
                <Link
                  href="/client/talent"
                  className={`px-3 py-2 rounded-lg transition-colors ${pathname === "/client/talent"
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                >
                  Find Talent
                </Link>
              </nav>

              {/* Post Project Button */}
              <Link
                href="/client/projects"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/25 hover:bg-primary-600 transition-all hover:scale-[1.02]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Post Project</span>
              </Link>

              {/* Switch Mode Button */}
              <button
                onClick={handleSwitchToFreelancer}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 shadow-xs"
                title="Ganti ke Freelancer Dashboard"
              >
                <Repeat className="h-3.5 w-3.5 text-primary" />
                <span className="hidden sm:inline">Switch to Freelancer</span>
                <span className="sm:hidden">Freelancer</span>
              </button>

              {/* User Dropdown Profile */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-xs">
                    {user?.email?.charAt(0).toUpperCase() || "P"}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-card p-2 shadow-xl z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-2 border-b border-border/40 mb-1">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user?.user_metadata?.full_name || "Putra Abyasa Wedha"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email || "user@doable.id"}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded">
                        Client Mode
                      </span>
                    </div>

                    <Link
                      href="/client/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" />
                      Client Dashboard
                    </Link>
                    <Link
                      href="/client/projects"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <FolderOpen className="h-3.5 w-3.5" />
                      My Projects & Orders
                    </Link>
                    <Link
                      href="/client/talent"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Users className="h-3.5 w-3.5" />
                      Find Verified Talent
                    </Link>

                    <div className="my-1 border-t border-border/40" />

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Header Categories Bar (Fiverr Style) */}
          <div className="border-t border-border/40 bg-card/50 overflow-x-auto scrollbar-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 h-10 text-xs font-medium text-muted-foreground whitespace-nowrap">
              <Link href="/client/talent?cat=Frontend" className="hover:text-primary transition-colors">
                Frontend & React
              </Link>
              <Link href="/client/talent?cat=Backend" className="hover:text-primary transition-colors">
                Backend & API (Python/Go)
              </Link>
              <Link href="/client/talent?cat=Design" className="hover:text-primary transition-colors">
                UI/UX & Product Design
              </Link>
              <Link href="/client/talent?cat=AI" className="hover:text-primary transition-colors">
                AI Agents & Machine Learning
              </Link>
              <Link href="/client/talent?cat=Mobile" className="hover:text-primary transition-colors">
                Mobile Apps (Flutter/React Native)
              </Link>
              <Link href="/client/talent?cat=DevOps" className="hover:text-primary transition-colors">
                Cloud & DevOps
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-16">
          {children}
        </main>
      </div>
    );
  }

  // ==========================================
  // 2. FREELANCER LAYOUT (LEFT SIDEBAR DASHBOARD)
  // ==========================================
  return (
    <div className="flex h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/50 bg-card transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-6">
          <Link href="/freelancer/dashboard" className="flex items-center gap-2">
            <Image
              src={logoWithText}
              alt="Doable! Logo"
              height={FREELANCER_SIDEBAR_LOGO_HEIGHT}
              width={Math.round(FREELANCER_SIDEBAR_LOGO_HEIGHT * (1650 / 580))}
              style={{
                height: `${FREELANCER_SIDEBAR_LOGO_HEIGHT}px`,
                width: "auto",
                maxHeight: `${FREELANCER_SIDEBAR_LOGO_HEIGHT}px`,
              }}
              className="object-contain block select-none"
              priority
            />
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
              onClick={handleSwitchToClient}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all text-muted-foreground hover:text-foreground"
            >
              <Briefcase className="h-3.5 w-3.5" />
              <span>Client</span>
            </button>
            <button
              onClick={handleSwitchToFreelancer}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-lg py-1.5 transition-all bg-primary text-white shadow-sm shadow-primary/25"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Freelancer</span>
            </button>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Freelancer Dashboard
          </div>
          {freelancerLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
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
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
              {user?.email?.charAt(0).toUpperCase() || "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {user?.user_metadata?.full_name || "Putra Abyasa Wedha"}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="capitalize">Freelancer Pro</span>
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
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Compass className="h-3 w-3" />
                <span>Freelancer Dashboard OS</span>
              </span>
            </div>
          </div>

          {/* Role Switcher Action in Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSwitchToClient}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/40 shadow-sm"
              title="Ganti ke Client Marketplace Hub"
            >
              <Repeat className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Switch to Client Mode</span>
              <span className="sm:hidden">Client</span>
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
