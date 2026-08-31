"use client";

import { use } from "react";
import { FreelancerProfileView } from "@/components/profile/freelancer-profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function DynamicFreelancerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user } = useAuth();
  const talentId = resolvedParams.id;
  const isOwner = user?.id === talentId;

  return <FreelancerProfileView talentId={talentId} isOwner={isOwner} />;
}
