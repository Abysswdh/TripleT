"use client";

import { Suspense } from "react";
import { SettingsView } from "@/components/settings/settings-view";

export default function GeneralSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <SettingsView />
    </Suspense>
  );
}
