export interface ProjectCategory {
  id: string;
  title: string;
  shortLabel: string;
  iconName: "Palette" | "Camera" | "MapPin" | "Globe" | "FileText" | "TrendingUp";
  desc: string;
  groupKey?: string;
}

// 6 Universal Primary Categories from Buat Project (without emojis, using vector icons)
export const UNIFIED_PROJECT_CATEGORIES: ProjectCategory[] = [
  {
    id: "Desain & Branding",
    title: "Desain & Branding",
    shortLabel: "Desain & Branding",
    iconName: "Palette",
    desc: "Poster UMKM, Logo, Feed IG, Kemasan, UI/UX",
    groupKey: "Desain & Kreatif",
  },
  {
    id: "Foto & Video Kreatif",
    title: "Foto & Video Kreatif",
    shortLabel: "Foto & Video",
    iconName: "Camera",
    desc: "Foto Produk, Reels/TikTok, Video Editing",
    groupKey: "Foto, Video & Audio",
  },
  {
    id: "Tugas Lokal / On-Site",
    title: "Tugas Lokal / On-Site",
    shortLabel: "Tugas On-Site",
    iconName: "MapPin",
    desc: "Foto Tempat/Bali, Cek Lokasi, Survei, Event",
    groupKey: "Tugas Lapangan & On-Site (Real-World Gigs)",
  },
  {
    id: "Web & IT Engineering",
    title: "Web & IT Engineering",
    shortLabel: "Web & IT",
    iconName: "Globe",
    desc: "Website Bisnis, Landing Page, App, Coding",
    groupKey: "Web, Aplikasi & Software",
  },
  {
    id: "Penulisan & Admin",
    title: "Penulisan & Admin",
    shortLabel: "Penulisan & Admin",
    iconName: "FileText",
    desc: "Copywriting Iklan, Artikel, Data Entry",
    groupKey: "Penulisan & Bantuan Operasional",
  },
  {
    id: "Marketing & Promosi",
    title: "Marketing & Promosi",
    shortLabel: "Marketing & Promosi",
    iconName: "TrendingUp",
    desc: "Kelola Sosmed, Setup Ads, Riset Pasar",
    groupKey: "Pemasaran Digital & Social Media",
  },
];

export const DEFAULT_CLIENT_CATEGORIES = [
  "Desain & Branding",
  "Foto & Video Kreatif",
  "Tugas Lokal / On-Site",
  "Web & IT Engineering",
  "Penulisan & Admin",
  "Marketing & Promosi",
];

// Detailed Subcategories Directory (30+ subcategories from Buat Project)
export const ALL_PROJECT_SUB_CATEGORIES: Record<string, string[]> = {
  "Desain & Kreatif": [
    "Desain Poster & Brosur UMKM",
    "Desain Logo & Identitas Brand",
    "Desain Kemasan Produk (Packaging)",
    "Desain Feed & Story Media Sosial",
    "UI/UX Design Web & Mobile",
    "Ilustrasi & Desain Vektor",
  ],
  "Foto, Video & Audio": [
    "Fotografi Produk & Katalog Olshop",
    "Video Reels, TikTok & Shorts",
    "Editing Video YouTube & Promosi",
    "Voice Over & Audio Podcast",
    "Fotografi Model & Event",
  ],
  "Tugas Lapangan & On-Site (Real-World Gigs)": [
    "Foto & Verifikasi Lokasi Khusus (Bali, Jogja, dll.)",
    "Survei Lapangan & Mystery Shopper",
    "Pengecekan Fisik Tempat / Properti",
    "Bantuan Logistik & Pendampingan Event",
  ],
  "Web, Aplikasi & Software": [
    "Website Profil Bisnis & UMKM",
    "Landing Page Penjualan Responsif",
    "Aplikasi Mobile (Flutter / React Native)",
    "Otomasi Bot & Integrasi AI",
    "Perbaikan Bug & Maintenance Web",
  ],
  "Penulisan & Bantuan Operasional": [
    "Copywriting Iklan & Caption Jualan",
    "Penulisan Artikel Blog & SEO",
    "Admin Toko Online & Data Entry",
    "Penerjemahan Dokumen & Transkripsi",
  ],
  "Pemasaran Digital & Social Media": [
    "Manajemen Akun Media Sosial UMKM",
    "Setup Iklan Meta Ads (Instagram/FB)",
    "Setup Google Ads & Local Business",
    "Riset Kompetitor & Tren Pasar",
  ],
};

/**
 * Intelligent matching between an item's category/tags and the selected filter tab
 */
export function matchCategory(
  itemCategory: string | undefined | null,
  targetFilter: string
): boolean {
  if (!targetFilter || targetFilter === "Semua" || targetFilter === "Semua Kategori") {
    return true;
  }
  if (!itemCategory) return false;

  const ic = itemCategory.toLowerCase();
  const tf = targetFilter.toLowerCase();

  // Direct exact or substring match
  if (ic.includes(tf) || tf.includes(ic)) return true;

  // 1. Desain & Branding
  if (tf.includes("desain") || tf.includes("brand") || tf.includes("grafis")) {
    return (
      ic.includes("desain") ||
      ic.includes("design") ||
      ic.includes("brand") ||
      ic.includes("logo") ||
      ic.includes("poster") ||
      ic.includes("kemasan") ||
      ic.includes("packaging") ||
      ic.includes("feed") ||
      ic.includes("ui") ||
      ic.includes("ux") ||
      ic.includes("figma") ||
      ic.includes("ilustrasi") ||
      ic.includes("canva")
    );
  }

  // 2. Foto & Video Kreatif
  if (tf.includes("foto") || tf.includes("video") || tf.includes("audio")) {
    return (
      ic.includes("foto") ||
      ic.includes("photo") ||
      ic.includes("video") ||
      ic.includes("reels") ||
      ic.includes("tiktok") ||
      ic.includes("editing") ||
      ic.includes("podcast") ||
      ic.includes("audio") ||
      ic.includes("voice") ||
      ic.includes("kamera") ||
      ic.includes("capcut") ||
      ic.includes("premiere")
    );
  }

  // 3. Tugas Lokal / On-Site
  if (
    tf.includes("tugas") ||
    tf.includes("on-site") ||
    tf.includes("onsite") ||
    tf.includes("lokal") ||
    tf.includes("lapangan")
  ) {
    return (
      ic.includes("tugas") ||
      ic.includes("on-site") ||
      ic.includes("onsite") ||
      ic.includes("lokal") ||
      ic.includes("lapangan") ||
      ic.includes("survei") ||
      ic.includes("verifikasi") ||
      ic.includes("lokasi") ||
      ic.includes("event") ||
      ic.includes("properti")
    );
  }

  // 4. Web & IT Engineering
  if (
    tf.includes("web") ||
    tf.includes("it") ||
    tf.includes("engineering") ||
    tf.includes("app") ||
    tf.includes("software") ||
    tf.includes("code") ||
    tf.includes("coding")
  ) {
    return (
      ic.includes("web") ||
      ic.includes("coding") ||
      ic.includes("it") ||
      ic.includes("software") ||
      ic.includes("fullstack") ||
      ic.includes("frontend") ||
      ic.includes("backend") ||
      ic.includes("next.js") ||
      ic.includes("react") ||
      ic.includes("landing") ||
      ic.includes("mobile") ||
      ic.includes("flutter") ||
      ic.includes("ai") ||
      ic.includes("bot")
    );
  }

  // 5. Penulisan & Admin
  if (
    tf.includes("tulis") ||
    tf.includes("penulisan") ||
    tf.includes("admin") ||
    tf.includes("copywriting")
  ) {
    return (
      ic.includes("tulis") ||
      ic.includes("penulisan") ||
      ic.includes("admin") ||
      ic.includes("copywriting") ||
      ic.includes("artikel") ||
      ic.includes("seo") ||
      ic.includes("data entry") ||
      ic.includes("transkrip") ||
      ic.includes("terjemah") ||
      ic.includes("excel")
    );
  }

  // 6. Marketing & Promosi
  if (
    tf.includes("market") ||
    tf.includes("promosi") ||
    tf.includes("pemasaran") ||
    tf.includes("ads") ||
    tf.includes("sosmed")
  ) {
    return (
      ic.includes("market") ||
      ic.includes("promosi") ||
      ic.includes("pemasaran") ||
      ic.includes("ads") ||
      ic.includes("sosmed") ||
      ic.includes("social") ||
      ic.includes("instagram") ||
      ic.includes("riset") ||
      ic.includes("iklan")
    );
  }

  return false;
}
