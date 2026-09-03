"use client";

import { useParams } from "next/navigation";
import { ClientProfileView } from "@/components/profile/client-profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function DynamicClientProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const clientId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "";
  const isOwner = Boolean(user?.id && user.id === clientId);

  return <ClientProfileView clientId={clientId} isOwner={isOwner} />;
}
