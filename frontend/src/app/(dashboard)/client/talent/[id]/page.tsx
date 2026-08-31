"use client";

import { useParams } from "next/navigation";
import { FreelancerProfileView } from "@/components/profile/freelancer-profile-view";

export default function ClientTalentDetailPage() {
  const params = useParams();
  const talentId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || "tal-1";
  return <FreelancerProfileView isOwner={false} talentId={talentId} />;
}
