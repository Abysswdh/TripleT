import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/services/activity";

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
    }));
  } catch (err) {
    console.warn("fetchProjectTasks unexpected:", err);
    return [];
  }
}

/**
 * Update task status in database (toggles completed / in_progress).
 * Also falls back to API route and localStorage if needed.
 */
export async function updateProjectTaskStatus(params: {
  taskId: string;
  projectId: string;
  milestoneId: string;
  status: "completed" | "in_progress" | "planned";
  name: string;
  sortOrder?: number;
}): Promise<{ success: boolean; data?: any; error?: string }> {
  const { taskId, projectId, milestoneId, status, name, sortOrder } = params;

  // 1. Cache to localStorage immediately for instant local persistence
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`doable_task_status_${projectId}_${taskId}`, status);
      localStorage.setItem(`doable_task_name_${projectId}_${name}`, status);
    } catch {
      // ignore localStorage quota
    }
  }

  // 2. Try direct Supabase client update if taskId is a real UUID
  const isTempId = !taskId || taskId.startsWith("t-");
  const supabase = createClient();

  if (!isTempId) {
    try {
      const { data, error } = await supabase
        .from("project_tasks")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .maybeSingle();

      if (!error && data) {
        if (status === "completed") {
          logActivity("milestone_delivered", {
            task_id: taskId,
            milestone_id: milestoneId,
            project_id: projectId,
            xp_earned: 50,
          });
        }
        return { success: true, data };
      }
    } catch (dbErr) {
      console.warn("Direct Supabase update notice:", dbErr);
    }
  }

  // 3. Call server API endpoint to handle RLS bypass or insert for new tasks
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
  onTaskUpdated: (task: { id: string; milestoneId: string | null; status: string; name: string }) => void
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
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
