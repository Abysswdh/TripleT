"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle2,
  FileText,
  CreditCard,
  Mail,
  Trophy,
  Sparkles,
  Trash2,
  FileCheck,
  Star,
  MessageSquare,
  CheckCheck,
  X,
  Loader2,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  subscribeToNotifications,
  type AppNotification,
  type NotificationType,
} from "@/lib/services/notifications";
import { useDashboardRole } from "@/context/role-context";
import { useAuth } from "@/hooks/use-auth";

// Simple Web Audio API synthesizer for clean notification chime
function playNotificationChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);
  } catch {
    // Audio playback not permitted or user didn't interact yet
  }
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user } = useAuth();

  let role = "customer";
  try {
    const roleCtx = useDashboardRole();
    role = roleCtx?.role || "customer";
  } catch {
    // Graceful fallback
  }

  const loadNotifs = useCallback(async () => {
    try {
      const data = await getNotifications(role as "customer" | "freelancer", user?.id);
      setNotifications(data);
    } catch (err) {
      console.warn("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [role, user?.id]);

  useEffect(() => {
    loadNotifs();

    const handleUpdate = () => {
      loadNotifs();
    };

    window.addEventListener("notification-updated", handleUpdate);
    window.addEventListener("quiz-completed", handleUpdate);
    window.addEventListener("payment-completed", handleUpdate);

    return () => {
      window.removeEventListener("notification-updated", handleUpdate);
      window.removeEventListener("quiz-completed", handleUpdate);
      window.removeEventListener("payment-completed", handleUpdate);
    };
  }, [loadNotifs]);

  // Realtime Supabase Subscription
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToNotifications(user.id, (newNotif) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev;
        return [newNotif, ...prev];
      });
      playNotificationChime();
    });

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === "unread") return !n.read;
    return true;
  });

  const handleNotificationClick = async (notif: AppNotification) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    await markNotificationAsRead(notif.id);
    setIsOpen(false);
    if (notif.linkUrl) {
      router.push(notif.linkUrl);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsAsRead(user?.id);
  };

  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    setNotifications([]);
    await clearAllNotifications(user?.id);
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "proposal":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "milestone":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "payment":
        return <CreditCard className="h-4 w-4 text-amber-500" />;
      case "invitation":
        return <Mail className="h-4 w-4 text-purple-500" />;
      case "badge":
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case "contract":
        return <FileCheck className="h-4 w-4 text-indigo-500" />;
      case "review":
        return <Star className="h-4 w-4 text-amber-400 fill-amber-400" />;
      case "chat":
        return <MessageSquare className="h-4 w-4 text-sky-500" />;
      case "system":
      default:
        return <Sparkles className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Buka Notifikasi"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" />

        {/* Unread Indicator Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-background animate-in zoom-in duration-150">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-3xl border border-border/80 bg-card/95 backdrop-blur-md p-4 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-3 mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Notifikasi</h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">
                  {unreadCount} baru
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5">
                  Semua terbaca
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-lg hover:bg-primary/10 flex items-center gap-1"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span>Tandai Dibaca</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 mb-3">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeFilter === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("unread")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                activeFilter === "unread"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="py-8 text-center space-y-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
                <p className="text-xs text-muted-foreground">Memuat notifikasi...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Bell className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">
                  {activeFilter === "unread" ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
                </p>
                <p className="text-[11px] text-muted-foreground/70">
                  Aktivitas proposal, kontrak, milestone, dan pembayaran akan muncul di sini secara real-time.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`group relative flex items-start gap-3 rounded-2xl p-3 text-left transition-all cursor-pointer ${
                    item.read
                      ? "bg-muted/20 hover:bg-muted/60 text-muted-foreground border border-transparent"
                      : "bg-primary/5 hover:bg-primary/10 text-foreground border border-primary/20 shadow-xs"
                  }`}
                >
                  {/* Avatar or Category Icon */}
                  <div className="relative mt-0.5 shrink-0">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt="Avatar"
                        className="h-8 w-8 rounded-xl object-cover border border-border/60"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-card border border-border/80 shadow-xs">
                        {getIconForType(item.type)}
                      </div>
                    )}
                    {!item.read && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-foreground truncate">{item.title}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Delete individual notification button */}
                  <button
                    type="button"
                    title="Hapus notifikasi ini"
                    onClick={(e) => handleDeleteItem(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive text-muted-foreground rounded-lg transition-opacity"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                <span>Hapus Semua Riwayat</span>
              </button>
              <span className="text-[10px] text-muted-foreground">Doable Realtime</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
