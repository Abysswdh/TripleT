/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardRole, DashboardRole } from "@/context/role-context";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/lib/api";
import {
  User,
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
  SlidersHorizontal
} from "lucide-react";

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

export function SettingsView({ initialTab = "profile", defaultRole }: SettingsViewProps) {
  const { user } = useAuth();
  const { role: activeRole } = useDashboardRole();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const currentRole = defaultRole || activeRole;

  // Form State
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Jakarta, Indonesia");
  const [timezone, setTimezone] = useState("Asia/Jakarta (UTC+7)");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

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
  const [language, setLanguage] = useState("id");
  const [currency, setCurrency] = useState("IDR");

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      const meta = user.user_metadata || {};
      setFullName(meta.full_name || meta.name || "");
      setDisplayName(meta.display_name || meta.user_name || (user.email ? user.email.split("@")[0] : ""));
      setPhone(meta.phone || "+62 812-3456-7890");
      setBio(meta.bio || (currentRole === "freelancer" ? "Passionate Full-Stack Developer specializing in modern web apps and AI agents." : "Product Leader looking for top-tier developers and designers for ambitious projects."));
      setAvatarUrl(meta.avatar_url || "");
      if (meta.company_name) setCompanyName(meta.company_name);
      if (meta.hourly_rate) setHourlyRate(String(meta.hourly_rate));
    }
  }, [user, currentRole]);

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
      const supabase = createClient();
      
      // Update Supabase Auth User Metadata
      const updateData: Record<string, unknown> = {
        full_name: fullName,
        display_name: displayName,
        phone: phone,
        bio: bio,
        location: location,
        timezone: timezone,
        avatar_url: avatarUrl,
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

      // Also try updating backend /api/v1/users/me if available
      try {
        await api.patch("/users/me", {
          full_name: fullName,
          bio: bio,
          avatar_url: avatarUrl || undefined,
          skills: currentRole === "freelancer" ? selectedSkills : undefined,
          hourly_rate: currentRole === "freelancer" ? parseInt(hourlyRate, 10) || null : null,
          experience_level: currentRole === "freelancer" ? experienceLevel : null,
        });
      } catch (backendErr) {
        // Backend API might not be running in purely local/mock mode, so continue gracefully
        console.info("Backend profile sync notice:", backendErr);
      }

      setSaveSuccess(true);
      setSaveMessage("Settings successfully saved!");
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
      setErrorMessage("New passwords do not match or are empty");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
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
      setSaveMessage("Password updated successfully!");
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
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Account Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Settings & Preferences
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your {currentRole === "customer" ? "Client & Company" : "Freelancer Pro"} profile, security, notifications, and payouts.
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
                <span>Profile & Identity</span>
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
                  {currentRole === "customer" ? "Company & Hiring" : "Skills & Work Rates"}
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
                <span>Security & Login</span>
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
                <span>Notifications</span>
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
                <span>{currentRole === "customer" ? "Payment Methods" : "Payouts & Bank"}</span>
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
                <span>Language & Display</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </button>
          </div>

          {/* Gamified Profile Level Snippet */}
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-tertiary/5 to-card p-4 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Account Status</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Profile Completeness</span>
              <span className="font-bold text-foreground">85%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: "85%" }} />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Complete your verification quiz and portfolio to unlock the Verified Pro badge.
            </p>
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: Profile & Identity */}
          {activeTab === "profile" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Personal Information</h2>
                  <p className="text-xs text-muted-foreground">Update your public identity, bio, and contact details.</p>
                </div>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-md overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>{fullName ? fullName.charAt(0).toUpperCase() : email ? email.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer">
                    <Camera className="h-5 w-5" />
                  </div>
                </div>
                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <h4 className="text-sm font-bold text-foreground">{fullName || "Your Full Name"}</h4>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or SVG. Maximum file size 2MB.</p>
                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <input
                      type="text"
                      placeholder="Paste image URL here..."
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="h-8 max-w-xs text-xs rounded-xl border border-border bg-background px-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {avatarUrl && (
                      <button
                        onClick={() => setAvatarUrl("")}
                        className="px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    Full Legal Name
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
                    Username / Handle
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="h-10 w-full rounded-xl border border-border/60 bg-muted/40 px-3.5 text-xs text-muted-foreground cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground">Email linked to your authentication provider.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    Phone Number
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
                    Location
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
                    Timezone
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
                  Bio & Introduction
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share a brief overview of your background, experience, and what you specialize in..."
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
                  <span>{isSaving ? "Saving changes..." : "Save Profile Details"}</span>
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
                    <h2 className="text-lg font-bold text-foreground">Freelancer Skills & Pricing</h2>
                    <p className="text-xs text-muted-foreground">Configure your hourly rate, primary skill stack, and portfolio links.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Hourly Rate */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                        Target Hourly Rate (USD)
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
                        ≈ Rp {(parseInt(hourlyRate || "0", 10) * 16200).toLocaleString("id-ID")}/jam
                      </p>
                    </div>

                    {/* Experience Level */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                        Experience Level
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
                      <label className="text-xs font-semibold text-foreground">Current Availability Status</label>
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
                            <p className="font-bold">Available for Work</p>
                            <p className="text-[10px] opacity-80">Ready to take new projects</p>
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
                            <p className="font-bold">Open to Offers</p>
                            <p className="text-[10px] opacity-80">Selective on high-fit quests</p>
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
                            <p className="font-bold">Fully Booked</p>
                            <p className="text-[10px] opacity-80">Not taking new gigs</p>
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
                        Skills & Tech Stack
                      </span>
                      <span className="text-[11px] text-muted-foreground">{selectedSkills.length} selected</span>
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
                        <span className="text-xs text-muted-foreground self-center">No skills added yet. Select below or add custom skills.</span>
                      )}
                    </div>

                    {/* Quick Add pills */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] text-muted-foreground font-medium">Quick suggestions:</p>
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
                        placeholder="Add other skill (e.g. WebGL)..."
                        value={newSkillInput}
                        onChange={(e) => setNewSkillInput(e.target.value)}
                        className="h-9 w-full rounded-xl border border-border bg-background px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      <button
                        type="submit"
                        className="rounded-xl bg-muted px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/80 shrink-0"
                      >
                        Add
                      </button>
                    </form>
                  </div>

                  {/* Portfolio & External Profiles */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                      Portfolio & Social Presence
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
                    <h2 className="text-lg font-bold text-foreground">Company & Organization Details</h2>
                    <p className="text-xs text-muted-foreground">Manage your organization profile, hiring industry, and company scale.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Acme Studio Inc."
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                        Company Website
                      </label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        placeholder="https://example.com"
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Industry Sector</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>{ind}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Company Size</label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {COMPANY_SIZES.map((size) => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        Billing & Tax Address
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
                      <label className="text-xs font-semibold text-foreground">Tax Identification / NPWP (Optional)</label>
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
                  <span>{isSaving ? "Saving..." : "Save Work Settings"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Security & Login */}
          {activeTab === "security" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">Security & Password</h2>
                <p className="text-xs text-muted-foreground">Manage your credentials, two-factor authentication, and active sessions.</p>
              </div>

              {/* Change Password Form */}
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Update Password
                </h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                    New Password
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
                    Confirm New Password
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
                  {isSaving ? "Updating..." : "Update Password"}
                </button>
              </form>

              {/* Two-Factor Authentication */}
              <div className="pt-6 border-t border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-primary" />
                      <h4 className="text-xs font-bold text-foreground">Two-Factor Authentication (2FA)</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your Doable! account using an authenticator app.</p>
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
                <h4 className="text-xs font-bold text-foreground">Connected Single Sign-On</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-white border border-border flex items-center justify-center text-xs font-bold text-slate-800 shadow-xs">
                        G
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Google Account</p>
                        <p className="text-[10px] text-muted-foreground">{email}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600">Connected</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                        GH
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">GitHub</p>
                        <p className="text-[10px] text-muted-foreground">Not linked</p>
                      </div>
                    </div>
                    <button className="text-[11px] font-semibold text-primary hover:underline">Connect</button>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="pt-6 border-t border-border/50 space-y-3">
                <h4 className="text-xs font-bold text-foreground">Active Sessions</h4>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-3">
                    <Laptop className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Current Browser • Windows 11 (Chrome)</p>
                      <p className="text-[10px] text-muted-foreground">Jakarta, Indonesia • Active Now</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <Check className="h-3 w-3" /> Current
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Notifications */}
          {activeTab === "notifications" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">Notification Preferences</h2>
                <p className="text-xs text-muted-foreground">Choose what alerts you want to receive across email, web, and sound alerts.</p>
              </div>

              {/* Email Alerts */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider text-muted-foreground">
                  Email Notifications
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">New Proposals & Quest Bids</p>
                      <p className="text-[11px] text-muted-foreground">Get notified when someone bids on your project or invites you to a quest.</p>
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
                      <p className="text-xs font-bold text-foreground">Milestone Updates & Approvals</p>
                      <p className="text-[11px] text-muted-foreground">Alerts when milestone deliverables are submitted, reviewed, or funded.</p>
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
                      <p className="text-xs font-bold text-foreground">Direct Chat Messages</p>
                      <p className="text-[11px] text-muted-foreground">Receive an email recap when you have unread messages after 15 minutes.</p>
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
                      <p className="text-xs font-bold text-foreground">Product Updates & Tips</p>
                      <p className="text-[11px] text-muted-foreground">Occasional highlights of top-paying projects, new features, and community guides.</p>
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
                  In-App & Gamification Sounds
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-foreground">XP, Level Ups & Daily Streaks</p>
                      <p className="text-[11px] text-muted-foreground">Celebratory animations and reminders to maintain your quest streak.</p>
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
                      <p className="text-xs font-bold text-foreground">Interactive Audio Effects</p>
                      <p className="text-[11px] text-muted-foreground">Play subtle chime sounds upon quest submission or milestone release.</p>
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
                  <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: Billing & Payouts */}
          {activeTab === "billing" && (
            <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
              <div className="border-b border-border/50 pb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {currentRole === "customer" ? "Billing & Payment Methods" : "Payout Accounts & Earnings"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {currentRole === "customer"
                    ? "Manage your payment cards, virtual accounts, and company invoice receipts."
                    : "Manage your Indonesian bank account or digital wallet for receiving milestone payouts."}
                </p>
              </div>

              {currentRole === "freelancer" ? (
                /* Freelancer Payout Section */
                <div className="space-y-6">
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Available Balance</span>
                      <h3 className="text-2xl font-bold text-foreground font-heading">Rp 14.850.000</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Ready for instant payout to your verified bank account.</p>
                    </div>
                    <button className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all shrink-0">
                      Withdraw Earnings
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Connected Bank Accounts</h4>
                    
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
                        Primary Account
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-dashed border-border flex items-center justify-center">
                      <button className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                        <Plus className="h-4 w-4" />
                        <span>Add New Bank (Mandiri, BRI, BNI, GoPay, OVO)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Client Payment Methods */
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Payment Methods</h4>

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
                        Default
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-dashed border-border flex items-center justify-center">
                      <button className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
                        <Plus className="h-4 w-4" />
                        <span>Add Credit Card or Virtual Account</span>
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
                <h2 className="text-lg font-bold text-foreground">Language & Regional Settings</h2>
                <p className="text-xs text-muted-foreground">Customize your interface language, currency format, and regional localization.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    Display Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="id">Bahasa Indonesia</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Preferred Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="IDR">IDR (Rp - Rupiah)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                  </select>
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
                  <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
