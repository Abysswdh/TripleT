import { createClient } from "@/lib/supabase/client";

export interface ProjectMilestone {
  id: string;
  title: string;
  amount: string;
  amountNumeric?: number;
  status: "completed" | "in_progress" | "pending";
  dueDate: string;
  deliverables?: string[];
}

export interface ProjectTaskItem {
  id: string;
  name: string;
  status: "planned" | "in_progress" | "completed";
  startDate?: string;
  endDate?: string;
  sortOrder: number;
}

export interface ProjectRecord {
  id: string;
  ownerId: string;
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
      owner:users!owner_id(id, full_name, avatar_url, location),
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

  // Fallback to active projects if client has not posted one yet
  const { data: allProjs } = await supabase
    .from("projects")
    .select(`
      *,
      owner:users!owner_id(id, full_name, avatar_url, location),
      milestones(*),
      project_tasks(*)
    `)
    .limit(5)
    .order("created_at", { ascending: false });

  if (allProjs && allProjs.length > 0) {
    return allProjs.map((p) => formatProjectRecord(p));
  }

  return [];
}

/**
 * Fetch a single project by ID with full milestone & task details
 */
export async function getProjectById(projectId: string): Promise<ProjectRecord | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("projects")
    .select(`
      *,
      owner:users!owner_id(id, full_name, avatar_url, location),
      milestones(*),
      project_tasks(*)
    `)
    .eq("id", projectId)
    .single();

  if (error || !data) {
    console.error("Error fetching project by ID:", error);
    return null;
  }

  return formatProjectRecord(data);
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

  // Format milestones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const milestones: ProjectMilestone[] = (p.milestones || []).map((m: any) => ({
    id: m.id,
    title: m.title,
    amount: m.amount_display || `Rp ${(m.amount || 0).toLocaleString("id-ID")}`,
    amountNumeric: m.amount || 0,
    status: (m.status as "completed" | "in_progress" | "pending") || "pending",
    dueDate: m.phase || `${m.percentage || 50}% phase`,
    deliverables: m.deliverables || [],
  }));

  // Format tasks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: ProjectTaskItem[] = (p.project_tasks || []).map((t: any) => ({
    id: t.id,
    name: t.name,
    status: (t.status as "planned" | "in_progress" | "completed") || "planned",
    startDate: t.start_date,
    endDate: t.end_date,
    sortOrder: t.sort_order || 0,
  }));

  return {
    id: p.id,
    ownerId: p.owner_id,
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
        }
      : undefined,
  };
}
