"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type RoleType = "freelancer" | "customer";
export type ExperienceLevel = "starter" | "intermediate" | "expert";
export type FreelancerBackground = "mahasiswa" | "fresh_grad" | "switch_career" | "professional";
export type WeeklyAvailability = "part_time" | "semi_full" | "full_time" | "flexible";
export type ClientHiringType = "umkm" | "startup" | "agency" | "individual";
export type ClientBudgetPref = "umkm" | "standard" | "enterprise";

export const DEFAULT_AVATAR_URL = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
export const DEFAULT_BANNER_URL = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80";

export interface OnboardingData {
  role: RoleType;
  fullName: string;
  username: string;
  // Freelancer specific
  backgroundType: FreelancerBackground;
  experienceLevel: ExperienceLevel;
  skills: string[];
  headline: string;
  weeklyAvailability: WeeklyAvailability;
  startingPrice: number; // Tarif mulai per proyek (bukan per jam)
  // Client specific
  hiringType: ClientHiringType;
  businessName: string;
  budgetPreference: ClientBudgetPref;
  projectCategories: string[];
  // Shared
  bio: string;
  locationCity: string;
  avatarUrl: string;
  willingToVerifyKtp: boolean;
}

const STORAGE_KEY = "doable_onboarding_data";

const initialData: OnboardingData = {
  role: "customer",
  fullName: "",
  username: "",
  backgroundType: "mahasiswa",
  experienceLevel: "starter",
  skills: ["Figma", "UI/UX Design"],
  headline: "",
  weeklyAvailability: "semi_full",
  startingPrice: 500000,
  hiringType: "umkm",
  businessName: "",
  budgetPreference: "umkm",
  projectCategories: ["Desain & Branding", "Web & IT Engineering"],
  bio: "",
  locationCity: "Jakarta, DKI Jakarta",
  avatarUrl: DEFAULT_AVATAR_URL,
  willingToVerifyKtp: true,
};

export function useOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams?.get("role") as RoleType | null;
  const isRoleSwitchMode = roleParam === "freelancer";

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(() => ({
    ...initialData,
    role: roleParam === "freelancer" ? "freelancer" : "customer",
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Load from sessionStorage if available, but respect roleParam override
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (roleParam === "freelancer") {
          setData({ ...parsed, role: "freelancer" });
        } else {
          setData({ ...parsed, role: "customer" });
        }
      } else if (roleParam === "freelancer") {
        setData((prev) => ({ ...prev, role: "freelancer" }));
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, [roleParam]);

  // Pre-fill user's existing basic identity (Name, Username, Domisili, Avatar) from Supabase
  useEffect(() => {
    async function loadExistingUserProfile() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;

        const { data: dbUser } = await supabase
          .from("users")
          .select("full_name, username, avatar_url, location, role, freelancer_onboarded, client_onboarded")
          .eq("id", authData.user.id)
          .maybeSingle();

        const meta = authData.user.user_metadata || {};
        const existingName = dbUser?.full_name || meta.full_name || "";
        const existingUsername = dbUser?.username || meta.username || "";
        const existingAvatar = (dbUser?.avatar_url && dbUser.avatar_url.startsWith("http")) 
          ? dbUser.avatar_url 
          : (meta.avatar_url && meta.avatar_url.startsWith("http")) 
          ? meta.avatar_url 
          : DEFAULT_AVATAR_URL;
        const existingLocation = dbUser?.location || "Jakarta, DKI Jakarta";

        setData((prev) => ({
          ...prev,
          fullName: prev.fullName || existingName,
          username: prev.username || existingUsername,
          avatarUrl: (prev.avatarUrl && prev.avatarUrl !== DEFAULT_AVATAR_URL) ? prev.avatarUrl : existingAvatar,
          locationCity: prev.locationCity !== "Jakarta, DKI Jakarta" ? prev.locationCity : existingLocation,
          role: (roleParam === "freelancer" || roleParam === "customer") ? roleParam : prev.role,
        }));
      } catch (err) {
        console.warn("Could not prefill onboarding user profile:", err);
      }
    }

    loadExistingUserProfile();
  }, [supabase, roleParam]);

  // Save to sessionStorage whenever data changes
  const updateData = useCallback((updates: Partial<OnboardingData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore
      }
      return next;
    });
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setData((prev) => {
      const exists = prev.skills.includes(skill);
      const nextSkills = exists
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill];
      const next = { ...prev, skills: nextSkills };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setData((prev) => {
      const exists = prev.projectCategories.includes(category);
      const nextCategories = exists
        ? prev.projectCategories.filter((c) => c !== category)
        : [...prev.projectCategories, category];
      const next = { ...prev, projectCategories: nextCategories };
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const submitOnboarding = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // If in development mode and testing without login, simulate success
        if (process.env.NODE_ENV === "development") {
          console.warn("Dev mode: Bypassing Supabase auth check on submitOnboarding");
          try {
            sessionStorage.removeItem(STORAGE_KEY);
          } catch {}
          setStep(5);
          return;
        }
        throw new Error("Silakan masuk terlebih dahulu untuk menyelesaikan onboarding");
      }

      // Check current onboarding completion statuses from users row
      const { data: currentUserRow } = await supabase
        .from("users")
        .select("freelancer_onboarded, client_onboarded, onboarding_completed, role")
        .eq("id", user.id)
        .maybeSingle();

      const wasFreelancerOnboarded = Boolean(
        currentUserRow?.freelancer_onboarded ||
        (currentUserRow?.onboarding_completed && currentUserRow?.role === "freelancer") ||
        user.user_metadata?.freelancer_onboarded
      );

      const wasClientOnboarded = Boolean(
        currentUserRow?.client_onboarded ||
        (currentUserRow?.onboarding_completed && (currentUserRow?.role === "customer" || currentUserRow?.role === "client")) ||
        user.user_metadata?.client_onboarded
      );

      // Symmetrically set the newly submitted role to true while preserving the other role's status
      const newFreelancerOnboarded = data.role === "freelancer" ? true : wasFreelancerOnboarded;
      const newClientOnboarded = data.role === "customer" ? true : wasClientOnboarded;

      const displayName = data.fullName || user.user_metadata?.full_name || (data.role === "customer" ? (data.businessName || "Klien Doable!") : "Talenta Muda Doable!");
      const cleanUsername = data.username ? data.username.toLowerCase().trim().replace(/[^a-z0-9_.]/g, "") : (user.user_metadata?.username || undefined);
      const userAvatar = (data.avatarUrl && data.avatarUrl.startsWith("http")) ? data.avatarUrl : DEFAULT_AVATAR_URL;
      const userBanner = DEFAULT_BANNER_URL;

      // 1. Update/Upsert public.users table with independent role onboarding flags
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: displayName,
          username: cleanUsername || null,
          role: data.role,
          bio: data.bio || (data.role === "freelancer" ? "Siap mengerjakan proyek desain & teknologi." : "Klien pemberi kerja di platform Doable!"),
          avatar_url: userAvatar,
          banner_url: userBanner,
          location: data.locationCity || "Jakarta, Indonesia",
          onboarding_completed: true,
          freelancer_onboarded: newFreelancerOnboarded,
          client_onboarded: newClientOnboarded,
          is_active: true,
          is_verified: false,
        },
        { onConflict: "id" }
      );

      // 2. Dual-Role Profile Initializations
      if (data.role === "freelancer") {
        const headlineText = data.headline || `${data.skills[0] || "Digital & Tech"} Specialist`;
        const eduText = data.backgroundType === "mahasiswa" ? "Mahasiswa / Pelajar Aktif" : data.backgroundType === "fresh_grad" ? "Fresh Graduate" : data.backgroundType === "switch_career" ? "Career Switcher" : "Profesional";

        const availLabel =
          data.weeklyAvailability === "full_time"
            ? "> 30 Jam / Minggu (Full-Time)"
            : data.weeklyAvailability === "part_time"
            ? "< 15 Jam / Minggu (Side Hustle)"
            : data.weeklyAvailability === "flexible"
            ? "Fleksibel (Malam & Weekend)"
            : "15 – 30 Jam / Minggu (Part-Time)";

        // Primary: Freelancer Profile with user-customized inputs
        await supabase.from("freelancer_profiles").upsert(
          {
            user_id: user.id,
            headline: headlineText,
            bio: data.bio || `Halo! Saya ${displayName}, ${headlineText}. Siap berkolaborasi dalam proyek.`,
            skills: data.skills.length > 0 ? data.skills : ["UI/UX Design", "Figma"],
            hourly_rate: data.weeklyAvailability === "full_time" ? 250000 : data.weeklyAvailability === "semi_full" ? 200000 : 150000,
            starting_price: availLabel,
            availability: data.weeklyAvailability,
            experience_level: data.experienceLevel,
            category: data.projectCategories[0] || "Web & Fullstack",
            badge_level: "Verified Pro",
            organization: eduText,
            cover_image: userBanner,
            completed_projects: 0,
            rating: 5.0,
            reviews_count: 0,
          },
          { onConflict: "user_id" }
        );

        // Secondary: Client Profile baseline fallback ONLY if client profile does not exist yet
        if (!wasClientOnboarded) {
          const { data: existingCl } = await supabase
            .from("client_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingCl) {
            await supabase.from("client_profiles").upsert(
              {
                user_id: user.id,
                company_name: data.businessName || displayName,
                company_size: "1-10 Karyawan (UMKM)",
                client_type: "individual",
                industry: data.projectCategories[0] || "Desain & Branding",
                project_categories: data.projectCategories.length > 0 ? data.projectCategories : ["Desain & Branding"],
                budget_preference: data.budgetPreference || "umkm",
                banner_url: userBanner,
                is_verified: false,
              },
              { onConflict: "user_id" }
            );
          }
        }
      } else {
        // Primary: Client Profile with user-customized inputs
        await supabase.from("client_profiles").upsert(
          {
            user_id: user.id,
            company_name: data.businessName || displayName,
            company_size: data.hiringType === "umkm" ? "1-10 Karyawan (UMKM)" : data.hiringType === "startup" ? "11-50 Karyawan (Startup)" : "Personal / Proyek Sendiri",
            client_type: data.hiringType,
            industry: data.projectCategories[0] || "Desain & Branding",
            project_categories: data.projectCategories.length > 0 ? data.projectCategories : ["Desain & Branding"],
            budget_preference: data.budgetPreference || "umkm",
            banner_url: userBanner,
            is_verified: false,
          },
          { onConflict: "user_id" }
        );

        // Secondary: Freelancer Profile baseline fallback ONLY if freelancer profile does not exist yet
        if (!wasFreelancerOnboarded) {
          const { data: existingFl } = await supabase
            .from("freelancer_profiles")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle();

          if (!existingFl) {
            await supabase.from("freelancer_profiles").upsert(
              {
                user_id: user.id,
                headline: "Digital & Tech Specialist",
                bio: data.bio || `Halo! Saya ${displayName}. Siap berkolaborasi dalam proyek profesional.`,
                skills: ["UI/UX Design", "Web Development"],
                hourly_rate: 200000,
                starting_price: "15 – 30 Jam / Minggu (Part-Time)",
                availability: "semi_full",
                experience_level: "intermediate",
                category: "Web & Fullstack",
                badge_level: "Verified Pro",
                organization: "Profesional",
                cover_image: userBanner,
                completed_projects: 0,
                rating: 5.0,
                reviews_count: 0,
              },
              { onConflict: "user_id" }
            );
          }
        }
      }

      // 3. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          role: data.role,
          full_name: displayName,
          username: cleanUsername || undefined,
          avatar_url: userAvatar,
          banner_url: userBanner,
          onboarding_completed: true,
          freelancer_onboarded: newFreelancerOnboarded,
          client_onboarded: newClientOnboarded,
          client_type: data.hiringType,
          project_categories: data.projectCategories,
          budget_preference: data.budgetPreference,
          experience_level: data.experienceLevel,
          weekly_availability: data.weeklyAvailability,
          availability: data.weeklyAvailability,
          willing_to_verify_ktp: data.willingToVerifyKtp,
        },
      });

      // Update localStorage & trigger profile update event
      if (typeof window !== "undefined") {
        const targetActiveRole = data.role === "customer" ? "customer" : "freelancer";
        localStorage.setItem("triplet_active_dashboard_role", targetActiveRole);
        if (newFreelancerOnboarded) localStorage.setItem("triplet_freelancer_onboarded", "true");
        if (newClientOnboarded) localStorage.setItem("triplet_client_onboarded", "true");
        window.dispatchEvent(new Event("profile-updated"));
        window.dispatchEvent(new CustomEvent("doable-preferences-updated", { detail: { categories: data.projectCategories } }));
      }

      // Clear session storage
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}

      // Advance to Step 5 (Welcome)
      setStep(5);
    } catch (err) {
      console.error("Error during onboarding submit:", err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan profil");
    } finally {
      setLoading(false);
    }
  }, [data, supabase]);

  const finishAndGoToDashboard = useCallback(() => {
    const targetRole = data.role === "customer" ? "customer" : "freelancer";
    if (typeof window !== "undefined") {
      localStorage.setItem("triplet_active_dashboard_role", targetRole);
      if (targetRole === "customer") {
        localStorage.setItem("triplet_client_onboarded", "true");
      } else {
        localStorage.setItem("triplet_freelancer_onboarded", "true");
      }
      window.dispatchEvent(new Event("profile-updated"));
    }

    if (targetRole === "customer") {
      router.push("/client/dashboard");
    } else {
      router.push("/freelancer/dashboard");
    }
    router.refresh();
  }, [data.role, router]);

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    data,
    updateData,
    toggleSkill,
    toggleCategory,
    submitOnboarding,
    finishAndGoToDashboard,
    loading,
    error,
    isRoleSwitchMode,
    roleParam,
  };
}
