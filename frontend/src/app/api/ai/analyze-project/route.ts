import { NextResponse } from "next/server";

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

/**
 * Serverless Next.js API Route for Vercel:
 * Analyzes project brief using LLM (Gemini) or enhanced semantic NLP rules.
 */
export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { error: "Title is required for analysis." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 1. If Gemini API Key is configured in Vercel environment variables:
    if (geminiApiKey) {
      try {
        const prompt = `Anda adalah AI analisis proyek freelance profesional untuk platform Doable! Indonesia.
Analisis judul dan kebutuhan pekerjaan berikut secara akurat dan tentukan klasifikasinya:

Judul: "${title}"
Deskripsi: "${description || "-"}"

Klasifikasikan ke format JSON (hanya kembalikan JSON murni tanpa markdown):
{
  "category": "Desain Grafis & Branding" | "Foto, Video & Kreatif" | "Tugas Lapangan & On-Site" | "Web & Digital Engineering" | "Penulisan & Virtual Admin" | "Pemasaran & Bisnis UMKM",
  "difficulty": "Starter" | "Standard" | "Enterprise",
  "experienceLevel": "Junior" | "Intermediate" | "Senior",
  "suggestedSkills": ["skill1", "skill2", "skill3"],
  "suggestedBudget": 150000,
  "suggestedDurationDays": 3,
  "suggestedObjectives": ["poin hasil 1", "poin hasil 2"],
  "suggestedDeliverables": ["format serah terima 1", "format serah terima 2"],
  "reasoning": "Alasan singkat klasifikasi"
}`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText) as AIAnalysisResponse;
            return NextResponse.json(parsed);
          }
        }
      } catch (geminiErr) {
        console.warn("Gemini API call error, falling back to enhanced NLP engine:", geminiErr);
      }
    }

    // 2. Enhanced Indonesian Semantic NLP Classification Engine (High Accuracy, 0ms, 0 Cost)
    const analysis = analyzeProjectLocally(title, description);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("AI Analysis route error:", error);
    return NextResponse.json(
      { error: "Internal server error during analysis." },
      { status: 500 }
    );
  }
}

/**
 * Robust Multi-Domain Indonesian Semantic Analyzer with Precision Heuristics
 */
export function analyzeProjectLocally(title: string, description: string = ""): AIAnalysisResponse {
  const text = `${title} ${description}`.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = text.split(/\s+/).filter(Boolean);

  const hasAny = (keywords: string[]) => keywords.some((k) => text.includes(k.toLowerCase()));

  // 1. Check for Complex Enterprise Web/Software systems
  const isEnterpriseTech =
    hasAny(["sistem", "aplikasi", "mobile app", "erp", "pos kasir", "kasir", "fullstack", "saas", "marketplace", "backend api", "flutter", "react native", "database"]) &&
    !hasAny(["poster", "feed", "foto"]);

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

  // 2. Simple / Standard Web Development
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

  // 3. Physical Tasks / Field Gigs / Local On-Site (e.g. Bali photo spots, surveys, property checks)
  const isFieldTask = hasAny([
    "bali", "jogja", "jakarta", "bandung", "surabaya", "lombok",
    "lokasi", "tempat", "spot", "pura", "pantai", "cafe", "kafe", "resto",
    "survei", "survey", "cek fisik", "fotoin", "fotokan", "lapangan", "mystery shopper",
    "verifikasi alamat", "ambil barang", "titip", "surveyor"
  ]);

  if (isFieldTask && !hasAny(["website", "koding", "source code"])) {
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

  // 4. Video Editing & Content Creation
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
      experienceLevel: isBigBigOrMid(isBigVideo) ? "Intermediate" : "Junior",
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

  // 5. Writing, Copywriting, Virtual Assistant, Admin
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

  // 6. Marketing, Social Media & Ads
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

  // 7. Graphic Design, Poster, Banner, Packaging, Logo (e.g. UMKM poster, warung, food)
  const isDesign = hasAny([
    "poster", "logo", "banner", "feed", "kemasan", "packaging", "kartu nama",
    "brosur", "menu", "nasi goreng", "warung", "resto", "makanan", "kuliner",
    "kaos", "t-shirt", "vektor", "illustrator", "photoshop", "canva", "desain", "design"
  ]);

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
    reasoning: "Kebutuhan materi grafis promosi UMKM dapat diselesaikan cepat dengan tarif hemat.",
  };
}

function isBigBigOrMid(val: boolean) {
  return val;
}
