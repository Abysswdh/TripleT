import { createClient } from "@/lib/supabase/client";

export type ActivityType =
  | "quiz_completed"
  | "quiz_attempted"
  | "resource_studied"
  | "proposal_submitted"
  | "milestone_delivered"
  | "contract_completed"
  | "profile_updated"
  | "daily_checkin";

export interface ActivityEntry {
  user_id: string;
  activity_type: ActivityType;
  metadata?: Record<string, unknown>;
  occurred_at?: string; // ISO string, defaults to now()
}

export interface DailyContribution {
  activity_date: string; // "YYYY-MM-DD"
  contribution_count: number;
}

export interface HeatmapData {
  weeks: Array<Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }>>;
  totalContributions: number;
  streakDays: number;
  monthLabels: Array<{ label: string; weekIndex: number }>;
  activeDates: string[];
}

export interface XPBreakdown {
  quizXP: number;
  workXP: number;
  learningXP: number;
  totalXP: number;
}

const LOCAL_STORAGE_LEARNED_RESOURCES_KEY = "doable_learned_resources";

// ============================================================================
// LOG ACTIVITY & ACCUMULATE XP
// ============================================================================
export async function logActivity(
  type: ActivityType,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Insert activity log row
    await supabase.from("user_activity_log").insert({
      user_id: user.id,
      activity_type: type,
      metadata,
    });

    // 2. If xp_earned is present, update user metadata XP in Supabase
    const xpEarned = (metadata.xp_earned as number) || 0;
    if (xpEarned > 0) {
      const currentXp = (user.user_metadata?.xp as number) || 0;
      const newTotal = currentXp + xpEarned;

      await supabase.auth.updateUser({
        data: {
          xp: newTotal,
        },
      });

      // Broadcast XP update across UI components
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("xp-updated", {
            detail: {
              xpEarned,
              newTotalXp: newTotal,
              type,
              metadata,
            },
          })
        );
      }
    }
  } catch (err) {
    // Non-fatal — activity logging should never break main flows
    console.warn("[activity] Failed to log activity:", err);
  }
}

// ============================================================================
// LEARNING RESOURCES REWARD SYSTEM (+25 XP per material)
// ============================================================================
export function getLearnedResources(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_LEARNED_RESOURCES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function markResourceStudied(
  quizId: string,
  resourceUrl: string,
  resourceTitle: string
): Promise<{ success: boolean; earnedXp: number }> {
  if (typeof window === "undefined") return { success: false, earnedXp: 0 };
  try {
    const learned = getLearnedResources();
    const resourceKey = `${quizId}:${resourceUrl}`;

    // If already claimed, don't double count XP
    if (learned.includes(resourceKey)) {
      return { success: false, earnedXp: 0 };
    }

    learned.push(resourceKey);
    localStorage.setItem(LOCAL_STORAGE_LEARNED_RESOURCES_KEY, JSON.stringify(learned));

    const XP_PER_RESOURCE = 25;

    // Log activity to database + award XP
    await logActivity("resource_studied", {
      quiz_id: quizId,
      resource_url: resourceUrl,
      resource_title: resourceTitle,
      xp_earned: XP_PER_RESOURCE,
    });

    return { success: true, earnedXp: XP_PER_RESOURCE };
  } catch (err) {
    console.warn("[activity] Failed to mark resource studied:", err);
    return { success: false, earnedXp: 0 };
  }
}

// ============================================================================
// CALCULATE XP ACCUMULATION BREAKDOWN (Quiz + Work + Learning)
// ============================================================================
export async function fetchUserXPBreakdown(): Promise<XPBreakdown> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Default seeded breakdown values for rich initial experience
    let quizXP = 750; // Next.js (350) + FastAPI (400)
    let workXP = 1500; // Milestones / projects
    let learningXP = 200; // 8 learning modules

    if (user) {
      const { data: logs } = await supabase
        .from("user_activity_log")
        .select("activity_type, metadata")
        .eq("user_id", user.id);

      if (logs && logs.length > 0) {
        let q = 0;
        let w = 0;
        let l = 0;

        for (const log of logs) {
          const xp = (log.metadata as { xp_earned?: number })?.xp_earned || 0;
          if (log.activity_type.startsWith("quiz_")) {
            q += xp;
          } else if (
            log.activity_type === "milestone_delivered" ||
            log.activity_type === "contract_completed" ||
            log.activity_type === "proposal_submitted"
          ) {
            w += xp;
          } else if (log.activity_type === "resource_studied") {
            l += xp;
          }
        }

        if (q > 0 || w > 0 || l > 0) {
          quizXP = q;
          workXP = w;
          learningXP = l;
        }
      }
    }

    const totalXP = quizXP + workXP + learningXP;
    return { quizXP, workXP, learningXP, totalXP };
  } catch (err) {
    console.warn("[activity] Failed to fetch XP breakdown:", err);
    return {
      quizXP: 750,
      workXP: 1500,
      learningXP: 200,
      totalXP: 2450,
    };
  }
}

// ============================================================================
// FETCH HEATMAP — returns 16 weeks of contribution data for the dashboard
// ============================================================================
export async function fetchHeatmapData(): Promise<HeatmapData> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return buildEmptyHeatmap();

    // Query: group by date for last 16 weeks
    const { data, error } = await supabase
      .from("user_activity_log")
      .select("occurred_at")
      .eq("user_id", user.id)
      .gte(
        "occurred_at",
        new Date(Date.now() - 16 * 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order("occurred_at", { ascending: true });

    if (error || !data) return buildEmptyHeatmap();

    // Build count-per-day map  { "2025-09-01": 3, ... }
    const countByDate: Record<string, number> = {};
    for (const row of data) {
      const date = row.occurred_at.slice(0, 10); // "YYYY-MM-DD"
      countByDate[date] = (countByDate[date] || 0) + 1;
    }

    return buildHeatmapFromCounts(countByDate);
  } catch (err) {
    console.warn("[activity] Failed to fetch heatmap:", err);
    return buildEmptyHeatmap();
  }
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

function buildHeatmapFromCounts(
  countByDate: Record<string, number>
): HeatmapData {
  const NUM_WEEKS = 16;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() - dayOfWeek + 6);

  const weeks: HeatmapData["weeks"] = [];
  const monthSeen = new Set<string>();
  const monthLabels: HeatmapData["monthLabels"] = [];

  let totalContributions = 0;

  for (let w = NUM_WEEKS - 1; w >= 0; w--) {
    const weekDays: HeatmapData["weeks"][0] = [];

    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + (6 - d);
      const date = new Date(endDate);
      date.setDate(endDate.getDate() - dayOffset);

      const dateStr = date.toISOString().slice(0, 10);
      const count = countByDate[dateStr] || 0;
      totalContributions += count;

      const level =
        count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;

      weekDays.push({ date: dateStr, count, level: level as 0 | 1 | 2 | 3 | 4 });

      const monthKey = dateStr.slice(0, 7);
      if (!monthSeen.has(monthKey)) {
        monthSeen.add(monthKey);
        monthLabels.push({
          label: date.toLocaleDateString("id-ID", { month: "short" }),
          weekIndex: NUM_WEEKS - 1 - w,
        });
      }
    }

    weeks.push(weekDays);
  }

  weeks.reverse();

  // Calculate streak
  const todayStr = today.toISOString().slice(0, 10);
  let streakDays = 0;
  const checkDate = new Date(today);
  while (true) {
    const ds = checkDate.toISOString().slice(0, 10);
    if (ds > todayStr) {
      checkDate.setDate(checkDate.getDate() - 1);
      continue;
    }
    if (!countByDate[ds] && ds !== todayStr) break;
    if (countByDate[ds]) streakDays++;
    checkDate.setDate(checkDate.getDate() - 1);
    if (streakDays > 365) break;
  }

  const activeDates = Object.keys(countByDate).filter((k) => (countByDate[k] || 0) > 0);

  return { weeks, totalContributions, streakDays, monthLabels, activeDates };
}

function buildEmptyHeatmap(): HeatmapData {
  const NUM_WEEKS = 16;
  const weeks: HeatmapData["weeks"] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let w = NUM_WEEKS - 1; w >= 0; w--) {
    const weekDays: HeatmapData["weeks"][0] = [];
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + (6 - d);
      const date = new Date(today);
      date.setDate(today.getDate() - dayOffset);
      weekDays.push({ date: date.toISOString().slice(0, 10), count: 0, level: 0 });
    }
    weeks.push(weekDays);
  }
  weeks.reverse();

  const monthLabels: HeatmapData["monthLabels"] = [];
  const seen = new Set<string>();
  weeks.forEach((week, wi) => {
    week.forEach((day) => {
      const mk = day.date.slice(0, 7);
      if (!seen.has(mk)) {
        seen.add(mk);
        const d = new Date(day.date);
        monthLabels.push({
          label: d.toLocaleDateString("id-ID", { month: "short" }),
          weekIndex: wi,
        });
      }
    });
  });

  return { weeks, totalContributions: 0, streakDays: 0, monthLabels, activeDates: [] };
}
