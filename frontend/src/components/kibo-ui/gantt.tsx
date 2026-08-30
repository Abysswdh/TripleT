"use client";

import React, { createContext, useContext, useMemo } from "react";

export interface GanttStatus {
  id: string;
  name: string;
  color?: string;
}

export interface GanttFeature {
  id: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status?: GanttStatus;
  progress?: number;
  isPendingApproval?: boolean;
  approvalNote?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
}

interface GanttContextType {
  range: "daily" | "weekly" | "monthly";
  zoom: number;
  minDate: Date;
  maxDate: Date;
  totalDays: number;
  today: Date;
  calculatePosition: (startAt: Date, endAt: Date) => { leftPercent: number; widthPercent: number };
  calculateDatePosition: (date: Date) => number;
  timeColumns: Array<{ id: string; label: string; subLabel?: string; start: Date; end: Date }>;
}

const GanttContext = createContext<GanttContextType | null>(null);

export function useGantt() {
  const context = useContext(GanttContext);
  if (!context) {
    throw new Error("useGantt must be used within a GanttProvider");
  }
  return context;
}

interface GanttProviderProps {
  children: React.ReactNode;
  range?: "daily" | "weekly" | "monthly";
  zoom?: number;
  className?: string;
  startDate?: Date;
  endDate?: Date;
  todayDate?: Date;
}

export function GanttProvider({
  children,
  range = "daily",
  zoom = 100,
  className = "",
  startDate,
  endDate,
  todayDate,
}: GanttProviderProps) {
  // Compute timeline boundaries (default 14 to 28 days for portfolio-focused sprints)
  const minDate = useMemo(() => {
    if (startDate) return new Date(startDate);
    const d = new Date("2026-03-01");
    return d;
  }, [startDate]);

  const maxDate = useMemo(() => {
    if (endDate) return new Date(endDate);
    const d = new Date("2026-03-21");
    return d;
  }, [endDate]);

  const today = useMemo(() => {
    if (todayDate) return new Date(todayDate);
    const realNow = new Date();
    if (realNow >= minDate && realNow <= maxDate) {
      return realNow;
    }
    // Mid sprint active day (e.g. Day 6 of the sprint)
    const mid = new Date(minDate);
    mid.setDate(mid.getDate() + 5);
    return mid;
  }, [todayDate, minDate, maxDate]);

  const totalDays = useMemo(() => {
    const diff = maxDate.getTime() - minDate.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [minDate, maxDate]);

  // Generate column headers based on range (daily, weekly, monthly)
  const timeColumns = useMemo(() => {
    const cols: Array<{ id: string; label: string; subLabel?: string; start: Date; end: Date }> = [];
    const daysShort = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    if (range === "daily") {
      const current = new Date(minDate);
      while (current <= maxDate) {
        const d = new Date(current);
        const nextDay = new Date(current);
        nextDay.setDate(nextDay.getDate() + 1);

        cols.push({
          id: `d-${d.toISOString().slice(0, 10)}`,
          label: `${d.getDate()} ${months[d.getMonth()]}`,
          subLabel: daysShort[d.getDay()],
          start: d,
          end: nextDay,
        });

        current.setDate(current.getDate() + 1);
      }
    } else if (range === "weekly") {
      const current = new Date(minDate);
      let weekNum = 1;
      while (current <= maxDate) {
        const startW = new Date(current);
        const endW = new Date(current);
        endW.setDate(endW.getDate() + 6);

        cols.push({
          id: `w-${weekNum}`,
          label: `Minggu ${weekNum}`,
          subLabel: `${startW.getDate()} ${months[startW.getMonth()]} - ${endW.getDate()} ${months[endW.getMonth()]}`,
          start: startW,
          end: endW,
        });

        current.setDate(current.getDate() + 7);
        weekNum++;
      }
    } else {
      // Monthly
      const current = new Date(minDate);
      current.setDate(1);
      while (current <= maxDate) {
        const year = current.getFullYear();
        const monthIdx = current.getMonth();
        const nextMonth = new Date(year, monthIdx + 1, 1);

        cols.push({
          id: `m-${year}-${monthIdx}`,
          label: `${months[monthIdx]} ${year}`,
          subLabel: `${nextMonth.getDate() - 1} hari`,
          start: new Date(year, monthIdx, 1),
          end: nextMonth,
        });

        current.setMonth(current.getMonth() + 1);
      }
    }
    return cols;
  }, [range, minDate, maxDate]);

  const calculatePosition = (startAt: Date, endAt: Date) => {
    const startTime = new Date(startAt).getTime();
    const endTime = new Date(endAt).getTime();
    const minTime = minDate.getTime();
    const totalTime = maxDate.getTime() - minTime;

    const startOffset = Math.max(0, startTime - minTime);
    const duration = Math.max(1000 * 60 * 60 * 24, endTime - startTime);

    const leftPercent = (startOffset / totalTime) * 100;
    const widthPercent = Math.max(3, (duration / totalTime) * 100);

    return { leftPercent, widthPercent };
  };

  const calculateDatePosition = (date: Date) => {
    const time = new Date(date).getTime();
    const minTime = minDate.getTime();
    const totalTime = maxDate.getTime() - minTime;
    const rawPercent = ((time - minTime) / totalTime) * 100;
    return Math.min(95, Math.max(5, rawPercent));
  };

  return (
    <GanttContext.Provider
      value={{
        range,
        zoom,
        minDate,
        maxDate,
        totalDays,
        today,
        calculatePosition,
        calculateDatePosition,
        timeColumns,
      }}
    >
      <div
        className={`relative flex flex-col md:flex-row overflow-hidden bg-card text-foreground select-none shadow-sm ${className}`}
      >
        {children}
      </div>
    </GanttContext.Provider>
  );
}

// -------------------------------------------------------------
// GanttSidebar
// -------------------------------------------------------------
export function GanttSidebar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-border bg-card/80 flex flex-col ${className}`}
    >
      <div className="h-16 border-b border-border/80 px-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
        <div className="space-y-0.5">
          <span className="block text-foreground font-bold">Task & Deliverables</span>
          <span className="text-[10px] font-medium lowercase text-muted-foreground">Sprint Organizer</span>
        </div>
        <span>Status</span>
      </div>
      <div className="flex flex-col divide-y divide-border/40 overflow-y-auto max-h-[380px] md:max-h-none">
        {children}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttSidebarItem
// -------------------------------------------------------------
export function GanttSidebarItem({
  feature,
  onClick,
  className = "",
}: {
  feature: GanttFeature;
  onClick?: (feature: GanttFeature) => void;
  className?: string;
}) {
  const statusColor = feature.status?.color || "#3b82f6";
  const startStr = new Date(feature.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const endStr = new Date(feature.endAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  return (
    <div
      onClick={() => onClick?.(feature)}
      className={`h-12 px-4 flex items-center justify-between gap-3 text-xs hover:bg-muted/60 cursor-pointer transition-colors ${className}`}
      title="Klik untuk menggeser atau menyesuaikan jadwal task ini"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`h-2.5 w-2.5 rounded-full shrink-0 shadow-xs ${
            feature.isPendingApproval ? "animate-pulse" : ""
          }`}
          style={{ backgroundColor: statusColor }}
        />
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate flex items-center gap-1.5">
            <span>{feature.name}</span>
            {feature.isPendingApproval && (
              <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-bold px-1.5 py-0.2 border border-amber-500/30 shrink-0">
                Menunggu Review
              </span>
            )}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">
            {startStr} – {endStr}
          </p>
        </div>
      </div>

      {feature.status && !feature.isPendingApproval && (
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 border"
          style={{
            color: statusColor,
            backgroundColor: `${statusColor}15`,
            borderColor: `${statusColor}30`,
          }}
        >
          {feature.status.name}
        </span>
      )}
    </div>
  );
}

// -------------------------------------------------------------
// GanttTimeline
// -------------------------------------------------------------
export function GanttTimeline({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { range } = useGantt();
  const minWidth = range === "daily" ? "min-w-[960px]" : "min-w-[600px]";

  return (
    <div className={`flex-1 overflow-x-auto overflow-y-hidden relative bg-muted/10 ${className}`}>
      <div className={`${minWidth} relative h-full flex flex-col`}>{children}</div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttHeader (2-Tier Header with Dedicated Top Space for Today marker)
// -------------------------------------------------------------
export function GanttHeader({ className = "" }: { className?: string }) {
  const { timeColumns, range, today } = useGantt();

  return (
    <div className={`h-16 border-b border-border/80 flex flex-col bg-muted/20 ${className}`}>
      {/* Top Track dedicated for markers and sprint info */}
      <div className="h-6 border-b border-border/30 px-3 flex items-center justify-between text-[10px] font-semibold text-muted-foreground/75 bg-muted/30">
        <span>Sprint Timeline (Maret 2026)</span>
        <span>{range === "daily" ? "Mode: Harian (Daily)" : "Mode: Mingguan (Weekly)"}</span>
      </div>

      {/* Date Columns Bottom Track */}
      <div className="h-10 flex items-stretch">
        {timeColumns.map((col, idx) => {
          const isTodayCol = col.start <= today && today < col.end;

          return (
            <div
              key={col.id}
              className={`flex-1 border-r border-border/40 last:border-r-0 px-1.5 flex flex-col justify-center text-center transition-colors ${
                isTodayCol
                  ? "bg-rose-500/10 text-rose-600 font-bold"
                  : idx % 2 === 0
                  ? "bg-muted/10"
                  : ""
              }`}
            >
              <span
                className={`text-[11px] truncate ${
                  isTodayCol ? "font-bold text-rose-600 dark:text-rose-400" : "font-semibold text-foreground"
                }`}
              >
                {col.label}
              </span>
              <span
                className={`text-[9px] truncate ${
                  isTodayCol ? "font-bold text-rose-500" : "text-muted-foreground"
                }`}
              >
                {col.subLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttFeatureList
// -------------------------------------------------------------
export function GanttFeatureList({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { timeColumns } = useGantt();

  return (
    <div className={`relative flex flex-col divide-y divide-border/40 ${className}`}>
      {/* Background Vertical Grid Columns */}
      <div className="absolute inset-0 flex pointer-events-none">
        {timeColumns.map((col, idx) => (
          <div
            key={col.id}
            className={`flex-1 border-r border-border/30 last:border-r-0 ${
              idx % 2 === 0 ? "bg-muted/5" : ""
            }`}
          />
        ))}
      </div>

      {/* Foreground Tasks */}
      <div className="relative z-10 flex flex-col divide-y divide-border/40">{children}</div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttFeatureItem
// -------------------------------------------------------------
export function GanttFeatureItem({
  onClick,
  className = "",
  ...props
}: GanttFeature & {
  onClick?: (feature: GanttFeature) => void;
  className?: string;
}) {
  const { calculatePosition } = useGantt();
  const { leftPercent, widthPercent } = calculatePosition(props.startAt, props.endAt);

  const statusColor = props.status?.color || "#3b82f6";
  const startStr = new Date(props.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const endStr = new Date(props.endAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  return (
    <div className="h-12 relative flex items-center px-1">
      <div
        onClick={() => onClick?.(props)}
        className={`group absolute h-8 rounded-xl flex items-center justify-between px-3 text-xs font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer ${
          props.isPendingApproval ? "border-2 border-dashed border-amber-300 ring-2 ring-amber-400/40" : ""
        } ${className}`}
        style={{
          left: `${leftPercent}%`,
          width: `${Math.max(8, widthPercent)}%`,
          backgroundColor: props.isPendingApproval ? "#f59e0b" : statusColor,
        }}
        title={`Klik untuk menggeser jadwal: ${props.name} (${startStr} - ${endStr})`}
      >
        <span className="truncate pr-1 drop-shadow-xs flex items-center gap-1.5">
          <span>{props.name}</span>
          {props.isPendingApproval && (
            <span className="text-[10px] bg-black/20 rounded px-1 font-bold">⏳ Draft</span>
          )}
        </span>
        <span className="text-[10px] opacity-90 shrink-0 font-normal hidden sm:inline">
          {startStr} – {endStr}
        </span>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttToday (Clean Top Track Badge + Red Line Dropping Down)
// -------------------------------------------------------------
export function GanttToday({ className = "" }: { className?: string }) {
  const { calculateDatePosition, today } = useGantt();
  const todayPercent = calculateDatePosition(today);
  const dateLabel = new Date(today).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  return (
    <div
      className={`absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center -translate-x-1/2 transition-all duration-300 ${className}`}
      style={{ left: `${todayPercent}%` }}
    >
      {/* Sits cleanly in the dedicated top track (0-24px) without covering date text */}
      <div className="mt-0.5 flex items-center gap-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold px-2 py-0.5 shadow-sm border border-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
        <span>Hari Ini ({dateLabel})</span>
      </div>
      <div className="w-0.5 flex-1 bg-rose-500/80 shadow-xs" />
    </div>
  );
}
