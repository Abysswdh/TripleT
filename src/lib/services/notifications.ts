export type NotificationType =
  | "proposal"
  | "milestone"
  | "payment"
  | "invitation"
  | "badge"
  | "system";

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  timestamp: string;
  linkUrl?: string;
  avatar?: string;
  roleTarget?: "customer" | "freelancer" | "all";
}

const STORAGE_KEY = "doable_app_notifications";

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    title: "Proposal Baru Masuk!",
    message: "Dimas Arya mengajukan penawaran pada proyek 'AI Marketing Automation & Analytics Suite'.",
    type: "proposal",
    read: false,
    timestamp: "10 menit lalu",
    linkUrl: "/client/projects",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    roleTarget: "customer"
  },
  {
    id: "notif-2",
    title: "Milestone Disetujui Klien",
    message: "Milestone 1 'Wireframe & Design Tokens' telah disetujui. Dana Rp 5.000.000 siap dicairkan ke Wallet.",
    type: "milestone",
    read: false,
    timestamp: "1 jam lalu",
    linkUrl: "/freelancer/my-work",
    roleTarget: "freelancer"
  },
  {
    id: "notif-3",
    title: "Penarikan Dana Berhasil",
    message: "Penarikan saldo sebesar Rp 5.000.000 ke rekening BCA ****-1029 telah berhasil diproses oleh sistem rekber.",
    type: "payment",
    read: false,
    timestamp: "3 jam lalu",
    linkUrl: "/freelancer/earnings",
    roleTarget: "freelancer"
  },
  {
    id: "notif-4",
    title: "Undangan Proyek Khusus",
    message: "PT Digital Nusantara mengundang Anda untuk bergabung ke proyek 'Fintech Microservice Architecture'.",
    type: "invitation",
    read: true,
    timestamp: "Kemarin",
    linkUrl: "/freelancer/explore",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    roleTarget: "freelancer"
  },
  {
    id: "notif-5",
    title: "Badge Keahlian Terverifikasi 🎉",
    message: "Selamat! Anda berhasil lulus tes kompetensi 'Next.js 14 App Router' dengan skor 100%.",
    type: "badge",
    read: true,
    timestamp: "2 hari lalu",
    linkUrl: "/freelancer/skills",
    roleTarget: "freelancer"
  },
  {
    id: "notif-6",
    title: "Proyek Siap Diterbitkan",
    message: "Blueprint proyek Anda berhasil dibuat menggunakan AI Analyzer dan tayang di Project Market.",
    type: "system",
    read: true,
    timestamp: "3 hari lalu",
    linkUrl: "/client/projects",
    roleTarget: "customer"
  }
];

/**
 * Get all notifications from storage with initial fallback
 */
export function getNotifications(currentRole?: "customer" | "freelancer"): AppNotification[] {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let items: AppNotification[];
    if (!raw) {
      items = INITIAL_NOTIFICATIONS;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } else {
      items = JSON.parse(raw);
    }

    if (currentRole) {
      return items.filter((n) => !n.roleTarget || n.roleTarget === "all" || n.roleTarget === currentRole);
    }
    return items;
  } catch (err) {
    console.warn("Failed to load notifications:", err);
    return INITIAL_NOTIFICATIONS;
  }
}

/**
 * Mark a single notification as read
 */
export function markNotificationAsRead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const items = getNotifications();
    const updated = items.map((n) => (n.id === id ? { ...n, read: true } : n));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("notification-updated"));
  } catch (e) {
    console.warn("Could not mark notification as read:", e);
  }
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsAsRead(): void {
  if (typeof window === "undefined") return;
  try {
    const items = getNotifications();
    const updated = items.map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("notification-updated"));
  } catch (e) {
    console.warn("Could not mark all notifications as read:", e);
  }
}

/**
 * Push a new notification into storage
 */
export function addNotification(notification: Omit<AppNotification, "id" | "timestamp" | "read">): void {
  if (typeof window === "undefined") return;
  try {
    const items = getNotifications();
    const newNotif: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: "Baru saja",
      read: false
    };
    const updated = [newNotif, ...items];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("notification-updated"));
  } catch (e) {
    console.warn("Could not add notification:", e);
  }
}

/**
 * Clear all notifications
 */
export function clearAllNotifications(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("notification-updated"));
  } catch (e) {
    console.warn("Could not clear notifications:", e);
  }
}
