"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type RoleType = "freelancer" | "customer";
export type ExperienceLevel = "entry" | "intermediate" | "expert";
export type HiringType = "individual" | "startup" | "company";

export interface OnboardingData {
  role: RoleType;
  skills: string[];
  experienceLevel: ExperienceLevel;
  hourlyRate?: number;
  projectCategories: string[];
  hiringType: HiringType;
  bio: string;
  avatarUrl: string;
}

const STORAGE_KEY = "doable_onboarding_data";

const initialData: OnboardingData = {
  role: "freelancer",
  skills: [],
  experienceLevel: "intermediate",
  hourlyRate: 35,
  projectCategories: [],
  hiringType: "individual",
  bio: "",
  avatarUrl: "avatar-1",
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
    setStep((s) => Math.min(s + 1, 4));
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
        throw new Error("You must be signed in to complete onboarding");
      }

      // Update profile in backend API or Supabase user metadata
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const payload = {
        role: data.role,
        skills: data.role === "freelancer" ? data.skills : [],
        experience_level: data.role === "freelancer" ? data.experienceLevel : undefined,
        hourly_rate: data.role === "freelancer" ? data.hourlyRate : undefined,
        bio: data.bio || undefined,
        avatar_url: data.avatarUrl || undefined,
      };

      // 1. Update Supabase Auth user metadata
      await supabase.auth.updateUser({
        data: {
          ...payload,
          onboarding_completed: true,
        },
      });

      // 2. Try updating FastAPI backend if reachable
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          await fetch(`${apiUrl}/api/v1/users/me`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify(payload),
          });
        }
      } catch {
        // Fallback gracefully if backend is offline during local dev
        console.warn("Backend sync failed, saved in Supabase metadata");
      }

      // Clear session storage
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}

      // Advance to Step 4 (Welcome & Confetti)
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  }, [data, supabase]);

  const finishAndGoToDashboard = useCallback(() => {
    router.push("/dashboard");
    router.refresh();
  }, [router]);

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
