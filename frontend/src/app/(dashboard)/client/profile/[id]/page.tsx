"use client";

import { use } from "react";
import { ClientProfileView } from "@/components/profile/client-profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function DynamicClientProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const clientId = resolvedParams.id;
  const isOwner = user?.id === clientId;

  return <ClientProfileView clientId={clientId} isOwner={isOwner} />;
}
