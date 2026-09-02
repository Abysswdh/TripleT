import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/services/activity";

export interface ContractMilestoneItem {
  id: string;
  contractId: string;
  title: string;
  amount: number;
  amountDisplay: string;
  status: "locked" | "in_progress" | "submitted" | "completed";
  dueDate?: string;
  completedAt?: string;
  sortOrder: number;
}

export interface ContractItem {
  id: string;
  projectId: string;
  projectTitle: string;
  projectCategory: string;
  clientId: string;
  clientName: string;
  clientAvatar: string;
  freelancerId: string;
  freelancerName: string;
  freelancerAvatar: string;
  totalAmount: number;
  amountDisplay: string;
  status: "active" | "completed" | "cancelled";
  progress: number;
  startedAt: string;
  completedAt?: string;
  milestones: ContractMilestoneItem[];
}

/**
 * Get active & completed contracts for a freelancer
 */
export async function getFreelancerContracts(userId?: string): Promise<ContractItem[]> {
  const supabase = createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetUserId = user?.id || "fa000000-0000-0000-0000-000000000001";
  }

  const { data, error } = await supabase
    .from("contracts")
    .select(`
      *,
      project:projects!project_id(id, title, category, description),
      client:users!client_id(id, full_name, avatar_url),
      freelancer:users!freelancer_id(id, full_name, avatar_url),
      contract_milestones(*)
    `)
    .eq("freelancer_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching freelancer contracts:", error);
    return [];
  }

  return data.map((c) => formatContract(c));
}

/**
 * Get active contracts for a client
 */
export async function getClientContracts(userId?: string): Promise<ContractItem[]> {
  const supabase = createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    targetUserId = user?.id || "ca000000-0000-0000-0000-000000000001";
  }

  const { data, error } = await supabase
    .from("contracts")
    .select(`
      *,
      project:projects!project_id(id, title, category, description),
      client:users!client_id(id, full_name, avatar_url),
      freelancer:users!freelancer_id(id, full_name, avatar_url),
      contract_milestones(*)
    `)
    .eq("client_id", targetUserId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching client contracts:", error);
    return [];
  }

  return data.map((c) => formatContract(c));
}

/**
 * Submit milestone deliverable (by freelancer)
 */
export async function submitMilestoneDeliverable(params: {
  contractMilestoneId: string;
  deliverableNote?: string;
  fileUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase
    .from("contract_milestones")
    .update({
      status: "submitted",
    })
    .eq("id", params.contractMilestoneId);

  if (error) {
    console.error("Error submitting deliverable:", error);
    return { success: false, error: error.message };
  }

  // Log activity for heatmap & streak + award 150 Work XP
  logActivity("milestone_delivered", {
    milestone_id: params.contractMilestoneId,
    xp_earned: 150,
  });

  return { success: true };
}

/**
 * Approve milestone deliverable & release escrow (by client)
 */
export async function approveMilestone(params: {
  contractId: string;
  contractMilestoneId: string;
  amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 1. Mark milestone completed
  await supabase
    .from("contract_milestones")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.contractMilestoneId);

  // 2. Unlock next milestone if available
  const { data: allMilestones } = await supabase
    .from("contract_milestones")
    .select("*")
    .eq("contract_id", params.contractId)
    .order("sort_order", { ascending: true });

  if (allMilestones) {
    const nextLocked = allMilestones.find((m) => m.status === "locked");
    if (nextLocked) {
      await supabase
        .from("contract_milestones")
        .update({ status: "in_progress" })
        .eq("id", nextLocked.id);
    }

    // Check if all milestones are completed -> mark contract completed
    const allDone = allMilestones.every((m) => m.id === params.contractMilestoneId || m.status === "completed");
    if (allDone) {
      await supabase
        .from("contracts")
        .update({ status: "completed", progress: 100, completed_at: new Date().toISOString() })
        .eq("id", params.contractId);
    }
  }

  // 3. Create Escrow Release transaction
  await supabase.from("escrow_transactions").insert({
    contract_id: params.contractId,
    contract_milestone_id: params.contractMilestoneId,
    type: "release",
    amount: params.amount,
    status: "success",
    notes: "Milestone deliverable approved by client. Escrow released.",
    processed_at: new Date().toISOString(),
  });

  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatContract(raw: any): ContractItem {
  const proj = raw.project || {};
  const cl = raw.client || {};
  const fl = raw.freelancer || {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const msList = (raw.contract_milestones || []).map((m: any) => ({
    id: m.id,
    contractId: m.contract_id,
    title: m.title,
    amount: m.amount,
    amountDisplay: `Rp ${m.amount?.toLocaleString("id-ID")}`,
    status: m.status,
    dueDate: m.due_date,
    completedAt: m.completed_at,
    sortOrder: m.sort_order || 0,
  }));

  return {
    id: raw.id,
    projectId: raw.project_id,
    projectTitle: proj.title || "Contract Project",
    projectCategory: proj.category || "General",
    clientId: raw.client_id,
    clientName: cl.full_name || "Enterprise Client",
    clientAvatar: cl.avatar_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    freelancerId: raw.freelancer_id,
    freelancerName: fl.full_name || "Specialist Talent",
    freelancerAvatar: fl.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    totalAmount: raw.total_amount,
    amountDisplay: raw.amount_display || `Rp ${raw.total_amount?.toLocaleString("id-ID")}`,
    status: raw.status,
    progress: raw.progress || 0,
    startedAt: raw.started_at || raw.created_at,
    completedAt: raw.completed_at,
    milestones: msList,
  };
}
