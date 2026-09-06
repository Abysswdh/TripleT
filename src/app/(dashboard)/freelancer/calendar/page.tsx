"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Briefcase,
  Zap,
  Check,
  ExternalLink,
  Target,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  formatLocalDateKey,
  fetchHeatmapData,
  logActivity,
} from "@/lib/services/activity";
import {
  computeMRPPlan,
  setTaskCompletedInStorage,
  getStoredCompletedTaskIds,
  type MRPPlannerResult,
  type ScheduledTaskItem,
} from "@/lib/services/mrp-planner";
import { getFreelancerContracts } from "@/lib/services/contracts";

export default function FreelancerCalendarPage() {
  const { user } = useAuth();
  const todayKey = useMemo(() => formatLocalDateKey(new Date()), []);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(todayKey);
  const [plannerData, setPlannerData] = useState<MRPPlannerResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());

  // Streak & Active Dates state
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);

  // Load completed tasks
  useEffect(() => {
    setCompletedTaskIds(new Set(getStoredCompletedTaskIds()));
  }, []);

  // Fetch heatmap streak data
  useEffect(() => {
    if (user?.id) {
      fetchHeatmapData(user.id).then((data) => {
        setActiveDates(data.activeDates || []);
        setStreakDays(data.streakDays || 0);
      });
    }
  }, [user?.id]);

  // Fetch contracts & compute MRP plan
  useEffect(() => {
    let isMounted = true;
    async function init() {
      setLoading(true);
      try {
        const liveContracts = await getFreelancerContracts();
        const plan = await computeMRPPlan({
          userId: user?.id,
          contracts: liveContracts,
          userAuth: user,
        });
        if (isMounted) {
          setPlannerData(plan);
        }
      } catch (err) {
        console.error("Error loading calendar plan:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Calendar Month Grid Generation
  const { calendarGrid, monthYearLabel } = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Days from Sunday (0) to Saturday (6)
    const startDayIndex = firstDay.getDay();
    const totalDaysInMonth = lastDay.getDate();

    const grid = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      const dKey = formatLocalDateKey(d);
      grid.push({
        date: d,
        dateKey: dKey,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: dKey === todayKey,
        isSelected: dKey === selectedDateKey,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const d = new Date(year, month, i);
      const dKey = formatLocalDateKey(d);
      grid.push({
        date: d,
        dateKey: dKey,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dKey === todayKey,
        isSelected: dKey === selectedDateKey,
      });
    }

    // Next month padding to fill up to 35 or 42 cells
    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= (remainingCells >= 7 ? remainingCells - 7 : remainingCells); i++) {
      const d = new Date(year, month + 1, i);
      const dKey = formatLocalDateKey(d);
      grid.push({
        date: d,
        dateKey: dKey,
        dayNum: i,
        isCurrentMonth: false,
        isToday: dKey === todayKey,
        isSelected: dKey === selectedDateKey,
      });
    }

    return {
      calendarGrid: grid,
      monthYearLabel: `${monthNames[month]} ${year}`,
    };
  }, [currentMonthDate, todayKey, selectedDateKey]);

  // Handle Month Navigation
  const handlePrevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };
  const handleNextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };
  const handleToday = () => {
    const now = new Date();
    setCurrentMonthDate(now);
    setSelectedDateKey(todayKey);
  };

  // Selected Day Tasks
  const selectedDayWorkload = plannerData?.days[selectedDateKey];
  const selectedDayTasks = selectedDayWorkload?.tasks || [];

  // Toggle task
  const handleToggleTask = (task: ScheduledTaskItem) => {
    const isCurrentlyDone = completedTaskIds.has(task.id) || task.status === "completed";
    const nextDone = !isCurrentlyDone;

    setCompletedTaskIds((prev) => {
      const next = new Set(prev);
      if (nextDone) next.add(task.id);
      else next.delete(task.id);
      return next;
    });

    setTaskCompletedInStorage(task.id, nextDone);

    if (nextDone) {
      if (!activeDates.includes(todayKey)) {
        setActiveDates((prev) => [...prev, todayKey]);
        setStreakDays((prev) => prev + 1);
      }
      logActivity("daily_checkin", { xp: task.xpReward || 50, taskId: task.id, title: task.title });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("xp-updated", { detail: { xp: task.xpReward || 50 } })
        );
      }
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans">
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/freelancer/dashboard"
            className="text-xs font-semibold text-muted-foreground hover:text-primary inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Dashboard</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground font-heading tracking-tight">
              Kalender Kerja & Kapasitas MRP
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              <Brain className="h-3.5 w-3.5" />
              AI Leveling
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Perencanaan beban kerja harian dan pelacak konsistensi streak talenta.
          </p>
        </div>

        {/* Capacity & Streak Indicator Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Streak Counter Badge */}
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2.5 shadow-xs">
            <Flame className="h-5 w-5 text-amber-500 fill-amber-500 animate-pulse" />
            <div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Streak Harian
              </div>
              <div className="text-sm font-black text-amber-700 dark:text-amber-300">
                {streakDays} Hari Beruntun
              </div>
            </div>
          </div>

          {/* Capacity Pill */}
          {plannerData && (
            <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl p-2.5 px-3.5 shadow-xs">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Kapasitas MRP
                </div>
                <div className="text-sm font-bold text-foreground">
                  {plannerData.dailyCapacityHours} Jam / Hari
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: 8 Columns Calendar + 4 Columns Selected Day Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Full Interactive Month Calendar */}
        <div className="lg:col-span-8 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
          {/* Calendar Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground font-heading">
                {monthYearLabel}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToday}
                className="px-3 py-1.5 rounded-xl border border-border/70 hover:border-primary hover:bg-primary/5 text-xs font-bold text-foreground transition-all cursor-pointer"
              >
                Hari Ini
              </button>
              <div className="flex items-center border border-border/70 rounded-xl overflow-hidden bg-muted/20">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Bulan Sebelumnya"
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="w-[1px] h-4 bg-border/60" />
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Bulan Berikutnya"
                  className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-muted-foreground py-1">
            <span>Min</span>
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span>Sab</span>
          </div>

          {/* Calendar Day Cells */}
          {/* COLOR RULES:
              - Hijau: Streak aktif (past with activity / today with activity)
              - Golden/Amber dashed: Hari ini belum streak
              - Golden/Amber solid: Hari mendatang ada rencana kerja
              - Merah: Streak terlewat (past without activity) / overdue task
              - Netral: Bersih tanpa beban
              - Biru: Hari terpilih (outline ring)
          */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarGrid.map((cell, idx) => {
              const dayTasks = plannerData?.days[cell.dateKey]?.tasks || [];
              const hasOverdue = plannerData?.days[cell.dateKey]?.hasOverdue || false;
              const isSelected = cell.dateKey === selectedDateKey;

              const isPast = cell.dateKey < todayKey;
              const isToday = cell.dateKey === todayKey;
              const isFuture = cell.dateKey > todayKey;
              const hasStreakActivity = activeDates.includes(cell.dateKey);
              const hasWork = dayTasks.length > 0;
              const isAllDone =
                hasWork &&
                dayTasks.every(
                  (t) => completedTaskIds.has(t.id) || t.status === "completed"
                );

              let cellStyle = "";
              let numBadgeStyle = "text-foreground font-semibold";
              let statusPill: React.ReactNode = null;

              if (isToday) {
                if (hasStreakActivity) {
                  // Hari ini streak aktif: HIJAU
                  cellStyle =
                    "border-2 border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30 shadow-xs";
                  numBadgeStyle = "bg-emerald-600 text-white font-black shadow-xs";
                  statusPill = (
                    <span className="inline-flex items-center gap-0.5 text-[8px] font-black text-emerald-600 dark:text-emerald-300">
                      <Flame className="h-2.5 w-2.5 fill-emerald-600" /> Streak
                    </span>
                  );
                } else {
                  // Hari ini belum streak: GOLDEN / AMBER DASHED
                  cellStyle =
                    "border-2 border-dashed border-amber-500/90 bg-amber-500/10 text-amber-800 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs";
                  numBadgeStyle = "bg-amber-500 text-white font-black shadow-xs";
                  statusPill = (
                    <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> Belum
                    </span>
                  );
                }
              } else if (isPast) {
                if (hasStreakActivity) {
                  // Past day with activity: HIJAU
                  cellStyle =
                    "border border-emerald-500/50 bg-emerald-500/5 hover:border-emerald-500/80 text-emerald-800 dark:text-emerald-300";
                  numBadgeStyle = "text-emerald-600 dark:text-emerald-400 font-bold";
                  statusPill = (
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                  );
                } else {
                  // Past day without activity: MERAH (Missed)
                  cellStyle =
                    "border border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60 text-rose-600 dark:text-rose-400";
                  numBadgeStyle = "text-rose-500 font-semibold";
                  statusPill = (
                    <span className="text-[8px] font-bold text-rose-500">Missed</span>
                  );
                }
              } else {
                // Future days
                if (hasWork) {
                  // Ada rencana kerja: GOLDEN SOLID BORDER
                  cellStyle =
                    "border-2 border-amber-500/60 bg-amber-500/5 hover:border-amber-500/90 text-amber-800 dark:text-amber-300 shadow-xs";
                  numBadgeStyle = "text-amber-700 dark:text-amber-200 font-extrabold";
                  statusPill = (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
                      {dayTasks.length} tugas
                    </span>
                  );
                } else {
                  // Clean neutral
                  cellStyle =
                    "border border-border/50 bg-card hover:border-border text-muted-foreground/60";
                  numBadgeStyle = "text-muted-foreground font-medium";
                  statusPill = null;
                }
              }

              // Dim non-current month
              if (!cell.isCurrentMonth) {
                cellStyle = "opacity-35 bg-muted/10 border-border/30";
              }

              // Selected focus ring (Streak Biru)
              if (isSelected) {
                cellStyle += " ring-2 ring-primary border-primary shadow-md";
              }

              return (
                <div
                  key={`${cell.dateKey}-${idx}`}
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl transition-all cursor-pointer flex flex-col justify-between select-none relative ${cellStyle}`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs rounded-md h-6 w-6 flex items-center justify-center ${numBadgeStyle}`}
                    >
                      {cell.dayNum}
                    </span>

                    <div className="flex items-center gap-1">
                      {hasOverdue && (
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                      {statusPill}
                    </div>
                  </div>

                  {/* Tasks Snippets */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map((t) => {
                      const isDone = completedTaskIds.has(t.id) || t.status === "completed";
                      return (
                        <div
                          key={t.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded-md font-medium ${
                            t.isOverdue && !isDone
                              ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30"
                              : isDone
                              ? "line-through opacity-50 bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {t.title}
                        </div>
                      );
                    })}

                    {dayTasks.length > 2 && (
                      <span className="text-[9px] text-muted-foreground font-semibold block text-right">
                        +{dayTasks.length - 2} lainnya
                      </span>
                    )}
                  </div>

                  {/* Bottom Day Status */}
                  <div className="text-right text-[9px] text-muted-foreground font-semibold">
                    {dayTasks.length > 0 && isAllDone ? (
                      <span className="text-emerald-600 font-bold flex items-center justify-end gap-0.5">
                        <Check className="h-2.5 w-2.5" /> Selesai
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Color Legend Bar */}
          <div className="pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-foreground">Panduan Warna Kalender:</span>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
                <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                  Hijau = Streak Aktif
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
                <span className="text-amber-700 dark:text-amber-300 font-bold">
                  Golden = Belum Streak / Ada Rencana Kerja
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  Merah = Streak Terlewat / Overdue
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/30" />
                <span className="text-primary font-bold">Biru = Terpilih</span>
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Selected Day Strategic Breakdown Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Workload Coach Card */}
          {plannerData && (
            <div
              className={`rounded-3xl p-5 border shadow-sm space-y-3 ${
                plannerData.aiTone === "urgent"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200"
                  : "bg-gradient-to-br from-primary/10 via-card to-card border-primary/25 text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold font-heading">
                  Analisis Strategis Beban Kerja
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {plannerData.aiInsight}
              </p>
            </div>
          )}

          {/* Selected Date Detail Panel */}
          <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="border-b border-border/50 pb-3">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Rincian Jadwal
              </span>
              <h3 className="text-base font-bold text-foreground font-heading mt-0.5">
                Target: {selectedDateKey}
              </h3>
              <p className="text-xs text-muted-foreground">
                {selectedDayTasks.length} tugas dijadwalkan &bull; Total est.{" "}
                {selectedDayTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0)} menit
              </p>
            </div>

            {/* Tasks Checklist for Selected Date */}
            {selectedDayTasks.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/50 mx-auto" />
                <p className="text-xs font-bold text-foreground">Tidak Ada Beban Tugas</p>
                <p className="text-[11px] text-muted-foreground">
                  Hari ini bebas dari jadwal penyerahan dan target proyek.
                </p>
                <div className="pt-2 flex items-center justify-center gap-3 text-xs">
                  <Link href="/freelancer/skills" className="font-bold text-primary hover:underline">
                    Ikuti Kuis (+XP) →
                  </Link>
                  <Link href="/freelancer/explore" className="font-bold text-primary hover:underline">
                    Cari Proyek →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayTasks.map((task) => {
                  const isDone = completedTaskIds.has(task.id) || task.status === "completed";
                  const isUrgent = task.isOverdue && !isDone;

                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isUrgent
                          ? "bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200 shadow-xs"
                          : isDone
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                          : "bg-muted/20 border-border/60"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleTask(task)}
                        className={`h-4 w-4 rounded-md border mt-0.5 flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          isDone
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : isUrgent
                            ? "border-rose-500 text-rose-500 hover:bg-rose-500/10"
                            : "border-muted-foreground/40 hover:border-primary text-transparent"
                        }`}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </button>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                              isUrgent
                                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold"
                                : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isUrgent ? `⚠️ Terlambat ${task.daysLate}h` : task.category}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            +{task.xpReward} XP
                          </span>
                        </div>

                        <h4
                          className={`text-xs font-bold ${
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </h4>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>

                        <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Est. {task.estimatedMinutes} Menit</span>
                          {task.actionUrl && (
                            <Link
                              href={task.actionUrl}
                              className="font-bold text-primary hover:underline"
                            >
                              Buka Tindakan →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
