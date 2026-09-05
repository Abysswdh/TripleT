import { createClient } from "@/lib/supabase/client";

export type NotificationType =
  | "proposal"
  | "milestone"
  | "payment"
  | "invitation"
  | "badge"
  | "contract"
  | "review"
  | "chat"
  | "system";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  createdAt: string;
  linkUrl?: string;
  avatar?: string;
  roleTarget?: "customer" | "freelancer" | "all";
  referenceType?: string;
  referenceId?: string;
  data?: Record<string, unknown>;
}

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  linkUrl?: string;
  roleTarget?: "customer" | "freelancer" | "all";
  referenceType?: string;
  referenceId?: string;
  avatar?: string;
  data?: Record<string, unknown>;
}

/**
 * Format ISO timestamp into Indonesian relative time string
 */
export function formatRelativeTime(isoString?: string): string {
  if (!isoString) return "Baru saja";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return "Baru saja";
    if (diffMin < 60) return `${diffMin} menit lalu`;
    if (diffHour < 24) return `${diffHour} jam lalu`;
    if (diffDay === 1) return "Kemarin";
    if (diffDay < 7) return `${diffDay} hari lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
  } catch {
    return "Baru saja";
  }
}

/**
 * Resolve target user ID from parameter, localStorage or supabase auth
 */
async function resolveCurrentUserId(explicitUserId?: string): Promise<string | null> {
  if (explicitUserId) return explicitUserId;

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem("doable_current_user_id");
    if (cached) return cached;
  }

  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.id) return session.user.id;

    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch (err) {
    console.warn("Could not resolve current user ID for notifications:", err);
  }

  return null;
}

/**
 * Fetch all notifications for the current user from Supabase database
 */
export async function getNotifications(
  currentRole?: "customer" | "freelancer",
  explicitUserId?: string
): Promise<AppNotification[]> {
  const supabase = createClient();
  const userId = await resolveCurrentUserId(explicitUserId);

  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      console.error("Error fetching notifications from DB:", error);
      return [];
    }

    // If zero notifications exist, seed a warm welcome notification into database
    if (!data || data.length === 0) {
      await seedInitialWelcomeNotification(userId, currentRole);
      const { data: refreshedData } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      return (refreshedData || []).map((row) => mapRowToNotification(row));
    }

    const mapped = data.map((row) => mapRowToNotification(row));

    if (currentRole) {
      return mapped.filter(
        (n) => !n.roleTarget || n.roleTarget === "all" || n.roleTarget === currentRole
      );
    }

    return mapped;
  } catch (err) {
    console.error("Failed to load notifications:", err);
    return [];
  }
}

/**
 * Get count of unread notifications for a user
 */
export async function getUnreadCount(explicitUserId?: string): Promise<number> {
  const supabase = createClient();
  const userId = await resolveCurrentUserId(explicitUserId);
  if (!userId) return 0;

  try {
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.warn("Error getting unread notification count:", error);
      return 0;
    }
    return count || 0;
  } catch {
    return 0;
  }
}

/**
 * Create and insert a new notification into Supabase database
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<{ success: boolean; data?: AppNotification; error?: string }> {
  const supabase = createClient();

  try {
    const payloadData: Record<string, unknown> = {
      ...(params.data || {}),
      avatar: params.avatar || params.data?.avatar || null,
      role_target: params.roleTarget || "all",
    };

    // 1. Preferred: RPC function with SECURITY DEFINER (bypasses RLS SELECT recipient constraint)
    const { data: rpcData, error: rpcError } = await supabase.rpc("create_app_notification", {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title,
      p_body: params.message,
      p_link_url: params.linkUrl || null,
      p_reference_type: params.referenceType || null,
      p_reference_id: params.referenceId || null,
      p_data: payloadData,
    });

    if (!rpcError && rpcData) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notification-updated"));
      }
      return {
        success: true,
        data: mapRowToNotification(rpcData),
      };
    }

    // 2. Fallback: Direct table insert without select (avoids RLS select rejection)
    const { error: insertError } = await supabase.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      body: params.message,
      link_url: params.linkUrl || null,
      reference_type: params.referenceType || null,
      reference_id: params.referenceId || null,
      data: payloadData,
      is_read: false,
    });

    if (insertError) {
      console.error("Error creating notification:", insertError);
      return { success: false, error: insertError.message };
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notification-updated"));
    }

    return {
      success: true,
      data: {
        id: `notif-${Date.now()}`,
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type,
        read: false,
        timestamp: "Baru saja",
        createdAt: new Date().toISOString(),
        linkUrl: params.linkUrl,
        roleTarget: params.roleTarget || "all",
      },
    };
  } catch (err) {
    console.error("Failed to create notification:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Mark a single notification as read in database
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      console.warn("Could not mark notification as read in DB:", error);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notification-updated"));
    }
  } catch (e) {
    console.warn("Could not mark notification as read:", e);
  }
}

/**
 * Mark all notifications as read for current user in database
 */
export async function markAllNotificationsAsRead(explicitUserId?: string): Promise<void> {
  const supabase = createClient();
  const userId = await resolveCurrentUserId(explicitUserId);
  if (!userId) return;

  try {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.warn("Could not mark all notifications as read in DB:", error);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notification-updated"));
    }
  } catch (e) {
    console.warn("Could not mark all notifications as read:", e);
  }
}

/**
 * Delete a single notification from database
 */
export async function deleteNotification(id: string): Promise<void> {
  const supabase = createClient();

  try {
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) {
      console.warn("Could not delete notification:", error);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notification-updated"));
    }
  } catch (e) {
    console.warn("Failed to delete notification:", e);
  }
}

/**
 * Clear all notifications for the current user from database
 */
export async function clearAllNotifications(explicitUserId?: string): Promise<void> {
  const supabase = createClient();
  const userId = await resolveCurrentUserId(explicitUserId);
  if (!userId) return;

  try {
    const { error } = await supabase.from("notifications").delete().eq("user_id", userId);
    if (error) {
      console.warn("Could not clear notifications from DB:", error);
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("notification-updated"));
    }
  } catch (e) {
    console.warn("Could not clear notifications:", e);
  }
}

/**
 * Realtime subscription to new notifications for current user
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notif: AppNotification) => void
): () => void {
  const supabase = createClient();

  const channel = supabase
    .channel(`realtime-notifications-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        if (payload.new) {
          const formatted = mapRowToNotification(payload.new);
          onNewNotification(formatted);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("notification-updated"));
          }
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Synchronous backward-compatible wrapper for adding notification
 */
export function addNotification(
  notification: Omit<AppNotification, "id" | "timestamp" | "read" | "createdAt" | "userId"> & {
    userId?: string;
  }
): void {
  (async () => {
    const resolvedUserId = await resolveCurrentUserId(notification.userId);
    if (!resolvedUserId) return;

    await createNotification({
      userId: resolvedUserId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      linkUrl: notification.linkUrl,
      roleTarget: notification.roleTarget,
      avatar: notification.avatar,
      data: notification.data,
    });
  })();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRowToNotification(row: any): AppNotification {
  const data = row.data || {};
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: row.title || "Notifikasi",
    message: row.body || "",
    type: (row.type as NotificationType) || "system",
    read: Boolean(row.is_read),
    timestamp: formatRelativeTime(row.created_at),
    createdAt: row.created_at || new Date().toISOString(),
    linkUrl: row.link_url || data.link_url || undefined,
    avatar: data.avatar || undefined,
    roleTarget: (data.role_target as "customer" | "freelancer" | "all") || "all",
    referenceType: row.reference_type || undefined,
    referenceId: row.reference_id ? String(row.reference_id) : undefined,
    data: data,
  };
}

/**
 * Helper to seed initial welcome notification for a new user
 */
async function seedInitialWelcomeNotification(
  userId: string,
  role?: "customer" | "freelancer"
): Promise<void> {
  const supabase = createClient();
  const isFreelancer = role === "freelancer";

  try {
    await supabase.from("notifications").insert([
      {
        user_id: userId,
        type: "system",
        title: isFreelancer ? "Selamat Datang di Doable! 👋" : "Mulai Proyek Pertama Anda di Doable! 🚀",
        body: isFreelancer
          ? "Profil freelancer Anda siap digunakan. Lengkapi skill & portfolio Anda untuk menarik klien terbaik."
          : "Publikasikan proyek Anda atau cari talenta terverifikasi dengan jaminan rekber escrow aman.",
        link_url: isFreelancer ? "/freelancer/skills" : "/client/projects",
        data: {
          role_target: role || "all",
        },
        is_read: false,
      },
    ]);
  } catch (err) {
    console.warn("Could not seed welcome notification:", err);
  }
}
