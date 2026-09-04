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
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    return [];
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
  projectId?: string;
  milestoneId?: string;
  contractMilestoneId?: string;
  deliverableUrl?: string;
  fileUrl?: string;
  deliverableNote?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const now = new Date().toISOString();
  const url = params.deliverableUrl || params.fileUrl || "";

  // 1. If milestoneId is provided, update milestones table
  if (params.milestoneId) {
    await supabase
      .from("milestones")
      .update({
        deliverable_file_url: url,
        deliverable_note: params.deliverableNote,
        is_submitted_for_review: true,
        submitted_at: now,
        status: "submitted",
      })
      .eq("id", params.milestoneId);
  }

  // 2. Update contract_milestones table (by id or milestone_id)
  const targetId = params.contractMilestoneId || params.milestoneId;
  if (targetId) {
    const { data: updatedCm, error } = await supabase
      .from("contract_milestones")
      .update({
        deliverable_file_url: url,
        deliverable_note: params.deliverableNote,
        is_submitted_for_review: true,
        submitted_at: now,
        status: "submitted",
      })
      .or(`id.eq.${targetId},milestone_id.eq.${targetId}`)
      .select("milestone_id, contract_id")
      .maybeSingle();

    if (error) {
      console.error("Error updating contract_milestones deliverable:", error);
    }

    // Sync to milestones table if milestoneId was not passed explicitly
    if (!params.milestoneId && updatedCm?.milestone_id) {
      await supabase
        .from("milestones")
        .update({
          deliverable_file_url: url,
          deliverable_note: params.deliverableNote,
          is_submitted_for_review: true,
          submitted_at: now,
          status: "submitted",
        })
        .eq("id", updatedCm.milestone_id);
    }
  }

  // 3. Post system notice in milestone discussion thread if projectId & milestoneId are known
  if (params.projectId && (params.milestoneId || targetId)) {
    await supabase.from("milestone_comments").insert({
      project_id: params.projectId,
      milestone_id: params.milestoneId || targetId,
      author_name: "Sistem Doable",
      role: "freelancer",
      content: `[HASIL KARYA DISERAHKAN]: Freelancer telah menyerahkan hasil karya untuk ditinjau oleh klien.\nLink: ${url}${params.deliverableNote ? `\nCatatan: ${params.deliverableNote}` : ""}`,
    });
  }

  // 4. Log activity for heatmap & streak + award 150 Work XP
  logActivity("milestone_delivered", {
    milestone_id: params.milestoneId || targetId,
    xp_earned: 150,
  });

  return { success: true };
}

/**
 * Approve milestone deliverable & release escrow (by client)
 */
export async function approveMilestone(params: {
  projectId: string;
  contractId?: string;
  milestoneId: string;
  contractMilestoneId?: string;
  amount: number;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  const now = new Date().toISOString();

  // 1. Mark milestone completed in milestones table
  await supabase
    .from("milestones")
    .update({
      status: "completed",
      is_submitted_for_review: false,
    })
    .eq("id", params.milestoneId);

  // 2. Unlock next milestone in milestones table
  const { data: allProjMilestones } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", params.projectId)
    .order("sort_order", { ascending: true });

  if (allProjMilestones) {
    const curIdx = allProjMilestones.findIndex((m) => m.id === params.milestoneId);
    if (curIdx !== -1 && curIdx + 1 < allProjMilestones.length) {
      const nextMs = allProjMilestones[curIdx + 1];
      await supabase
        .from("milestones")
        .update({ status: "in_progress" })
        .eq("id", nextMs.id);
    }
  }

  // 3. Resolve actual contract milestone and contract id
  let contractId = params.contractId;
  let actualContractMilestoneId = params.contractMilestoneId;

  const { data: cmRow } = await supabase
    .from("contract_milestones")
    .select("id, contract_id, status")
    .or(`id.eq.${params.milestoneId},milestone_id.eq.${params.milestoneId}`)
    .maybeSingle();

  if (cmRow) {
    actualContractMilestoneId = cmRow.id;
    if (!contractId) {
      contractId = cmRow.contract_id;
    }
  }

  if (actualContractMilestoneId) {
    await supabase
      .from("contract_milestones")
      .update({
        status: "completed",
        completed_at: now,
        is_submitted_for_review: false,
      })
      .eq("id", actualContractMilestoneId);
  } else {
    await supabase
      .from("contract_milestones")
      .update({
        status: "completed",
        completed_at: now,
        is_submitted_for_review: false,
      })
      .or(`id.eq.${params.milestoneId},milestone_id.eq.${params.milestoneId}`);
  }

  // 4. Unlock next milestone in contract_milestones table if contract exists
  if (!contractId) {
    const { data: contractData } = await supabase
      .from("contracts")
      .select("id, freelancer_id")
      .eq("project_id", params.projectId)
      .maybeSingle();
    contractId = contractData?.id;
  }

  if (contractId) {
    const { data: allMilestones } = await supabase
      .from("contract_milestones")
      .select("*")
      .eq("contract_id", contractId)
      .order("sort_order", { ascending: true });

    if (allMilestones) {
      const nextLocked = allMilestones.find((m) => m.status === "locked");
      if (nextLocked) {
        await supabase
          .from("contract_milestones")
          .update({ status: "in_progress" })
          .eq("id", nextLocked.id);
      }

      // Check if all milestones are completed -> mark contract and project completed
      const allDone = allMilestones.every((m) => m.id === actualContractMilestoneId || m.milestone_id === params.milestoneId || m.status === "completed");
      if (allDone) {
        await supabase
          .from("contracts")
          .update({ status: "completed", progress: 100, completed_at: now })
          .eq("id", contractId);

        await supabase
          .from("projects")
          .update({ status: "completed" })
          .eq("id", params.projectId);

        // Update freelancer profile stats (completed_projects)
        const { data: contractInfo } = await supabase
          .from("contracts")
          .select("freelancer_id")
          .eq("id", contractId)
          .maybeSingle();

        if (contractInfo?.freelancer_id) {
          const { count } = await supabase
            .from("contracts")
            .select("id", { count: "exact", head: true })
            .eq("freelancer_id", contractInfo.freelancer_id)
            .eq("status", "completed");

          const completedCount = Math.max(1, count || 1);
          await supabase
            .from("freelancer_profiles")
            .update({ completed_projects: completedCount })
            .eq("user_id", contractInfo.freelancer_id);
        }
      }
    }

    // 5. Create Escrow Release transaction (contract_milestone_id must be valid FK to contract_milestones)
    const { error: txErr } = await supabase.from("escrow_transactions").insert({
      contract_id: contractId,
      contract_milestone_id: actualContractMilestoneId || null,
      type: "release",
      amount: params.amount,
      status: "success",
      notes: `Milestone deliverable disetujui klien. Dana escrow Rp ${params.amount.toLocaleString("id-ID")} dicairkan ke saldo freelancer.`,
      processed_at: now,
    });
    if (txErr) {
      console.error("Error creating escrow release transaction:", txErr);
    }

    // Update freelancer_profiles total_earnings
    const { data: cRow } = await supabase
      .from("contracts")
      .select("freelancer_id")
      .eq("id", contractId)
      .maybeSingle();

    if (cRow?.freelancer_id) {
      const { data: currentFp } = await supabase
        .from("freelancer_profiles")
        .select("total_earnings")
        .eq("user_id", cRow.freelancer_id)
        .maybeSingle();

      const newTotal = (Number(currentFp?.total_earnings) || 0) + params.amount;
      await supabase
        .from("freelancer_profiles")
        .update({ total_earnings: newTotal })
        .eq("user_id", cRow.freelancer_id);
    }
  }

  // 6. Post system notice in milestone discussion thread
  await supabase.from("milestone_comments").insert({
    project_id: params.projectId,
    milestone_id: params.milestoneId,
    author_name: "Sistem Doable",
    role: "client",
    content: `[HASIL KARYA DISETUJUI]: Klien telah menyetujui hasil karya milestone ini dan dana escrow sebesar Rp ${params.amount.toLocaleString("id-ID")} telah dicairkan ke saldo freelancer.`,
  });

  return { success: true };
}

/**
 * Request revision on milestone deliverable (by client)
 */
export async function requestMilestoneRevision(params: {
  projectId: string;
  milestoneId: string;
  contractMilestoneId?: string;
  note: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  // 1. Reset is_submitted_for_review in milestones
  await supabase
    .from("milestones")
    .update({
      is_submitted_for_review: false,
      status: "in_progress",
    })
    .eq("id", params.milestoneId);

  // 2. Reset in contract_milestones
  const targetId = params.contractMilestoneId || params.milestoneId;
  await supabase
    .from("contract_milestones")
    .update({
      is_submitted_for_review: false,
      status: "in_progress",
    })
    .or(`id.eq.${targetId},milestone_id.eq.${params.milestoneId}`);

  // 3. Post revision comment in milestone discussion
  await supabase.from("milestone_comments").insert({
    project_id: params.projectId,
    milestone_id: params.milestoneId,
    author_name: "Klien",
    role: "client",
    content: `[PERMINTAAN REVISI]: ${params.note}`,
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

  const isAllDone = msList.length > 0 && msList.every((m: any) => m.status === "completed");
  const contractStatus = (isAllDone || raw.status === "completed") ? "completed" : raw.status;

  if (isAllDone && raw.status !== "completed" && raw.id) {
    const supabase = createClient();
    supabase.from("contracts").update({ status: "completed", progress: 100 }).eq("id", raw.id).then(() => {});
    if (raw.project_id) {
      supabase.from("projects").update({ status: "completed" }).eq("id", raw.project_id).then(() => {});
    }
  }

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
    freelancerAvatar: (fl.avatar_url && !fl.avatar_url.includes("photo-1534528741775")) ? fl.avatar_url : "/images/default-avatar.svg",
    totalAmount: raw.total_amount,
    amountDisplay: raw.amount_display || `Rp ${raw.total_amount?.toLocaleString("id-ID")}`,
    status: contractStatus,
    progress: isAllDone ? 100 : (raw.progress || 0),
    startedAt: raw.started_at || raw.created_at,
    completedAt: raw.completed_at,
    milestones: msList,
  };
}
