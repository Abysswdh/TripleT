import { createClient } from "@/lib/supabase/client";

export interface ProposalRecord {
  id: string;
  projectId: string;
  freelancerId: string;
  bidAmount: number;
  bidDisplay: string;
  deliveryDays: number;
  coverLetter: string;
  skills: string[];
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  freelancer?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    headline?: string;
    rating?: number;
    reviewsCount?: number;
  };
  project?: {
    id: string;
    title: string;
    budget: string;
    category: string;
  };
}

/**
 * Submit a bid proposal for a project
 */
export async function submitProposal(params: {
  projectId: string;
  bidAmount: number;
  deliveryDays: number;
  coverLetter: string;
  skills?: string[];
}): Promise<{ success: boolean; error?: string; data?: ProposalRecord }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Silakan login terlebih dahulu untuk mengajukan proposal." };
  }

  const formattedBid = `Rp ${params.bidAmount.toLocaleString("id-ID")}`;

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      project_id: params.projectId,
      freelancer_id: user.id,
      bid_amount: params.bidAmount,
      bid_display: formattedBid,
      delivery_days: params.deliveryDays,
      cover_letter: params.coverLetter,
      skills: params.skills || [],
      status: "pending",
    })
    .select(`
      *,
      freelancer:users!freelancer_id(id, full_name, avatar_url),
      project:projects!project_id(id, title, budget_display, category)
    `)
    .single();

  if (error) {
    console.error("Error submitting proposal:", error);
    return { success: false, error: error.message };
  }

  return {
    success: true,
    data: {
      id: data.id,
      projectId: data.project_id,
      freelancerId: data.freelancer_id,
      bidAmount: data.bid_amount,
      bidDisplay: data.bid_display || formattedBid,
      deliveryDays: data.delivery_days,
      coverLetter: data.cover_letter,
      skills: data.skills || [],
      status: data.status,
      createdAt: data.created_at,
    },
  };
}

/**
 * Fetch proposals for a specific project
 */
export async function getProjectProposals(projectId: string): Promise<ProposalRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("proposals")
    .select(`
      *,
      freelancer:users!freelancer_id(
        id, full_name, avatar_url,
        freelancer_profile:freelancer_profiles(headline, rating, reviews_count)
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching proposals:", error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((p: any) => {
    const fl = p.freelancer || {};
    const flProfile = Array.isArray(fl.freelancer_profile) ? fl.freelancer_profile[0] : fl.freelancer_profile;
    return {
      id: p.id,
      projectId: p.project_id,
      freelancerId: p.freelancer_id,
      bidAmount: p.bid_amount,
      bidDisplay: p.bid_display || `Rp ${(p.bid_amount || 0).toLocaleString("id-ID")}`,
      deliveryDays: p.delivery_days,
      coverLetter: p.cover_letter,
      skills: p.skills || [],
      status: p.status,
      createdAt: p.created_at,
      freelancer: {
        id: fl.id,
        fullName: fl.full_name || "Pelamar Talenta",
        avatarUrl: fl.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        headline: flProfile?.headline || "Digital Specialist",
        rating: Number(flProfile?.rating) || 5.0,
        reviewsCount: flProfile?.reviews_count || 0,
      },
    };
  });
}
