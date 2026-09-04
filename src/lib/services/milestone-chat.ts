import { createClient } from "@/lib/supabase/client";

export interface MilestoneComment {
  id: string;
  authorId?: string;
  author: string;
  role: "freelancer" | "client";
  avatar: string;
  content: string;
  imageUrl?: string;
  time: string;
  createdAt?: string;
}

export function formatChatTime(dateStr?: string): string {
  if (!dateStr) return "Baru saja";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Baru saja";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins} mnt lalu`;

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const timeStr = date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return timeStr;

    return `${date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    })}, ${timeStr}`;
  } catch {
    return "Baru saja";
  }
}

/**
 * Upload chat image attachment to Supabase Storage bucket 'chat-attachments'
 */
export async function uploadChatAttachment(
  file: File,
  projectId: string,
  milestoneId: string
): Promise<{ publicUrl: string | null; error: string | null }> {
  try {
    const supabase = createClient();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `projects/${projectId}/${milestoneId}/${Date.now()}_${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("chat-attachments")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading chat attachment:", uploadError.message);
      return { publicUrl: null, error: uploadError.message };
    }

    const { data } = supabase.storage
      .from("chat-attachments")
      .getPublicUrl(filePath);

    return { publicUrl: data.publicUrl, error: null };
  } catch (err) {
    console.error("Unexpected error in uploadChatAttachment:", err);
    return {
      publicUrl: null,
      error: err instanceof Error ? err.message : "Gagal mengunggah gambar",
    };
  }
}

/**
 * Fetch all comments for a project across all its milestones
 */
export async function fetchProjectMilestoneComments(
  projectId: string
): Promise<Record<string, MilestoneComment[]>> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("milestone_comments")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching milestone comments:", error);
      return {};
    }

    const map: Record<string, MilestoneComment[]> = {};

    (data || []).forEach((row) => {
      const msId = row.milestone_id;
      if (!map[msId]) map[msId] = [];

      map[msId].push({
        id: row.id,
        authorId: row.author_id || undefined,
        author: row.author_name,
        role: row.role as "freelancer" | "client",
        avatar:
          row.author_avatar ||
          "/images/default-avatar.svg",
        content: row.content || "",
        imageUrl: row.image_url || undefined,
        time: formatChatTime(row.created_at),
        createdAt: row.created_at,
      });
    });

    return map;
  } catch (err) {
    console.error("Unexpected error fetching milestone comments:", err);
    return {};
  }
}

/**
 * Send a new milestone chat message (with optional image)
 */
export async function sendMilestoneComment(params: {
  projectId: string;
  milestoneId: string;
  content: string;
  imageFile?: File | null;
  imageUrl?: string | null;
  authorName: string;
  authorAvatar?: string;
  role: "client" | "freelancer";
}): Promise<{ success: boolean; comment?: MilestoneComment; error?: string }> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let finalImageUrl = params.imageUrl || null;

    // 1. If an image file was provided, upload it first
    if (params.imageFile) {
      const uploadRes = await uploadChatAttachment(
        params.imageFile,
        params.projectId,
        params.milestoneId
      );
      if (uploadRes.error) {
        return { success: false, error: uploadRes.error };
      }
      finalImageUrl = uploadRes.publicUrl;
    }

    // 2. Insert comment row into database
    const insertPayload = {
      project_id: params.projectId,
      milestone_id: params.milestoneId,
      author_id: user?.id || null,
      author_name: params.authorName || (params.role === "client" ? "Klien" : "Freelancer"),
      author_avatar: params.authorAvatar || "/images/default-avatar.svg",
      role: params.role,
      content: params.content || "",
      image_url: finalImageUrl,
    };

    const { data, error } = await supabase
      .from("milestone_comments")
      .insert(insertPayload)
      .select()
      .single();

    if (error || !data) {
      console.error("Error inserting milestone comment:", error);
      return { success: false, error: error?.message };
    }

    const createdComment: MilestoneComment = {
      id: data.id,
      authorId: data.author_id || user?.id || undefined,
      author: data.author_name,
      role: data.role as "client" | "freelancer",
      avatar: data.author_avatar || "/images/default-avatar.svg",
      content: data.content || "",
      imageUrl: data.image_url || undefined,
      time: formatChatTime(data.created_at),
      createdAt: data.created_at,
    };

    return { success: true, comment: createdComment };
  } catch (err) {
    console.error("Unexpected error sending milestone comment:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim pesan.",
    };
  }
}

/**
 * Realtime subscription to new milestone comments on this project
 */
export function subscribeToMilestoneComments(
  projectId: string,
  onNewComment: (comment: MilestoneComment, milestoneId: string) => void
): () => void {
  const supabase = createClient();
  const channelName = `milestone_comments_${projectId}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "milestone_comments",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        const row = payload.new as {
          id: string;
          project_id: string;
          milestone_id: string;
          author_id?: string;
          author_name: string;
          author_avatar?: string;
          role: "client" | "freelancer";
          content: string;
          image_url?: string;
          created_at: string;
        };

        const comment: MilestoneComment = {
          id: row.id,
          authorId: row.author_id || undefined,
          author: row.author_name,
          role: row.role,
          avatar: row.author_avatar || "/images/default-avatar.svg",
          content: row.content || "",
          imageUrl: row.image_url || undefined,
          time: formatChatTime(row.created_at),
          createdAt: row.created_at,
        };

        onNewComment(comment, row.milestone_id);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Sync legacy localStorage comments to Supabase if any exist from before
 */
export async function syncLocalCommentsToSupabase(
  projectId: string,
  milestoneIds: string[]
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    for (const msId of milestoneIds) {
      const storageKey = `doable_comments_${projectId}_${msId}`;
      const saved = localStorage.getItem(storageKey);
      if (!saved) continue;

      try {
        const localComments: MilestoneComment[] = JSON.parse(saved);
        if (!Array.isArray(localComments) || localComments.length === 0) continue;

        // Check which ones already exist in Supabase
        const { data: existing } = await supabase
          .from("milestone_comments")
          .select("content, author_name, created_at")
          .eq("project_id", projectId)
          .eq("milestone_id", msId);

        const existingContents = new Set((existing || []).map((e) => `${e.author_name}_${e.content}`));

        for (const lc of localComments) {
          const key = `${lc.author}_${lc.content}`;
          if (!existingContents.has(key)) {
            await supabase.from("milestone_comments").insert({
              project_id: projectId,
              milestone_id: msId,
              author_id: user?.id || null,
              author_name: lc.author,
              author_avatar: lc.avatar,
              role: lc.role,
              content: lc.content,
              image_url: lc.imageUrl || null,
            });
            existingContents.add(key);
          }
        }
      } catch (err) {
        console.warn(`Could not sync local comments for ${msId}:`, err);
      }
    }
  } catch (err) {
    console.warn("Error syncing local comments to Supabase:", err);
  }
}
