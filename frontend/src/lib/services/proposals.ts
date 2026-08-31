import { createClient } from "@/lib/supabase/client";

export interface ProposalItem {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  freelancerTitle: string;
  freelancerRating: number;
  freelancerReviewsCount: number;
  freelancerSkills: string[];
  bidAmount: number;
  bidDisplay: string;
  deliveryDays: number;
  coverLetter: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

/**
 * Submit a proposal on a project
 */
export async function submitProposal(params: {
  projectId: string;
  freelancerId?: string;
  bidAmount: number;
  deliveryDays: number;
  coverLetter: string;
  skills?: string[];
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const supabase = createClient();
  let targetFreelancerId = params.freelancerId;

  if (!targetFreelancerId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetFreelancerId = user?.id || "fa000000-0000-0000-0000-000000000001";
  }

  const bidDisplay = `Rp ${params.bidAmount.toLocaleString("id-ID")}`;

  const { data, error } = await supabase
    .from("proposals")
    .upsert({
      project_id: params.projectId,
      freelancer_id: targetFreelancerId,
      bid_amount: params.bidAmount,
      bid_display: bidDisplay,
      delivery_days: params.deliveryDays,
      cover_letter: params.coverLetter,
      skills: params.skills || [],
      status: "pending",
    }, { onConflict: "project_id,freelancer_id" })
    .select()
    .single();

  if (error) {
    console.error("Error submitting proposal:", error);
    return { success: false, error: error.message };
  }

  // Increment proposals_count on the project
  try {
    const { data: proj } = await supabase.from("projects").select("proposals_count").eq("id", params.projectId).single();
    if (proj) {
      await supabase.from("projects").update({ proposals_count: (proj.proposals_count || 0) + 1 }).eq("id", params.projectId);
    }
  } catch (countErr) {
    console.info("Notice updating proposal count:", countErr);
  }

  return { success: true, data };
}

/**
 * Get proposals for a specific project
 */
export async function getProposalsForProject(projectId: string): Promise<ProposalItem[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("proposals")
    .select(`
      *,
      freelancer:users!freelancer_id(
        id,
        full_name,
        avatar_url,
        freelancer_profile:freelancer_profiles(
          headline,
          rating,
          reviews_count,
          skills
        )
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching proposals:", error);
    return [];
  }

  return data.map((p) => {
    const flUser = p.freelancer || {};
    const flProf = flUser.freelancer_profile || {};
    return {
      id: p.id,
      projectId: p.project_id,
      freelancerId: p.freelancer_id,
      freelancerName: flUser.full_name || "Specialist Freelancer",
      freelancerAvatar: flUser.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      freelancerTitle: flProf.headline || "Verified Specialist",
      freelancerRating: Number(flProf.rating) || 5.0,
      freelancerReviewsCount: flProf.reviews_count || 0,
      freelancerSkills: p.skills?.length ? p.skills : (flProf.skills || []),
      bidAmount: p.bid_amount,
      bidDisplay: p.bid_display || `Rp ${p.bid_amount?.toLocaleString("id-ID")}`,
      deliveryDays: p.delivery_days,
      coverLetter: p.cover_letter,
      status: p.status,
      createdAt: p.created_at,
    };
  });
}

/**
 * Accept a proposal: marks proposal accepted, updates project to in_progress, and creates active Contract & Milestones
 */
export async function acceptProposal(params: {
  proposalId: string;
  projectId: string;
  freelancerId: string;
  bidAmount: number;
}): Promise<{ success: boolean; contractId?: string; error?: string }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const clientId = user?.id || "ca000000-0000-0000-0000-000000000001";

  // 1. Update proposal status
  await supabase.from("proposals").update({ status: "accepted" }).eq("id", params.proposalId);

  // 2. Update other proposals on this project to rejected
  await supabase.from("proposals").update({ status: "rejected" }).eq("project_id", params.projectId).neq("id", params.proposalId);

  // 3. Update project status to in_progress
  await supabase.from("projects").update({ status: "in_progress", freelancer_id: params.freelancerId }).eq("id", params.projectId);

  // 4. Create Contract
  const { data: contract, error: contractErr } = await supabase
    .from("contracts")
    .insert({
      project_id: params.projectId,
      proposal_id: params.proposalId,
      client_id: clientId,
      freelancer_id: params.freelancerId,
      total_amount: params.bidAmount,
      amount_display: `Rp ${params.bidAmount.toLocaleString("id-ID")}`,
      status: "active",
      progress: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (contractErr || !contract) {
    console.error("Error creating contract:", contractErr);
    return { success: false, error: contractErr?.message };
  }

  // 5. Copy project milestones to contract_milestones
  const { data: projMilestones } = await supabase.from("milestones").select("*").eq("project_id", params.projectId);
  if (projMilestones && projMilestones.length > 0) {
    const contractMilestones = projMilestones.map((m, idx) => ({
      contract_id: contract.id,
      milestone_id: m.id,
      title: m.title,
      amount: m.amount || Math.round(params.bidAmount / projMilestones.length),
      percentage: m.percentage || Math.round(100 / projMilestones.length),
      status: idx === 0 ? "in_progress" : "locked",
      sort_order: m.sort_order || idx + 1,
    }));
    await supabase.from("contract_milestones").insert(contractMilestones);
  }

  return { success: true, contractId: contract.id };
}
