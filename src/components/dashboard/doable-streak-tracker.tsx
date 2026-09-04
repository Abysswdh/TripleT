"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Flame, Check, X, CircleDot } from "lucide-react";
import { formatLocalDateKey } from "@/lib/services/activity";
import { useAuth } from "@/hooks/use-auth";

interface DoableStreakTrackerProps {
  streakDays?: number;
  streakWeeks?: number;
  activeDates?: string[];
  totalContributions?: number;
  className?: string;
  isOwner?: boolean;
  userCreatedAt?: string | Date | null;
}

export const DoableStreakTracker: React.FC<DoableStreakTrackerProps> = ({
  streakDays = 0,
  activeDates: initialActiveDates = [],
  totalContributions = 0,
  className = "",
  isOwner = true,
  userCreatedAt,
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [liveActiveDates, setLiveActiveDates] = useState<string[]>(initialActiveDates);
  const [liveStreakDays, setLiveStreakDays] = useState<number>(streakDays);

  // Determine user account registration date in local calendar format (YYYY-MM-DD)
  const joinedDateStr = useMemo(() => {
    const raw = userCreatedAt || (isOwner ? user?.created_at : null);
    if (!raw) return null;
    return formatLocalDateKey(raw);
  }, [userCreatedAt, isOwner, user?.created_at]);

  // Sync props to state
  useEffect(() => {
    setLiveActiveDates(initialActiveDates);
    setLiveStreakDays(streakDays);
  }, [initialActiveDates, streakDays]);

  // Listen to live XP and quiz completion events to instantly light up today
  useEffect(() => {
    const handleLiveActivity = () => {
      const todayStr = formatLocalDateKey(new Date());
      setLiveActiveDates((prev) => {
        if (!prev.includes(todayStr)) {
          setLiveStreakDays((currStreak) => currStreak + 1);
          return [...prev, todayStr];
        }
        return prev;
      });
    };

    window.addEventListener("xp-updated", handleLiveActivity as EventListener);
    window.addEventListener("quiz-completed", handleLiveActivity as EventListener);
    return () => {
      window.removeEventListener("xp-updated", handleLiveActivity as EventListener);
      window.removeEventListener("quiz-completed", handleLiveActivity as EventListener);
    };
  }, []);

  // Compute 4 Weeks of Data (4 Rows x 7 Days) strictly from REAL active dates
  // Current Day (Hari Ini) is placed at the CENTER (index 3 of 7 columns) with a prominent indicator badge!
  const allWeeks = useMemo(() => {
    const today = new Date();

    const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const weeks = [];

    // Build 4 rows of 7 days:
    // Row 0: Center (i=3) is TODAY (offset 0). Left: 3 past days. Right: 3 future days.
    // Row w (1..3): Shifts backwards by w * 7 days.
    for (let w = 0; w < 4; w++) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        // (3 - i) places column 3 as offset 0 for row 0
        const dayOffset = (3 - i) + (w * 7);
        const d = new Date(today);
        d.setDate(today.getDate() - dayOffset);

        const dStr = formatLocalDateKey(d);
        const isToday = dayOffset === 0;
        const isPast = dayOffset > 0;
        const isFuture = dayOffset < 0;
        const hasActivity = liveActiveDates.includes(dStr);

        days.push({
          label: DAY_LABELS[d.getDay()],
          dateNumber: d.getDate(),
          dateStr: dStr,
          isToday,
          isPast,
          isFuture,
          hasActivity,
        });
      }

      weeks.push({
        weekIndex: w,
        isCurrentWeek: w === 0,
        days,
      });
    }

    return weeks;
  }, [liveActiveDates]);

  // Find earliest recorded active date to distinguish between truly missed days vs days before user joined
  const earliestActiveDate = useMemo(() => {
    if (liveActiveDates.length === 0) return null;
    const sorted = [...liveActiveDates].sort();
    return sorted[0];
  }, [liveActiveDates]);

  // If collapsed: show the current week (Row 0, with Today in the center). If expanded: show all 4 weeks.
  const displayedWeeks = isExpanded ? allWeeks : [allWeeks[0]];

  return (
    <div className={`rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5 shadow-sm space-y-3 ${className}`}>
      {/* Header: Clean Streak Count with GOLD number color */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400 font-heading leading-none drop-shadow-xs">
              {liveStreakDays}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-500 dark:text-amber-400 flex items-center gap-1">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              Day Streak
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
            {isOwner
              ? liveStreakDays > 0
                ? "Streak aktif! Pertahankan konsistensimu hari ini 🔥"
                : "Kerjakan kuis, proposal, atau misi untuk memulai streak!"
              : `Total ${totalContributions} kontribusi aktif`}
          </p>
        </div>
      </div>

      {/* 7-COLUMN GRID (Today placed in the CENTER at column index 3) */}
      <div className="space-y-2 pt-1 transition-all duration-300">
        {displayedWeeks.map((week, wIdx) => (
          <div
            key={wIdx}
            className="grid grid-cols-7 gap-1 sm:gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200 pt-1"
          >
            {week.days.map((day, dIdx) => {
              // Determine card theme:
              // 1. Today with running streak: GREEN!
              // 2. Today pending: AMBER/GOLD!
              // 3. Past day with activity: GREEN!
              // 4. Past day missed (AFTER user has active history): RED!
              // 5. Past day for new user (BEFORE user ever had activity): GRAY!
              // 6. Future day: MUTED!
              const isTodayRunning = day.isToday && day.hasActivity;
              const isTodayPending = day.isToday && !day.hasActivity;
              const isPastCompleted = day.isPast && day.hasActivity;

              // Check if user was already registered on or before this day
              const isAfterJoin = joinedDateStr !== null ? day.dateStr >= joinedDateStr : false;
              // Or if user had recorded active history before this day
              const isAfterFirstActivity = earliestActiveDate !== null ? day.dateStr > earliestActiveDate : false;

              // Mark missed (RED) if user already had an active account on this day (or had prior activity) but had no activity
              const isPastMissed =
                day.isPast && !day.hasActivity && (isAfterJoin || isAfterFirstActivity);
              // For past days before user joined / had any activity, keep it neutral GRAY
              const isPastNeutral =
                day.isPast && !day.hasActivity && !isPastMissed;

              let cardStyle = "bg-muted/15 border border-border/40 text-muted-foreground/50 opacity-60";
              let labelStyle = "text-muted-foreground/60 font-medium";
              let numberStyle = "text-muted-foreground/60 font-bold";

              if (isTodayRunning) {
                cardStyle = "bg-gradient-to-b from-emerald-500/25 via-emerald-500/15 to-emerald-500/5 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-300 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/40";
                labelStyle = "text-emerald-600 dark:text-emerald-300 font-extrabold";
                numberStyle = "text-emerald-700 dark:text-emerald-200 font-black";
              } else if (isTodayPending) {
                cardStyle = "bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent border-2 border-dashed border-amber-500/70 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/30";
                labelStyle = "text-amber-600 dark:text-amber-400 font-extrabold";
                numberStyle = "text-amber-700 dark:text-amber-300 font-black";
              } else if (isPastCompleted) {
                cardStyle = "bg-gradient-to-b from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 border border-emerald-500/40 text-emerald-600 dark:text-emerald-300 shadow-xs shadow-emerald-500/10";
                labelStyle = "text-emerald-600 dark:text-emerald-300 font-bold";
                numberStyle = "text-emerald-700 dark:text-emerald-200 font-black";
              } else if (isPastMissed) {
                cardStyle = "bg-gradient-to-b from-rose-500/15 via-rose-500/10 to-rose-500/5 border border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-xs shadow-rose-500/10";
                labelStyle = "text-rose-500/90 dark:text-rose-400/90 font-bold";
                numberStyle = "text-rose-600 dark:text-rose-300 font-black";
              } else if (isPastNeutral) {
                // Neutral gray for days before user joined / had activity
                cardStyle = "bg-muted/20 border border-border/50 text-muted-foreground/70";
                labelStyle = "text-muted-foreground/70 font-semibold";
                numberStyle = "text-muted-foreground/80 font-bold";
              }

              return (
                <div
                  key={dIdx}
                  title={
                    day.isToday
                      ? day.hasActivity
                        ? "Hari ini: Streak sedang berjalan! 🔥 (Hijau)"
                        : "Hari ini: Belum ada aktivitas, kerjakan misi/kuis untuk mengaktifkan streak!"
                      : day.hasActivity
                      ? `Selesai: Aktivitas tercatat pada ${day.dateStr} (Hijau)`
                      : isPastMissed
                      ? `Terlewat: Tidak ada aktivitas pada ${day.dateStr} (Merah)`
                      : isPastNeutral
                      ? `Sebelum bergabung: ${day.dateStr} (Abu-abu)`
                      : `Mendatang: ${day.dateStr}`
                  }
                  className={`group relative rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-center transition-all duration-200 flex flex-col items-center justify-between gap-1 hover:scale-105 cursor-default ${cardStyle}`}
                >
                  {/* Floating Indicator Badge for Current Day (Hari Ini) in Center */}
                  {day.isToday && (
                    <span
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded-full text-white text-[8px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap z-10 flex items-center gap-1 ${
                        day.hasActivity ? "bg-emerald-600" : "bg-amber-500"
                      }`}
                    >
                      <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                      Hari Ini
                    </span>
                  )}

                  {/* Top: Day Label */}
                  <span className={`text-[9px] sm:text-[10px] uppercase tracking-tight block ${labelStyle}`}>
                    {day.label}
                  </span>

                  {/* Center: Date Number */}
                  <span className={`text-xs sm:text-sm font-heading leading-none ${numberStyle}`}>
                    {day.dateNumber}
                  </span>

                  {/* Bottom: Mini Status Indicator */}
                  <div className="h-3 flex items-center justify-center">
                    {isTodayRunning && <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />}
                    {isTodayPending && <CircleDot className="h-3 w-3 text-amber-500 animate-pulse" />}
                    {isPastCompleted && <Check className="h-2.5 w-2.5 text-emerald-500 stroke-[3]" />}
                    {isPastMissed && <X className="h-2.5 w-2.5 text-rose-500 stroke-[2.5]" />}
                    {isPastNeutral && <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30" />}
                    {day.isFuture && <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* EXPAND / COLLAPSE BUTTON */}
      <div className="pt-0.5 flex justify-center">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/70 transition-colors py-0.5 px-1 hover:underline underline-offset-2"
        >
          <span>{isExpanded ? "Less" : "More"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>
    </div>
  );
};
