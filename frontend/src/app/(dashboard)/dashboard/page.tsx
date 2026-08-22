"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDashboardRole } from "@/context/role-context";
import { Loader2 } from "lucide-react";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { isClient } = useDashboardRole();

  useEffect(() => {
    if (isClient) {
      router.replace("/client/dashboard");
    } else {
      router.replace("/freelancer/dashboard");
    }
  }, [isClient, router]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-xs text-muted-foreground">Mengarahkan ke dashboard...</p>
    </div>
  );
}
