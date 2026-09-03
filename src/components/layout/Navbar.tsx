"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardRole, type DashboardRole } from "@/context/role-context";
import { useTranslation } from "@/context/language-context";
import { createClient } from "@/lib/supabase/client";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Container } from "@/components/layout/Container";
import {
  Search,
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
  ArrowLeftRight,
  User
} from "lucide-react";
import { NotificationDropdown } from "@/components/layout/NotificationDropdown";

export function Navbar() {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useTranslation();
  
  // Safe role hook access (if used outside role provider, provide fallback)
  let role: DashboardRole = "customer";
  try {
    const roleCtx = useDashboardRole();
    role = roleCtx?.role || "customer";
  } catch {
    // If we're not in dashboard, we can fallback gracefully
  }

  const [navbarQuery, setNavbarQuery] = useState("");

  // Determine context strictly based on current URL route first, then fallback to role context
  const isFreelancerRoute = pathname.startsWith("/freelancer");
  const isClientRoute = pathname.startsWith("/client");
  const isDashboard = isFreelancerRoute || isClientRoute || pathname.startsWith("/dashboard");

  const isFreelancerView = isFreelancerRoute || (!isClientRoute && role === "freelancer");
  const isClientView = isClientRoute || (!isFreelancerRoute && role === "customer");

  // Sync search query with hero search bar
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (typeof customEvent?.detail === "string") {
        setNavbarQuery(customEvent.detail);
      }
    };
    window.addEventListener("doable-search-sync", handleSync);
    return () => window.removeEventListener("doable-search-sync", handleSync);
  }, []);

  // Click outside to close user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    if (userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userDropdownOpen]);

  // Live avatar state synced from database and custom update events
  const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(DEFAULT_AVATAR);
  const [freelancerOnboarded, setFreelancerOnboarded] = useState<boolean | null>(null);
  const [clientOnboarded, setClientOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) {
      setDbAvatarUrl(null);
      setFreelancerOnboarded(null);
      setClientOnboarded(null);
      return;
    }

    const cleanUrl = (url?: string | null) => {
      if (url && typeof url === "string" && url.startsWith("http")) {
        return url;
      }
      return DEFAULT_AVATAR;
    };

    if (user.user_metadata?.avatar_url) {
      setDbAvatarUrl(cleanUrl(user.user_metadata.avatar_url));
    }
    if (user.user_metadata?.freelancer_onboarded !== undefined) {
      setFreelancerOnboarded(Boolean(user.user_metadata.freelancer_onboarded));
    }
    if (user.user_metadata?.client_onboarded !== undefined) {
      setClientOnboarded(Boolean(user.user_metadata.client_onboarded));
    }

    const supabase = createClient();
    const fetchUserData = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("avatar_url, freelancer_onboarded, client_onboarded, role, onboarding_completed")
          .eq("id", user.id)
          .single();
        if (data) {
          if (data.avatar_url !== undefined) {
            setDbAvatarUrl(cleanUrl(data.avatar_url));
          }
          const isFlOnboarded = !!data.freelancer_onboarded || (!!data.onboarding_completed && data.role === "freelancer");
          const isClOnboarded = !!data.client_onboarded || (!!data.onboarding_completed && (data.role === "customer" || data.role === "client"));

          setFreelancerOnboarded(isFlOnboarded);
          setClientOnboarded(isClOnboarded);

          if (typeof window !== "undefined") {
            if (isFlOnboarded) localStorage.setItem("triplet_freelancer_onboarded", "true");
            if (isClOnboarded) localStorage.setItem("triplet_client_onboarded", "true");
          }
        }
      } catch (err) {
        console.warn("Could not fetch navbar user data:", err);
      }
    };

    fetchUserData();

    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdate);
    };
  }, [user]);

  // Seamless role switcher with first-time role onboarding detection
  const handleSwitchRole = async () => {
    const targetRole = isClientView ? "freelancer" : "customer";

    // 1. Determine onboarding status for target role
    let isTargetOnboarded: boolean = targetRole === "freelancer"
      ? (freelancerOnboarded ?? (user?.user_metadata?.freelancer_onboarded ?? false))
      : (clientOnboarded ?? (user?.user_metadata?.client_onboarded ?? false));

    // Also check localStorage cache
    if (!isTargetOnboarded && typeof window !== "undefined") {
      const cached = targetRole === "freelancer"
        ? localStorage.getItem("triplet_freelancer_onboarded") === "true"
        : localStorage.getItem("triplet_client_onboarded") === "true";
      if (cached) isTargetOnboarded = true;
    }

    // Double check with live DB if still not flagged to prevent erroneous redirects
    if (!isTargetOnboarded && user?.id) {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("users")
          .select("freelancer_onboarded, client_onboarded, role, onboarding_completed")
          .eq("id", user.id)
          .single();
        if (data) {
          const isFl = !!data.freelancer_onboarded || (!!data.onboarding_completed && data.role === "freelancer");
          const isCl = !!data.client_onboarded || (!!data.onboarding_completed && (data.role === "customer" || data.role === "client"));
          setFreelancerOnboarded(isFl);
          setClientOnboarded(isCl);
          isTargetOnboarded = targetRole === "freelancer" ? isFl : isCl;
        }
      } catch (err) {
        console.warn("Error checking target role onboarding status:", err);
      }
    }

    // 2. If it's their first time switching to target role, direct to onboarding for that role
    if (!isTargetOnboarded) {
      if (typeof window !== "undefined") {
        localStorage.setItem("triplet_active_dashboard_role", targetRole);
      }
      router.push(`/onboarding?role=${targetRole}`);
      return;
    }

    // 3. Target role already onboarded: direct seamless navigation
    if (typeof window !== "undefined") {
      localStorage.setItem("triplet_active_dashboard_role", targetRole);
    }
    if (targetRole === "freelancer") {
      router.push("/freelancer/dashboard");
    } else {
      router.push("/client/dashboard");
    }
    router.refresh();
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
    { href: "/freelancer/explore", label: t("nav.exploreQuests", "Explore Projects"), icon: Compass },
    { href: "/freelancer/my-work", label: t("nav.myWork", "My Work"), icon: Briefcase },
    { href: "/freelancer/skills", label: t("nav.skills", "Skills"), icon: Award },
    { href: "/freelancer/earnings", label: t("nav.earnings", "Earnings"), icon: CreditCard },
  ];

  const publicLinks = [
    { href: "/#our-story", label: t("nav.ourStory", "Our Story") },
    { href: "/#realitas-data", label: t("nav.dataRealitas", "Data & Realitas") },
    { href: "/#solusi-doable", label: t("nav.solusiWorkspace", "Solusi & Workspace") },
    { href: "/#dummy-projects", label: t("nav.dummyProjects", "Dummy Projects") },
    { href: "/#sdg-impact", label: t("nav.sdgImpact", "SDG Impact") },
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

          {isDashboard && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const query = navbarQuery.trim();
                const targetUrl = isFreelancerView ? "/freelancer/explore" : "/client/market";
                if (query) {
                  router.push(`${targetUrl}?q=${encodeURIComponent(query)}`);
                } else {
                  router.push(targetUrl);
                }
              }}
              className="relative hidden md:flex items-center max-w-xs lg:max-w-sm xl:max-w-md w-full ml-3 rounded-full border border-border/80 bg-white dark:bg-card/90 shadow-xs focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary overflow-hidden pl-3.5 pr-0 py-0 transition-all h-9"
            >
              <input
                type="text"
                value={navbarQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setNavbarQuery(val);
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("doable-search-sync", { detail: val }));
                  }
                }}
                placeholder={
                  isFreelancerView
                    ? t("nav.freelancerSearchPlaceholder", "Cari proyek, keahlian...")
                    : t("nav.searchPlaceholder", "Cari proyek, blueprint, talenta...")
                }
                className="w-full flex-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent font-medium py-1.5 pr-2"
              />
              <button
                type="submit"
                className="shrink-0 self-stretch inline-flex items-center justify-center px-3.5 bg-primary text-white hover:bg-primary-600 active:bg-primary-700 transition-colors"
                title={isFreelancerView ? "Cari Proyek" : "Cari di Market"}
                aria-label={isFreelancerView ? "Cari Proyek" : "Cari di Market"}
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
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
            {!user && !isDashboard ? (
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

              {/* Notification Center Popover */}
              <NotificationDropdown />

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 rounded-full p-0.5 sm:px-2.5 sm:py-1 hover:bg-muted/80 transition-colors border border-border/50"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm overflow-hidden border border-border/40 shrink-0">
                    {dbAvatarUrl ? (
                      <img src={dbAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>
                        {user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
                          user?.email?.charAt(0).toUpperCase() ||
                          "U"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground hidden sm:block max-w-[130px] truncate text-left">
                    {user?.user_metadata?.full_name || "Rania Putri"}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-border/80 bg-card p-2.5 shadow-xl z-50 animate-in fade-in zoom-in-95">
                    {/* Profile Header & Role Switcher */}
                    <div className="px-3 py-2.5 border-b border-border/40 mb-1.5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-xs overflow-hidden border border-border/40">
                          {dbAvatarUrl ? (
                            <img src={dbAvatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <span>
                              {user?.user_metadata?.full_name?.charAt(0).toUpperCase() ||
                                user?.email?.charAt(0).toUpperCase() ||
                                "U"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-foreground truncate">
                            {user?.user_metadata?.full_name || "User Name"}
                          </p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email || "user@doable.id"}</p>
                        </div>
                      </div>

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
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          {t("nav.dashboard", "Dashboard")}
                        </Link>
                        <Link
                          href={role === "freelancer" ? "/freelancer/profile" : "/client/profile"}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <User className="h-3.5 w-3.5" />
                          {t("nav.profile", "Profil Anda")}
                        </Link>
                        <Link
                          href={role === "freelancer" ? "/freelancer/settings" : "/client/settings"}
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          {t("nav.settings", "Settings")}
                        </Link>
                      </>
                    )}
                    {isDashboard && isClientView && (
                      <>
                        <Link
                          href="/client/dashboard"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          {t("nav.dashboard", "Dashboard")}
                        </Link>
                        <Link
                          href="/client/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="h-3.5 w-3.5" />
                          {t("nav.profile", "Profil Anda")}
                        </Link>
                        <Link
                          href="/client/settings"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Settings className="h-3.5 w-3.5" />
                          {t("nav.settings", "Settings")}
                        </Link>
                      </>
                    )}
                    {isDashboard && isFreelancerView && (
                      <>
                        <Link
                          href="/freelancer/dashboard"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <LayoutDashboard className="h-3.5 w-3.5" />
                          {t("nav.overview", "Dashboard")}
                        </Link>
                        <Link
                          href="/freelancer/profile"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <User className="h-3.5 w-3.5" />
                          {t("nav.profile", "Profil Anda")}
                        </Link>
                        <Link
                          href="/freelancer/settings"
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                          onClick={() => setUserDropdownOpen(false)}
                        >
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
