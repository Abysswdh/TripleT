"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TalentRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/client/talent");
  }, [router]);

  return null;
}
