import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { taskId, projectId, milestoneId, status, name, sortOrder } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const isTempId = !taskId || String(taskId).startsWith("t-");

    if (!isTempId) {
      const { data, error } = await supabase
        .from("project_tasks")
        .update({
          status: status || "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .select()
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ success: true, data });
      }

      if (error) {
        console.warn("Direct update error in /api/tasks/toggle:", error);
      }
    }

    // If task was not found or is temp ID, check if a task with the same name and milestone already exists
    if (milestoneId && name) {
      const { data: existing } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("project_id", projectId)
        .eq("milestone_id", milestoneId)
        .eq("name", name)
        .maybeSingle();

      if (existing) {
        const { data: updated, error: updateErr } = await supabase
          .from("project_tasks")
          .update({
            status: status || "in_progress",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (!updateErr && updated) {
          return NextResponse.json({ success: true, data: updated });
        }
      }
    }

    // Insert new task into project_tasks
    const { data: inserted, error: insertErr } = await supabase
      .from("project_tasks")
      .insert({
        project_id: projectId,
        milestone_id: milestoneId || null,
        name: name || "Tugas Checklist",
        status: status || "in_progress",
        sort_order: sortOrder || 1,
        is_auto_generated: false,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("Error inserting project_task:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: inserted });
  } catch (err: any) {
    console.error("Unexpected error in /api/tasks/toggle:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
