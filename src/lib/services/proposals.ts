import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/services/activity";

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
}): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const supabase = createClient();
  let targetFreelancerId = params.freelancerId;

  if (!targetFreelancerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        error: "Silakan masuk (login) terlebih dahulu untuk mengajukan proposal ke klien.",
      };
    }
    targetFreelancerId = user.id;
  }

  // Ensure user exists in public.users to prevent foreign key violation "proposals_freelancer_id_fkey"
  try {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", targetFreelancerId)
      .maybeSingle();

    if (!existingUser) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser && authUser.id === targetFreelancerId) {
        const meta = authUser.user_metadata || {};
        await supabase.from("users").upsert({
          id: authUser.id,
          email: authUser.email || "",
          full_name: meta.full_name || authUser.email?.split("@")[0] || "Freelancer Doable",
          avatar_url: (meta.avatar_url && !meta.avatar_url.includes("photo-1534528741775")) ? meta.avatar_url : "/images/default-avatar.svg",
          role: "freelancer",
          is_active: true,
          onboarding_completed: true,
        });

        await supabase.from("freelancer_profiles").upsert({
          user_id: authUser.id,
          headline: "Freelancer Spesialis",
          skills: params.skills || ["General"],
        }, { onConflict: "user_id" });
      } else {
        return {
          success: false,
          error: "Profil akun Anda belum terdaftar di database. Silakan masuk (login) kembali.",
        };
      }
    }
  } catch (userCheckErr) {
    console.warn("Notice validating user profile before proposal submission:", userCheckErr);
  }

  // Anti Self-Dealing validation: Prevent project owner from submitting proposal to their own project
  try {
    const { data: projData } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", params.projectId)
      .single();

    if (projData && projData.owner_id === targetFreelancerId) {
      return {
        success: false,
        error: "Anda tidak dapat mengajukan proposal pada proyek yang Anda buat sendiri (Anti Self-Dealing).",
      };
    }
  } catch (checkErr) {
    console.warn("Anti-self-dealing check notice:", checkErr);
  }

  // Check if freelancer already submitted a proposal for this project
  try {
    const { data: existingProp } = await supabase
      .from("proposals")
      .select("id")
      .eq("project_id", params.projectId)
      .eq("freelancer_id", targetFreelancerId)
      .maybeSingle();

    if (existingProp) {
      return {
        success: false,
        error: "Anda sudah mengajukan proposal untuk proyek ini sebelumnya.",
      };
    }
  } catch (dupCheckErr) {
    console.warn("Notice checking existing proposal:", dupCheckErr);
  }

  const bidDisplay = `Rp ${params.bidAmount.toLocaleString("id-ID")}`;

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      project_id: params.projectId,
      freelancer_id: targetFreelancerId,
      bid_amount: params.bidAmount,
      bid_display: bidDisplay,
      delivery_days: params.deliveryDays,
      cover_letter: params.coverLetter,
      skills: params.skills || [],
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error submitting proposal:", error);
    if (error.code === "23505") {
      return { success: false, error: "Anda sudah mengajukan proposal untuk proyek ini sebelumnya." };
    }
    return { success: false, error: error.message };
  }

  // Note: projects.proposals_count is automatically and atomically updated
  // by database trigger trg_update_project_proposals_count (SECURITY DEFINER) in Supabase.

  // Log activity for heatmap & streak + award 100 Work XP
  logActivity("proposal_submitted", {
    project_id: params.projectId,
    bid_amount: params.bidAmount,
    xp_earned: 100,
  });

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
      freelancerAvatar: (flUser.avatar_url && !flUser.avatar_url.includes("photo-1534528741775")) ? flUser.avatar_url : "/images/default-avatar.svg",
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

  let clientId = user?.id;
  if (!clientId) {
    const { data: projData } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", params.projectId)
      .maybeSingle();
    clientId = projData?.owner_id;
  }

  if (!clientId) {
    return { success: false, error: "Tidak dapat mengidentifikasi pengguna klien." };
  }

  // 1. Update proposal status to accepted
  const { error: propErr } = await supabase
    .from("proposals")
    .update({ status: "accepted" })
    .eq("id", params.proposalId);

  if (propErr) {
    console.error("Error updating proposal status:", propErr);
    return { success: false, error: propErr.message };
  }

  // 2. Update other proposals on this project to rejected
  await supabase
    .from("proposals")
    .update({ status: "rejected" })
    .eq("project_id", params.projectId)
    .neq("id", params.proposalId);

  // 3. Update project status to in_progress
  const { error: projErr } = await supabase
    .from("projects")
    .update({ status: "in_progress", freelancer_id: params.freelancerId })
    .eq("id", params.projectId);

  if (projErr) {
    console.error("Error updating project status:", projErr);
    // Rollback proposal
    await supabase.from("proposals").update({ status: "pending" }).eq("id", params.proposalId);
    return { success: false, error: projErr.message };
  }

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
    // Rollback project and proposal
    await supabase.from("projects").update({ status: "hiring", freelancer_id: null }).eq("id", params.projectId);
    await supabase.from("proposals").update({ status: "pending" }).eq("id", params.proposalId);
    return { success: false, error: contractErr?.message };
  }

  // 5. Copy project milestones to contract_milestones
  const { data: projMilestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", params.projectId)
    .order("sort_order", { ascending: true });

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
  } else {
    // If no project milestones exist, create 1 default contract milestone
    await supabase.from("contract_milestones").insert({
      contract_id: contract.id,
      title: "Penyelesaian Proyek",
      amount: params.bidAmount,
      percentage: 100,
      status: "in_progress",
      sort_order: 1,
    });
  }

  return { success: true, contractId: contract.id };
}

export interface FreelancerProposalItem {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  projectBudget: string;
  clientName: string;
  clientAvatar?: string;
  bidAmount: number;
  bidDisplay: string;
  deliveryDays: number;
  coverLetter: string;
  skills: string[];
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

/**
 * Fetch all proposals submitted by the current freelancer
 */
export async function getFreelancerProposals(userId?: string): Promise<FreelancerProposalItem[]> {
  const supabase = createClient();
  let targetFreelancerId = userId;

  if (!targetFreelancerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    targetFreelancerId = user.id;
  }

  const { data, error } = await supabase
    .from("proposals")
    .select(`
      *,
      project:projects(
        id,
        title,
        category,
        budget_display,
        budget_min,
        status,
        owner:users!owner_id(
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq("freelancer_id", targetFreelancerId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching freelancer proposals:", error);
    return [];
  }

  return data.map((p) => {
    const proj = p.project || {};
    const owner = proj.owner || {};
    return {
      id: p.id,
      projectId: p.project_id,
      projectTitle: proj.title || "Proyek",
      projectCategory: proj.category || "General",
      projectBudget: proj.budget_display || `Rp ${(proj.budget_min || 0).toLocaleString("id-ID")}`,
      clientName: owner.full_name || "Klien Terverifikasi",
      clientAvatar: owner.avatar_url,
      bidAmount: p.bid_amount,
      bidDisplay: p.bid_display || `Rp ${(p.bid_amount || 0).toLocaleString("id-ID")}`,
      deliveryDays: p.delivery_days || 1,
      coverLetter: p.cover_letter || "",
      skills: p.skills || [],
      status: (p.status as "pending" | "accepted" | "rejected") || "pending",
      createdAt: p.created_at,
    };
  });
}

/**
 * Check if the user has already submitted a proposal for a specific project
 */
export async function getUserProposalForProject(
  projectId: string,
  userId?: string
): Promise<FreelancerProposalItem | null> {
  const supabase = createClient();
  let targetFreelancerId = userId;

  if (!targetFreelancerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    targetFreelancerId = user.id;
  }

  const { data, error } = await supabase
    .from("proposals")
    .select(`
      *,
      project:projects(
        id,
        title,
        category,
        budget_display,
        budget_min,
        status,
        owner:users!owner_id(
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq("project_id", projectId)
    .eq("freelancer_id", targetFreelancerId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const proj = data.project || {};
  const owner = proj.owner || {};

  return {
    id: data.id,
    projectId: data.project_id,
    projectTitle: proj.title || "Proyek",
    projectCategory: proj.category || "General",
    projectBudget: proj.budget_display || `Rp ${(proj.budget_min || 0).toLocaleString("id-ID")}`,
    clientName: owner.full_name || "Klien Terverifikasi",
    clientAvatar: owner.avatar_url,
    bidAmount: data.bid_amount,
    bidDisplay: data.bid_display || `Rp ${(data.bid_amount || 0).toLocaleString("id-ID")}`,
    deliveryDays: data.delivery_days || 1,
    coverLetter: data.cover_letter || "",
    skills: data.skills || [],
    status: (data.status as "pending" | "accepted" | "rejected") || "pending",
    createdAt: data.created_at,
  };
}

/**
 * Fetch list of project IDs that the current freelancer has submitted proposals to
 */
export async function getUserSubmittedProjectIds(userId?: string): Promise<string[]> {
  const supabase = createClient();
  let targetFreelancerId = userId;

  if (!targetFreelancerId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    targetFreelancerId = user.id;
  }

  const { data, error } = await supabase
    .from("proposals")
    .select("project_id")
    .eq("freelancer_id", targetFreelancerId);

  if (error || !data) {
    return [];
  }

  return data.map((p) => p.project_id);
}

