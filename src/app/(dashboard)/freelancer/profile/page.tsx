"use client";

import { useAuth } from "@/hooks/use-auth";
import { FreelancerProfileView } from "@/components/profile/freelancer-profile-view";

export default function FreelancerProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <FreelancerProfileView isOwner={true} talentId={user?.id || ""} />;
}
