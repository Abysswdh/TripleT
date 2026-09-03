"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

/**
 * Hook for managing Supabase Auth state in Client Components.
 *
 * Provides:
 * - Current user and session
 * - signIn, signUp, signOut functions
 * - Loading state
 *
 * Usage:
 *   const { user, signIn, signOut, loading } = useAuth();
 */
export function clearAllUserLocalCaches(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove = [
      "doable_current_user_id",
      "doable_local_active_dates",
      "doable_learned_resources",
      "doable_freelancer_quiz_results",
      "doable_quiz_results",
      "triplet_freelancer_onboarded",
      "triplet_client_onboarded",
      "triplet_active_dashboard_role",
      "doable_onboarding_freelancer",
      "doable_onboarding_client",
      "doable_onboarding_data",
    ];
    keysToRemove.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    const allKeys = Object.keys(localStorage);
    for (const key of allKeys) {
      if (key.startsWith("doable_") || key.startsWith("triplet_")) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (typeof window !== "undefined") {
        if (session?.user?.id) {
          const storedId = localStorage.getItem("doable_current_user_id");
          if (storedId && storedId !== session.user.id) {
            clearAllUserLocalCaches();
          }
          localStorage.setItem("doable_current_user_id", session.user.id);
        } else {
          clearAllUserLocalCaches();
        }
      }

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    };

    getSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (typeof window !== "undefined") {
        if (session?.user?.id) {
          const storedId = localStorage.getItem("doable_current_user_id");
          if (storedId && storedId !== session.user.id) {
            clearAllUserLocalCaches();
          }
          localStorage.setItem("doable_current_user_id", session.user.id);
        } else if (event === "SIGNED_OUT") {
          clearAllUserLocalCaches();
        }
      }

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (typeof window !== "undefined" && data.user?.id) {
        const storedId = localStorage.getItem("doable_current_user_id");
        if (storedId && storedId !== data.user.id) {
          clearAllUserLocalCaches();
        }
        localStorage.setItem("doable_current_user_id", data.user.id);
      }

      router.push("/dashboard");
      router.refresh();
      return data;
    },
    [supabase, router]
  );

  const signInWithGoogle = useCallback(
    async (redirectTo = "/onboarding") => {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;
      return data;
    },
    [supabase]
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      // Clear previous caches before creating new account so user starts completely fresh
      clearAllUserLocalCaches();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        },
      });

      if (error) throw error;

      return data;
    },
    [supabase]
  );

  const signOut = useCallback(async () => {
    clearAllUserLocalCaches();

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    router.push("/login");
    router.refresh();
  }, [supabase, router]);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };
}
