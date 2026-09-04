"use client";

import { useState } from "react";
import {
  Compass,
  Search,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

interface Quest {
  id: string;
  title: string;
  clientName: string;
  category: string;
  budget: string;
  budgetType: "Fixed" | "Milestone";
  skills: string[];
  matchScore: number;
  proposalsCount: number;
  postedAt: string;
  difficulty: "Entry" | "Intermediate" | "Expert";
  description: string;
  deadline: string;
}

const ALL_QUESTS: Quest[] = [
  {
    id: "q-1",
    title: "Build Responsive SaaS Dashboard with Tailwind & Next.js 14",
    clientName: "Nexa Corp",
    category: "Frontend",
    budget: "Rp 6.500.000",
    budgetType: "Fixed",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "React"],
    matchScore: 98,
    proposalsCount: 5,
    postedAt: "1 jam lalu",
    difficulty: "Intermediate",
    description: "Kami membutuhkan frontend developer berpengalaman untuk membangun dashboard SaaS responsif dengan tema modern (dark mode, animations, chart visual).",
    deadline: "14 hari",
  },
  {
    id: "q-2",
    title: "FastAPI Backend & Supabase Auth API Integration",
    clientName: "Studio Kreatif ID",
    category: "Backend",
    budget: "Rp 8.000.000",
    budgetType: "Fixed",
    skills: ["Python", "FastAPI", "PostgreSQL", "Supabase"],
    matchScore: 94,
    proposalsCount: 3,
    postedAt: "3 jam lalu",
    difficulty: "Expert",
    description: "Membangun REST API performa tinggi menggunakan FastAPI, SQLAlchemy/Prisma, dan integrasi role-based access control dengan Supabase Auth.",
    deadline: "21 hari",
  },
  {
    id: "q-3",
    title: "Mobile App Wireframe & UI Design System in Figma",
    clientName: "PT FinTech Solusindo",
    category: "UI/UX",
    budget: "Rp 4.500.000",
    budgetType: "Fixed",
    skills: ["Figma", "Design Systems", "Prototyping", "Wireframing"],
    matchScore: 89,
    proposalsCount: 9,
    postedAt: "6 jam lalu",
    difficulty: "Intermediate",
    description: "Pembuatan full flow UI/UX aplikasi fintech mulai dari onboarding, KYC, dashboard saldo, hingga transfer antar bank dengan atomic design system.",
    deadline: "10 hari",
  },
  {
    id: "q-4",
    title: "AI Voice Agent Integration using OpenAI Realtime API",
    clientName: "Alpha Labs",
    category: "AI & ML",
    budget: "Rp 12.000.000",
    budgetType: "Fixed",
    skills: ["Python", "OpenAI", "WebRTC", "FastAPI"],
    matchScore: 91,
    proposalsCount: 2,
    postedAt: "12 jam lalu",
    difficulty: "Expert",
    description: "Integrasi sistem customer support berbasis voice agent dengan latensi rendah menggunakan WebSockets dan Realtime Audio API.",
    deadline: "30 hari",
  },
  {
    id: "q-5",
    title: "Cross-Platform Mobile App (Flutter) with Midtrans",
    clientName: "Kopi Nusantara Co",
    category: "Mobile",
    budget: "Rp 9.500.000",
    budgetType: "Fixed",
    skills: ["Flutter", "Dart", "Midtrans", "REST API"],
    matchScore: 86,
    proposalsCount: 7,
    postedAt: "1 hari lalu",
    difficulty: "Intermediate",
    description: "Aplikasi pemesanan kopi takeaway & delivery dengan fitur live tracking driver dan payment gateway QRIS / VA.",
    deadline: "25 hari",
  },
];

const CATEGORIES = ["Semua", "Frontend", "Backend", "UI/UX", "AI & ML", "Mobile"];

export default function ExploreQuestsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [proposalCover, setProposalCover] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [submitted, setSubmitted] = useState(false);

  const filteredQuests = ALL_QUESTS.filter((quest) => {
    const matchesSearch =
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      quest.clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "Semua" || quest.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenProposal = (quest: Quest) => {
    setSelectedQuest(quest);
    setBidAmount(quest.budget);
    setSubmitted(false);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSelectedQuest(null);
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Compass className="h-3.5 w-3.5" />
            <span>Papan Proyek</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Jelajahi Proyek
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Temukan proyek terverifikasi dengan garansi pembayaran aman
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          <span>← Kembali ke Dashboard</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari judul proyek, keahlian (React, FastAPI, Figma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-border/80 bg-card pl-10 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "border border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quest Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredQuests.map((quest) => (
          <div
            key={quest.id}
            className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {quest.category}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600">
                  <Sparkles className="h-3 w-3" />
                  {quest.matchScore}% Match
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {quest.title}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {quest.description}
                </p>
              </div>

              <div className="space-y-1.5 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{quest.budget}</span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium">
                    {quest.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span>Client: <strong className="text-foreground">{quest.clientName}</strong></span>
                  <span>{quest.proposalsCount} Proposal</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {quest.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border/40">
              <button
                onClick={() => handleOpenProposal(quest)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-sm shadow-primary/20 hover:bg-primary-600 transition-all hover:scale-[1.01]"
              >
                <span>Ajukan Proposal</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuests.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <SlidersHorizontal className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-bold text-foreground">Tidak ada quest ditemukan</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Coba ubah kata kunci pencarian atau kategori filter di atas.
          </p>
        </div>
      )}

      {/* Proposal Modal */}
      {selectedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setSelectedQuest(null)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Proposal Terkirim!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Proposalmu telah disampaikan ke <strong>{selectedQuest.clientName}</strong>. Kamu akan menerima notifikasi jika proposalmu direview.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {selectedQuest.category}
                  </span>
                  <h2 className="text-lg font-bold text-foreground mt-1.5">
                    Ajukan Proposal: {selectedQuest.title}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Budget Klien: <strong>{selectedQuest.budget}</strong> ({selectedQuest.budgetType})
                  </p>
                </div>

                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Nominal Penawaran (Rp)
                    </label>
                    <input
                      type="text"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      required
                      placeholder="e.g. Rp 6.000.000"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Estimasi Pengerjaan (Hari)
                    </label>
                    <input
                      type="number"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      required
                      min="1"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Pesan Penawaran / Cover Letter
                    </label>
                    <textarea
                      rows={4}
                      value={proposalCover}
                      onChange={(e) => setProposalCover(e.target.value)}
                      required
                      placeholder="Jelaskan pengalaman relevanmu, portfolio serupa, dan bagaimana kamu akan menyelesaikan quest ini..."
                      className="w-full rounded-xl border border-input bg-background p-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQuest(null)}
                      className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                    >
                      Kirim Proposal Sekarang
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
