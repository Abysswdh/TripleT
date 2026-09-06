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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatLocalDateKey, logActivity } from "@/lib/services/activity";
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

  // Load completed tasks
  useEffect(() => {
    setCompletedTaskIds(new Set(getStoredCompletedTaskIds()));
  }, []);

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
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-0.5 text-xs font-bold text-primary">
              <Brain className="h-3.5 w-3.5" />
              AI Workload Leveling
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Perencanaan beban kerja terdistribusi cerdas agar terhindar dari overwork dan deadline terlambat.
          </p>
        </div>

        {/* Capacity Indicator Pill */}
        {plannerData && (
          <div className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl p-3 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Kapasitas Harian
              </div>
              <div className="text-sm font-bold text-foreground">
                {plannerData.dailyCapacityHours} Jam / Hari
              </div>
              <div className="text-[11px] text-primary font-semibold">
                Tersedia: {plannerData.weeklyAvailability === "part_time" ? "Side-Hustle" : plannerData.weeklyAvailability === "full_time" ? "Full-Time" : "Part-Time Aktif"}
              </div>
            </div>
          </div>
        )}
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
            <span>Minggu</span>
            <span>Senin</span>
            <span>Selasa</span>
            <span>Rabu</span>
            <span>Kamis</span>
            <span>Jumat</span>
            <span>Sabtu</span>
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarGrid.map((cell, idx) => {
              const dayTasks = plannerData?.days[cell.dateKey]?.tasks || [];
              const hasOverdue = plannerData?.days[cell.dateKey]?.hasOverdue || false;
              const isSelected = cell.dateKey === selectedDateKey;

              return (
                <div
                  key={`${cell.dateKey}-${idx}`}
                  onClick={() => setSelectedDateKey(cell.dateKey)}
                  className={`min-h-[85px] sm:min-h-[105px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between select-none relative ${
                    !cell.isCurrentMonth
                      ? "opacity-35 bg-muted/10 border-border/30"
                      : isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/30 shadow-md"
                      : "bg-card border-border/60 hover:border-primary/50 hover:bg-muted/20"
                  } ${cell.isToday ? "border-primary/70" : ""}`}
                >
                  {/* Top Day Header */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold rounded-md h-6 w-6 flex items-center justify-center ${
                        cell.isToday
                          ? "bg-primary text-white font-extrabold shadow-xs"
                          : isSelected
                          ? "text-primary font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasOverdue && (
                      <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                    )}
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
                    {dayTasks.length > 0 ? `${dayTasks.length} tugas` : ""}
                  </div>
                </div>
              );
            })}
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
                          ? "bg-rose-500/10 border-rose-500/40 text-rose-900 dark:text-rose-200"
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
                                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
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
