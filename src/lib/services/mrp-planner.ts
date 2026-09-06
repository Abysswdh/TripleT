import { createClient } from "@/lib/supabase/client";
import { formatLocalDateKey, logActivity } from "@/lib/services/activity";
import { addNotification } from "@/lib/services/notifications";

export interface ScheduledTaskItem {
  id: string;
  title: string;
  description: string;
  category: "project_milestone" | "project_task" | "profile" | "skill_quiz";
  dateKey: string; // YYYY-MM-DD
  status: "pending" | "completed";
  isOverdue: boolean;
  daysLate: number;
  priority: "urgent" | "high" | "medium" | "low";
  estimatedMinutes: number;
  xpReward: number;
  actionType: "checkin" | "submit" | "link" | "quiz";
  actionUrl?: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    clientName?: string;
    milestoneId?: string;
    taskId?: string;
  };
}

export interface DayWorkload {
  dateKey: string; // YYYY-MM-DD
  dayLabel: string; // "Hari Ini", "Besok", "Senin", etc.
  dateNumber: number;
  totalTasks: number;
  completedTasks: number;
  totalMinutes: number;
  capacityMinutes: number;
  tasks: ScheduledTaskItem[];
  hasOverdue: boolean;
}

export interface MRPPlannerResult {
  weeklyAvailability: "part_time" | "semi_full" | "full_time" | "flexible";
  dailyCapacityHours: number;
  aiInsight: string;
  aiTone: "urgent" | "balanced" | "relaxed";
  days: Record<string, DayWorkload>; // keyed by dateKey YYYY-MM-DD
  overdueCount: number;
  todayTasksCount: number;
}

const STORAGE_COMPLETED_TASKS_KEY = "doable_mrp_completed_tasks";

/**
 * Get user capacity in hours per day based on onboarding availability
 */
export function getDailyCapacityHours(availability?: string | null): number {
  switch (availability) {
    case "part_time": // < 15 hrs / week
      return 3;
    case "semi_full": // 15 - 30 hrs / week
      return 5;
    case "full_time": // > 30 hrs / week
      return 7;
    case "flexible":
    default:
      return 4;
  }
}

/**
 * Get stored completed tasks for persistence across reloads
 */
export function getStoredCompletedTaskIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETED_TASKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Mark a task as completed in local storage & log activity
 */
export function setTaskCompletedInStorage(taskId: string, completed: boolean): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredCompletedTaskIds();
    let updated: string[];
    if (completed) {
      updated = Array.from(new Set([...current, taskId]));
    } else {
      updated = current.filter((id) => id !== taskId);
    }
    localStorage.setItem(STORAGE_COMPLETED_TASKS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to store completed task:", err);
  }
}

/**
 * Main MRP & AI Engine: Gathers all real data, applies workload leveling,
 * detects overdue items, and integrates profile & quiz recommendations.
 */
export async function computeMRPPlan(params: {
  userId?: string;
  contracts?: any[];
  userProfile?: any;
  userAuth?: any;
  availability?: string;
  forceRefreshAI?: boolean;
}): Promise<MRPPlannerResult> {
  const supabase = createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = formatLocalDateKey(today);

  // 1. Resolve User Capacity from Onboarding / Profile
  let availability = params.availability;
  if (!availability && typeof window !== "undefined") {
    try {
      const savedOnboarding = sessionStorage.getItem("doable_onboarding_freelancer") || localStorage.getItem("doable_onboarding_data");
      if (savedOnboarding) {
        const parsed = JSON.parse(savedOnboarding);
        availability = parsed.weeklyAvailability;
      }
    } catch {}
  }
  if (!availability && params.userProfile?.availability) {
    availability = params.userProfile.availability;
  }
  const weeklyAvailability = (availability as any) || "semi_full";
  const dailyCapacityHours = getDailyCapacityHours(weeklyAvailability);
  const dailyCapacityMinutes = dailyCapacityHours * 60;

  // 2. Fetch Active Contracts & Milestones if not provided
  let activeContracts = params.contracts || [];
  if (!params.contracts && params.userId) {
    try {
      const { data } = await supabase
        .from("contracts")
        .select(`
          *,
          project:projects!project_id(id, title, category),
          client:users!client_id(id, full_name, avatar_url),
          contract_milestones(*)
        `)
        .eq("freelancer_id", params.userId)
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (data) activeContracts = data;
    } catch (e) {
      console.warn("Error fetching contracts for MRP:", e);
    }
  }

  // 3. Stagger Profile Completion Gaps (KTP, portfolio, avatar) across sequential days
  const profileTasks: ScheduledTaskItem[] = [];
  const profile = params.userProfile || {};
  const authUser = params.userAuth || {};

  // Compute date keys for Day 0 (today), Day 1, Day 2, etc.
  const getDateKeyAtOffset = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() + offsetDays);
    return formatLocalDateKey(d);
  };

  const isKtpVerified = authUser?.is_verified || profile?.is_verified;
  if (!isKtpVerified) {
    profileTasks.push({
      id: "profile-task-ktp",
      title: "Verifikasi Identitas & KTP",
      description: "Tingkatkan kepercayaan klien & buka badge 'Verified Talent'.",
      category: "profile",
      dateKey: getDateKeyAtOffset(0), // Day 0: Hari Ini
      status: "pending",
      isOverdue: false,
      daysLate: 0,
      priority: "high",
      estimatedMinutes: 15,
      xpReward: 100,
      actionType: "link",
      actionUrl: "/freelancer/settings?tab=profile",
    });
  }

  const hasPortfolio = profile?.portfolio_url || profile?.github_url || profile?.linkedin_url;
  if (!hasPortfolio) {
    profileTasks.push({
      id: "profile-task-portfolio",
      title: "Tambahkan Tautan Portofolio",
      description: "Klien UMKM 3x lebih sering memilih talenta dengan portofolio terhubung.",
      category: "profile",
      dateKey: getDateKeyAtOffset(1), // Day 1: Besok
      status: "pending",
      isOverdue: false,
      daysLate: 0,
      priority: "medium",
      estimatedMinutes: 20,
      xpReward: 75,
      actionType: "link",
      actionUrl: "/freelancer/settings?tab=profile",
    });
  }

  const hasAvatar = authUser?.avatar_url && !authUser.avatar_url.includes("default-avatar");
  if (!hasAvatar) {
    profileTasks.push({
      id: "profile-task-avatar",
      title: "Unggah Foto Profil Profesional",
      description: "Foto ramah dan jelas meningkatkan daya pikat proposal Anda.",
      category: "profile",
      dateKey: getDateKeyAtOffset(3), // Day 3
      status: "pending",
      isOverdue: false,
      daysLate: 0,
      priority: "low",
      estimatedMinutes: 10,
      xpReward: 50,
      actionType: "link",
      actionUrl: "/freelancer/settings?tab=profile",
    });
  }

  // 4. Check Skill Verification / Quiz Gaps (Scheduled for Day 2: Lusa)
  const quizTasks: ScheduledTaskItem[] = [];
  const verifiedSkills = profile?.verified_skills || [];
  if (verifiedSkills.length === 0) {
    quizTasks.push({
      id: "quiz-task-verify-1",
      title: "Uji Kompetensi Kuis Keahlian",
      description: "Selesaikan 1 kuis singkat (5 menit) untuk melipatgandakan peluang lolos seleksi.",
      category: "skill_quiz",
      dateKey: getDateKeyAtOffset(2), // Day 2: Lusa
      status: "pending",
      isOverdue: false,
      daysLate: 0,
      priority: "medium",
      estimatedMinutes: 15,
      xpReward: 150,
      actionType: "quiz",
      actionUrl: "/freelancer/skills",
    });
  }

  // Optional: Add weekly discovery goals for later days if contract work is still light
  if (activeContracts.length === 0) {
    quizTasks.push({
      id: "explore-task-market",
      title: "Eksplorasi Proyek & Ajukan Tawaran",
      description: "Lihat tawaran proyek UMKM terverifikasi dan kirim minimal 1 proposal terarah.",
      category: "skill_quiz",
      dateKey: getDateKeyAtOffset(4), // Day 4
      status: "pending",
      isOverdue: false,
      daysLate: 0,
      priority: "low",
      estimatedMinutes: 25,
      xpReward: 80,
      actionType: "link",
      actionUrl: "/freelancer/explore",
    });
  }

  // 5. Gather Contract Milestones & Subtasks + Detect Overdue
  const rawProjectTasks: ScheduledTaskItem[] = [];
  let overdueCount = 0;

  for (const contract of activeContracts) {
    const milestones = contract.contract_milestones || contract.milestones || [];
    const clientName = contract.client?.full_name || contract.clientName || "Klien";
    const projectTitle = contract.project?.title || contract.projectTitle || "Proyek Aktif";

    for (const m of milestones) {
      if (m.status === "completed") continue;

      let isOverdue = false;
      let daysLate = 0;
      let targetDateKey = todayKey;

      if (m.dueDate || m.due_date) {
        const dueDateRaw = new Date(m.dueDate || m.due_date);
        dueDateRaw.setHours(0, 0, 0, 0);

        if (!isNaN(dueDateRaw.getTime())) {
          targetDateKey = formatLocalDateKey(dueDateRaw);
          if (dueDateRaw < today) {
            isOverdue = true;
            const diffTime = Math.abs(today.getTime() - dueDateRaw.getTime());
            daysLate = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            overdueCount++;
          }
        }
      }

      // If milestone is ready for submission
      if (m.status === "in_progress" || m.status === "submitted") {
        rawProjectTasks.push({
          id: `milestone-${m.id}`,
          title: `Penyerahan: ${m.title}`,
          description: `Kirim hasil deliverable untuk ${projectTitle} (${clientName}).`,
          category: "project_milestone",
          dateKey: isOverdue ? todayKey : targetDateKey,
          status: m.status === "submitted" ? "completed" : "pending",
          isOverdue,
          daysLate,
          priority: isOverdue ? "urgent" : "high",
          estimatedMinutes: 90,
          xpReward: 200,
          actionType: "submit",
          actionUrl: `/freelancer/my-work`,
          metadata: {
            projectId: contract.projectId || contract.project?.id,
            projectTitle,
            clientName,
            milestoneId: m.id,
          },
        });
      }

      // Add standard realistic subtasks for active milestones
      if (m.status === "in_progress") {
        rawProjectTasks.push({
          id: `task-${m.id}-core`,
          title: `Kerjakan: ${m.title}`,
          description: `Fokus eksekusi tahapan kerja proyek "${projectTitle}".`,
          category: "project_task",
          dateKey: isOverdue ? todayKey : targetDateKey,
          status: "pending",
          isOverdue,
          daysLate,
          priority: isOverdue ? "urgent" : "high",
          estimatedMinutes: 120,
          xpReward: 80,
          actionType: "checkin",
          metadata: {
            projectId: contract.projectId || contract.project?.id,
            projectTitle,
            clientName,
            milestoneId: m.id,
          },
        });
      }
    }
  }

  // Trigger Overdue Alerts to Freelancer Notification System if any
  if (overdueCount > 0 && typeof window !== "undefined") {
    const overdueKey = `notif_overdue_flag_${todayKey}`;
    if (!sessionStorage.getItem(overdueKey)) {
      addNotification({
        title: "⚠️ Peringatan Keterlambatan Tugas!",
        message: `Anda memiliki ${overdueCount} tugas atau milestone yang telah melewati batas tenggat. Buka Tugas Hari Ini untuk menyelesaikan segera.`,
        type: "milestone",
        linkUrl: "/freelancer/dashboard#tugas-hari-ini",
        roleTarget: "freelancer",
      });
      sessionStorage.setItem(overdueKey, "sent");
    }
  }

  // 6. Apply Stored Completed Statuses
  const storedCompletedIds = new Set(getStoredCompletedTaskIds());
  const applyCompletion = (t: ScheduledTaskItem): ScheduledTaskItem => ({
    ...t,
    status: storedCompletedIds.has(t.id) ? "completed" : t.status,
  });

  const allAvailableTasks = [
    ...rawProjectTasks.map(applyCompletion),
    ...profileTasks.map(applyCompletion),
    ...quizTasks.map(applyCompletion),
  ];

  // 7. Deterministic MRP Workload Leveling (Spreading across 7 days)
  // Day 0 = Today, Day 1 = Tomorrow, ..., Day 6 = 6 days ahead
  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const daysMap: Record<string, DayWorkload> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dKey = formatLocalDateKey(d);

    let label = `${dayLabels[d.getDay()]}, ${d.getDate()}`;
    if (i === 0) label = "Hari Ini";
    else if (i === 1) label = "Besok";
    else if (i === 2) label = "Lusa";

    daysMap[dKey] = {
      dateKey: dKey,
      dayLabel: label,
      dateNumber: d.getDate(),
      totalTasks: 0,
      completedTasks: 0,
      totalMinutes: 0,
      capacityMinutes: dailyCapacityMinutes,
      tasks: [],
      hasOverdue: false,
    };
  }

  // Allocation Algorithm:
  // - Overdue & Critical tasks MUST go to Today (Day 0)
  // - Other tasks are distributed so daily workload does not surpass capacity
  const sortedTasks = [...allAvailableTasks].sort((a, b) => {
    // 1. Overdue first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    // 2. Priority: urgent > high > medium > low
    const pWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    if (pWeight[a.priority] !== pWeight[b.priority]) {
      return pWeight[b.priority] - pWeight[a.priority];
    }
    // 3. Category: project > profile > quiz
    const cWeight = { project_milestone: 4, project_task: 3, profile: 2, skill_quiz: 1 };
    return cWeight[b.category] - cWeight[a.category];
  });

  const dayKeys = Object.keys(daysMap).sort();

  for (const task of sortedTasks) {
    if (task.isOverdue) {
      // Overdue stays on Today
      daysMap[todayKey].tasks.push(task);
      daysMap[todayKey].hasOverdue = true;
      daysMap[todayKey].totalMinutes += task.estimatedMinutes;
      continue;
    }

    // Attempt to fit on its preferred target date if not overloaded
    let placed = false;
    const preferredDay = daysMap[task.dateKey];

    if (preferredDay && preferredDay.totalMinutes + task.estimatedMinutes <= dailyCapacityMinutes) {
      preferredDay.tasks.push(task);
      preferredDay.totalMinutes += task.estimatedMinutes;
      placed = true;
    }

    // If preferred day is overloaded or doesn't exist, place in the earliest day with capacity
    if (!placed) {
      for (const dKey of dayKeys) {
        const dObj = daysMap[dKey];
        // Don't overfill days beyond capacity + 60 mins leeway
        if (dObj.totalMinutes + task.estimatedMinutes <= dailyCapacityMinutes + 60 || dKey === dayKeys[dayKeys.length - 1]) {
          dObj.tasks.push({ ...task, dateKey: dKey });
          dObj.totalMinutes += task.estimatedMinutes;
          placed = true;
          break;
        }
      }
    }
  }

  // Recalculate summary totals
  for (const dKey of dayKeys) {
    const d = daysMap[dKey];
    d.totalTasks = d.tasks.length;
    d.completedTasks = d.tasks.filter((t) => t.status === "completed").length;
    d.hasOverdue = d.tasks.some((t) => t.isOverdue && t.status !== "completed");
  }

  // 8. Call Gemini AI via Serverless Route for Strategic Insight
  let aiInsight = "Jadwal kerja Anda seimbang dan terdistribusi optimal sesuai kapasitas harian Anda.";
  let aiTone: "urgent" | "balanced" | "relaxed" = "balanced";

  if (overdueCount > 0) {
    aiInsight = `Perhatian! Anda memiliki ${overdueCount} tugas yang melewati deadline. AI memprioritaskannya ke urutan pertama hari ini untuk menjaga reputasi Anda.`;
    aiTone = "urgent";
  } else if (daysMap[todayKey].tasks.length === 0) {
    aiInsight = "Beban kerja hari ini kosong! Waktu yang tepat untuk mengasah keahlian baru atau menjelajahi quest proyek UMKM bernilai tinggi.";
    aiTone = "relaxed";
  } else {
    aiInsight = `Kapasitas harian Anda (${dailyCapacityHours} jam/hari) dialokasikan dengan baik untuk ${daysMap[todayKey].tasks.length} fokus kerja hari ini.`;
  }

  // Try fetching enhanced Gemini AI suggestion
  if (params.forceRefreshAI || typeof window !== "undefined") {
    try {
      const todayTasks = daysMap[todayKey].tasks;
      const res = await fetch("/api/ai/strategic-planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyCapacityHours,
          weeklyAvailability,
          todayTasksCount: todayTasks.length,
          overdueCount,
          activeProjectsCount: activeContracts.length,
          todayTaskTitles: todayTasks.map((t) => t.title),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.insight) {
          aiInsight = json.insight;
          if (json.tone) aiTone = json.tone;
        }
      }
    } catch (apiErr) {
      // Graceful fallback to heuristic text
    }
  }

  return {
    weeklyAvailability,
    dailyCapacityHours,
    aiInsight,
    aiTone,
    days: daysMap,
    overdueCount,
    todayTasksCount: daysMap[todayKey].tasks.length,
  };
}
