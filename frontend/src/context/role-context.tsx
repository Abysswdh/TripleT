"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState<DashboardRole>("customer");

  useEffect(() => {
    if (user?.user_metadata?.role) {
      const userRole = user.user_metadata.role;
      if (userRole === "freelancer") {
        setRoleState("freelancer");
      } else {
        setRoleState("customer");
      }
    }
  }, [user]);

  const setRole = useCallback((newRole: DashboardRole) => {
    setRoleState(newRole);
  }, []);

  const toggleRole = useCallback(() => {
    setRoleState((prev) => (prev === "customer" ? "freelancer" : "customer"));
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
