"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  X,
} from "lucide-react";

export interface GanttStatus {
  id: string;
  name: string;
  color?: string;
}

export interface GanttFeature {
  id: string;
  milestoneId?: string;
  milestoneTitle?: string;
  name: string;
  startAt: Date;
  endAt: Date;
  status?: GanttStatus;
  progress?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  isCancelled?: boolean;
  cancelReason?: string | null;
  isPendingApproval?: boolean;
  approvalNote?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  dependencyTaskId?: string;
  laneIndex?: number;
}

/**
 * Interval Scheduling / Lane Packing Algorithm
 * Organizes overlapping tasks into clean horizontal lanes (sub-rows)
 * so that tasks occurring on the same day never collide or obscure each other.
 */
export function computeFeatureLanes(features: GanttFeature[]): {
  features: (GanttFeature & { laneIndex: number })[];
  totalLanes: number;
} {
  if (!features || features.length === 0) {
    return { features: [], totalLanes: 1 };
  }

  // Sort by startAt ascending, then by duration descending
  const sorted = [...features].sort((a, b) => {
    const diff = a.startAt.getTime() - b.startAt.getTime();
    if (diff !== 0) return diff;
    const durA = a.endAt.getTime() - a.startAt.getTime();
    const durB = b.endAt.getTime() - b.startAt.getTime();
    return durB - durA;
  });

  const laneEndTimes: number[] = [];
  const assigned = sorted.map((feat) => {
    const featStart = feat.startAt.getTime();
    const featEnd = feat.endAt.getTime();

    // Find the first lane where this task can fit without collision
    let targetLane = -1;
    for (let i = 0; i < laneEndTimes.length; i++) {
      if (featStart >= laneEndTimes[i]) {
        targetLane = i;
        laneEndTimes[i] = featEnd;
        break;
      }
    }

    // If no existing lane fits, create a new stacked lane
    if (targetLane === -1) {
      targetLane = laneEndTimes.length;
      laneEndTimes.push(featEnd);
    }

    return {
      ...feat,
      laneIndex: targetLane,
    };
  });

  return {
    features: assigned,
    totalLanes: Math.max(1, laneEndTimes.length),
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
  const minDate = useMemo(() => {
    if (startDate) return new Date(startDate);
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d;
  }, [startDate]);

  const maxDate = useMemo(() => {
    if (endDate) return new Date(endDate);
    const d = new Date();
    d.setDate(d.getDate() + 18);
    return d;
  }, [endDate]);

  const today = useMemo(() => {
    if (todayDate) return new Date(todayDate);
    return new Date();
  }, [todayDate]);

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

  // Calculate percentage position of a task inside timeline
  const calculatePosition = (startAt: Date, endAt: Date) => {
    const startMs = new Date(startAt).getTime();
    const endMs = new Date(endAt).getTime();
    const minMs = minDate.getTime();
    const maxMs = maxDate.getTime();
    const totalMs = Math.max(1, maxMs - minMs);

    const left = Math.max(0, Math.min(100, ((startMs - minMs) / totalMs) * 100));
    const width = Math.max(2, Math.min(100 - left, ((endMs - startMs) / totalMs) * 100));

    return {
      leftPercent: Number(left.toFixed(2)),
      widthPercent: Number(width.toFixed(2)),
    };
  };

  const calculateDatePosition = (date: Date) => {
    const dMs = new Date(date).getTime();
    const minMs = minDate.getTime();
    const maxMs = maxDate.getTime();
    const totalMs = Math.max(1, maxMs - minMs);

    const pos = Math.max(0, Math.min(100, ((dMs - minMs) / totalMs) * 100));
    return Number(pos.toFixed(2));
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
      className={`w-full md:w-72 lg:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border bg-card flex flex-col ${className}`}
    >
      <div className="h-16 border-b border-border/80 px-4 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
        <div className="space-y-0.5">
          <span className="block text-foreground font-bold">Daftar Tugas & Sprint</span>
          <span className="text-[10px] font-medium lowercase text-muted-foreground">Status & Progress</span>
        </div>
        <span>Aksi</span>
      </div>
      <div className="flex flex-col divide-y divide-border/40 overflow-y-auto max-h-[420px] md:max-h-none">
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
  const { today } = useGantt();
  const startStr = new Date(feature.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const endStr = new Date(feature.endAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const isCompleted = feature.status?.id === "completed" || (feature.progress ?? 0) >= 100;
  const isCancelled = Boolean(feature.isCancelled);
  const isLate = !isCancelled && !isCompleted && new Date(feature.endAt) < today;

  const effectiveStatus = isCancelled
    ? "cancelled"
    : isCompleted
    ? "completed"
    : isLate
    ? "late"
    : feature.status?.id || "planned";

  return (
    <div
      onClick={() => onClick?.(feature)}
      className={`min-h-[52px] py-2 px-3.5 flex items-center justify-between gap-2.5 text-xs hover:bg-muted/50 cursor-pointer transition-colors ${
        isCancelled ? "opacity-60 bg-muted/20" : ""
      } ${className}`}
      title="Klik untuk menggeser jadwal atau memperbarui status tugas ini"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`h-2.5 w-2.5 rounded-full shrink-0 shadow-xs ${
            isLate ? "bg-rose-500 animate-ping" : isCompleted ? "bg-emerald-500" : isCancelled ? "bg-gray-400" : "bg-blue-500"
          }`}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-semibold truncate max-w-[160px] sm:max-w-[180px] ${
                isCancelled ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {feature.name}
            </span>
            {feature.priority === "urgent" && (
              <span className="rounded bg-rose-500/15 text-rose-600 text-[9px] font-bold px-1.5 py-0.2">
                Urgent
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <span>{startStr} – {endStr}</span>
            {feature.progress !== undefined && !isCancelled && (
              <span className="font-semibold text-foreground/80">• {feature.progress}%</span>
            )}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-1">
        {effectiveStatus === "late" ? (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Terlambat
          </span>
        ) : effectiveStatus === "cancelled" ? (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-muted text-muted-foreground border border-border">
            Dibatalkan
          </span>
        ) : effectiveStatus === "completed" ? (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
            <Check className="h-3 w-3" /> Selesai
          </span>
        ) : (
          <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-blue-500/15 text-blue-600 border border-blue-500/30">
            {feature.progress ? `${feature.progress}%` : "In Progress"}
          </span>
        )}
      </div>
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
  const minWidth = range === "daily" ? "min-w-[1020px]" : "min-w-[650px]";

  return (
    <div className={`flex-1 overflow-x-auto overflow-y-hidden relative bg-muted/10 ${className}`}>
      <div className={`${minWidth} relative h-full flex flex-col`}>{children}</div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttHeader (2-Tier Header with Dedicated Top Track for Today marker)
// -------------------------------------------------------------
export function GanttHeader({ className = "" }: { className?: string }) {
  const { timeColumns, range, today } = useGantt();

  return (
    <div className={`h-16 border-b border-border/80 flex flex-col bg-muted/20 ${className}`}>
      {/* Top Track dedicated for markers and sprint info */}
      <div className="h-6 border-b border-border/30 px-3 flex items-center justify-between text-[10px] font-semibold text-muted-foreground/75 bg-muted/30">
        <span>Timeline Proyek</span>
        <span>{range === "daily" ? "Tampilan: Harian (Daily)" : "Tampilan: Mingguan (Weekly)"}</span>
      </div>

      {/* Date Columns Bottom Track */}
      <div className="h-10 flex items-stretch">
        {timeColumns.map((col, idx) => {
          const isTodayCol = col.start <= today && today < col.end;

          return (
            <div
              key={col.id}
              className={`flex-1 border-r border-border/40 last:border-r-0 px-1 flex flex-col justify-center text-center transition-colors ${
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
// GanttFeatureList (Stacked Lane Container)
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
    <div className={`relative flex-1 min-h-[320px] ${className}`}>
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
      <div className="relative z-10 p-2 space-y-2">{children}</div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttStackedFeatureGroup
// Renders multiple tasks within a milestone/group in stacked lanes
// -------------------------------------------------------------
export function GanttStackedFeatureGroup({
  title,
  features,
  onClick,
  className = "",
}: {
  title?: string;
  features: GanttFeature[];
  onClick?: (feature: GanttFeature) => void;
  className?: string;
}) {
  const { features: stackedFeatures, totalLanes } = useMemo(
    () => computeFeatureLanes(features),
    [features]
  );

  const groupHeight = Math.max(48, totalLanes * 38 + 14);

  return (
    <div className={`rounded-xl border border-border/50 bg-card/60 relative overflow-hidden transition-all ${className}`}>
      {title && (
        <div className="px-3 py-1.5 bg-muted/40 border-b border-border/40 text-[11px] font-bold text-foreground flex items-center justify-between">
          <span>{title}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {features.length} Tugas • {totalLanes} Jalur Waktu
          </span>
        </div>
      )}

      <div className="relative" style={{ height: `${groupHeight}px` }}>
        {stackedFeatures.map((feat) => (
          <GanttFeatureItem
            key={feat.id}
            {...feat}
            laneIndex={feat.laneIndex}
            onClick={onClick}
          />
        ))}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// GanttFeatureItem
// -------------------------------------------------------------
export function GanttFeatureItem({
  onClick,
  className = "",
  laneIndex = 0,
  ...props
}: GanttFeature & {
  onClick?: (feature: GanttFeature) => void;
  className?: string;
  laneIndex?: number;
}) {
  const { calculatePosition, today } = useGantt();
  const { leftPercent, widthPercent } = calculatePosition(props.startAt, props.endAt);

  const startStr = new Date(props.startAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const endStr = new Date(props.endAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const isCompleted = props.status?.id === "completed" || (props.progress ?? 0) >= 100;
  const isCancelled = Boolean(props.isCancelled);
  const isLate = !isCancelled && !isCompleted && new Date(props.endAt) < today;

  let daysLate = 0;
  if (isLate) {
    const diffMs = Math.abs(today.getTime() - new Date(props.endAt).getTime());
    daysLate = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Visual styling based on status
  let barGradient = "bg-gradient-to-r from-blue-600 to-indigo-600 text-white";
  let borderStyle = "border border-blue-400/40 shadow-sm shadow-blue-500/10";
  let statusBadge = `${props.progress || 0}%`;

  if (isCancelled) {
    barGradient = "bg-gray-700/80 text-gray-300";
    borderStyle = "border border-gray-600 border-dashed opacity-60";
    statusBadge = "Dibatalkan";
  } else if (isCompleted) {
    barGradient = "bg-gradient-to-r from-emerald-600 to-teal-600 text-white";
    borderStyle = "border border-emerald-400/50 shadow-sm shadow-emerald-500/20";
    statusBadge = "Selesai";
  } else if (isLate) {
    barGradient = "bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white animate-pulse";
    borderStyle = "border-2 border-rose-300 shadow-md shadow-rose-500/30";
    statusBadge = `⚠️ Terlambat ${daysLate}h`;
  }

  const topOffset = laneIndex * 38 + 6;

  return (
    <div
      onClick={() => onClick?.(props)}
      className={`group absolute h-[30px] rounded-xl flex items-center justify-between px-2.5 text-xs font-semibold select-none cursor-pointer transition-all hover:scale-[1.015] hover:z-30 hover:shadow-lg overflow-hidden ${barGradient} ${borderStyle} ${className}`}
      style={{
        left: `${leftPercent}%`,
        width: `${Math.max(6, widthPercent)}%`,
        top: `${topOffset}px`,
        ...(isCancelled
          ? {
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(55,65,81,0.9), rgba(55,65,81,0.9) 8px, rgba(75,85,99,0.9) 8px, rgba(75,85,99,0.9) 16px)",
            }
          : {}),
      }}
      title={`Klik untuk mengedit atau menggeser: ${props.name} (${startStr} - ${endStr})`}
    >
      {/* Progress fill bar inside the task */}
      {!isCancelled && !isCompleted && props.progress !== undefined && props.progress > 0 && (
        <div
          className="absolute inset-y-0 left-0 bg-white/20 pointer-events-none transition-all"
          style={{ width: `${props.progress}%` }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center gap-1.5 truncate pr-1">
        {isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-white" />
        ) : isLate ? (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-200 animate-bounce" />
        ) : isCancelled ? (
          <X className="h-3 w-3 shrink-0 text-gray-400" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-white shrink-0 shadow-xs" />
        )}

        <span
          className={`truncate font-semibold text-[11px] drop-shadow-xs ${
            isCancelled ? "line-through" : ""
          }`}
        >
          {props.name}
        </span>
      </div>

      <div className="relative z-10 flex items-center gap-1 shrink-0 text-[10px]">
        <span className="opacity-80 font-normal hidden lg:inline">
          {startStr}–{endStr}
        </span>
        <span className="rounded bg-black/25 px-1.5 py-0.2 font-bold text-[9px] backdrop-blur-xs">
          {statusBadge}
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
