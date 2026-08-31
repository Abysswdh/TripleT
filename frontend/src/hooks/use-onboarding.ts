"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type RoleType = "freelancer" | "customer";
export type ExperienceLevel = "starter" | "intermediate" | "expert";
export type FreelancerBackground = "mahasiswa" | "fresh_grad" | "switch_career" | "professional";
export type ClientHiringType = "umkm" | "startup" | "agency" | "individual";
export type ClientBudgetPref = "umkm" | "standard" | "enterprise";

export interface OnboardingData {
  role: RoleType;
  fullName: string;
  username: string;
  // Freelancer specific
  backgroundType: FreelancerBackground;
  experienceLevel: ExperienceLevel;
  skills: string[];
  headline: string;
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
  startingPrice: 500000,
  hiringType: "umkm",
  businessName: "",
  budgetPreference: "umkm",
  projectCategories: ["UI/UX & Product Design"],
  bio: "",
  locationCity: "Jakarta, DKI Jakarta",
  avatarUrl: "avatar-1",
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

      // 1. Update/Upsert public.users table
      await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: displayName,
          username: cleanUsername || null,
          role: data.role,
          bio: data.bio || (data.role === "freelancer" ? "Siap mengerjakan proyek desain & teknologi." : "Klien pemberi kerja di platform Doable!"),
          avatar_url: data.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          location: data.locationCity || "Jakarta, Indonesia",
          onboarding_completed: true,
          is_active: true,
          is_verified: false,
        },
        { onConflict: "id" }
      );

      // 2. Role-specific profile table insertion
      if (data.role === "freelancer") {
        const headlineText = data.headline || `${data.skills[0] || "Digital & Tech"} Specialist`;
        const eduText = data.backgroundType === "mahasiswa" ? "Mahasiswa / Pelajar Aktif" : data.backgroundType === "fresh_grad" ? "Fresh Graduate" : data.backgroundType === "switch_career" ? "Career Switcher" : "Profesional";

        await supabase.from("freelancer_profiles").upsert(
          {
            user_id: user.id,
            headline: headlineText,
            bio: data.bio || `Halo! Saya ${displayName}, ${headlineText}. Siap berkolaborasi dalam proyek.`,
            skills: data.skills.length > 0 ? data.skills : ["UI/UX Design", "Figma"],
            hourly_rate: data.startingPrice,
            starting_price: `Mulai Rp ${(data.startingPrice || 500000).toLocaleString("id-ID")}`,
            category: data.projectCategories[0] || "Web Development",
            years_experience: data.experienceLevel === "starter" ? 0 : data.experienceLevel === "expert" ? 4 : 2,
            education: eduText,
            completed_projects_count: 0,
            average_rating: 5.0,
            total_reviews_count: 0,
          },
          { onConflict: "user_id" }
        );
      } else {
        await supabase.from("client_profiles").upsert(
          {
            user_id: user.id,
            company_name: data.businessName || "Bisnis UMKM / Startup",
            company_size: data.hiringType === "umkm" ? "1-10 Karyawan (UMKM)" : data.hiringType === "startup" ? "11-50 Karyawan (Startup)" : "Personal / Proyek Sendiri",
            industry: data.projectCategories[0] || "Teknologi & Kreatif",
            hiring_needs: data.projectCategories,
            budget_range: data.budgetPreference === "umkm" ? "< Rp 2.000.000 (Ramah UMKM)" : data.budgetPreference === "enterprise" ? "> Rp 10.000.000 (Enterprise)" : "Rp 2.000.000 - Rp 10.000.000 (Standar)",
            verified_badge: false,
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
          onboarding_completed: true,
          experience_level: data.experienceLevel,
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
