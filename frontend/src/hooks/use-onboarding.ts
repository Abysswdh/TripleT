"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  role: "freelancer",
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
  projectCategories: ["UI/UX & Product Design"],
  bio: "",
  locationCity: "Jakarta, DKI Jakarta",
  avatarUrl: DEFAULT_AVATAR_URL,
  willingToVerifyKtp: true,
};

export function useOnboarding() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Load from sessionStorage if available
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setData(JSON.parse(saved));
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

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
    setStep((s) => Math.min(s + 1, 6));
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
          setStep(6);
          return;
        }
        throw new Error("Silakan masuk terlebih dahulu untuk menyelesaikan onboarding");
      }

      const displayName = data.fullName || user.user_metadata?.full_name || (data.role === "customer" ? (data.businessName || "Klien Doable!") : "Talenta Muda Doable!");
      const cleanUsername = data.username ? data.username.toLowerCase().trim().replace(/[^a-z0-9_.]/g, "") : (user.user_metadata?.username || undefined);
      const userAvatar = (data.avatarUrl && data.avatarUrl.startsWith("http")) ? data.avatarUrl : DEFAULT_AVATAR_URL;
      const userBanner = DEFAULT_BANNER_URL;

      // 1. Update/Upsert public.users table
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
          is_active: true,
          is_verified: false,
        },
        { onConflict: "id" }
      );

      // 2. Dual-Role Profile Initializations (Ensure BOTH profiles exist for seamless switching)
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

        // Primary: Freelancer Profile
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
            category: data.projectCategories[0] || "Web Development",
            badge_level: "Verified Pro",
            organization: eduText,
            cover_image: userBanner,
            completed_projects: 0,
            rating: 5.0,
            reviews_count: 0,
          },
          { onConflict: "user_id" }
        );

        // Secondary / Lazy-load: Client Profile fallback
        await supabase.from("client_profiles").upsert(
          {
            user_id: user.id,
            company_name: data.businessName || displayName,
            company_size: "1-10 Karyawan (UMKM)",
            client_type: "individual",
            industry: data.projectCategories[0] || "Teknologi & Kreatif",
            banner_url: userBanner,
            is_verified: false,
          },
          { onConflict: "user_id" }
        );
      } else {
        // Primary: Client Profile
        await supabase.from("client_profiles").upsert(
          {
            user_id: user.id,
            company_name: data.businessName || displayName,
            company_size: data.hiringType === "umkm" ? "1-10 Karyawan (UMKM)" : data.hiringType === "startup" ? "11-50 Karyawan (Startup)" : "Personal / Proyek Sendiri",
            client_type: data.hiringType,
            industry: data.projectCategories[0] || "Teknologi & Kreatif",
            banner_url: userBanner,
            is_verified: false,
          },
          { onConflict: "user_id" }
        );

        // Secondary / Lazy-load: Freelancer Profile fallback
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
            category: "Web Development",
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

      // 3. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          role: data.role,
          full_name: displayName,
          username: cleanUsername || undefined,
          avatar_url: userAvatar,
          banner_url: userBanner,
          onboarding_completed: true,
          experience_level: data.experienceLevel,
          weekly_availability: data.weeklyAvailability,
          availability: data.weeklyAvailability,
          willing_to_verify_ktp: data.willingToVerifyKtp,
        },
      });

      // Clear session storage
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}

      // Advance to Step 6 (Welcome)
      setStep(6);
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
  };
}
