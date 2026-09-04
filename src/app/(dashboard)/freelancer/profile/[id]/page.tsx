"use client";

import { useParams } from "next/navigation";
import { FreelancerProfileView } from "@/components/profile/freelancer-profile-view";
import { useAuth } from "@/hooks/use-auth";

export default function DynamicFreelancerProfilePage() {
  const params = useParams();
  const { user, loading } = useAuth();
  const talentId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "tal-1";
  const isOwner = Boolean(user?.id && user.id === talentId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <FreelancerProfileView talentId={talentId} isOwner={isOwner} />;
}
