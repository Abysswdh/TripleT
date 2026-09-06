"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Flame,
  Brain,
  Calendar as CalendarIcon,
  CheckCircle2,
  CircleDot,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  UserCheck,
  FileText,
  Award,
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
      const completedCount = dayWorkload?.tasks.filter(
        (t) => completedTaskIds.has(t.id) || t.status === "completed"
      ).length || 0;
      const hasOverdue = dayWorkload?.hasOverdue || false;

      days.push({
        date: d,
        dateKey: dKey,
        label: displayLabel,
        dateNum: d.getDate(),
        isToday: i === 0,
        isSelected: dKey === selectedDateKey,
        totalTasks,
        completedCount,
        hasOverdue,
      });
    }

    return days;
  }, [plannerData, selectedDateKey, completedTaskIds]);

  // Selected Day Workload
  const activeDayWorkload = plannerData?.days[selectedDateKey];
  const selectedDayTasks = activeDayWorkload?.tasks || [];

  // Handle task completion toggle (STREAK + 1 & Checkmark)
  const handleToggleTask = (task: ScheduledTaskItem) => {
    const isCurrentlyDone = completedTaskIds.has(task.id) || task.status === "completed";
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
      logActivity("daily_checkin", { xp: task.xpReward || 50, taskId: task.id, title: task.title });

      // Dispatch window event for other listeners
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("xp-updated", { detail: { xp: task.xpReward || 50 } }));
      }
    }
  };

  const completedSelectedCount = selectedDayTasks.filter(
    (t) => completedTaskIds.has(t.id) || t.status === "completed"
  ).length;

  return (
    <div
      id="tugas-hari-ini"
      className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-5 relative overflow-hidden transition-all"
    >
      {/* 1. Header: Unified Title + Streak Display + Full Calendar Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <h3 className="text-base font-bold text-foreground font-heading">
              Tugas Hari Ini & Jadwal MRP
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
              <Brain className="h-3 w-3" />
              AI Strategist
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Beban kerja diatur otomatis agar tidak overwork dan deadline tepat waktu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Streak Counter Pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 shadow-xs">
            <Flame className="h-4 w-4 text-amber-500 animate-pulse fill-amber-500" />
            <span>{liveStreakDays} Hari Streak</span>
          </div>

          {/* Direct Link to Full Calendar Page */}
          <Link
            href="/freelancer/calendar"
            title="Buka Kalender Kerja Lengkap"
            className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-border/70 hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Interactive Calendar Strip (Click day to show its tasks) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
          <span>Pilih Hari Jadwal Kerja:</span>
          <Link
            href="/freelancer/calendar"
            className="text-primary hover:underline inline-flex items-center gap-1 text-[11px] font-bold"
          >
            <span>Lihat Kalender Lengkap</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarDays.map((day) => {
            const isAllDone = day.totalTasks > 0 && day.completedCount === day.totalTasks;

            return (
              <button
                key={day.dateKey}
                type="button"
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`relative flex flex-col items-center justify-between py-2 sm:py-2.5 px-1 rounded-2xl border transition-all cursor-pointer select-none text-center ${
                  day.isSelected
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-sm"
                    : "border-border/60 bg-muted/20 hover:bg-muted/50 hover:border-border"
                } ${day.isToday ? "font-bold" : ""}`}
              >
                {/* Red pulse indicator if day has overdue tasks */}
                {day.hasOverdue && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card animate-ping" />
                )}
                {day.hasOverdue && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
                )}

                <span
                  className={`text-[10px] sm:text-[11px] ${
                    day.isSelected ? "text-primary font-bold" : "text-muted-foreground"
                  }`}
                >
                  {day.label}
                </span>

                <span
                  className={`text-sm sm:text-base font-heading my-0.5 ${
                    day.isToday
                      ? "text-primary font-extrabold"
                      : day.isSelected
                      ? "text-foreground font-bold"
                      : "text-foreground font-medium"
                  }`}
                >
                  {day.dateNum}
                </span>

                {/* Task Count / Status Pill */}
                <div className="mt-1">
                  {day.totalTasks === 0 ? (
                    <span className="text-[9px] text-muted-foreground/60 leading-none">Santai</span>
                  ) : isAllDone ? (
                    <span className="inline-flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-600 text-[9px] font-bold">
                      <Check className="h-2.5 w-2.5" />
                    </span>
                  ) : day.hasOverdue ? (
                    <span className="text-[9px] font-extrabold text-rose-600 bg-rose-500/20 px-1.5 py-0.2 rounded-full">
                      ! Urgent
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold text-primary bg-primary/15 px-1.5 py-0.2 rounded-full">
                      {day.totalTasks} tugas
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. AI Workload Strategist Insight Card */}
      {plannerData && (
        <div
          className={`rounded-2xl p-3.5 border text-xs transition-all flex items-start gap-3 ${
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

      {/* 4. Task List for Selected Date */}
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
          <div className="space-y-2.5">
            {selectedDayTasks.map((task) => {
              const isCompleted = completedTaskIds.has(task.id) || task.status === "completed";
              const isUrgentLate = task.isOverdue && !isCompleted;

              return (
                <div
                  key={task.id}
                  className={`rounded-2xl border p-3.5 transition-all flex items-start gap-3 relative overflow-hidden ${
                    isUrgentLate
                      ? "bg-rose-500/10 border-rose-500/50 shadow-xs shadow-rose-500/10 ring-1 ring-rose-500/20"
                      : isCompleted
                      ? "bg-emerald-500/5 border-emerald-500/20 opacity-80"
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
                            isUrgentLate ? "text-rose-600 dark:text-rose-400 font-extrabold" : "text-primary"
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
            })}
          </div>
        )}
      </div>

      {/* 5. Bottom Navigation Strip */}
      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
        <span className="text-muted-foreground text-[11px]">
          Algoritma Leveling MRP memastikan jadwal tidak melebihi kapasitas harian.
        </span>
        <Link
          href="/freelancer/calendar"
          className="font-bold text-primary hover:underline inline-flex items-center gap-1 text-xs shrink-0"
        >
          <span>Buka Kalender Kerja Lengkap</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
