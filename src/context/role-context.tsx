"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export type DashboardRole = "customer" | "freelancer";

interface RoleContextType {
  role: DashboardRole;
  setRole: (role: DashboardRole) => void;
  toggleRole: () => void;
  isClient: boolean;
  isFreelancer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);
const STORAGE_KEY = "triplet_active_dashboard_role";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState<DashboardRole>("freelancer");
  const hasInitialized = useRef(false);

  const syncCookie = (val: string) => {
    if (typeof document !== "undefined") {
      document.cookie = `${STORAGE_KEY}=${val}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  // Initialize role once from localStorage or user metadata
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRole = localStorage.getItem(STORAGE_KEY) as DashboardRole | null;
      if (savedRole === "customer" || savedRole === "freelancer") {
        setRoleState(savedRole);
        syncCookie(savedRole);
        hasInitialized.current = true;
        return;
      }
    }

    if (!hasInitialized.current && user?.user_metadata?.role) {
      const userRole = user.user_metadata.role === "customer" ? "customer" : "freelancer";
      setRoleState(userRole);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, userRole);
        syncCookie(userRole);
      }
      hasInitialized.current = true;
    }
  }, [user]);

  const setRole = useCallback((newRole: DashboardRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newRole);
      syncCookie(newRole);
    }
  }, []);

  const toggleRole = useCallback(() => {
    setRoleState((prev) => {
      const nextRole = prev === "customer" ? "freelancer" : "customer";
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, nextRole);
        syncCookie(nextRole);
      }
      return nextRole;
    });
  }, []);

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        toggleRole,
        isClient: role === "customer",
        isFreelancer: role === "freelancer",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useDashboardRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useDashboardRole must be used within a RoleProvider");
  }
  return context;
}

export const useRole = useDashboardRole;

