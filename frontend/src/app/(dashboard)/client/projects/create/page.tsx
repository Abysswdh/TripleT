"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function CreateProjectRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/client/projects?create=true");
  }, [router]);

  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 p-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">Membuka Project Builder...</p>
    </div>
  );
}
