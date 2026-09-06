import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/services/activity";
import { createNotification } from "@/lib/services/notifications";

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
  isDummy?: boolean;
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
 * Start instant simulation for a dummy project (without client approval needed)
 */
export async function startDummyProjectSimulation(
  projectId: string,
  freelancerId?: string
): Promise<{ success: boolean; contractId?: string; error?: string }> {
  const supabase = createClient();
  let targetUserId = freelancerId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    targetUserId = user?.id;
  }

  if (!targetUserId) {
    return { success: false, error: "Silakan masuk (login) terlebih dahulu untuk memulai simulasi." };
  }

  // 1. Fetch project and verify
  const { data: proj, error: projErr } = await supabase
    .from("projects")
    .select("*, milestones(*)")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr || !proj) {
    return { success: false, error: "Proyek simulasi tidak ditemukan." };
  }

  // 2. Check if the user already has an active or completed contract for this project
  const { data: existingContract } = await supabase
    .from("contracts")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("freelancer_id", targetUserId)
    .maybeSingle();

  if (existingContract) {
    return { success: true, contractId: existingContract.id };
  }

  // 3. Create active simulation contract
  const academyClientId = proj.owner_id || "a0000000-0000-0000-0000-000000000001";
  const now = new Date().toISOString();

  const { data: newContract, error: contractErr } = await supabase
    .from("contracts")
    .insert({
      project_id: projectId,
      client_id: academyClientId,
      freelancer_id: targetUserId,
      total_amount: proj.budget_numeric || 0,
      amount_display: proj.budget_display || "Rp 0 (Simulasi)",
      status: "active",
      progress: 0,
      started_at: now,
    })
    .select()
    .single();

  if (contractErr || !newContract) {
    console.error("Error creating simulation contract:", contractErr);
    return { success: false, error: contractErr?.message || "Gagal membuat sesi simulasi." };
  }

  // 4. Update project freelancer_id & status if needed
  await supabase
    .from("projects")
    .update({
      freelancer_id: targetUserId,
      status: "in_progress",
    })
    .eq("id", projectId);

  // 5. Seed contract_milestones from project milestones
  const msList = (proj.milestones || []).sort(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)
  );

  if (msList.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cmInserts = msList.map((m: any, idx: number) => ({
      contract_id: newContract.id,
      milestone_id: m.id,
      title: m.title,
      amount: m.amount || 0,
      status: idx === 0 ? "in_progress" : "locked",
      sort_order: m.sort_order || idx,
    }));

    await supabase.from("contract_milestones").insert(cmInserts);

    // Ensure first milestone in milestones table is in_progress
    if (msList[0]?.id) {
      await supabase.from("milestones").update({ status: "in_progress" }).eq("id", msList[0].id);
    }
  }

  // 6. Log activity for streak / heatmap
  logActivity("milestone_delivered", {
    project_id: projectId,
    contract_id: newContract.id,
    action: "simulation_started",
    xp_earned: 50,
  });

  // 7. Welcome comment in milestone 1 chat
  if (msList.length > 0 && msList[0]?.id) {
    await supabase.from("milestone_comments").insert({
      project_id: projectId,
      milestone_id: msList[0].id,
      author_name: "Doable! Sandbox Academy",
      role: "client",
      content: `Selamat datang di Simulasi Portofolio Mandiri Doable! 🚀\nBrief proyek '${proj.title}' telah aktif. Silakan ikuti instruksi sprint dan serahkan deliverable Anda begitu selesai untuk validasi otomatis dan pencantuman ke Portofolio Profil Publik Anda.`,
    });
  }

  // 8. Notification
  await createNotification({
    userId: targetUserId,
    type: "contract",
    title: "Simulasi Proyek Dimulai 🚀",
    message: `Sesi simulasi '${proj.title}' Anda telah aktif. Selesaikan milestone untuk menambahkan proyek ini ke portofolio!`,
    linkUrl: `/freelancer/projects/${projectId}`,
    roleTarget: "freelancer",
  });

  return { success: true, contractId: newContract.id };
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
}): Promise<{ success: boolean; autoApproved?: boolean; allCompleted?: boolean; error?: string }> {
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
  let updatedContractId: string | undefined;

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
    if (updatedCm?.contract_id) {
      updatedContractId = updatedCm.contract_id;
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

  // 4. Check if this is a dummy simulation project
  if (params.projectId) {
    const { data: proj } = await supabase
      .from("projects")
      .select("id, owner_id, title, category, description, required_skills, is_dummy, banner_url")
      .eq("id", params.projectId)
      .maybeSingle();

    if (proj?.is_dummy) {
      // Auto-approve this simulation milestone!
      if (params.milestoneId) {
        await supabase
          .from("milestones")
          .update({
            status: "completed",
            is_submitted_for_review: false,
          })
          .eq("id", params.milestoneId);
      }
      if (targetId) {
        await supabase
          .from("contract_milestones")
          .update({
            status: "completed",
            completed_at: now,
            is_submitted_for_review: false,
          })
          .or(`id.eq.${targetId},milestone_id.eq.${targetId}`);
      }

      // Unlock next milestone in milestones table
      const { data: allMilestones } = await supabase
        .from("milestones")
        .select("*")
        .eq("project_id", params.projectId)
        .order("sort_order", { ascending: true });

      if (allMilestones) {
        const curIdx = allMilestones.findIndex((m) => m.id === params.milestoneId || m.id === targetId);
        if (curIdx !== -1 && curIdx + 1 < allMilestones.length) {
          const nextMs = allMilestones[curIdx + 1];
          await supabase.from("milestones").update({ status: "in_progress" }).eq("id", nextMs.id);
          await supabase.from("contract_milestones").update({ status: "in_progress" }).eq("milestone_id", nextMs.id);
        }
      }

      // Check if all milestones are completed
      const { data: remainingPending } = await supabase
        .from("milestones")
        .select("id")
        .eq("project_id", params.projectId)
        .neq("status", "completed");

      const isAllCompleted = !remainingPending || remainingPending.length === 0;

      let targetContractId = updatedContractId;
      if (!targetContractId) {
        const { data: cRow } = await supabase
          .from("contracts")
          .select("id, freelancer_id")
          .eq("project_id", params.projectId)
          .maybeSingle();
        targetContractId = cRow?.id;
      }

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const freelancerUserId = currentUser?.id;

      if (isAllCompleted) {
        // Mark contract completed
        if (targetContractId) {
          await supabase
            .from("contracts")
            .update({ status: "completed", progress: 100, completed_at: now })
            .eq("id", targetContractId);
        }

        // Mark project completed
        await supabase
          .from("projects")
          .update({ status: "completed" })
          .eq("id", params.projectId);

        // Update freelancer profile completed_projects count & insert into portfolio_projects
        if (freelancerUserId) {
          const { count } = await supabase
            .from("contracts")
            .select("id", { count: "exact", head: true })
            .eq("freelancer_id", freelancerUserId)
            .eq("status", "completed");

          await supabase
            .from("freelancer_profiles")
            .update({ completed_projects: Math.max(1, count || 1) })
            .eq("user_id", freelancerUserId);

          // Check if already in portfolio_projects to prevent duplicate
          const { data: existingPort } = await supabase
            .from("portfolio_projects")
            .select("id")
            .eq("user_id", freelancerUserId)
            .eq("title", proj.title)
            .maybeSingle();

          if (!existingPort) {
            await supabase.from("portfolio_projects").insert({
              user_id: freelancerUserId,
              contract_id: targetContractId || null,
              title: proj.title,
              category: proj.category || "Simulasi Portofolio",
              description: proj.description || "Hasil pengerjaan proyek simulasi terverifikasi di platform TripleT.",
              image_url: proj.banner_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
              tags: Array.isArray(proj.required_skills) && proj.required_skills.length > 0 ? proj.required_skills : ["Simulasi 0-to-1", "Portofolio Terverifikasi"],
              is_featured: true,
              is_from_dummy: true,
            });
          }

          // Activity log + XP
          logActivity("contract_completed", {
            project_id: params.projectId,
            contract_id: targetContractId,
            action: "simulation_completed",
            xp_earned: 300,
          });

          // Notification
          await createNotification({
            userId: freelancerUserId,
            type: "badge",
            title: "Simulasi Selesai & Masuk Portofolio! 🏆",
            message: `Selamat! Proyek simulasi '${proj.title}' telah selesai dan otomatis tampil di showcase Portofolio Profil Publik Anda!`,
            linkUrl: "/freelancer/profile",
            roleTarget: "freelancer",
          });
        }

        // Comment in milestone chat
        await supabase.from("milestone_comments").insert({
          project_id: params.projectId,
          milestone_id: params.milestoneId || targetId,
          author_name: "Doable! Sandbox Academy",
          role: "client",
          content: `[SIMULASI SELESAI & TERVERIFIKASI 🏆]: Luar biasa! Seluruh milestone proyek simulasi '${proj.title}' telah berhasil diselesaikan. Proyek ini resmi terverifikasi dan otomatis ditambahkan ke showcase Portofolio Profil Publik Anda!`,
        });

        return { success: true, autoApproved: true, allCompleted: true };
      } else {
        // Milestone auto-approved, next unlocked
        await supabase.from("milestone_comments").insert({
          project_id: params.projectId,
          milestone_id: params.milestoneId || targetId,
          author_name: "Doable! Sandbox Academy",
          role: "client",
          content: `[MILESTONE TERVERIFIKASI ✅]: Deliverable milestone ini telah otomatis divalidasi oleh sistem Doable! Sandbox Academy. Milestone diselesaikan dan fase berikutnya telah dibuka!`,
        });

        logActivity("milestone_delivered", {
          project_id: params.projectId,
          milestone_id: params.milestoneId || targetId,
          action: "simulation_milestone_completed",
          xp_earned: 150,
        });

        return { success: true, autoApproved: true, allCompleted: false };
      }
    }

    // Normal client project flow
    // 5. Log activity for heatmap & streak + award 150 Work XP
    logActivity("milestone_delivered", {
      milestone_id: params.milestoneId || targetId,
      xp_earned: 150,
    });

    // 6. Trigger notification for client to review deliverable
    try {
      if (proj?.owner_id) {
        await createNotification({
          userId: proj.owner_id,
          type: "milestone",
          title: "Hasil Karya Milestone Dikirim 🚀",
          message: `Freelancer telah menyerahkan hasil karya untuk proyek '${proj.title || "Proyek"}'. Silakan tinjau dan verifikasi deliverable.`,
          linkUrl: `/client/projects/${params.projectId}`,
          referenceType: "milestone",
          referenceId: params.milestoneId || targetId,
          roleTarget: "customer",
        });
      }
    } catch (notifErr) {
      console.warn("Could not send milestone deliverable notification:", notifErr);
    }
  }

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

  // 7. Trigger notification for freelancer
  try {
    const { data: proj } = await supabase
      .from("projects")
      .select("title, freelancer_id")
      .eq("id", params.projectId)
      .maybeSingle();

    const targetFreelancerId = proj?.freelancer_id;
    if (targetFreelancerId) {
      await createNotification({
        userId: targetFreelancerId,
        type: "payment",
        title: "Milestone Disetujui & Pembayaran Cair! 💰",
        message: `Milestone proyek '${proj.title || "Proyek"}' telah disetujui! Dana sebesar Rp ${params.amount.toLocaleString("id-ID")} telah masuk ke saldo Anda.`,
        linkUrl: "/freelancer/earnings",
        referenceType: "milestone",
        referenceId: params.milestoneId,
        roleTarget: "freelancer",
      });
    }
  } catch (notifErr) {
    console.warn("Could not send milestone approval notification:", notifErr);
  }

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

  // 4. Trigger notification for freelancer
  try {
    const { data: proj } = await supabase
      .from("projects")
      .select("freelancer_id, title")
      .eq("id", params.projectId)
      .maybeSingle();

    if (proj?.freelancer_id) {
      await createNotification({
        userId: proj.freelancer_id,
        type: "milestone",
        title: "Permintaan Revisi Milestone 📝",
        message: `Klien meminta revisi pada milestone proyek '${proj.title || "Proyek"}': "${params.note}".`,
        linkUrl: "/freelancer/my-work",
        referenceType: "milestone",
        referenceId: params.milestoneId,
        roleTarget: "freelancer",
      });
    }
  } catch (notifErr) {
    console.warn("Could not send milestone revision notification:", notifErr);
  }

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
    isDummy: Boolean(proj.is_dummy),
  };
}
