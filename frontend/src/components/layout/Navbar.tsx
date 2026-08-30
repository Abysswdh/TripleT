"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardRole, type DashboardRole } from "@/context/role-context";
import { useTranslation } from "@/context/language-context";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Container } from "@/components/layout/Container";
import {
  Search,
  Plus,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Compass,
  Briefcase,
  Award,
  CreditCard,
  Settings,
  Menu,
  X,
  ArrowLeftRight
} from "lucide-react";

export function Navbar() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  
  // Safe role hook access (if used outside role provider, provide fallback)
  let role: DashboardRole = "customer";
  let setRole: (role: DashboardRole) => void = () => {};
  try {
    const roleCtx = useDashboardRole();
    role = roleCtx?.role || "customer";
    if (roleCtx?.setRole) setRole = roleCtx.setRole;
  } catch {
    // If we're not in dashboard, we can fallback gracefully
  }

  // Determine context
  const isDashboard = pathname.startsWith("/client") || pathname.startsWith("/freelancer") || pathname === "/dashboard";
  const isClientView = pathname.startsWith("/client") || (isDashboard && role === "customer");
  const isFreelancerView = pathname.startsWith("/freelancer") || (isDashboard && role === "freelancer");
  const isClientDashboard = pathname === "/client/dashboard" || (pathname === "/dashboard" && role === "customer");

  useEffect(() => {
    if (!isClientDashboard) {
      setScrolledPastHero(true);
      return;
    }

    const handleScroll = () => {
      // Threshold when the hero searchbar and create button scroll out of view
      if (window.scrollY > 380) {
        setScrolledPastHero(true);
      } else {
        setScrolledPastHero(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClientDashboard]);

  // Switching role requires going through onboarding selection page
  const handleSwitchRole = () => {
    // Clear saved role so the /dashboard page shows the role selection screen
    if (typeof window !== "undefined") {
      localStorage.removeItem("triplet_active_dashboard_role");
    }
    router.push("/dashboard");
  };

  // Nav Items configuration
  type NavLink = { href: string; label: string; icon?: React.ElementType };

  const clientLinks: NavLink[] = [
    { href: "/client/dashboard", label: t("nav.dashboard", "Dashboard"), icon: LayoutDashboard },
    { href: "/client/projects", label: t("nav.myProjects", "My Projects"), icon: FolderOpen },
    { href: "/client/market", label: t("nav.projectMarket", "Project Market"), icon: Compass },
    { href: "/client/talent", label: t("nav.findTalent", "Find Talent"), icon: Search },
  ];

  const freelancerLinks: NavLink[] = [
    { href: "/freelancer/dashboard", label: t("nav.overview", "Overview"), icon: LayoutDashboard },
    { href: "/freelancer/explore", label: t("nav.exploreQuests", "Explore Quests"), icon: Compass },
    { href: "/freelancer/my-work", label: t("nav.myWork", "My Work"), icon: Briefcase },
    { href: "/freelancer/skills", label: t("nav.skills", "Skills"), icon: Award },
    { href: "/freelancer/earnings", label: t("nav.earnings", "Earnings"), icon: CreditCard },
  ];

  const publicLinks = [
    { href: "/#our-story", label: t("nav.ourStory", "Our Story") },
    { href: "/#realitas", label: t("nav.impact", "Impact") },
    { href: "/#transformasi-ai", label: t("nav.methodology", "Methodology") },
    { href: "/#filosofi", label: t("nav.careers", "Careers") },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container className="h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Mobile Toggle & Search */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <button 
            className="md:hidden p-2 -ml-2 text-muted-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link href={isDashboard ? (isClientView ? "/client/dashboard" : "/freelancer/dashboard") : "/"} className="flex items-center shrink-0 group">
            <BrandLogo height={36} className="group-hover:opacity-90 transition-opacity hidden sm:block" />
            <BrandLogo variant="mark" height={36} className="group-hover:opacity-90 transition-opacity sm:hidden" />
          </Link>

          {isDashboard && isClientView && (
            <div
              className={`relative hidden md:block max-w-md w-full ml-4 transition-all duration-300 ${
                isClientDashboard && !scrolledPastHero
                  ? "opacity-0 -translate-y-2 pointer-events-none w-0 max-w-0 ml-0 overflow-hidden"
                  : "opacity-100 translate-y-0"
              }`}
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("nav.searchPlaceholder", "Cari proyek, blueprint template, atau talent...")}
                className="h-9 w-full rounded-xl border border-border/80 bg-muted/40 pl-9 pr-4 text-xs placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          )}
        </div>

        {/* Right Section: Desktop Navigation & User Controls */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Public Navigation */}
          {!isDashboard && (
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground mr-2">
              {publicLinks.map(link => (
                <a key={link.label} href={link.href} className="hover:text-primary transition-colors">
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Dashboard Navigation */}
          {isDashboard && (
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold">
              {(isClientView ? clientLinks : freelancerLinks).map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-primary hover:text-primary/80 px-3 py-2 transition-all hover:scale-105 inline-block hidden sm:block"
                >
                  {t("nav.signIn", "Sign In")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-105 hover:shadow-lg transition-all"
                >
                  {t("nav.getStarted", "Get Started")}
                </Link>
              </div>
            ) : (
              <>
                {isDashboard && isClientView && (
                  <div
                    className={`transition-all duration-300 ${
                      isClientDashboard && !scrolledPastHero
                        ? "opacity-0 translate-x-2 pointer-events-none w-0 overflow-hidden"
                        : "opacity-100 translate-x-0"
                    }`}
                  >
                    <Link
                      href="/client/projects?create=true"
                      className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all whitespace-nowrap"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>{t("nav.createProject", "Buat Proyek")}</span>
                    </Link>
                  </div>
                )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-xl p-1 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-border/80 bg-card p-2 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    {/* Profile Header & Role Switcher */}
                    <div className="px-3 py-2.5 border-b border-border/40 mb-1.5">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user?.user_metadata?.full_name || "User Name"}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">{user?.email || "user@doable.id"}</p>

                      {isDashboard && (
                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleSwitchRole();
                          }}
                          className="mt-2.5 w-full flex items-center justify-center gap-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground border border-border px-3 py-2 text-xs font-semibold transition-all"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                          <span>{isClientView ? t("nav.switchToFreelancer", "Beralih ke Freelancer") : t("nav.switchToClient", "Beralih ke Client")}</span>
                        </button>
                      )}
                    </div>

                    {!isDashboard && (
                      <>
                        <Link
                          href={role === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard"}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          {t("nav.goToDashboard", "Go to Dashboard")}
                        </Link>
                        <Link
                          href={role === "freelancer" ? "/freelancer/settings" : "/client/settings"}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          {t("nav.settings", "Settings")}
                        </Link>
                      </>
                    )}
                    {isDashboard && isClientView && (
                      <>
                        <Link href="/client/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setUserDropdownOpen(false)}>
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          {t("nav.dashboard", "Dashboard")}
                        </Link>
                        <Link href="/client/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setUserDropdownOpen(false)}>
                          <Settings className="h-3.5 w-3.5" />
                          {t("nav.settings", "Settings")}
                        </Link>
                      </>
                    )}
                    {isDashboard && isFreelancerView && (
                      <>
                        <Link href="/freelancer/settings" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setUserDropdownOpen(false)}>
                          <Settings className="h-3.5 w-3.5" />
                          {t("nav.settings", "Settings")}
                        </Link>
                      </>
                    )}

                    <div className="my-1 border-t border-border/40" />
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        signOut();
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("nav.signOut", "Sign Out")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      </Container>
      
      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-md absolute w-full left-0 z-40 p-4 shadow-xl">
           <nav className="flex flex-col gap-2 text-sm font-semibold text-muted-foreground">
             {!isDashboard && publicLinks.map(link => (
                <Link key={link.label} href={link.href} className="p-2 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
             ))}
             {isDashboard && (isClientView ? clientLinks : freelancerLinks).map(link => (
                <Link key={link.href} href={link.href} className="p-2 hover:text-primary transition-colors flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  {link.icon && <link.icon className="h-4 w-4" />}
                  {link.label}
                </Link>
             ))}
           </nav>
        </div>
      )}
    </header>
  );
}
