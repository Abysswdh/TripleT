import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/services/activity";

export type EffectiveTaskStatus = "planned" | "in_progress" | "completed" | "late" | "cancelled";

export interface ProjectTaskRecord {
  id: string;
  projectId: string;
  milestoneId: string | null;
  name: string;
  description?: string | null;
  status: "planned" | "in_progress" | "completed";
  startDate?: string | null;
  endDate?: string | null;
  sortOrder: number;
  progress?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  isCancelled?: boolean;
  cancelReason?: string | null;
  dependencyTaskId?: string | null;
}

/**
 * Compute the effective status of a task taking into account dates,
 * cancellation, and completion (Late, Cancelled, In Progress, Completed, Planned)
 */
export function computeEffectiveStatus(task: {
  status?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  isCancelled?: boolean;
}): {
  status: EffectiveTaskStatus;
  isLate: boolean;
  daysLate: number;
  label: string;
  color: string;
  badgeBg: string;
  badgeText: string;
} {
  if (task.isCancelled) {
    return {
      status: "cancelled",
      isLate: false,
      daysLate: 0,
      label: "Dibatalkan",
      color: "#6b7280", // Gray
      badgeBg: "bg-muted text-muted-foreground border-border",
      badgeText: "text-muted-foreground",
    };
  }

  if (task.status === "completed") {
    return {
      status: "completed",
      isLate: false,
      daysLate: 0,
      label: "Selesai",
      color: "#10b981", // Emerald
      badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      badgeText: "text-emerald-600 dark:text-emerald-400",
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (task.endDate) {
    const end = new Date(task.endDate);
    end.setHours(23, 59, 59, 999);

    if (end < now) {
      const diffTime = Math.abs(now.getTime() - end.getTime());
      const daysLate = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return {
        status: "late",
        isLate: true,
        daysLate,
        label: `Terlambat ${daysLate} Hari`,
        color: "#ef4444", // Red
        badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
        badgeText: "text-rose-600 dark:text-rose-400",
      };
    }
  }

  if (task.startDate) {
    const start = new Date(task.startDate);
    start.setHours(0, 0, 0, 0);

    if (start <= now) {
      return {
        status: "in_progress",
        isLate: false,
        daysLate: 0,
        label: "Sedang Berjalan",
        color: "#3b82f6", // Blue
        badgeBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        badgeText: "text-blue-600 dark:text-blue-400",
      };
    }
  }

  return {
    status: "planned",
    isLate: false,
    daysLate: 0,
    label: "Direncanakan",
    color: "#8b5cf6", // Purple
    badgeBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    badgeText: "text-purple-600 dark:text-purple-400",
  };
}

/**
 * Fetch all tasks for a given project from Supabase project_tasks table
 */
export async function fetchProjectTasks(projectId: string): Promise<ProjectTaskRecord[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("project_tasks")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error || !data) {
      console.warn("fetchProjectTasks notice:", error);
      return [];
    }

    return data.map((t) => ({
      id: t.id,
      projectId: t.project_id,
      milestoneId: t.milestone_id,
      name: t.name,
      description: t.description,
      status: (t.status as "planned" | "in_progress" | "completed") || "planned",
      startDate: t.start_date,
      endDate: t.end_date,
      sortOrder: t.sort_order || 0,
      progress: typeof t.progress === "number" ? t.progress : t.status === "completed" ? 100 : 0,
      priority: t.priority || "medium",
      isCancelled: Boolean(t.is_cancelled),
      cancelReason: t.cancel_reason,
      dependencyTaskId: t.dependency_task_id,
    }));
  } catch (err) {
    console.warn("fetchProjectTasks unexpected:", err);
    return [];
  }
}

/**
 * Update task status, dates, progress, or cancellation in database.
 * Also falls back to API route and localStorage if needed.
 */
export async function updateProjectTaskStatus(params: {
  taskId: string;
  projectId: string;
  milestoneId: string;
  status?: "completed" | "in_progress" | "planned";
  name: string;
  sortOrder?: number;
  startDate?: string;
  endDate?: string;
  progress?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  isCancelled?: boolean;
  cancelReason?: string;
  dependencyTaskId?: string;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const {
    taskId,
    projectId,
    milestoneId,
    status,
    name,
    sortOrder,
    startDate,
    endDate,
    progress,
    priority,
    isCancelled,
    cancelReason,
    dependencyTaskId,
  } = params;

  // 1. Cache to localStorage immediately for instant local persistence
  if (typeof window !== "undefined") {
    try {
      if (status) {
        localStorage.setItem(`doable_task_status_${projectId}_${taskId}`, status);
        localStorage.setItem(`doable_task_name_${projectId}_${name}`, status);
      }
      if (typeof progress === "number") {
        localStorage.setItem(`doable_task_prog_${projectId}_${taskId}`, String(progress));
      }
      if (isCancelled !== undefined) {
        localStorage.setItem(`doable_task_canc_${projectId}_${taskId}`, String(isCancelled));
      }
      if (startDate) {
        localStorage.setItem(`doable_task_start_${projectId}_${taskId}`, startDate);
      }
      if (endDate) {
        localStorage.setItem(`doable_task_end_${projectId}_${taskId}`, endDate);
      }
    } catch {
      // ignore localStorage quota
    }
  }

  // 2. Call server API endpoint to handle updates, inserts, and RLS bypass
  try {
    const res = await fetch("/api/tasks/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskId,
        projectId,
        milestoneId,
        status,
        name,
        sortOrder: sortOrder || 1,
        startDate,
        endDate,
        progress,
        priority,
        isCancelled,
        cancelReason,
        dependencyTaskId,
      }),
    });

    const json = await res.json();
    if (json.success && json.data) {
      if (status === "completed") {
        logActivity("milestone_delivered", {
          task_id: json.data.id || taskId,
          milestone_id: milestoneId,
          project_id: projectId,
          xp_earned: 50,
        });
      }
      return { success: true, data: json.data };
    }
    return { success: false, error: json.error || "Gagal memperbarui status tugas" };
  } catch (apiErr: any) {
    console.error("API update error:", apiErr);
    return { success: false, error: apiErr.message };
  }
}

/**
 * Subscribe to realtime changes on project_tasks table
 */
export function subscribeToProjectTasks(
  projectId: string,
  onTaskUpdated: (task: {
    id: string;
    milestoneId: string | null;
    status: string;
    name: string;
    startDate?: string | null;
    endDate?: string | null;
    progress?: number;
    priority?: "low" | "medium" | "high" | "urgent";
    isCancelled?: boolean;
    cancelReason?: string | null;
  }) => void
) {
  const supabase = createClient();
  const channel = supabase
    .channel(`project-tasks-sync-${projectId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "project_tasks",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const row = (payload.new || payload.old) as any;
        if (row && row.id) {
          onTaskUpdated({
            id: row.id,
            milestoneId: row.milestone_id,
            status: row.status,
            name: row.name,
            startDate: row.start_date,
            endDate: row.end_date,
            progress: row.progress,
            priority: row.priority,
            isCancelled: row.is_cancelled,
            cancelReason: row.cancel_reason,
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
