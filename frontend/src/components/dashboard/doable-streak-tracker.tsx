"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DoableStreakTrackerProps {
  streakDays?: number;
  streakWeeks?: number;
  activeDates?: string[];
  totalContributions?: number;
  className?: string;
  isOwner?: boolean;
}

export const DoableStreakTracker: React.FC<DoableStreakTrackerProps> = ({
  streakDays = 0,
  activeDates: initialActiveDates = [],
  totalContributions = 0,
  className = "",
  isOwner = true,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [liveActiveDates, setLiveActiveDates] = useState<string[]>(initialActiveDates);
  const [liveStreakDays, setLiveStreakDays] = useState<number>(streakDays);

  // Sync props to state
  useEffect(() => {
    setLiveActiveDates(initialActiveDates);
    setLiveStreakDays(streakDays);
  }, [initialActiveDates, streakDays]);

  // Listen to live XP and quiz completion events to instantly light up today in Yellow
  useEffect(() => {
    const handleLiveActivity = () => {
      const todayStr = new Date().toISOString().slice(0, 10);
      setLiveActiveDates((prev) => (prev.includes(todayStr) ? prev : [...prev, todayStr]));
      setLiveStreakDays((prev) => (prev > 0 ? prev : 1));
    };

    window.addEventListener("xp-updated", handleLiveActivity as EventListener);
    window.addEventListener("quiz-completed", handleLiveActivity as EventListener);
    return () => {
      window.removeEventListener("xp-updated", handleLiveActivity as EventListener);
      window.removeEventListener("quiz-completed", handleLiveActivity as EventListener);
    };
  }, []);

  // Compute 4 Weeks of Data (4 Rows x 7 Days) strictly from REAL active dates
  const allWeeks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    // Monday of the CURRENT week
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + distanceToMonday);

    const dayLabels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
    const weeks = [];

    // Build 4 weeks (from 3 weeks ago up to current week)
    for (let w = 3; w >= 0; w--) {
      const weekMonday = new Date(currentMonday);
      weekMonday.setDate(currentMonday.getDate() - w * 7);

      const days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekMonday);
        d.setDate(weekMonday.getDate() + i);

        const dStr = d.toISOString().slice(0, 10);
        const isToday = d.getTime() === today.getTime();
        const isPast = d.getTime() < today.getTime();

        // REAL logic: True if this exact date has logged activity in activeDates
        const hasActivity = liveActiveDates.includes(dStr);

        days.push({
          label: dayLabels[i],
          dateNumber: d.getDate(),
          dateStr: dStr,
          isToday,
          isPast,
          hasActivity,
        });
      }

      weeks.push({
        weekIndex: 3 - w,
        isCurrentWeek: w === 0,
        days,
      });
    }

    return weeks;
  }, [liveActiveDates]);

  // If collapsed: only show the current week (last row). If expanded: show all 4 weeks.
  const displayedWeeks = isExpanded ? allWeeks : [allWeeks[allWeeks.length - 1]];

  return (
    <div className={`rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-4 sm:p-5 shadow-sm space-y-3 ${className}`}>
      {/* Header: Clean Streak Count (Logo icon removed) */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-foreground font-heading leading-none">
              {liveStreakDays}
            </span>
            <span className="text-xs sm:text-sm font-bold text-amber-500 dark:text-amber-400">
              Day Streak
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">
            {isOwner
              ? liveStreakDays > 0
                ? "Extend streakmu sekarang! 🔥"
                : "Extend streakmu sekarang!"
              : `Total ${totalContributions} kontribusi aktif`}
          </p>
        </div>
      </div>

      {/* GLOWING BOXES (Scaled down, sleek & compact) */}
      <div className="space-y-1.5 pt-0.5 transition-all duration-300">
        {displayedWeeks.map((week, wIdx) => (
          <div
            key={wIdx}
            className="grid grid-cols-7 gap-1 sm:gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
          >
            {week.days.map((day, dIdx) => (
              <div
                key={dIdx}
                title={day.hasActivity ? `Aktivitas tercatat pada ${day.dateStr} 🔥` : `Belum ada aktivitas pada ${day.dateStr}`}
                className={`group relative rounded-xl sm:rounded-2xl p-2 sm:p-2.5 text-center transition-all duration-200 flex flex-col items-center justify-between gap-1 hover:scale-105 cursor-default ${
                  day.hasActivity
                    ? "bg-gradient-to-b from-amber-500/20 via-amber-500/10 to-amber-500/5 border border-amber-400/90 text-amber-600 dark:text-amber-300 shadow-md shadow-amber-500/20 ring-1 ring-amber-400/20"
                    : "bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 border border-primary/40 text-primary shadow-xs shadow-primary/15"
                }`}
              >
                {/* Top: Day Label */}
                <span
                  className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-tight block ${
                    day.hasActivity ? "text-amber-600 dark:text-amber-300" : "text-primary/90 font-bold"
                  }`}
                >
                  {day.label}
                </span>

                {/* Bottom: Date Number */}
                <span
                  className={`text-xs sm:text-sm font-black font-heading leading-none ${
                    day.hasActivity ? "text-amber-700 dark:text-amber-200" : "text-primary"
                  }`}
                >
                  {day.dateNumber}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* EXPAND / COLLAPSE BUTTON (Pure Clean Text) */}
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
