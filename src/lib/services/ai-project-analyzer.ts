export interface AIAnalysisResponse {
  category: string;
  difficulty: "Starter" | "Standard" | "Enterprise";
  experienceLevel: "Junior" | "Intermediate" | "Senior";
  suggestedSkills: string[];
  suggestedBudget: number;
  suggestedDurationDays: number;
  suggestedObjectives: string[];
  suggestedDeliverables: string[];
  reasoning: string;
}

const VALID_CATEGORIES = [
  "Desain Grafis & Branding",
  "Foto, Video & Kreatif",
  "Tugas Lapangan & On-Site",
  "Web & Digital Engineering",
  "Penulisan & Virtual Admin",
  "Pemasaran & Bisnis UMKM",
];

const VALID_DIFFICULTIES = ["Starter", "Standard", "Enterprise"];
const VALID_EXPERIENCES = ["Junior", "Intermediate", "Senior"];

/**
 * Validates whether an untrusted AI response matches the expected schema and enums.
 */
export function validateAIResponse(data: unknown): data is AIAnalysisResponse {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;

  return (
    typeof obj.category === "string" &&
    VALID_CATEGORIES.includes(obj.category) &&
    typeof obj.difficulty === "string" &&
    VALID_DIFFICULTIES.includes(obj.difficulty) &&
    typeof obj.experienceLevel === "string" &&
    VALID_EXPERIENCES.includes(obj.experienceLevel) &&
    Array.isArray(obj.suggestedSkills) &&
    typeof obj.suggestedBudget === "number" &&
    typeof obj.suggestedDurationDays === "number" &&
    typeof obj.reasoning === "string"
  );
}

/**
 * Robust Multi-Domain Indonesian Semantic Analyzer with Precision Priority Ordering
 */
export function analyzeProjectLocally(title: string, description: string = ""): AIAnalysisResponse {
  const text = `${title} ${description}`.toLowerCase().replace(/[^a-z0-9\s]/g, " ");

  const hasAny = (keywords: string[]) => keywords.some((k) => text.includes(k.toLowerCase()));

  // 1. Check for Graphic Design, Poster, Banner, Packaging, Logo, Food Menu (UMKM) FIRST
  const isDesign = hasAny([
    "poster", "logo", "banner", "feed", "kemasan", "packaging", "kartu nama",
    "brosur", "menu", "desain", "design", "vektor", "illustrator", "photoshop",
    "canva", "mockup", "flyer", "stiker", "t shirt", "kaos", "rebranding"
  ]);

  if (isDesign) {
    const isFullBranding = hasAny(["full brand", "identitas brand", "brand guideline", "packaging 5", "rebranding"]);
    return {
      category: "Desain Grafis & Branding",
      difficulty: isFullBranding ? "Standard" : "Starter",
      experienceLevel: isFullBranding ? "Intermediate" : "Junior",
      suggestedSkills: isFullBranding
        ? ["Illustrator", "Photoshop", "Logo Design", "Brand Identity", "Figma"]
        : ["Canva", "Photoshop", "Poster Design", "Banner", "Branding"],
      suggestedBudget: isFullBranding ? 1500000 : 150000,
      suggestedDurationDays: isFullBranding ? 7 : 3,
      suggestedObjectives: [
        "Pahami tema visual, warna brand, dan teks promosi yang diinginkan",
        "Buat konsep desain visual yang menarik perhatian konsumen",
        "Serahkan file siap cetak dan siap posting di media sosial",
      ],
      suggestedDeliverables: [
        "File Final Siap Pakai / High-Res (PNG, JPG, PDF)",
        "File Mentahan / Master Asli (AI, PSD, atau Link Canva)",
      ],
      reasoning: "Kebutuhan materi grafis promosi dapat diselesaikan cepat dengan tarif hemat.",
    };
  }

  // 2. Check for Complex Enterprise Web/Software systems
  const isEnterpriseTech =
    hasAny(["sistem", "aplikasi", "mobile app", "erp", "pos kasir", "kasir", "fullstack", "saas", "marketplace", "backend api", "flutter", "react native", "database"]);

  if (isEnterpriseTech) {
    return {
      category: "Web & Digital Engineering",
      difficulty: "Enterprise",
      experienceLevel: "Senior",
      suggestedSkills: ["Next.js", "TypeScript", "PostgreSQL", "React", "REST API", "Tailwind CSS"],
      suggestedBudget: 4500000,
      suggestedDurationDays: 14,
      suggestedObjectives: [
        "Rancang arsitektur sistem dan struktur basis data",
        "Implementasikan alur fitur bisnis utama secara menyeluruh",
        "Lakukan pengujian fungsional & deployment siap pakai",
      ],
      suggestedDeliverables: [
        "Source Code Repositori (Git / GitHub)",
        "Dokumentasi API & Panduan Deploy",
        "Link Demo Aplikasi Aktif (Live URL)",
      ],
      reasoning: "Pembangunan sistem fungsional tergolong kompleks dan membutuhkan jam terbang talenta senior.",
    };
  }

  // 3. Simple / Standard Web Development
  const isWebDev = hasAny(["website", "web", "landing page", "wordpress", "html", "css", "portofolio web", "company profile", "frontend", "slicing", "bugfix"]);
  if (isWebDev) {
    const isMediumWeb = hasAny(["company profile", "profil bisnis", "toko online", "woocommerce", "dashboard"]);
    return {
      category: "Web & Digital Engineering",
      difficulty: isMediumWeb ? "Standard" : "Starter",
      experienceLevel: isMediumWeb ? "Intermediate" : "Junior",
      suggestedSkills: isMediumWeb ? ["WordPress", "React", "Tailwind CSS", "HTML/CSS"] : ["HTML/CSS", "WordPress", "Landing Page"],
      suggestedBudget: isMediumWeb ? 1500000 : 650000,
      suggestedDurationDays: isMediumWeb ? 7 : 4,
      suggestedObjectives: [
        "Buat tampilan responsif yang rapi di desktop dan mobile",
        "Hubungkan formulir kontak atau link WhatsApp pemesanan",
        "Optimasi kecepatan loading dan SEO dasar",
      ],
      suggestedDeliverables: [
        "File Source Code Siap Upload / Akses CMS",
        "Link Live Website yang Berjalan",
        "Panduan Singkat Pengelolaan Konten",
      ],
      reasoning: "Pembuatan landing page/website profil cocok untuk pengerjaan cepat bertarif terjangkau.",
    };
  }

  // 4. Physical Tasks / Field Gigs / Local On-Site (e.g. Bali photo spots, surveys, property checks)
  const isFieldTask = hasAny([
    "bali", "jogja", "jakarta", "bandung", "surabaya", "lombok",
    "lokasi", "tempat", "spot", "pura", "pantai",
    "survei", "survey", "cek fisik", "fotoin", "fotokan", "lapangan", "mystery shopper",
    "verifikasi alamat", "ambil barang", "titip", "surveyor"
  ]);

  if (isFieldTask) {
    const isLargeSurvey = hasAny(["banyak titik", "10 lokasi", "survey lengkap", "riset lapangan"]);
    return {
      category: "Tugas Lapangan & On-Site",
      difficulty: isLargeSurvey ? "Standard" : "Starter",
      experienceLevel: isLargeSurvey ? "Intermediate" : "Junior",
      suggestedSkills: ["Fotografi Smartphone", "Survei Lapangan", "Komunikasi Lokal", "Verifikasi Alamat", "Mobilitas Cepat"],
      suggestedBudget: isLargeSurvey ? 500000 : 150000,
      suggestedDurationDays: isLargeSurvey ? 4 : 2,
      suggestedObjectives: [
        "Kunjungi titik lokasi yang ditentukan sesuai briefing",
        "Ambil foto/data kondisi terkini dengan pencahayaan jelas",
        "Unggah hasil dokumentasi ke penyimpanan cloud tepat waktu",
      ],
      suggestedDeliverables: [
        "Foto/Video Asli High-Res Tanpa Kompresi",
        "Link Google Drive Berisi Seluruh Dokumentasi",
        "Catatan Laporan / Verifikasi Lokasi Singkat",
      ],
      reasoning: "Tugas lapangan on-site tergolong pekerjaan mikro praktis yang ramah untuk talenta lokal.",
    };
  }

  // 5. Video Editing & Content Creation
  const isVideoOrPhoto = hasAny([
    "video", "reels", "tiktok", "shorts", "youtube", "editing video",
    "capcut", "premiere", "foto produk", "katalog", "photoshoot", "model",
    "voice over", "audio", "sound", "podcast", "cinematic"
  ]);

  if (isVideoOrPhoto) {
    const isBigVideo = hasAny(["iklan tv", "dokumenter", "cinematic 4k", "banyak video", "paket bulanan"]);
    return {
      category: "Foto, Video & Kreatif",
      difficulty: isBigVideo ? "Standard" : "Starter",
      experienceLevel: isBigVideo ? "Intermediate" : "Junior",
      suggestedSkills: ["CapCut", "Premiere Pro", "Video Editing", "Color Grading", "Product Photo"],
      suggestedBudget: isBigVideo ? 1200000 : 250000,
      suggestedDurationDays: isBigVideo ? 6 : 3,
      suggestedObjectives: [
        "Pahami konsep, durasi, dan hook konten yang diinginkan",
        "Edit transisi, musik latar, efek, dan teks subtitle dinamis",
        "Ekspor hasil video dengan resolusi tajam 1080p/4K",
      ],
      suggestedDeliverables: [
        "File Video Final MP4 (Vertical 9:16 / Horizontal 16:9)",
        "Link Cloud Storage (Google Drive / Dropbox)",
      ],
      reasoning: "Editing video vertikal atau foto produk cocok untuk kreator konten bertarif terjangkau.",
    };
  }

  // 6. Writing, Copywriting, Virtual Assistant, Admin
  const isWritingOrAdmin = hasAny([
    "artikel", "copywriting", "caption", "tulisan", "blog", "seo",
    "admin", "data entry", "excel", "sheets", "input data", "rekap",
    "terjemahan", "translate", "transkrip", "notulen", "naskah"
  ]);

  if (isWritingOrAdmin) {
    const isBigWriting = hasAny(["10 artikel", "skripsi", "e-book", "riset mendalam"]);
    return {
      category: "Penulisan & Virtual Admin",
      difficulty: isBigWriting ? "Standard" : "Starter",
      experienceLevel: isBigWriting ? "Intermediate" : "Junior",
      suggestedSkills: ["Copywriting", "SEO Content", "Microsoft Excel", "Google Sheets", "Data Entry", "Penerjemahan"],
      suggestedBudget: isBigWriting ? 600000 : 100000,
      suggestedDurationDays: isBigWriting ? 5 : 2,
      suggestedObjectives: [
        "Pelajari pedoman gaya bahasa dan target pembaca",
        "Susun konten yang komunikatif, rapi, dan bebas typo",
        "Lakukan pengecekan orisinalitas tulisan",
      ],
      suggestedDeliverables: [
        "Dokumen Final (Word / Google Docs / PDF)",
        "Rekap Spreadsheet Rapi (Excel / Sheets)",
      ],
      reasoning: "Tugas penulisan dan entri data cocok dikerjakan oleh fresh talent / mahasiswa.",
    };
  }

  // 7. Marketing, Social Media & Ads
  const isMarketing = hasAny([
    "iklan", "ads", "meta ads", "facebook ads", "instagram ads", "google ads",
    "kelola sosmed", "admin sosmed", "social media manager", "optimasi", "riset pasar"
  ]);

  if (isMarketing) {
    return {
      category: "Pemasaran & Bisnis UMKM",
      difficulty: "Standard",
      experienceLevel: "Intermediate",
      suggestedSkills: ["Meta Ads", "Instagram Marketing", "Google Ads", "Analisis Pasar", "Canva"],
      suggestedBudget: 850000,
      suggestedDurationDays: 7,
      suggestedObjectives: [
        "Riset target audiens & penentuan kata kunci/interest yang tepat",
        "Setup materi kampanye iklan dan anggaran harian",
        "Kirim laporan metrik performa (Reach, CTR, ROAS)",
      ],
      suggestedDeliverables: [
        "Akses Kampanye Ads Aktif",
        "Laporan Analisis Performa PDF Ringkas",
      ],
      reasoning: "Pengelolaan iklan membutuhkan pemahaman strategi pemasaran digital menengah.",
    };
  }

  // Default Universal Fallback
  return {
    category: "Desain Grafis & Branding",
    difficulty: "Starter",
    experienceLevel: "Junior",
    suggestedSkills: ["Canva", "Kreatif", "Tepat Waktu"],
    suggestedBudget: 150000,
    suggestedDurationDays: 3,
    suggestedObjectives: [
      "Pahami kebutuhan dan instruksi kerja dari klien",
      "Selesaikan pengerjaan deliverable sesuai kesepakatan",
    ],
    suggestedDeliverables: [
      "File Final Siap Pakai / High-Res",
      "Link Penyimpanan Cloud (Google Drive / Dropbox)",
    ],
    reasoning: "Tugas umum diset default ke pengerjaan cepat ramah pemula.",
  };
}

/**
 * Realtime Smart Analyzer for Project Creation Wizard
 * 1. Executes instant local heuristic analysis in 0ms.
 * 2. Optionally queries the Next.js /api/ai/analyze-project endpoint.
 */
export async function analyzeProjectBrief(
  title: string,
  description: string = ""
): Promise<AIAnalysisResponse> {
  // 1. Instant client-side analysis
  const localResult = analyzeProjectLocally(title, description);

  // If title is too short, return local immediately
  if (!title.trim() || title.trim().length < 4) {
    return localResult;
  }

  // 2. Try querying the Next.js serverless route (if deployed on Vercel with Gemini/LLM)
  try {
    const res = await fetch("/api/ai/analyze-project", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (res.ok) {
      const data = await res.json();
      if (validateAIResponse(data)) {
        return data;
      }
    }
  } catch {
    // Gracefully fallback to instant local analysis if offline or route unavailable
  }

  return localResult;
}
