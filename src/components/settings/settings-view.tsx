/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardRole, DashboardRole } from "@/context/role-context";
import { useTranslation, type Locale } from "@/context/language-context";
import { useCurrency, type Currency } from "@/context/currency-context";
import { createClient } from "@/lib/supabase/client";
import { uploadProfileMedia } from "@/lib/services/storage";
import { getFreelancerEarnings } from "@/lib/services/earnings";
import { UNIFIED_PROJECT_CATEGORIES } from "@/lib/constants/categories";
import {
  User,
  Image as ImageIcon,
  Building2,
  Shield,
  Bell,
  CreditCard,
  Globe,
  Save,
  Check,
  Plus,
  X,
  ExternalLink,
  Lock,
  Smartphone,
  Laptop,
  Eye,
  EyeOff,
  Briefcase,
  Code2,
  DollarSign,
  CheckCircle2,
  Layers,
  Sparkles,
  Camera,
  AlertTriangle,
  FileText,
  MapPin,
  Mail,
  Phone,
  Link as LinkIcon,
  ChevronRight,
  Palette,
  TrendingUp,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  "Desain & Branding": Palette,
  "Foto & Video Kreatif": Camera,
  "Tugas Lokal / On-Site": MapPin,
  "Web & IT Engineering": Globe,
  "Penulisan & Admin": FileText,
  "Marketing & Promosi": TrendingUp,
};

type SettingsTab = "profile" | "work" | "security" | "notifications" | "billing" | "preferences";

interface SettingsViewProps {
  initialTab?: SettingsTab;
  defaultRole?: DashboardRole;
}

const AVAILABLE_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Supabase",
  "UI/UX Design",
  "Figma",
  "GraphQL",
  "Docker",
  "AWS",
  "AI & LLM Integration",
  "Three.js",
  "Mobile App Development",
  "Flutter"
];

const INDUSTRIES = [
  "Technology & Software",
  "E-Commerce & Retail",
  "Creative & Design Agency",
  "Fintech & Banking",
  "Healthcare & Biotech",
  "Education & EdTech",
  "Media & Entertainment",
  "Other"
];

const COMPANY_SIZES = [
  "1-10 employees (Startup)",
  "11-50 employees (Small)",
  "51-200 employees (Medium)",
  "201-500 employees (Mid-Market)",
  "500+ employees (Enterprise)"
];

const PRESET_BANNERS = [
  {
    id: "preset-office",
    name: "Modern Office",
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-blue-600/40 via-indigo-600/30 to-purple-600/40"
  },
  {
    id: "preset-tech",
    name: "Creative Tech",
    url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-cyan-600/40 via-blue-600/30 to-indigo-600/40"
  },
  {
    id: "preset-gradient",
    name: "Cyber Violet",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-violet-600/40 via-purple-600/30 to-pink-600/40"
  },
  {
    id: "preset-abstract",
    name: "Abstract Silk",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-emerald-600/40 via-teal-600/30 to-blue-600/40"
  },
  {
    id: "preset-minimal",
    name: "Minimal Studio",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
    gradient: "from-slate-600/40 via-gray-600/30 to-zinc-600/40"
  }
];

export function SettingsView({ initialTab = "profile", defaultRole }: SettingsViewProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { role: activeRole } = useDashboardRole();
  const { locale, setLocale, t } = useTranslation();
  const { currency: globalCurrency, setCurrency: setGlobalCurrency, formatMoney } = useCurrency();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const currentRole = defaultRole || activeRole;

  useEffect(() => {
    const tabParam = searchParams?.get("tab") as SettingsTab | null;
    if (tabParam && ["profile", "work", "security", "notifications", "billing", "preferences"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Form State
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Jakarta, Indonesia");
  const [timezone, setTimezone] = useState("Asia/Jakarta (UTC+7)");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerPreviewUrl, setBannerPreviewUrl] = useState("");
  const [pendingBannerFile, setPendingBannerFile] = useState<File | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran gambar maksimal 5MB");
        return;
      }
      setPendingAvatarFile(file);
      const preview = URL.createObjectURL(file);
      setAvatarPreviewUrl(preview);
      setErrorMessage("");
    }
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage("Ukuran banner maksimal 5MB");
        return;
      }
      setPendingBannerFile(file);
      const preview = URL.createObjectURL(file);
      setBannerPreviewUrl(preview);
      setErrorMessage("");
    }
  };

  const handleSelectPresetBanner = (url: string) => {
    setBannerUrl(url);
    setBannerPreviewUrl(url);
    setPendingBannerFile(null);
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
  };

  const handleResetBanner = () => {
    setBannerUrl("");
    setBannerPreviewUrl("");
    setPendingBannerFile(null);
    if (bannerFileInputRef.current) bannerFileInputRef.current.value = "";
  };

  const handleResetAvatar = () => {
    setAvatarUrl("");
    setAvatarPreviewUrl("");
    setPendingAvatarFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Freelancer specific fields
  const [hourlyRate, setHourlyRate] = useState("35");
  const [experienceLevel, setExperienceLevel] = useState("Senior (4-7 years)");
  const [availability, setAvailability] = useState("available");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    "React",
    "Next.js",
    "TypeScript",
    "FastAPI"
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [githubUrl, setGithubUrl] = useState("https://github.com/");
  const [linkedinUrl, setLinkedinUrl] = useState("https://linkedin.com/in/");
  const [portfolioUrl, setPortfolioUrl] = useState("https://");

  // Client specific fields
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("https://");
  const [companySize, setCompanySize] = useState(COMPANY_SIZES[0]);
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [clientType, setClientType] = useState<"umkm" | "startup" | "agency" | "individual">("umkm");
  const [projectCategories, setProjectCategories] = useState<string[]>([
    "Desain & Branding",
    "Web & IT Engineering"
  ]);
  const [budgetPreference, setBudgetPreference] = useState<"umkm" | "standard" | "enterprise">("umkm");
  const [billingAddress, setBillingAddress] = useState("");
  const [taxId, setTaxId] = useState("");

  // Security Form
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification toggles
  const [notifications, setNotifications] = useState({
    emailProposals: true,
    emailMilestones: true,
    emailMessages: true,
    emailMarketing: false,
    inAppMilestones: true,
    inAppChat: true,
    inAppGamification: true,
    soundEffects: true
  });

  // Preferences
  const [language, setLanguage] = useState<Locale>(locale);
  const [currency, setCurrency] = useState<Currency>(globalCurrency);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Keep local language & currency state in sync if changed externally
  useEffect(() => {
    setLanguage(locale);
  }, [locale]);

  useEffect(() => {
    setCurrency(globalCurrency);
  }, [globalCurrency]);

  // Load user data on mount
  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      setEmail(user.email || "");
      const meta = user.user_metadata || {};
      
      // Initialize with sanitized metadata
      const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
      const DEFAULT_BANNER = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80";
      const cleanAvatar = (url?: string | null) => (url && typeof url === "string" && url.startsWith("http")) ? url : DEFAULT_AVATAR;
      const cleanBanner = (url?: string | null) => (url && typeof url === "string" && url.startsWith("http")) ? url : DEFAULT_BANNER;

      setFullName(meta.full_name || meta.name || "");
      setDisplayName(meta.display_name || meta.user_name || meta.username || (user.email ? user.email.split("@")[0] : ""));
      setPhone(meta.phone || "");
      setBio(meta.bio || "");
      setAvatarUrl(cleanAvatar(meta.avatar_url));
      setBannerUrl(cleanBanner(meta.banner_url || meta.cover_image));

      // Query database tables for the latest source-of-truth across users, freelancer_profiles, and client_profiles
      try {
        const supabase = createClient();
        
        // 1. Fetch core user row
        const { data: dbUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (dbUser) {
          if (dbUser.avatar_url) setAvatarUrl(cleanAvatar(dbUser.avatar_url));
          if (dbUser.banner_url) setBannerUrl(cleanBanner(dbUser.banner_url));
          if (dbUser.full_name) setFullName(dbUser.full_name);
          if (dbUser.bio) setBio(dbUser.bio);
          if (dbUser.phone) setPhone(dbUser.phone);
          if (dbUser.location) setLocation(dbUser.location);
          if (dbUser.username) setDisplayName(dbUser.username);
        }

        // 2. Fetch freelancer profile row
        const { data: flProfile } = await supabase
          .from("freelancer_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (flProfile) {
          if (flProfile.hourly_rate) setHourlyRate(String(flProfile.hourly_rate));
          if (flProfile.skills && Array.isArray(flProfile.skills) && flProfile.skills.length > 0) {
            setSelectedSkills(flProfile.skills);
          }
          if (flProfile.experience_level) setExperienceLevel(flProfile.experience_level);
          if (flProfile.availability) setAvailability(flProfile.availability);
          if (flProfile.github_url) setGithubUrl(flProfile.github_url);
          if (flProfile.linkedin_url) setLinkedinUrl(flProfile.linkedin_url);
          if (flProfile.portfolio_url) setPortfolioUrl(flProfile.portfolio_url);
        }

        // 3. Fetch client profile row
        const { data: clProfile } = await supabase
          .from("client_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (clProfile) {
          if (clProfile.company_name) setCompanyName(clProfile.company_name);
          if (clProfile.company_website) setCompanyWebsite(clProfile.company_website);
          if (clProfile.company_size) setCompanySize(clProfile.company_size);
          if (clProfile.industry) setIndustry(clProfile.industry);
          if (clProfile.client_type) setClientType(clProfile.client_type as "umkm" | "startup" | "agency" | "individual");
          if (clProfile.project_categories && Array.isArray(clProfile.project_categories) && clProfile.project_categories.length > 0) {
            setProjectCategories(clProfile.project_categories);
          }
          if (clProfile.budget_preference) setBudgetPreference(clProfile.budget_preference as "umkm" | "standard" | "enterprise");
          if (clProfile.billing_address) setBillingAddress(clProfile.billing_address);
          if (clProfile.tax_id) setTaxId(clProfile.tax_id);
        }
      } catch (err) {
        console.warn("Could not fetch profile from tables:", err);
      }

      if (meta.client_type && !clientType) setClientType(meta.client_type);
      if (meta.project_categories && Array.isArray(meta.project_categories) && meta.project_categories.length > 0) {
        setProjectCategories(meta.project_categories);
      }
      if (meta.budget_preference && !budgetPreference) setBudgetPreference(meta.budget_preference);
      if (meta.company_name && !companyName) setCompanyName(meta.company_name);
      if (meta.hourly_rate && !hourlyRate) setHourlyRate(String(meta.hourly_rate));
      if (meta.preferred_language && (meta.preferred_language === "id" || meta.preferred_language === "en")) {
        setLocale(meta.preferred_language as Locale);
        setLanguage(meta.preferred_language as Locale);
      }
      if (meta.preferred_currency && (meta.preferred_currency === "IDR" || meta.preferred_currency === "USD")) {
        setGlobalCurrency(meta.preferred_currency as Currency);
        setCurrency(meta.preferred_currency as Currency);
      }
    }

    loadUserData();
  }, [user, currentRole, setLocale, setGlobalCurrency]);

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !selectedSkills.includes(newSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, newSkillInput.trim()]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      // 1. Immediately apply the language & currency changes app-wide
      if (language !== locale) {
        setLocale(language);
      }
      if (currency !== globalCurrency) {
        setGlobalCurrency(currency);
      }

      const supabase = createClient();
      let finalAvatarUrl = avatarUrl;
      let finalBannerUrl = bannerUrl;

      // If user selected a new avatar file, upload it now to Supabase Storage
      if (pendingAvatarFile && user?.id) {
        const res = await uploadProfileMedia(pendingAvatarFile, user.id, "avatar");
        if (res.publicUrl) {
          finalAvatarUrl = res.publicUrl;
          setAvatarUrl(res.publicUrl);
          setAvatarPreviewUrl("");
          setPendingAvatarFile(null);
        } else if (res.error) {
          setErrorMessage(res.error);
          setIsSaving(false);
          return;
        }
      }

      // If user selected a new banner file, upload it now to Supabase Storage
      if (pendingBannerFile && user?.id) {
        const res = await uploadProfileMedia(pendingBannerFile, user.id, "banner");
        if (res.publicUrl) {
          finalBannerUrl = res.publicUrl;
          setBannerUrl(res.publicUrl);
          setBannerPreviewUrl("");
          setPendingBannerFile(null);
        } else if (res.error) {
          setErrorMessage(res.error);
          setIsSaving(false);
          return;
        }
      }
      
      // Update Supabase Auth User Metadata
      const updateData: Record<string, unknown> = {
        full_name: fullName,
        display_name: displayName,
        phone: phone,
        bio: bio,
        location: location,
        timezone: timezone,
        avatar_url: finalAvatarUrl,
        banner_url: finalBannerUrl,
        cover_image: finalBannerUrl, // Backward compatibility
        preferred_language: language,
        preferred_currency: currency,
      };

      if (currentRole === "freelancer") {
        updateData.hourly_rate = parseInt(hourlyRate, 10) || 0;
        updateData.skills = selectedSkills;
        updateData.experience_level = experienceLevel;
        updateData.availability = availability;
        updateData.github_url = githubUrl;
        updateData.linkedin_url = linkedinUrl;
        updateData.portfolio_url = portfolioUrl;
      } else {
        updateData.company_name = companyName;
        updateData.company_website = companyWebsite;
        updateData.company_size = companySize;
        updateData.industry = industry;
        updateData.client_type = clientType;
        updateData.project_categories = projectCategories;
        updateData.budget_preference = budgetPreference;
        updateData.billing_address = billingAddress;
        updateData.tax_id = taxId;
      }

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: updateData,
      });

      if (authError) {
        console.warn("Auth update warning:", authError.message);
      }

      // Upsert direct database tables in Supabase
      if (user?.id) {
        try {
          // 1. Core user table upsert
          await supabase.from("users").upsert(
            {
              id: user.id,
              email: user.email || email,
              full_name: fullName,
              avatar_url: finalAvatarUrl ? finalAvatarUrl : null,
              banner_url: finalBannerUrl ? finalBannerUrl : null,
              bio: bio,
              phone: phone,
              location: location,
              timezone: timezone,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          // 2. Freelancer profile upsert
          if (currentRole === "freelancer" || selectedSkills.length > 0 || hourlyRate) {
            await supabase.from("freelancer_profiles").upsert(
              {
                user_id: user.id,
                headline: `${selectedSkills[0] || "Digital"} Specialist`,
                bio: bio,
                hourly_rate: parseInt(hourlyRate, 10) || 0,
                skills: selectedSkills,
                availability: availability,
                github_url: githubUrl,
                linkedin_url: linkedinUrl,
                portfolio_url: portfolioUrl,
                cover_image: finalBannerUrl ? finalBannerUrl : null,
              },
              { onConflict: "user_id" }
            );
          }

          // 3. Client profile upsert
          if (currentRole === "customer" || companyName || companySize || clientType) {
            await supabase.from("client_profiles").upsert(
              {
                user_id: user.id,
                company_name: companyName || fullName,
                company_website: companyWebsite,
                company_size: companySize,
                client_type: clientType,
                industry: industry,
                project_categories: projectCategories,
                budget_preference: budgetPreference,
                billing_address: billingAddress,
                tax_id: taxId,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" }
            );
          }
        } catch (dbErr) {
          console.info("Direct DB table sync notice:", dbErr);
        }
      }

      // Sync global language & currency contexts immediately
      setLocale(language);
      setGlobalCurrency(currency);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("profile-updated"));
        window.dispatchEvent(new CustomEvent("doable-preferences-updated", { 
          detail: { categories: projectCategories, clientType, budgetPreference } 
        }));
        window.dispatchEvent(new CustomEvent("doable-locale-updated", { 
          detail: { locale: language } 
        }));
        window.dispatchEvent(new CustomEvent("doable-currency-updated", { 
          detail: { currency } 
        }));
      }

      setSaveSuccess(true);
      setSaveMessage(t("settings.savedSuccess", "Pengaturan berhasil disimpan!"));
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save settings";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMessage(t("settings.passwordMismatch", "Kata sandi baru tidak cocok atau masih kosong"));
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage(t("settings.passwordMinLength", "Kata sandi harus memiliki minimal 6 karakter"));
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setNewPassword("");
      setConfirmPassword("");
      setSaveSuccess(true);
      setSaveMessage(t("settings.passwordUpdated", "Kata sandi berhasil diperbarui!"));
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            {t("settings.title", "Pengaturan & Preferensi")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("settings.subtitle", {
              role: currentRole === "customer" 
                ? t("settings.clientRole", "Klien & Perusahaan") 
                : t("settings.freelancerRole", "Freelancer Pro")
            })}
          </p>
        </div>
      </div>

      {/* Alert / Notification banners */}
      {saveSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-700 dark:text-emerald-300 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{saveMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 border border-destructive/30 p-4 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-card border border-border/70 rounded-2xl p-3 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "profile"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4" />
                <span>{t("settings.tabs.profile", "Profil & Identitas")}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("work")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "work"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {currentRole === "customer" ? (
                  <Building2 className="h-4 w-4" />
                ) : (
                  <Briefcase className="h-4 w-4" />
                )}
                <span>
                  {currentRole === "customer" 
                    ? t("settings.tabs.workClient", "Perusahaan & Perekrutan") 
                    : t("settings.tabs.workFreelancer", "Keahlian & Tarif")}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "security"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield className="h-4 w-4" />
                <span>{t("settings.tabs.security", "Keamanan & Masuk")}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "notifications"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="h-4 w-4" />
                <span>{t("settings.tabs.notifications", "Notifikasi")}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "billing"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4" />
                <span>
                  {currentRole === "customer" 
                    ? t("settings.tabs.billingClient", "Metode Pembayaran") 
                    : t("settings.tabs.billingFreelancer", "Penarikan & Rekening")}
                </span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "preferences"
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4" />
                <span>{t("settings.tabs.preferences", "Bahasa & Tampilan")}</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: Profile & Identity */}
          {activeTab === "profile" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {t("settings.profile.title", "Informasi Pribadi")}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.profile.subtitle", "Perbarui identitas publik, bio, dan detail kontak Anda.")}
                  </p>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* Profile Visuals: Banner & Avatar Header Selection (Mirroring Design)       */}
              {/* ========================================================================= */}
              <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
                {/* Hidden File Inputs */}
                <input
                  type="file"
                  ref={bannerFileInputRef}
                  onChange={handleBannerFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  className="hidden"
                />

                {/* 1. Header Cover Banner Area */}
                <div className="relative h-36 sm:h-44 w-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-600/30 overflow-hidden group">
                  {(bannerPreviewUrl || bannerUrl) ? (
                    <img
                      src={bannerPreviewUrl || bannerUrl}
                      alt="Banner Sampul"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-purple-600/25">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80 bg-background/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border/40">
                        <ImageIcon className="h-4 w-4" />
                        <span>{t("settings.profile.bannerPlaceholder", "Belum ada banner sampul kustom")}</span>
                      </div>
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                  {/* Pending Banner Indicator */}
                  {pendingBannerFile && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/90 text-white backdrop-blur-md px-3 py-1 text-[11px] font-bold shadow-md">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        {t("settings.profile.bannerPreviewNotice", "Pratinjau Banner (Klik Simpan)")}
                      </span>
                    </div>
                  )}

                  {/* Banner Action Buttons (Top Right Overlay) */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
                    {(bannerPreviewUrl || bannerUrl) && (
                      <button
                        type="button"
                        onClick={handleResetBanner}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black/50 hover:bg-destructive/80 backdrop-blur-md rounded-xl transition-all shadow-sm"
                        title={t("settings.profile.resetBanner", "Reset Banner ke Default")}
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>{t("settings.profile.reset", "Reset")}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => bannerFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-black/60 hover:bg-black/85 backdrop-blur-md rounded-xl transition-all shadow-sm border border-white/20 hover:border-white/40"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>{t("settings.profile.changeBanner", "Ubah Banner")}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Avatar & Identity Area (Clear Separation — Name Never Clipped) */}
                <div className="px-6 pb-6 pt-0">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5">
                    {/* Interactive Avatar Container (Floats over banner edge) */}
                    <div
                      className="relative group cursor-pointer shrink-0 -mt-12 sm:-mt-14 z-20"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl overflow-hidden border-4 border-card bg-muted">
                        {(avatarPreviewUrl || avatarUrl) ? (
                          <img
                            src={avatarPreviewUrl || avatarUrl}
                            alt="Avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>
                            {fullName ? fullName.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : "U"}
                          </span>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black/45 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white border-4 border-transparent">
                        <Camera className="h-6 w-6" />
                        <span className="text-[10px] font-bold mt-1">Ubah Foto</span>
                      </div>
                    </div>

                    {/* User Name, Badges & Upload Actions (Safely below banner) */}
                    <div className="flex-1 text-center sm:text-left space-y-1.5 pt-1 sm:pt-3">
                      <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                        <h4 className="text-lg font-bold text-foreground leading-tight">
                          {fullName || "Nama Profil Anda"}
                        </h4>
                        {pendingAvatarFile && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pratinjau Foto
                          </span>
                        )}
                        {(avatarPreviewUrl || avatarUrl) && (
                          <button
                            type="button"
                            onClick={handleResetAvatar}
                            className="px-2 py-0.5 text-[11px] text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
                          >
                            {t("settings.profile.reset", "Reset Foto")}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("settings.profile.avatarHelp", "PNG, JPG, atau SVG. Ukuran maksimum 5MB.")}
                      </p>
                      <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>{t("settings.profile.uploadPhoto", "Ubah / Unggah Foto")}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 3. Quick Preset Banners Selector */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        {t("settings.profile.bannerPreset", "Pilihan Banner Cepat")}
                      </span>
                      <span className="text-[11px] text-muted-foreground hidden sm:inline">
                        {t("settings.profile.bannerHelp", "Disarankan rasio lebar (1200x400). Maks 5MB.")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                      {PRESET_BANNERS.map((preset) => {
                        const isSelected = (bannerPreviewUrl || bannerUrl) === preset.url;
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPresetBanner(preset.url)}
                            className={`group relative h-16 rounded-xl overflow-hidden border transition-all text-left ${
                              isSelected
                                ? "border-primary ring-2 ring-primary/40 shadow-sm scale-[1.02]"
                                : "border-border/70 hover:border-primary/50 hover:shadow-xs"
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between">
                              <span className="text-[10px] font-bold text-white truncate drop-shadow-sm">
                                {preset.name}
                              </span>
                              {isSelected && (
                                <span className="h-3.5 w-3.5 rounded-full bg-primary flex items-center justify-center text-[8px] text-white shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.profile.fullName", "Nama Lengkap Sesuai Identitas")}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Putra Satria"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.profile.username", "Username / Handle")}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="username"
                      className="h-10 w-full rounded-xl border border-border bg-background pl-8 pr-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.profile.email", "Alamat Email")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 w-full rounded-xl border border-border/60 bg-muted/40 px-3.5 text-xs text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground">{t("settings.profile.emailNotice", "Email terhubung ke akun autentikasi Anda.")}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.profile.phone", "Nomor Telepon / WhatsApp")}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+62 812 3456 7890"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.profile.location", "Lokasi")}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.profile.timezone", "Zona Waktu")}
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="Asia/Jakarta (UTC+7)">Asia/Jakarta (WIB, UTC+7)</option>
                    <option value="Asia/Makassar (UTC+8)">Asia/Makassar (WITA, UTC+8)</option>
                    <option value="Asia/Jayapura (UTC+9)">Asia/Jayapura (WIT, UTC+9)</option>
                    <option value="Asia/Singapore (UTC+8)">Asia/Singapore (SGT, UTC+8)</option>
                    <option value="America/New_York (UTC-5)">America/New_York (EST)</option>
                    <option value="America/Los_Angeles (UTC-8)">America/Los_Angeles (PST)</option>
                    <option value="Europe/London (UTC+0)">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  {t("settings.profile.bio", "Bio & Pengenalan Singkat")}
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t("settings.profile.bioPlaceholder", "Ceritakan ringkasan pengalaman, keahlian, dan apa yang Anda minati...")}
                  className="w-full rounded-xl border border-border bg-background p-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-[11px] text-muted-foreground text-right">{bio.length}/500 characters</p>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? t("common.saving", "Menyimpan...") : t("settings.profile.saveBtn", "Simpan Detail Profil")}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Work & Role Settings (Dynamic for Freelancer vs Client) */}
          {activeTab === "work" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              {currentRole === "freelancer" ? (
                <>
                  <div className="border-b border-border/50 pb-4">
                    <h2 className="text-lg font-bold text-foreground">
                      {t("settings.work.freelancerTitle", "Keahlian Freelancer & Tarif")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.work.freelancerSubtitle", "Atur tarif per jam, stack keahlian utama, dan tautan portofolio.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Hourly Rate */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("settings.work.hourlyRate", "Target Tarif per Jam (USD)")}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="5"
                          max="500"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="h-10 w-full rounded-xl border border-border bg-background pl-8 pr-12 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">/ hr</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        ≈ {formatMoney(parseInt(hourlyRate || "0", 10), "USD")}/jam
                      </p>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("settings.work.experienceLevel", "Tingkat Pengalaman")}
                      </label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="Junior (0-2 years)">Junior (0-2 years)</option>
                        <option value="Mid-Level (2-4 years)">Mid-Level (2-4 years)</option>
                        <option value="Senior (4-7 years)">Senior (4-7 years)</option>
                        <option value="Lead / Architect (7+ years)">Lead / Architect (7+ years)</option>
                      </select>
                    </div>

                    {/* Availability */}
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">
                        {t("settings.work.availability", "Status Ketersediaan")}
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            availability === "available"
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value="available"
                            checked={availability === "available"}
                            onChange={() => setAvailability("available")}
                            className="sr-only"
                          />
                          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          <div className="text-xs">
                            <p className="font-bold">{t("settings.work.availableStatus", "Tersedia untuk Kerja")}</p>
                            <p className="text-[10px] opacity-80">{t("settings.work.availableStatusDesc", "Siap menerima proyek baru")}</p>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            availability === "open"
                              ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value="open"
                            checked={availability === "open"}
                            onChange={() => setAvailability("open")}
                            className="sr-only"
                          />
                          <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                          <div className="text-xs">
                            <p className="font-bold">{t("settings.work.openStatus", "Terbuka untuk Tawaran")}</p>
                            <p className="text-[10px] opacity-80">{t("settings.work.openStatusDesc", "Selektif untuk proyek yang cocok")}</p>
                          </div>
                        </label>

                        <label
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            availability === "busy"
                              ? "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300"
                              : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60"
                          }`}
                        >
                          <input
                            type="radio"
                            name="availability"
                            value="busy"
                            checked={availability === "busy"}
                            onChange={() => setAvailability("busy")}
                            className="sr-only"
                          />
                          <div className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                          <div className="text-xs">
                            <p className="font-bold">{t("settings.work.busyStatus", "Sedang Penuh")}</p>
                            <p className="text-[10px] opacity-80">{t("settings.work.busyStatusDesc", "Tidak menerima proyek baru saat ini")}</p>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Skills Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Code2 className="h-3.5 w-3.5 text-primary" />
                        {t("settings.work.skillsTitle", "Keahlian & Stack Teknologi")}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {t("settings.work.skillsSelected", { count: selectedSkills.length })}
                      </span>
                    </label>

                    {/* Selected skill tags */}
                    <div className="flex flex-wrap gap-2 min-h-[44px] p-3 rounded-2xl border border-border bg-muted/20">
                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 px-3 py-1 text-xs font-semibold animate-in fade-in"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-primary-700 p-0.5 rounded-full"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {selectedSkills.length === 0 && (
                        <span className="text-xs text-muted-foreground self-center">
                          {t("settings.work.skillsEmpty", "Belum ada keahlian ditambahkan. Pilih dari daftar atau tambahkan keahlian kustom.")}
                        </span>
                      )}
                    </div>

                    {/* Quick Add pills */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted-foreground font-medium">
                        {t("settings.work.quickSuggestions", "Saran cepat:")}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_SKILLS.map((skill) => {
                          const isSelected = selectedSkills.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => handleToggleSkill(skill)}
                              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                isSelected
                                  ? "bg-primary text-white shadow-xs"
                                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {isSelected ? "✓ " : "+ "}
                              {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add custom skill input */}
                    <form onSubmit={handleAddCustomSkill} className="flex gap-2 max-w-sm pt-1">
                      <input
                        type="text"
                        placeholder={t("settings.work.customSkillPlaceholder", "Tambahkan keahlian lain (contoh: Solidity, Golang...)")}
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-muted px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 shrink-0"
                      >
                        {t("settings.work.add", "Tambah")}
                      </button>
                    </form>
                  </div>

                  {/* Portfolio & External Profiles */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                      {t("settings.work.portfolioLinks", "Tautan Portofolio & Profesional")}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          GitHub Profile
                        </label>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <LinkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                          Personal Portfolio
                        </label>
                        <input
                          type="url"
                          value={portfolioUrl}
                          onChange={(e) => setPortfolioUrl(e.target.value)}
                          className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Client Mode Settings */
                <>
                  <div className="border-b border-border/50 pb-4">
                    <h2 className="text-lg font-bold text-foreground">
                      {t("settings.work.clientTitle", "Profil Perusahaan & Perekrutan")}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.work.clientSubtitle", "Atur nama perusahaan, industri, skala bisnis, dan alamat penagihan.")}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Tipe Usaha / Skala Organisasi */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground">
                        Tipe Usaha / Skala Organisasi
                      </label>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {[
                          { type: "umkm", label: "UMKM / Bisnis Lokal", desc: "Kedai, Toko, Retail & F&B" },
                          { type: "startup", label: "Startup Teknologi", desc: "Produk & platform digital" },
                          { type: "agency", label: "Agensi / Studio", desc: "Eksekusi proyek klien" },
                          { type: "individual", label: "Individu / Personal", desc: "Proyek personal mandiri" },
                        ].map((item) => (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setClientType(item.type as "umkm" | "startup" | "agency" | "individual")}
                            className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                              clientType === item.type
                                ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                                : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                            }`}
                          >
                            <p className="text-xs sm:text-sm font-bold text-foreground">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{item.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("settings.work.companyName", "Nama Usaha / Perusahaan")}
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Contoh: Kopi Seduh Kenari, PT Inovasi..."
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("settings.work.companyWebsite", "Website / Tautan Usaha")}
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Kategori Kebutuhan Proyek & Filter Utama */}
                    <div className="space-y-3 sm:col-span-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                            Kategori Kebutuhan Proyek (Preferensi Filter Dashboard)
                          </label>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Pilihan kategori di sini otomatis menjadi filter utama yang muncul di Dashboard dan Cari Talenta Anda.
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-primary">
                          {projectCategories.length} kategori dipilih
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                        {UNIFIED_PROJECT_CATEGORIES.map((cat) => {
                          const isSelected = projectCategories.includes(cat.id);
                          const Icon = CATEGORY_ICON_MAP[cat.id] || Globe;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setProjectCategories((prev) =>
                                  isSelected ? prev.filter((c) => c !== cat.id) : [...prev, cat.id]
                                );
                              }}
                              className={`flex items-start gap-3 rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                                isSelected
                                  ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                                  : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                              }`}
                            >
                              <div
                                className={`p-2 rounded-xl shrink-0 ${
                                  isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold text-foreground truncate">{cat.shortLabel}</p>
                                  {isSelected && (
                                    <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{cat.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Kisaran Budget Proyek */}
                    <div className="space-y-2 sm:col-span-2 pt-2 border-t border-border/50">
                      <label className="text-xs font-semibold text-foreground">
                        Kisaran Budget Proyek Utama
                      </label>
                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {[
                          { pref: "umkm", label: "Ramah UMKM", range: "< Rp 2 Juta", note: "Untuk kebutuhan esensial & cepat" },
                          { pref: "standard", label: "Standar Bisnis", range: "Rp 2jt - Rp 10jt", note: "Untuk web, aplikasi & modul lengkap" },
                          { pref: "enterprise", label: "Enterprise", range: "> Rp 10 Juta", note: "Untuk skala besar & modul custom" },
                        ].map((item) => (
                          <button
                            key={item.pref}
                            type="button"
                            onClick={() => setBudgetPreference(item.pref as "umkm" | "standard" | "enterprise")}
                            className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                              budgetPreference === item.pref
                                ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                                : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                            }`}
                          >
                            <p className="text-xs font-bold text-foreground">{item.label}</p>
                            <p className="text-xs font-bold text-primary mt-1">{item.range}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.note}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-border/50">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        {t("settings.work.billingAddress", "Alamat Penagihan Resmi")}
                      </label>
                      <textarea
                        rows={2}
                        value={billingAddress}
                        onChange={(e) => setBillingAddress(e.target.value)}
                        placeholder="Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan, 12190"
                        className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">
                        {t("settings.work.taxId", "NPWP / ID Pajak Perusahaan")}
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="01.234.567.8-901.000"
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSaving 
                      ? t("common.saving", "Menyimpan...") 
                      : t("settings.work.saveBtn", "Simpan Pengaturan Kerja")}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Login */}
          {activeTab === "security" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {t("settings.security.title", "Keamanan & Autentikasi")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("settings.security.subtitle", "Kelola kata sandi, autentikasi dua faktor (2FA), dan sesi aktif.")}
                </p>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  {t("settings.security.changePassword", "Ubah Kata Sandi")}
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.security.newPassword", "Kata Sandi Baru")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="h-10 w-full rounded-xl border border-border bg-background px-3.5 pr-10 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.security.confirmPassword", "Konfirmasi Kata Sandi Baru")}
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving || !newPassword}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSaving 
                    ? t("common.saving", "Memperbarui...") 
                    : t("settings.security.updatePasswordBtn", "Perbarui Kata Sandi")}
                </button>
              </form>

              {/* Two-Factor Authentication */}
              <div className="pt-6 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold text-foreground">
                        {t("settings.security.twoFactorTitle", "Autentikasi Dua Faktor (2FA)")}
                      </h4>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("settings.security.twoFactorDesc", "Tambahkan lapisan keamanan ekstra ke akun Doable! Anda dengan aplikasi autentikator.")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      twoFactorEnabled ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="pt-6 border-t border-border/50 space-y-3">
                <h4 className="text-xs font-bold text-foreground">
                  {t("settings.security.connectedSso", "Single Sign-On Terhubung")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-bold text-slate-800 shadow-xs">
                        G
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {t("settings.security.googleAccount", "Akun Google")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">
                      {t("common.connected", "Terhubung")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                        GH
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {t("settings.security.githubAccount", "GitHub")}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {t("common.notLinked", "Belum terhubung")}
                        </p>
                      </div>
                    </div>
                    <button className="text-[11px] font-semibold text-primary hover:underline">
                      {t("common.connect", "Hubungkan")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="pt-6 border-t border-border/50 space-y-3">
                <h4 className="text-xs font-bold text-foreground">
                  {t("settings.security.activeSessions", "Sesi Aktif")}
                </h4>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.security.currentSession", "Sesi browser saat ini • Windows 11 (Chrome)")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Jakarta, Indonesia • {t("common.activeNow", "Aktif sekarang")}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <Check className="h-3 w-3" /> {t("common.current", "Saat ini")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {t("settings.notifications.title", "Preferensi Notifikasi")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("settings.notifications.subtitle", "Pilih pemberitahuan yang ingin Anda terima di email, web, dan efek suara.")}
                </p>
              </div>

              {/* Email Alerts */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  {t("settings.notifications.emailSection", "Notifikasi Email")}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.notifications.proposals", "Proposal Baru & Tawaran Proyek")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("settings.notifications.proposalsDesc", "Dapatkan pemberitahuan ketika seseorang menawar proyek Anda atau mengundang ke proyek.")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailProposals}
                      onChange={(e) => setNotifications({ ...notifications, emailProposals: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.notifications.milestones", "Pembaruan Milestone & Persetujuan")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("settings.notifications.milestonesDesc", "Pemberitahuan ketika hasil kerja milestone dikirimkan, ditinjau, atau didanai.")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailMilestones}
                      onChange={(e) => setNotifications({ ...notifications, emailMilestones: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.notifications.messages", "Pesan Obrolan Langsung")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("settings.notifications.messagesDesc", "Terima rangkuman email saat ada pesan belum dibaca setelah 15 menit.")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailMessages}
                      onChange={(e) => setNotifications({ ...notifications, emailMessages: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.notifications.marketing", "Pembaruan Produk & Tips")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("settings.notifications.marketingDesc", "Sorotan berkala tentang proyek dengan bayaran tertinggi, fitur baru, dan panduan komunitas.")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.emailMarketing}
                      onChange={(e) => setNotifications({ ...notifications, emailMarketing: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Gamification & In-App Alerts */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  {t("settings.notifications.inAppSection", "Suara & Peringatan Dalam Aplikasi")}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.notifications.gamification", "XP, Kenaikan Level & Streak Harian")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("settings.notifications.gamificationDesc", "Animasi perayaan dan pengingat untuk menjaga streak pengerjaan Anda.")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.inAppGamification}
                      onChange={(e) => setNotifications({ ...notifications, inAppGamification: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        {t("settings.notifications.soundEffects", "Efek Audio Interaktif")}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {t("settings.notifications.soundEffectsDesc", "Putar suara lonceng halus saat penyerahan hasil kerja atau pencairan dana milestone.")}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.soundEffects}
                      onChange={(e) => setNotifications({ ...notifications, soundEffects: e.target.checked })}
                      className="h-4 w-4 rounded text-primary focus:ring-primary/20 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSaving 
                      ? t("common.saving", "Menyimpan...") 
                      : t("settings.notifications.saveBtn", "Simpan Preferensi Notifikasi")}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Billing & Payouts */}
          {activeTab === "billing" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {currentRole === "customer" 
                    ? t("settings.billing.clientTitle", "Metode Pembayaran & Penagihan") 
                    : t("settings.billing.freelancerTitle", "Akun Penarikan & Pendapatan")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentRole === "customer"
                    ? t("settings.billing.clientSubtitle", "Kelola kartu pembayaran, virtual account, dan tanda terima invoice perusahaan.")
                    : t("settings.billing.freelancerSubtitle", "Kelola rekening bank Indonesia atau dompet digital untuk menerima pencairan dana milestone.")}
                </p>
              </div>

              {currentRole === "freelancer" ? (
                /* Freelancer Payout Section */
                <div className="space-y-6">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">{t("settings.billing.availableBalance", "Saldo Tersedia")}</span>
                      <h3 className="text-2xl font-bold text-foreground font-heading">
                        {formatMoney(walletBalance, "IDR")}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("settings.billing.instantPayoutDesc", "Siap ditarik langsung ke rekening bank terverifikasi Anda.")}</p>
                    </div>
                    <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all shrink-0">
                      {t("settings.billing.withdrawBtn", "Tarik Pendapatan")}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">{t("settings.billing.connectedBanks", "Rekening Bank Terhubung")}</h4>
                    
                    <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          BCA
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Bank Central Asia (BCA)</p>
                          <p className="text-[11px] text-muted-foreground">•••• •••• 8921 • a.n. {fullName || "User"}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        {t("settings.billing.primaryAccount", "Rekening Utama")}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-dashed border-border flex items-center justify-center">
                      <button className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                        <Plus className="h-4 w-4" />
                        <span>{t("settings.billing.addBank", "Tambah Rekening Baru (BCA, Mandiri, BRI, BNI, GoPay, OVO)")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Client Payment Methods */
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">{t("settings.billing.paymentMethods", "Metode Pembayaran")}</h4>

                    <div className="p-4 rounded-2xl border border-border/80 bg-muted/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-lg bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                          VISA
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">Corporate Visa Card</p>
                          <p className="text-[11px] text-muted-foreground">•••• •••• •••• 4242 • Exp 08/28</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                        {t("settings.billing.defaultCard", "Kartu Utama")}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-dashed border-border flex items-center justify-center">
                      <button className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                        <Plus className="h-4 w-4" />
                        <span>{t("settings.billing.addPaymentMethod", "Tambah Kartu Kredit atau Virtual Account")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Preferences & Language */}
          {activeTab === "preferences" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {t("settings.preferences.title", "Pengaturan Bahasa & Regional")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("settings.preferences.subtitle", "Sesuaikan bahasa antarmuka, format mata uang, dan lokalisasi regional Anda.")}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.preferences.languageLabel", "Bahasa Tampilan")}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      const next = e.target.value as Locale;
                      setLanguage(next);
                      setLocale(next);
                    }}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="id">{t("settings.preferences.languageId", "Bahasa Indonesia (Default)")}</option>
                    <option value="en">{t("settings.preferences.languageEn", "English (US)")}</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    {language === "id" 
                      ? "Bahasa default adalah Bahasa Indonesia. Anda dapat mengubahnya ke English kapan saja." 
                      : "Default language is Indonesian. You can switch to English anytime."}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    {t("settings.preferences.currencyLabel", "Mata Uang Pilihan")}
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => {
                      const next = e.target.value as Currency;
                      setCurrency(next);
                      setGlobalCurrency(next);
                    }}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="IDR">{t("settings.preferences.currencyIdr", "IDR (Rp - Rupiah)")}</option>
                    <option value="USD">{t("settings.preferences.currencyUsd", "USD ($ - US Dollar)")}</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    {currency === "IDR"
                      ? "Mata uang default adalah Rupiah (IDR). Format harga akan menyesuaikan otomatis."
                      : "Display currency is US Dollar (USD). Amounts convert automatically."}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {isSaving 
                      ? t("common.saving", "Menyimpan...") 
                      : t("settings.preferences.saveBtn", "Simpan Preferensi")}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
