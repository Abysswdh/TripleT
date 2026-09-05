import { createClient } from "@/lib/supabase/client";

export interface ProjectMilestone {
  id: string;
  contractMilestoneId?: string;
  title: string;
  amount: string;
  amountNumeric?: number;
  status: "completed" | "in_progress" | "pending";
  dueDate: string;
  deliverables?: string[];
  deliverableFileUrl?: string;
  deliverableNote?: string;
  isSubmittedForReview?: boolean;
  submittedAt?: string;
}

export interface ProjectTaskItem {
  id: string;
  milestoneId?: string;
  name: string;
  status: "planned" | "in_progress" | "completed";
  startDate?: string;
  endDate?: string;
  sortOrder: number;
}

export interface ProjectRecord {
  id: string;
  ownerId: string;
  contractId?: string;
  contractStatus?: string;
  title: string;
  category: string;
  budget: string;
  budgetNumeric: number;
  status: "Hiring" | "In Progress" | "Completed" | "Draft" | "Open";
  proposalsCount: number;
  dueDate: string;
  postedDate: string;
  description: string;
  skills: string[];
  difficulty: "Starter" | "Standard" | "Enterprise";
  isDummy?: boolean;
  objectives?: string[];
  milestones: ProjectMilestone[];
  tasks: ProjectTaskItem[];
  owner?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    location?: string;
    isVerified?: boolean;
  };
  freelancer?: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    location?: string;
    headline?: string;
    rating?: number;
    completedProjects?: number;
    skills?: string[];
  };
}


/**
 * Fetch all available/open projects for the explore & marketplace pages
 */
export async function getOpenProjects(): Promise<ProjectRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      owner:users!owner_id(id, full_name, avatar_url, location, is_verified),
      milestones(*),
      project_tasks(*)
    `)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Error fetching projects from Supabase:", error);
    return [];
  }

  return data.map((p) => formatProjectRecord(p));
}

/**
 * Fetch projects created by a specific client (or current logged in user)
 */
export async function getClientProjects(userId?: string): Promise<ProjectRecord[]> {
  const supabase = createClient();
  let targetUserId = userId;

  if (!targetUserId) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      targetUserId = user.id;
    }
  }

  if (targetUserId) {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        owner:users!owner_id(id, full_name, avatar_url, location),
        milestones(*),
        project_tasks(*),
        proposals(id, bid_amount, bid_display, status, freelancer:users!freelancer_id(id, full_name, avatar_url))
      `)
      .eq("owner_id", targetUserId)
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((p) => formatProjectRecord(p));
    }
  }

  return [];
}

/**
 * Fetch a single project by ID with full milestone & task details
 */
export async function getProjectById(projectId: string): Promise<ProjectRecord | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        owner:users!owner_id(id, full_name, avatar_url, location, is_verified),
        freelancer:users!freelancer_id(
          id,
          full_name,
          avatar_url,
          location,
          freelancer_profile:freelancer_profiles(headline, rating, completed_projects, skills)
        ),
        milestones(*),
        contracts(
          id,
          status,
          contract_milestones(*)
        ),
        project_tasks(*)
      `)
      .eq("id", projectId)
      .single();

    if (!error && data) {
      return formatProjectRecord(data);
    }
  } catch (err) {
    console.warn("Direct project lookup notice:", err);
  }

  // Graceful fallback to search in open projects list
  try {
    const all = await getOpenProjects();
    const found = all.find((p) => p.id === projectId);
    if (found) return found;
  } catch (fallbackErr) {
    console.warn("Fallback project lookup notice:", fallbackErr);
  }

  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formatProjectRecord(p: any): ProjectRecord {
  const statusMap: Record<string, "Hiring" | "In Progress" | "Completed" | "Draft" | "Open"> = {
    hiring: "Hiring",
    in_progress: "In Progress",
    completed: "Completed",
    draft: "Draft",
    open: "Open",
  };

  const status = statusMap[p.status?.toLowerCase()] || "Hiring";

  // Merge milestones with contract_milestones if available
  const contract = Array.isArray(p.contracts) ? p.contracts[0] : p.contracts;
  const contractMilestones = Array.isArray(contract?.contract_milestones) ? contract.contract_milestones : [];

  const milestones: ProjectMilestone[] = (p.milestones || []).map((m: any) => {
    const cm = contractMilestones.find(
      (c: any) => c.milestone_id === m.id || c.title === m.title || c.id === m.id
    );

    const deliverableFileUrl = m.deliverable_file_url || cm?.deliverable_file_url || undefined;
    const deliverableNote = m.deliverable_note || cm?.deliverable_note || undefined;
    const isSubmittedForReview = Boolean(
      m.is_submitted_for_review || cm?.is_submitted_for_review || cm?.status === "submitted" || m.status === "submitted"
    );

    const rawStatus = cm?.status || m.status || "pending";
    const mappedStatus =
      rawStatus === "completed"
        ? "completed"
        : rawStatus === "in_progress" || rawStatus === "submitted"
        ? "in_progress"
        : "pending";

    return {
      id: m.id,
      contractMilestoneId: cm?.id,
      title: m.title,
      amount: m.amount_display || `Rp ${(m.amount || 0).toLocaleString("id-ID")}`,
      amountNumeric: m.amount || cm?.amount || 0,
      status: mappedStatus,
      dueDate: m.phase || `${m.percentage || 50}% phase`,
      deliverables: m.deliverables || [],
      deliverableFileUrl,
      deliverableNote,
      isSubmittedForReview,
      submittedAt: m.submitted_at || cm?.submitted_at || undefined,
    };
  });

  // Format tasks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: ProjectTaskItem[] = (p.project_tasks || []).map((t: any) => ({
    id: t.id,
    milestoneId: t.milestone_id || undefined,
    name: t.name,
    status: (t.status as "planned" | "in_progress" | "completed") || "planned",
    startDate: t.start_date,
    endDate: t.end_date,
    sortOrder: t.sort_order || 0,
  }));

  const flUser = p.freelancer;
  const flProf = Array.isArray(flUser?.freelancer_profile)
    ? flUser?.freelancer_profile[0]
    : flUser?.freelancer_profile;

  const freelancer = flUser
    ? {
        id: flUser.id,
        fullName: flUser.full_name || "Specialist Freelancer",
        avatarUrl: flUser.avatar_url,
        location: flUser.location || "Indonesia",
        headline: flProf?.headline || "Verified Talent",
        rating: Number(flProf?.rating) || 5.0,
        completedProjects: Number(flProf?.completed_projects) || 0,
        skills: flProf?.skills || [],
      }
    : undefined;

  return {
    id: p.id,
    ownerId: p.owner_id,
    contractId: contract?.id,
    contractStatus: contract?.status,
    title: p.title,
    category: p.category || "Web Development",
    budget: p.budget_display || `Rp ${(p.budget_min || 0).toLocaleString("id-ID")}`,
    budgetNumeric: p.budget_min || 0,
    status,
    proposalsCount: p.proposals_count || 0,
    dueDate: p.timeline_days ? `${p.timeline_days} hari` : "14 hari",
    postedDate: p.posted_at ? new Date(p.posted_at).toLocaleDateString("id-ID") : "Baru saja",
    description: p.description || "",
    skills: p.required_skills || [],
    difficulty: (p.difficulty as "Starter" | "Standard" | "Enterprise") || "Starter",
    isDummy: Boolean(p.is_dummy),
    objectives: p.objectives || [],
    milestones,
    tasks,
    owner: p.owner
      ? {
          id: p.owner.id,
          fullName: p.owner.full_name || "Klien Doable!",
          avatarUrl: p.owner.avatar_url,
          location: p.owner.location,
          isVerified: Boolean(p.owner.is_verified),
        }
      : undefined,
    freelancer,
  };
}

/**
 * Universal Sprint Tasks Generator for dynamic Gantt chart initialization
 */
export function generateSprintTasksForCategory(
  category: string,
  durationDays: number = 14,
  baseDate: Date = new Date()
): ProjectTaskItem[] {
  const days = Math.max(3, durationDays);
  const dayMs = 24 * 60 * 60 * 1000;
  const p1Days = Math.max(1, Math.floor(days * 0.4));
  const p2Days = Math.max(1, days - p1Days);

  const d1Start = new Date(baseDate);
  const d1End = new Date(d1Start.getTime() + (p1Days - 1) * dayMs);
  const d2Start = new Date(d1End.getTime() + dayMs);
  const p2Half = Math.max(1, Math.floor(p2Days / 2));
  const d2Mid = new Date(Math.min(d2Start.getTime() + (p2Half - 1) * dayMs, d1Start.getTime() + (days - 1) * dayMs));
  const d3Start = new Date(d2Mid.getTime() + dayMs);
  const d3End = new Date(d1Start.getTime() + (days - 1) * dayMs);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const catLower = (category || "").toLowerCase();

  if (catLower.includes("desain") || catLower.includes("foto") || catLower.includes("video") || catLower.includes("kreatif")) {
    return [
      { id: "gen-1", name: "Pengumpulan Materi & Moodboard Konsep Visual", status: "completed", startDate: fmt(d1Start), endDate: fmt(d1End), sortOrder: 1 },
      { id: "gen-2", name: "Produksi Aset Visual Utama & Layout Draft", status: "in_progress", startDate: fmt(d2Start), endDate: fmt(d2Mid), sortOrder: 2 },
      { id: "gen-3", name: "Penyempurnaan Detail & Ekspor File High-Res Master", status: "planned", startDate: fmt(d3Start), endDate: fmt(d3End), sortOrder: 3 },
    ];
  }

  if (catLower.includes("web") || catLower.includes("engineering") || catLower.includes("aplikasi") || catLower.includes("mobile")) {
    return [
      { id: "gen-1", name: "Arsitektur Sistem, Wireframing & Setup Lingkungan", status: "completed", startDate: fmt(d1Start), endDate: fmt(d1End), sortOrder: 1 },
      { id: "gen-2", name: "Implementasi Fitur Kunci & Integrasi API / Database", status: "in_progress", startDate: fmt(d2Start), endDate: fmt(d2Mid), sortOrder: 2 },
      { id: "gen-3", name: "Testing, Optimasi Responsif & Serah Terima Deployment", status: "planned", startDate: fmt(d3Start), endDate: fmt(d3End), sortOrder: 3 },
    ];
  }

  return [
    { id: "gen-1", name: "Kickoff, Klarifikasi Ruang Lingkup & Draft Awal", status: "completed", startDate: fmt(d1Start), endDate: fmt(d1End), sortOrder: 1 },
    { id: "gen-2", name: "Eksekusi Pengerjaan Inti & Review Iterasi Milestone", status: "in_progress", startDate: fmt(d2Start), endDate: fmt(d2Mid), sortOrder: 2 },
    { id: "gen-3", name: "Finalisasi Hasil Kerja, Quality Check & Serah Terima", status: "planned", startDate: fmt(d3Start), endDate: fmt(d3End), sortOrder: 3 },
  ];
}

