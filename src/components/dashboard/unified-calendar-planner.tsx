"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Brain,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  Check,
} from "lucide-react";
import { formatLocalDateKey, logActivity } from "@/lib/services/activity";
import {
  computeMRPPlan,
  setTaskCompletedInStorage,
  getStoredCompletedTaskIds,
  type MRPPlannerResult,
  type ScheduledTaskItem,
} from "@/lib/services/mrp-planner";
import { useAuth } from "@/hooks/use-auth";

interface UnifiedSmartCalendarPlannerProps {
  activeContracts?: any[];
  userProfile?: any;
  onOpenSubmitMilestone?: (item: any) => void;
  streakDays?: number;
  activeDates?: string[];
  totalContributions?: number;
}

export function UnifiedSmartCalendarPlanner({
  activeContracts = [],
  userProfile,
  onOpenSubmitMilestone,
  streakDays = 0,
  activeDates = [],
  totalContributions = 0,
}: UnifiedSmartCalendarPlannerProps) {
  const { user } = useAuth();
  const todayKey = useMemo(() => formatLocalDateKey(new Date()), []);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [viewMode, setViewMode] = useState<"week" | "day">("week");
  const [plannerData, setPlannerData] = useState<MRPPlannerResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Live streak state
  const [liveStreakDays, setLiveStreakDays] = useState<number>(streakDays);
  const [liveActiveDates, setLiveActiveDates] = useState<string[]>(activeDates);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Load completed task IDs
  useEffect(() => {
    setCompletedTaskIds(new Set(getStoredCompletedTaskIds()));
  }, []);

  // Sync prop changes
  useEffect(() => {
    setLiveStreakDays(streakDays);
    setLiveActiveDates(activeDates);
  }, [streakDays, activeDates]);

  // Load MRP Plan
  useEffect(() => {
    let isMounted = true;
    async function loadPlan() {
      setLoading(true);
      try {
        const plan = await computeMRPPlan({
          userId: user?.id,
          contracts: activeContracts,
          userProfile,
          userAuth: user,
          availability: userProfile?.availability,
        });
        if (isMounted) {
          setPlannerData(plan);
        }
      } catch (err) {
        console.error("Error computing MRP plan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadPlan();
    return () => {
      isMounted = false;
    };
  }, [user?.id, activeContracts, userProfile]);

  // Days list for the interactive calendar strip (7 days)
  const calendarDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const MONTH_NAMES = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dKey = formatLocalDateKey(d);
      const dayWorkload = plannerData?.days[dKey];

      let displayLabel = DAY_NAMES[d.getDay()];
      if (i === 0) displayLabel = "Hari Ini";
      else if (i === 1) displayLabel = "Besok";
      else if (i === 2) displayLabel = "Lusa";

      const totalTasks = dayWorkload?.tasks.length || 0;
      const completedCount =
        dayWorkload?.tasks.filter(
          (t) => completedTaskIds.has(t.id) || t.status === "completed"
        ).length || 0;
      const hasOverdue = dayWorkload?.hasOverdue || false;

      days.push({
        date: d,
        dateKey: dKey,
        label: displayLabel,
        monthName: MONTH_NAMES[d.getMonth()],
        dateNum: d.getDate(),
        isToday: i === 0,
        isSelected: dKey === selectedDateKey && viewMode === "day",
        totalTasks,
        completedCount,
        hasOverdue,
      });
    }

    return days;
  }, [plannerData, selectedDateKey, viewMode, completedTaskIds]);

  // Grouped tasks for the week
  const weekTasksByDay = useMemo(() => {
    return calendarDays.map((d) => ({
      day: d,
      tasks: plannerData?.days[d.dateKey]?.tasks || [],
    }));
  }, [calendarDays, plannerData]);

  // Total tasks across the week
  const totalWeekTasks = useMemo(() => {
    return weekTasksByDay.reduce((acc, curr) => acc + curr.tasks.length, 0);
  }, [weekTasksByDay]);

  const totalWeekCompleted = useMemo(() => {
    return weekTasksByDay.reduce(
      (acc, curr) =>
        acc +
        curr.tasks.filter(
          (t) => completedTaskIds.has(t.id) || t.status === "completed"
        ).length,
      0
    );
  }, [weekTasksByDay, completedTaskIds]);

  // Selected Day Workload
  const activeDayWorkload = plannerData?.days[selectedDateKey];
  const selectedDayTasks = activeDayWorkload?.tasks || [];
  const completedSelectedCount = selectedDayTasks.filter(
    (t) => completedTaskIds.has(t.id) || t.status === "completed"
  ).length;

  // Handle task completion toggle (STREAK + 1 & Checkmark)
  const handleToggleTask = (task: ScheduledTaskItem) => {
    const isCurrentlyDone =
      completedTaskIds.has(task.id) || task.status === "completed";
    const nextDone = !isCurrentlyDone;

    // Update local state
    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (nextDone) {
        next.add(task.id);
      } else {
        next.delete(task.id);
      }
      return next;
    });

    setTaskCompletedInStorage(task.id, nextDone);

    // If marked as done: trigger Streak +1 & XP logging!
    if (nextDone) {
      if (!liveActiveDates.includes(todayKey)) {
        setLiveActiveDates((prev) => [...prev, todayKey]);
        setLiveStreakDays((prev) => prev + 1);
      }
      logActivity("daily_checkin", {
        xp: task.xpReward || 50,
        taskId: task.id,
        title: task.title,
      });

      // Dispatch window event for other listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("xp-updated", { detail: { xp: task.xpReward || 50 } })
        );
      }
    }
  };

  // Reusable task card renderer
  const renderTaskCard = (task: ScheduledTaskItem) => {
    const isCompleted =
      completedTaskIds.has(task.id) || task.status === "completed";
    const isUrgentLate = task.isOverdue && !isCompleted;

    return (
      <div
        key={task.id}
        className={`rounded-2xl border p-3 sm:p-3.5 transition-all flex items-start gap-3 relative overflow-hidden ${
          isUrgentLate
            ? "bg-rose-500/10 border-rose-500/50 shadow-xs shadow-rose-500/10 ring-1 ring-rose-500/20"
            : isCompleted
            ? "bg-emerald-500/5 border-emerald-500/20 opacity-75"
            : "bg-card border-border/70 hover:border-primary/40 hover:bg-muted/20"
        }`}
      >
        {/* Custom Interactive Checkbox (STREAK +1) */}
        <div className="pt-0.5 shrink-0">
          <button
            type="button"
            onClick={() => handleToggleTask(task)}
            aria-label="Tandai tugas selesai"
            className={`h-4 w-4 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
              isCompleted
                ? "bg-emerald-600 border-emerald-600 text-white"
                : isUrgentLate
                ? "border-rose-500 text-rose-500 hover:bg-rose-500/10"
                : "border-muted-foreground/40 hover:border-primary text-transparent"
            }`}
          >
            <Check className="h-3 w-3 stroke-[3]" />
          </button>
        </div>

        {/* Task Body */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Urgent Overdue Badge */}
              {isUrgentLate && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 animate-pulse">
                  <AlertTriangle className="h-3 w-3" />
                  <span>⚠️ Terlambat {task.daysLate} Hari (Urgent)</span>
                </span>
              )}

              {/* Normal Category Badge */}
              {!isUrgentLate && (
                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    task.category === "project_milestone"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : task.category === "profile"
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      : task.category === "skill_quiz"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {task.category === "project_milestone"
                    ? "Milestone"
                    : task.category === "profile"
                    ? "Profil & Verifikasi"
                    : task.category === "skill_quiz"
                    ? "Kuis Keahlian"
                    : "Tugas Proyek"}
                </span>
              )}
            </div>

            {/* XP & Duration Badge */}
            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 shrink-0">
              <Zap className="h-3 w-3" />
              +{task.xpReward} XP
            </span>
          </div>

          <h4
            className={`text-xs font-bold leading-snug ${
              isCompleted ? "line-through text-muted-foreground" : "text-foreground"
            } ${isUrgentLate ? "text-rose-700 dark:text-rose-300 font-extrabold" : ""}`}
          >
            {task.title}
          </h4>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {task.description}
          </p>

          {/* Action Triggers */}
          <div className="pt-1 flex flex-wrap items-center gap-3 text-[11px]">
            {task.actionType === "submit" && !isCompleted && onOpenSubmitMilestone && (
              <button
                type="button"
                onClick={() => {
                  if (task.metadata?.milestoneId) {
                    onOpenSubmitMilestone({
                      id: task.metadata.milestoneId,
                      projectTitle: task.metadata.projectTitle,
                      clientName: task.metadata.clientName,
                      milestoneTitle: task.title,
                    });
                  }
                }}
                className={`font-bold inline-flex items-center gap-1 hover:underline cursor-pointer ${
                  isUrgentLate
                    ? "text-rose-600 dark:text-rose-400 font-extrabold"
                    : "text-primary"
                }`}
              >
                <span>Serahkan Deliverable Sekarang</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            )}

            {task.actionType === "link" && task.actionUrl && (
              <Link
                href={task.actionUrl}
                className="font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Lengkapi di Pengaturan</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}

            {task.actionType === "quiz" && task.actionUrl && (
              <Link
                href={task.actionUrl}
                className="font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Mulai Tes Kuis</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            <span className="text-[10px] text-muted-foreground flex items-center gap-1 ml-auto">
              <Clock className="h-2.5 w-2.5" />
              <span>~{task.estimatedMinutes} Menit</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      id="tugas-hari-ini"
      className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden transition-all"
    >
      {/* 1. Header: Short Title "Plan Anda" + AI Tag + Streak Pill + Single Calendar Link */}
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3.5">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h3 className="text-base font-bold text-foreground font-heading">
            Plan Anda
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
            <Brain className="h-3 w-3" />
            AI
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak Counter Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-black text-amber-600 dark:text-amber-400 shadow-xs">
            <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            <span>{liveStreakDays} Hari Streak</span>
          </div>

          {/* Single Calendar Link */}
          <Link
            href="/freelancer/calendar"
            title="Buka Kalender Kerja Lengkap"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 hover:underline transition-all"
          >
            <span>Kalender</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. View Toggle (Semua Minggu Ini vs Hari Ini) */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "week"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua Minggu Ini ({totalWeekTasks})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedDateKey(todayKey);
              setViewMode("day");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "day" && selectedDateKey === todayKey
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Hari Ini ({plannerData?.days[todayKey]?.tasks.length || 0})
          </button>
        </div>

        {viewMode === "day" && (
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
          >
            <span>Lihat Seluruh Minggu</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* 3. 7-Day Calendar Strip */}
      {/* Rules requested by user:
          - If selected in day view: Streak Biru (primary blue border & ring)
          - If has work (totalTasks > 0): Golden / Amber border & tint
          - If no work (totalTasks === 0): Clean neutral, no text (gk ada kerja gk ada)
      */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((day) => {
          const isSelectedDay = day.isSelected && viewMode === "day";
          const hasWork = day.totalTasks > 0;
          const isAllDone = hasWork && day.completedCount === day.totalTasks;

          let cardClasses = "";
          let labelClasses = "";
          let numberClasses = "";

          if (isSelectedDay) {
            // Streak Biru (active selected focus)
            cardClasses =
              "border-2 border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs";
            labelClasses = "text-primary font-bold";
            numberClasses = "text-primary font-black";
          } else if (hasWork) {
            // Golden / Amber border for days with scheduled work
            cardClasses =
              "border-2 border-amber-500/70 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shadow-xs";
            labelClasses = "text-amber-600 dark:text-amber-400 font-bold";
            numberClasses = "text-amber-700 dark:text-amber-200 font-black";
          } else {
            // No work: clean neutral, minimal
            cardClasses =
              "border border-border/40 bg-muted/15 text-muted-foreground/60 hover:bg-muted/30 hover:border-border/60";
            labelClasses = "text-muted-foreground/60 font-medium";
            numberClasses = "text-muted-foreground/70 font-semibold";
          }

          return (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => {
                setSelectedDateKey(day.dateKey);
                setViewMode("day");
              }}
              className={`relative flex flex-col items-center justify-between py-2 sm:py-2.5 px-1 rounded-2xl transition-all cursor-pointer select-none text-center ${cardClasses}`}
            >
              {/* Overdue alert indicator */}
              {day.hasOverdue && (
                <>
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card animate-ping" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
                </>
              )}

              {/* Day Label */}
              <span className={`text-[10px] sm:text-[11px] ${labelClasses}`}>
                {day.label}
              </span>

              {/* Date Number */}
              <span className={`text-sm sm:text-base font-heading my-0.5 ${numberClasses}`}>
                {day.dateNum}
              </span>

              {/* Bottom Task Indicator */}
              <div className="h-4 flex items-center justify-center">
                {hasWork ? (
                  isAllDone ? (
                    <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-emerald-500/20 text-emerald-600 text-[8px] font-bold">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : day.hasOverdue ? (
                    <span className="text-[8px] font-extrabold text-rose-600 bg-rose-500/20 px-1 py-0.2 rounded-full">
                      ! Urgent
                    </span>
                  ) : isSelectedDay ? (
                    <span className="text-[9px] font-bold text-primary bg-primary/20 px-1.5 py-0.2 rounded-full">
                      {day.totalTasks} tugas
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-1.5 py-0.2 rounded-full">
                      {day.totalTasks} tugas
                    </span>
                  )
                ) : (
                  // Clean blank when no work (klo gk ada kerja gk ada)
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/20" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. AI Workload Strategist Insight Card */}
      {plannerData && (
        <div
          className={`rounded-2xl p-3 sm:p-3.5 border text-xs transition-all flex items-start gap-3 ${
            plannerData.aiTone === "urgent"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
              : plannerData.aiTone === "relaxed"
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-900 dark:text-emerald-200"
              : "bg-gradient-to-r from-primary/10 via-card to-primary/5 border-primary/20 text-foreground"
          }`}
        >
          <div className="pt-0.5 shrink-0">
            {plannerData.aiTone === "urgent" ? (
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 animate-bounce" />
            ) : (
              <Sparkles className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <span className="font-bold font-heading text-xs">
                {plannerData.aiTone === "urgent"
                  ? "Prioritas Mendesak (Overdue Alert)"
                  : "Rekomendasi AI Strategist"}
              </span>
              <span className="text-[10px] font-semibold opacity-75">
                Kapasitas: {plannerData.dailyCapacityHours} Jam/Hari
              </span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{plannerData.aiInsight}</p>
          </div>
        </div>
      )}

      {/* 5. Tasks List: Either Weekly Grouped or Day Focused */}
      <div className="space-y-3 pt-1">
        {viewMode === "week" ? (
          // ================= WEEKLY SCHEDULE VIEW (Visible for whole week on home) =================
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="font-heading flex items-center gap-1.5">
                <span>Daftar Kerja 1 Minggu:</span>
              </span>
              <span className="text-[11px] font-semibold text-muted-foreground">
                {totalWeekCompleted}/{totalWeekTasks} Selesai
              </span>
            </div>

            {totalWeekTasks === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center bg-muted/10 space-y-2">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground">Tidak Ada Beban Tugas Minggu Ini</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Semua target mingguan Anda telah beres. Tingkatkan XP Anda melalui kuis keahlian atau jelajahi tawaran proyek baru.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {weekTasksByDay.map(({ day, tasks }) => {
                  if (tasks.length === 0) return null;
                  const dayCompleted = tasks.filter(
                    (t) => completedTaskIds.has(t.id) || t.status === "completed"
                  ).length;

                  return (
                    <div
                      key={day.dateKey}
                      className="rounded-2xl border border-border/60 bg-muted/10 p-3 sm:p-3.5 space-y-2.5"
                    >
                      {/* Sub-header for each day with tasks */}
                      <div className="flex items-center justify-between text-xs font-bold">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              day.isToday ? "bg-primary animate-pulse" : "bg-amber-500"
                            }`}
                          />
                          <span className="text-foreground font-heading">
                            {day.label} ({day.dateNum} {day.monthName})
                          </span>
                          {day.isToday && (
                            <span className="text-[9px] font-extrabold bg-primary/15 text-primary px-1.5 py-0.2 rounded-full">
                              Hari Ini
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {dayCompleted}/{tasks.length} Selesai
                        </span>
                      </div>

                      {/* Day Tasks List */}
                      <div className="space-y-2">
                        {tasks.map((task) => renderTaskCard(task))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // ================= SINGLE DAY VIEW =================
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-foreground">
              <span className="font-heading">
                Daftar Tugas (
                {calendarDays.find((d) => d.dateKey === selectedDateKey)?.label || "Hari Ini"}):
              </span>
              {selectedDayTasks.length > 0 && (
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {completedSelectedCount}/{selectedDayTasks.length} Selesai
                </span>
              )}
            </div>

            {selectedDayTasks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/80 p-6 text-center bg-muted/10 space-y-2">
                <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <p className="text-xs font-bold text-foreground">Tidak Ada Beban Tugas</p>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Jadwal hari ini kosong. Anda bisa mengasah skill lewat kuis atau menjelajahi tawaran proyek baru.
                </p>
                <div className="pt-1 flex items-center justify-center gap-3 text-xs">
                  <Link href="/freelancer/skills" className="font-bold text-primary hover:underline">
                    Ikuti Kuis (+XP) →
                  </Link>
                  <Link href="/freelancer/explore" className="font-bold text-primary hover:underline">
                    Cari Proyek →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayTasks.map((task) => renderTaskCard(task))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
