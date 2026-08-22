"use client";

import { useDashboardRole } from "@/context/role-context";
import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { FreelancerDashboard } from "@/components/dashboard/freelancer-dashboard";

export default function DashboardPage() {
  const { isClient } = useDashboardRole();

  return isClient ? <ClientDashboard /> : <FreelancerDashboard />;
}
