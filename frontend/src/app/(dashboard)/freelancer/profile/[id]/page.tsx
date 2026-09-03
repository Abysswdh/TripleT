"use client";

import { useParams } from "next/navigation";
import { FreelancerProfileView } from "@/components/profile/freelancer-profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function DynamicFreelancerProfilePage() {
  const params = useParams();
  const { user } = useAuth();
  const talentId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "tal-1";
  const isOwner = Boolean(user?.id && user.id === talentId);

  return <FreelancerProfileView talentId={talentId} isOwner={isOwner} />;
}
