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
  ChevronRight,
  Zap,
  Clock,
  Check,
  ExternalLink,
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
  totalContributions: _totalContributions = 0,
}: UnifiedSmartCalendarPlannerProps) {
  const { user } = useAuth();
  const todayKey = useMemo(() => formatLocalDateKey(new Date()), []);
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [plannerData, setPlannerData] = useState<MRPPlannerResult | null>(null);
  const [_loading, setLoading] = useState<boolean>(true);

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

  // Memoize contracts fingerprint to prevent unnecessary loadPlan triggers on parent re-renders
  const contractsFingerprint = useMemo(
    () => (activeContracts || []).map((c) => `${c.id || ""}_${c.status || ""}_${c.progress || 0}`).join(";"),
    [activeContracts]
  );

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
  }, [user?.id, contractsFingerprint, userProfile?.availability]);

  // Days list for the interactive calendar strip (7 days: Kemarin (-1) to +5 ahead)
  const calendarDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];
    const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const MONTH_NAMES = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];

    // Offset: -1 (Kemarin), 0 (Hari Ini), 1 (Besok), 2 (Lusa), 3, 4, 5 => Total 7 days
    for (let i = -1; i <= 5; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dKey = formatLocalDateKey(d);
      const dayWorkload = plannerData?.days[dKey];

      let displayLabel = DAY_NAMES[d.getDay()];
      if (i === -1) displayLabel = "Kemarin";
      else if (i === 0) displayLabel = "Hari Ini";
      else if (i === 1) displayLabel = "Besok";
      else if (i === 2) displayLabel = "Lusa";

      const totalTasks = dayWorkload?.tasks.length || 0;
      const completedCount =
        dayWorkload?.tasks.filter(
          (t) => completedTaskIds.has(t.id) || t.status === "completed"
        ).length || 0;
      const hasOverdue = dayWorkload?.hasOverdue || false;
      const hasStreakActivity = liveActiveDates.includes(dKey);

      days.push({
        date: d,
        dateKey: dKey,
        offset: i,
        label: displayLabel,
        monthName: MONTH_NAMES[d.getMonth()],
        dateNum: d.getDate(),
        isPast: i < 0,
        isToday: i === 0,
        isFuture: i > 0,
        isSelected: dKey === selectedDateKey,
        totalTasks,
        completedCount,
        hasOverdue,
        hasStreakActivity,
      });
    }

    return days;
  }, [plannerData, selectedDateKey, completedTaskIds, liveActiveDates]);

  // Selected Day Workload
  const selectedDayObj = calendarDays.find((d) => d.dateKey === selectedDateKey);
  const selectedDayLabel = selectedDayObj
    ? `${selectedDayObj.label} (${selectedDayObj.dateNum} ${selectedDayObj.monthName})`
    : "Hari Ini";
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

      {/* 2. 7-Day Calendar Strip (Includes Kemarin, Hari Ini, Besok, Lusa, +3) */}
      {/* COLOR RULES:
          - Streak Aktif: Hijau (Emerald) border & tint + Checkmark
          - Hari Belum Streak: Golden/Amber dashed border + pulse dot
          - Ada Rencana Kerja (Mendatang): Golden/Amber solid border + count tugas
          - Gk Streak (Kemarin Missed): Merah (Rose) border + Missed
          - Gk Ada Kerja: Netral / Clean (no text)
          - Terpilih: Streak Biru ring & focus
      */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {calendarDays.map((day) => {
          const isSelectedDay = day.isSelected;
          const hasWork = day.totalTasks > 0;

          let cardClasses = "";
          let labelClasses = "";
          let numberClasses = "";
          let tooltipText = "";

          // Determine State
          if (day.isPast) {
            // KEMARIN (Audit Streak)
            if (day.hasStreakActivity) {
              // Streak aktif kemarin: HIJAU
              cardClasses =
                "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs";
              labelClasses = "text-emerald-600 dark:text-emerald-400 font-bold";
              numberClasses = "text-emerald-700 dark:text-emerald-200 font-extrabold";
              tooltipText = "Kemarin: Streak aktif tercatat (Hijau)";
            } else {
              // Tidak streak kemarin: MERAH
              cardClasses =
                "border-2 border-rose-500/80 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs";
              labelClasses = "text-rose-600 dark:text-rose-400 font-bold";
              numberClasses = "text-rose-700 dark:text-rose-300 font-extrabold";
              tooltipText = "Kemarin: Tidak ada streak (Merah)";
            }
          } else if (day.isToday) {
            // HARI INI
            if (day.hasStreakActivity) {
              // Sudah streak hari ini: HIJAU
              cardClasses =
                "border-2 border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-200 shadow-xs";
              labelClasses = "text-emerald-600 dark:text-emerald-300 font-black";
              numberClasses = "text-emerald-700 dark:text-emerald-100 font-black";
              tooltipText = "Hari ini: Streak sudah aktif (Hijau)!";
            } else {
              // Belum streak hari ini: GOLDEN / AMBER DASHED
              cardClasses =
                "border-2 border-dashed border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 shadow-xs";
              labelClasses = "text-amber-600 dark:text-amber-400 font-extrabold";
              numberClasses = "text-amber-700 dark:text-amber-200 font-black";
              tooltipText = "Hari ini: Belum streak (Golden) - selesaikan tugas/kuis!";
            }
          } else {
            // HARI MENDATANG (Besok, Lusa, dst)
            if (hasWork) {
              // Ada rencana kerja: GOLDEN SOLID BORDER
              cardClasses =
                "border-2 border-amber-500/80 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 shadow-xs";
              labelClasses = "text-amber-600 dark:text-amber-400 font-bold";
              numberClasses = "text-amber-700 dark:text-amber-200 font-black";
              tooltipText = `${day.label}: Ada ${day.totalTasks} target kerja (Golden)`;
            } else {
              // Gk ada kerja: NETRAL / CLEAN (100% Opacity Opaque)
              cardClasses =
                "border border-border/80 bg-card hover:border-primary/40 hover:bg-muted/30 text-foreground shadow-2xs";
              labelClasses = "text-muted-foreground font-semibold";
              numberClasses = "text-foreground font-bold";
              tooltipText = `${day.label}: Bebas tugas`;
            }
          }

          // Override ring for Selected Day (Streak Biru)
          if (isSelectedDay) {
            cardClasses += " ring-2 ring-primary border-primary shadow-sm";
          }

          return (
            <button
              key={day.dateKey}
              type="button"
              title={tooltipText}
              onClick={() => {
                setSelectedDateKey(day.dateKey);
              }}
              className={`relative flex flex-col items-center justify-center py-2 sm:py-3 px-0.5 sm:px-1 rounded-xl sm:rounded-2xl transition-all cursor-pointer select-none text-center gap-0.5 ${cardClasses}`}
            >
              {/* Overdue alert indicator */}
              {day.hasOverdue && (
                <>
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card animate-ping" />
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-card" />
                </>
              )}

              {/* Day Label */}
              <span className={`text-[9px] sm:text-[11px] leading-tight truncate max-w-full px-0.5 font-bold ${labelClasses}`}>
                <span className="sm:hidden">
                  {day.offset === -1
                    ? "Kmr"
                    : day.offset === 0
                    ? "Ini"
                    : day.offset === 1
                    ? "Bsk"
                    : day.label}
                </span>
                <span className="hidden sm:inline">{day.label}</span>
              </span>

              {/* Date Number */}
              <span className={`text-xs sm:text-base font-heading my-0.5 leading-tight ${numberClasses}`}>
                {day.dateNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sleek Mini Status Legend (Clean Single Line without separator dots) */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4.5 pt-1 text-[10px] text-muted-foreground/80 select-none border-t border-border/20">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Streak Aktif</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>Ada Kerja</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          <span>Terlewat</span>
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span>Terpilih</span>
        </span>
      </div>

      {/* Tasks List for the Clicked / Selected Date */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span className="font-heading">
            Daftar Tugas ({selectedDayLabel}):
          </span>
          {selectedDayTasks.length > 0 && (
            <span className="text-[11px] font-semibold text-muted-foreground">
              {completedSelectedCount}/{selectedDayTasks.length} Selesai
            </span>
          )}
        </div>

        {selectedDayTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-5 text-center bg-muted/10 space-y-2">
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <p className="text-xs font-bold text-foreground">Tidak Ada Beban Tugas</p>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Jadwal {selectedDayObj?.label?.toLowerCase() || "hari ini"} bebas dari tugas. Anda bisa mengasah skill lewat kuis atau menjelajahi tawaran proyek baru.
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
    </div>
  );
}
