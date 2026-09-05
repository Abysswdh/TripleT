import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isMissingColumnError(err: any): boolean {
  if (!err) return false;
  if (err.code === "42703" || err.code === "PGRST204") return true;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("schema cache") ||
    msg.includes("column") ||
    msg.includes("could not find")
  );
}

const isValidUuid = (val: any): boolean =>
  typeof val === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export async function POST(req: Request) {
  try {
    const body = await req.json();
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
    } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    // Gracefully handle mock/demo projects without database UUID
    if (!isValidUuid(projectId)) {
      return NextResponse.json({
        success: true,
        data: {
          id: taskId || `task-${Date.now()}`,
          project_id: projectId,
          milestone_id: milestoneId || null,
          name: name || "Tugas Timeline Gantt",
          status: status || "in_progress",
          start_date: startDate || null,
          end_date: endDate || null,
          progress: progress ?? (status === "completed" ? 100 : 0),
          priority: priority || "medium",
          is_cancelled: Boolean(isCancelled),
          cancel_reason: cancelReason || null,
        },
      });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const dbMilestoneId = isValidUuid(milestoneId) ? milestoneId : null;
    const dbDependencyId = isValidUuid(dependencyTaskId) ? dependencyTaskId : null;

    const nowIso = new Date().toISOString();
    const fullPayload: Record<string, any> = {
      updated_at: nowIso,
    };
    if (status !== undefined) fullPayload.status = status;
    if (name !== undefined) fullPayload.name = name;
    if (startDate !== undefined) fullPayload.start_date = startDate;
    if (endDate !== undefined) fullPayload.end_date = endDate;
    if (sortOrder !== undefined) fullPayload.sort_order = sortOrder;
    if (progress !== undefined) fullPayload.progress = progress;
    if (priority !== undefined) fullPayload.priority = priority;
    if (isCancelled !== undefined) fullPayload.is_cancelled = isCancelled;
    if (cancelReason !== undefined) fullPayload.cancel_reason = cancelReason;
    if (dbDependencyId !== undefined) fullPayload.dependency_task_id = dbDependencyId;
    if (dbMilestoneId !== undefined) fullPayload.milestone_id = dbMilestoneId;

    // Safe payload excluding migration 017 columns in case they are not yet migrated in Supabase
    const safePayload: Record<string, any> = {
      updated_at: nowIso,
    };
    if (status !== undefined) safePayload.status = status;
    if (name !== undefined) safePayload.name = name;
    if (startDate !== undefined) safePayload.start_date = startDate;
    if (endDate !== undefined) safePayload.end_date = endDate;
    if (sortOrder !== undefined) safePayload.sort_order = sortOrder;
    if (dbMilestoneId !== undefined) safePayload.milestone_id = dbMilestoneId;

    const isTempId = !taskId || !isValidUuid(taskId) || String(taskId).startsWith("t-") || String(taskId).startsWith("task-") || String(taskId).startsWith("gantt-");

    if (!isTempId) {
      // 1. Try updating with full payload
      let { data, error } = await supabase
        .from("project_tasks")
        .update(fullPayload)
        .eq("id", taskId)
        .select()
        .maybeSingle();

      // If column does not exist, retry with safe payload
      if (isMissingColumnError(error)) {
        const retry = await supabase
          .from("project_tasks")
          .update(safePayload)
          .eq("id", taskId)
          .select()
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (!error && data) {
        return NextResponse.json({
          success: true,
          data: {
            ...data,
            progress: progress ?? data.progress ?? (data.status === "completed" ? 100 : 0),
            is_cancelled: isCancelled ?? data.is_cancelled ?? false,
            priority: priority ?? data.priority ?? "medium",
          },
        });
      }
    }

    // 2. Check if a task with the same name and milestone already exists
    if (milestoneId && name) {
      const { data: existing } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .eq("milestone_id", milestoneId)
        .eq("name", name)
        .maybeSingle();

      if (existing) {
        let { data: updated, error: updateErr } = await supabase
          .from("project_tasks")
          .update(fullPayload)
          .eq("id", existing.id)
          .select()
          .single();

        if (isMissingColumnError(updateErr)) {
          const retry = await supabase
            .from("project_tasks")
            .update(safePayload)
            .eq("id", existing.id)
            .select()
            .single();
          updated = retry.data;
          updateErr = retry.error;
        }

        if (!updateErr && updated) {
          return NextResponse.json({
            success: true,
            data: {
              ...updated,
              progress: progress ?? updated.progress ?? (updated.status === "completed" ? 100 : 0),
              is_cancelled: isCancelled ?? updated.is_cancelled ?? false,
              priority: priority ?? updated.priority ?? "medium",
            },
          });
        }
      }
    }

    // 3. Insert new task into project_tasks
    let insertPayload: Record<string, any> = {
      project_id: projectId,
      milestone_id: dbMilestoneId,
      name: name || "Tugas Timeline Gantt",
      status: status || "in_progress",
      start_date: startDate || null,
      end_date: endDate || null,
      sort_order: sortOrder || 1,
      is_auto_generated: false,
    };

    let { data: inserted, error: insertErr } = await supabase
      .from("project_tasks")
      .insert({
        ...insertPayload,
        progress: progress ?? (status === "completed" ? 100 : 0),
        priority: priority || "medium",
        is_cancelled: Boolean(isCancelled),
        cancel_reason: cancelReason || null,
      })
      .select()
      .single();

    if (isMissingColumnError(insertErr)) {
      const retry = await supabase
        .from("project_tasks")
        .insert(insertPayload)
        .select()
        .single();
      inserted = retry.data;
      insertErr = retry.error;
    }

    if (insertErr) {
      console.error("Error inserting project_task:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...inserted,
        progress: progress ?? inserted?.progress ?? (status === "completed" ? 100 : 0),
        is_cancelled: isCancelled ?? inserted?.is_cancelled ?? false,
        priority: priority ?? inserted?.priority ?? "medium",
      },
    });
  } catch (err: any) {
    console.error("Unexpected error in /api/tasks/toggle:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
