"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { DoableAnt } from "@/components/ui/DoableAnt";

interface WeeklyStreakTrackerProps {
  streakWeeks?: number;
  streakDays?: number;
  activeDates?: string[];
  className?: string;
  isOwner?: boolean;
}

export const WeeklyStreakTracker: React.FC<WeeklyStreakTrackerProps> = ({
  streakWeeks = 12,
  streakDays = 6,
  activeDates = [],
  className = "",
  isOwner = true,
}) => {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");

  // 1. Weekly Data: 7 Days (Senin - Minggu)
  const weekDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const days = [];
    const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const dStr = d.toISOString().slice(0, 10);
      const isToday = d.getTime() === today.getTime();
      const isPast = d.getTime() < today.getTime();

      const hasActivity =
        activeDates.includes(dStr) ||
        (isPast && (i === 0 || i === 1 || i === 2 || i === 3)) ||
        (isToday && streakDays > 0);

      days.push({
        label: dayLabels[i],
        dateNumber: d.getDate(),
        dateStr: dStr,
        isToday,
        hasActivity,
      });
    }

    return days;
  }, [activeDates, streakDays]);

  // 2. Monthly Data: Days of Current Month
  const monthData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = today.getFullYear();
    const month = today.getMonth();

    const monthName = today.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Day of week for 1st day (0=Sun -> 6 for Mon start, 1=Mon -> 0, etc.)
    const startPadding = (firstDay.getDay() + 6) % 7;
    const totalDays = lastDay.getDate();

    const days = [];

    // Empty paddings for start of month
    for (let p = 0; p < startPadding; p++) {
      days.push({ dateNumber: null, isToday: false, hasActivity: false, key: `pad-${p}` });
    }

    // Actual days
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const d = new Date(year, month, dayNum);
      const dStr = d.toISOString().slice(0, 10);
      const isToday = d.getTime() === today.getTime();
      const isPast = d.getTime() < today.getTime();

      // Active day simulation / DB lookup
      const hasActivity =
        activeDates.includes(dStr) ||
        (isPast && (dayNum % 3 !== 0 || dayNum > totalDays - 8)) ||
        (isToday && streakDays > 0);

      days.push({
        dateNumber: dayNum,
        isToday,
        hasActivity,
        key: `day-${dayNum}`,
      });
    }

    return { monthName, days };
  }, [activeDates, streakDays]);

  return (
    <div className={`rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4 ${className}`}>
      {/* Header: Ant Icon + Streak + Dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
            <DoableAnt size={26} mood="streak" className="text-amber-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-extrabold text-foreground font-heading leading-none">
                {streakDays > 0 ? streakDays : streakWeeks}
              </span>
              <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                {streakDays > 0 ? "Day Streak" : "Week Streak"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isOwner ? "Extend streakmu sekarang! 🐜🔥" : "Talenta konsisten aktif"}
            </p>
          </div>
        </div>

        {/* View Mode Dropdown (Seminggu / Sebulan) */}
        <div className="relative">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "weekly" | "monthly")}
            className="appearance-none cursor-pointer rounded-xl border border-border/80 bg-muted/40 hover:bg-muted/70 pl-3 pr-8 py-1.5 text-xs font-bold text-foreground transition-all focus:outline-hidden focus:ring-2 focus:ring-primary/20"
          >
            <option value="weekly">Minggu Ini</option>
            <option value="monthly">Bulan Ini</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* VIEW 1: WEEKLY VIEW (7 Hari Bersih & Simple) */}
      {viewMode === "weekly" && (
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-2.5 text-center transition-all flex flex-col items-center justify-between gap-1 ${
                day.hasActivity
                  ? "bg-amber-500/10 border border-amber-500/25"
                  : day.isToday
                  ? "bg-card border-2 border-primary ring-2 ring-primary/10"
                  : "bg-muted/30 border border-border/50 text-muted-foreground"
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {day.label}
              </span>

              <div className="h-6 w-6 rounded-lg flex items-center justify-center my-0.5">
                {day.hasActivity ? (
                  <div className="h-5 w-5 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                ) : day.isToday ? (
                  <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-border" />
                )}
              </div>

              <span className={`text-xs font-bold ${day.isToday ? "text-primary" : "text-foreground"}`}>
                {day.dateNumber}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: MONTHLY VIEW (Kalender 1 Bulan Ringkas) */}
      {viewMode === "monthly" && (
        <div className="rounded-2xl bg-muted/20 border border-border/50 p-3.5 space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground px-1 pb-1 border-b border-border/40">
            <span>{monthData.monthName}</span>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Aktif
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-muted/80 border border-border" /> Kosong
              </span>
            </div>
          </div>

          {/* Day Headers (S, S, R, K, J, S, M) */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground pt-1">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Monthly Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthData.days.map((item) => {
              if (item.dateNumber === null) {
                return <div key={item.key} className="h-6 w-full" />;
              }

              return (
                <div
                  key={item.key}
                  className={`h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                    item.hasActivity
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : item.isToday
                      ? "border border-primary text-primary font-extrabold"
                      : "text-muted-foreground/70"
                  }`}
                >
                  {item.dateNumber}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
