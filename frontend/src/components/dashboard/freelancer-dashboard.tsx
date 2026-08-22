"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Sparkles,
  Flame,
  Zap,
  Briefcase,
  Clock,
  ChevronRight,
  ArrowUpRight,
  DollarSign,
  Star,
  Target,
  ShieldCheck,
  Compass,
  X,
  CheckCircle2,
  Bookmark,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

interface QuestOpportunity {
  id: string;
  title: string;
  clientName: string;
  clientRating: number;
  category: string;
  budget: string;
  budgetNumeric: number;
  budgetType: "Fixed" | "Hourly";
  matchingSkills: string[];
  matchScore: number;
  proposalsCount: number;
  postedAt: string;
  difficulty: "Entry" | "Intermediate" | "Expert";
  description: string;
  xpReward: number;
  escrowGuaranteed: boolean;
}

interface ActiveContract {
  id: string;
  title: string;
  clientName: string;
  currentMilestone: string;
  deadline: string;
  progress: number;
  amount: string;
}

const mockQuests: QuestOpportunity[] = [
  {
    id: "quest-1",
    title: "Build Responsive SaaS Dashboard with Tailwind & Next.js 14",
    clientName: "Nexa Corp",
    clientRating: 4.9,
    category: "Frontend",
    budget: "Rp 6.500.000",
    budgetNumeric: 6500000,
    budgetType: "Fixed",
    matchingSkills: ["Next.js", "TypeScript", "Tailwind CSS"],
    matchScore: 98,
    proposalsCount: 5,
    postedAt: "1 jam lalu",
    difficulty: "Intermediate",
    description: "Membangun dashboard SaaS responsif dengan dark mode, visual chart interactif, dan micro-animation yang mulus.",
    xpReward: 450,
    escrowGuaranteed: true,
  },
  {
    id: "quest-2",
    title: "FastAPI Backend & Supabase Auth API Integration",
    clientName: "Studio Kreatif ID",
    clientRating: 5.0,
    category: "Backend",
    budget: "Rp 8.000.000",
    budgetNumeric: 8000000,
    budgetType: "Fixed",
    matchingSkills: ["Python", "FastAPI", "PostgreSQL", "Supabase"],
    matchScore: 94,
    proposalsCount: 3,
    postedAt: "3 jam lalu",
    difficulty: "Expert",
    description: "Membangun REST API performa tinggi dengan FastAPI, otentikasi role-based Supabase, dan webhook payment gateway.",
    xpReward: 600,
    escrowGuaranteed: true,
  },
  {
    id: "quest-3",
    title: "Mobile App Wireframe & UI Design System in Figma",
    clientName: "PT FinTech Solusindo",
    clientRating: 4.8,
    category: "UI/UX",
    budget: "Rp 4.500.000",
    budgetNumeric: 4500000,
    budgetType: "Fixed",
    matchingSkills: ["Figma", "Design Systems", "Prototyping"],
    matchScore: 89,
    proposalsCount: 9,
    postedAt: "6 jam lalu",
    difficulty: "Intermediate",
    description: "Desain atomic UI/UX lengkap untuk aplikasi personal finance mulai dari onboarding, dashboard transaksi, hingga charts.",
    xpReward: 350,
    escrowGuaranteed: true,
  },
  {
    id: "quest-4",
    title: "AI Voice Agent Integration using OpenAI Realtime API",
    clientName: "Alpha Labs",
    clientRating: 4.9,
    category: "AI & ML",
    budget: "Rp 12.000.000",
    budgetNumeric: 12000000,
    budgetType: "Fixed",
    matchingSkills: ["Python", "OpenAI", "WebSockets", "FastAPI"],
    matchScore: 92,
    proposalsCount: 2,
    postedAt: "10 jam lalu",
    difficulty: "Expert",
    description: "Integrasi sistem customer support berbasis voice agent dengan latensi ultra-rendah memanfaatkan WebSockets dan WebRTC.",
    xpReward: 800,
    escrowGuaranteed: true,
  },
  {
    id: "quest-5",
    title: "Fullstack Marketplace Mobile App with Flutter & Go",
    clientName: "Kopi Nusantara Co",
    clientRating: 4.7,
    category: "Mobile",
    budget: "Rp 9.500.000",
    budgetNumeric: 9500000,
    budgetType: "Fixed",
    matchingSkills: ["Flutter", "Dart", "Golang", "REST API"],
    matchScore: 87,
    proposalsCount: 7,
    postedAt: "1 hari lalu",
    difficulty: "Intermediate",
    description: "Aplikasi mobile pesan-antar kopi dengan integrasi live tracking kurir serta QRIS payment gateway.",
    xpReward: 500,
    escrowGuaranteed: true,
  },
  {
    id: "quest-6",
    title: "Fullstack Next.js 14 Learning Management Platform",
    clientName: "EduVenture Academy",
    clientRating: 5.0,
    category: "Frontend",
    budget: "Rp 7.800.000",
    budgetNumeric: 7800000,
    budgetType: "Fixed",
    matchingSkills: ["Next.js", "React", "Tailwind CSS", "Prisma"],
    matchScore: 96,
    proposalsCount: 4,
    postedAt: "1 hari lalu",
    difficulty: "Intermediate",
    description: "Platform kursus online interaktif dengan fitur video player streaming, kuis interaktif, dan sertifikat otomatis.",
    xpReward: 520,
    escrowGuaranteed: true,
  },
];

const mockActiveContracts: ActiveContract[] = [
  {
    id: "act-1",
    title: "E-Commerce Checkout & Midtrans Integration",
    clientName: "Tokopedika Store",
    currentMilestone: "Milestone 2: Payment Webhook & Invoice PDF",
    deadline: "2 hari tersisa",
    progress: 70,
    amount: "Rp 4.200.000",
  },
  {
    id: "act-2",
    title: "Company Landing Page Optimization & SEO",
    clientName: "Aethel Media",
    currentMilestone: "Milestone 1: Performance Tuning (Lighthouse 95+)",
    deadline: "5 hari tersisa",
    progress: 40,
    amount: "Rp 2.800.000",
  },
];

const CATEGORIES = ["Semua", "Frontend", "Backend", "UI/UX", "AI & ML", "Mobile"];

type FeedTab = "recommended" | "high-xp" | "quick-turnaround";
type SortOption = "match" | "budget-desc" | "newest";

export function FreelancerDashboard() {
  const { user } = useAuth();

  // Feed State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [activeTab, setActiveTab] = useState<FeedTab>("recommended");
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [bookmarkedQuests, setBookmarkedQuests] = useState<string[]>(["quest-1"]);

  // Proposal modal state
  const [selectedQuest, setSelectedQuest] = useState<QuestOpportunity | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [proposalCover, setProposalCover] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [submitted, setSubmitted] = useState(false);
  const [activeDeliverable, setActiveDeliverable] = useState<string | null>(null);

  // Gamification state
  const currentLevel = user?.user_metadata?.level || 3;
  const currentXP = user?.user_metadata?.xp || 2450;
  const nextLevelXP = 3000;
  const xpPercentage = Math.round((currentXP / nextLevelXP) * 100);
  const streakDays = user?.user_metadata?.streak_days || 6;

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedQuests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenProposal = (quest: QuestOpportunity) => {
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

  // Filtered & Sorted Quests
  const filteredQuests = useMemo(() => {
    let result = mockQuests.filter((quest) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        quest.title.toLowerCase().includes(query) ||
        quest.category.toLowerCase().includes(query) ||
        quest.clientName.toLowerCase().includes(query) ||
        quest.matchingSkills.some((s) => s.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === "Semua" || quest.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });

    if (activeTab === "high-xp") {
      result = [...result].sort((a, b) => b.xpReward - a.xpReward);
    } else if (activeTab === "quick-turnaround") {
      result = result.filter((q) => q.difficulty !== "Expert");
    }

    if (sortBy === "match") {
      result.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === "budget-desc") {
      result.sort((a, b) => b.budgetNumeric - a.budgetNumeric);
    }

    return result;
  }, [searchQuery, selectedCategory, activeTab, sortBy]);

  const stats = [
    {
      title: "Quest Aktif",
      label: "Sedang dikerjakan",
      value: "2",
      change: "2 in progress",
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Proposal Terkirim",
      label: "Dalam seleksi",
      value: "9",
      change: "3 shortlisted",
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      title: "Total Pendapatan",
      label: "Saldo & Escrow",
      value: "Rp 18.5M",
      change: "Rp 7.0M in escrow",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Skor Rating",
      label: "Kepuasan klien",
      value: "4.9",
      change: "100% on-time",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="animate-fade-in space-y-3.5">
      {/* 1. Top Metrics Grid: Level & XP Progression + Statistik Kerja Cards */}
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Level & XP Progression Card */}
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans text-xs font-semibold text-foreground">
                Level & Reputasi
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-sans text-[11px] font-semibold text-amber-600">
                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span>{streakDays}d Streak</span>
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-heading text-xs font-normal text-amber-600">
                Level {currentLevel}
              </span>
              <span className="font-semibold text-xs text-foreground">Master Dev</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between font-sans text-xs mb-1">
              <span className="text-[11px] text-muted-foreground">Progres XP</span>
              <span className="text-[11px] font-medium text-foreground">{currentXP} / {nextLevelXP} XP</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-primary to-emerald-500 transition-all duration-500"
                style={{ width: `${xpPercentage}%` }}
              />
            </div>
            <p className="mt-1.5 font-sans text-[11px] text-muted-foreground truncate">
              +{nextLevelXP - currentXP} XP ke Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* 4 Work KPI Stat Cards */}
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="font-sans text-xs font-semibold text-foreground">
                  {stat.title}
                </span>
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform ${stat.bg}`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="font-heading text-xl md:text-2xl font-normal tracking-tight text-foreground">{stat.value}</p>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border/40 pt-2 font-sans text-xs">
              <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Sticky Interactive Project Search & Feed Bar */}
      <div className="sticky -top-6 md:-top-8 z-30 -mx-6 md:-mx-8 px-6 md:px-8 pt-1.5 md:pt-2 pb-2 bg-background/95 backdrop-blur-md transition-all">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-3.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
            {/* Live Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari judul quest, client, atau keahlian (e.g. Next.js, Python, Figma, Flutter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-border/80 bg-background pl-10 pr-10 font-sans text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Sort Dropdown */}
            <div className="flex items-center gap-2 self-end md:self-auto font-sans">
              <span className="text-xs text-muted-foreground hidden sm:inline">Urutkan:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-10 rounded-xl border border-border bg-background px-3 font-sans text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              >
                <option value="match">Highest Match</option>
                <option value="budget-desc">Budget: Terbesar</option>
                <option value="newest">Quest Terbaru</option>
              </select>
            </div>
          </div>

          {/* Category Pills & Feed View Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
            {/* Category Chips */}
            <div className="flex flex-wrap items-center gap-1.5 font-sans">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${selectedCategory === cat
                      ? "bg-primary text-white shadow-sm shadow-primary/30 scale-100"
                      : "border border-border/60 bg-muted/40 text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sub-Filter Tabs */}
            <div className="flex items-center rounded-xl bg-muted/60 p-1 font-sans text-xs">
              <button
                onClick={() => setActiveTab("recommended")}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${activeTab === "recommended"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Rekomendasi
              </button>
              <button
                onClick={() => setActiveTab("high-xp")}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${activeTab === "high-xp"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                High XP
              </button>
              <button
                onClick={() => setActiveTab("quick-turnaround")}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${activeTab === "quick-turnaround"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Fast Quest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Two-Column Layout: Quest Feed (Left) & Sticky Active Projects (Right) */}
      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {/* LEFT COLUMN: Project Feed (2 Cols) */}
        <div className="space-y-4 lg:col-span-2">
          {/* Feed Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Compass className="h-4 w-4" />
              </div>
              <h2 className="font-heading text-base font-normal tracking-tight text-foreground md:text-lg">
                Quest Feed Terpilih
              </h2>
              <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-xs">
                {filteredQuests.length}
              </span>
            </div>

            <Link
              href="/dashboard/explore"
              className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              <span>Lihat Semua di Quest Board</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Quests List with Smooth Top Fade Mask */}
          <div
            className="space-y-3.5 pt-1"
            style={{
              maskImage: "linear-gradient(to bottom, transparent 0px, black 36px, black 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 36px, black 100%)",
            }}
          >
            {filteredQuests.map((quest) => {
              const isBookmarked = bookmarkedQuests.includes(quest.id);

              return (
                <div
                  key={quest.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category, XP Bounty, Match, Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 font-sans">
                        <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {quest.category}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600">
                          <Zap className="h-3 w-3 fill-amber-500" />
                          +{quest.xpReward} XP
                        </span>
                        {quest.escrowGuaranteed && (
                          <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                            <ShieldCheck className="h-3 w-3" />
                            Escrow
                          </span>
                        )}
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {quest.difficulty}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-0.5 font-sans text-xs font-bold text-emerald-600">
                          <Sparkles className="h-3.5 w-3.5" />
                          {quest.matchScore}% Match
                        </span>
                        <button
                          onClick={(e) => toggleBookmark(quest.id, e)}
                          className={`rounded-lg p-1.5 transition-colors ${isBookmarked
                              ? "text-primary hover:text-primary-600"
                              : "text-muted-foreground/60 hover:text-foreground hover:bg-muted"
                            }`}
                          title={isBookmarked ? "Hapus dari simpanan" : "Simpan quest"}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {/* Quest Title & Description */}
                    <div>
                      <h3 className="font-heading text-sm md:text-base font-normal text-foreground group-hover:text-primary transition-colors leading-snug">
                        {quest.title}
                      </h3>
                      <p className="font-sans text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {quest.description}
                      </p>
                    </div>

                    {/* Metadata Row: Budget, Client, Proposals */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 font-sans text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm md:text-base text-foreground font-sans">
                          {quest.budget}
                        </span>
                        <span className="text-[11px] text-muted-foreground">({quest.budgetType})</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span>Client:</span>
                          <strong className="text-foreground font-medium">{quest.clientName}</strong>
                          <span className="inline-flex items-center gap-0.5 text-amber-600 text-[11px] font-semibold">
                            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                            {quest.clientRating}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{quest.proposalsCount} Proposal</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {quest.postedAt}
                        </span>
                      </div>
                    </div>

                    {/* Skill Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {quest.matchingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md border border-border/70 bg-background px-2 py-0.5 font-sans text-[11px] font-medium text-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-3">
                    <span className="font-sans text-[11px] text-muted-foreground">
                      Pembayaran aman melalui Doable! Smart Escrow
                    </span>
                    <button
                      onClick={() => handleOpenProposal(quest)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 font-sans text-xs font-semibold text-white shadow-sm shadow-primary/20 hover:bg-primary-600 transition-all hover:scale-[1.02]"
                    >
                      <span>Ajukan Proposal</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredQuests.length === 0 && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-12 text-center bg-card/40">
                <SlidersHorizontal className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <h3 className="font-heading text-base font-normal text-foreground">
                  Tidak ada quest yang cocok
                </h3>
                <p className="font-sans text-xs text-muted-foreground mt-1 max-w-sm">
                  Coba sesuaikan kata kunci pencarian atau ganti filter kategori di atas.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("Semua");
                    setActiveTab("recommended");
                  }}
                  className="mt-4 rounded-xl bg-primary/10 px-4 py-2 font-sans text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  Reset Semua Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Sticky Active Projects Widget (1 Col) */}
        <div className="space-y-6 lg:sticky lg:top-[128px] z-20">
          {/* Active Projects Widget */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Briefcase className="h-3.5 w-3.5" />
                </div>
                <h3 className="font-heading text-sm font-normal text-foreground">
                  Proyek Berjalan
                </h3>
                <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-xs">
                  {mockActiveContracts.length}
                </span>
              </div>
              <Link
                href="/dashboard/my-work"
                className="font-sans text-xs font-semibold text-primary hover:text-primary-600"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-3">
              {mockActiveContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2.5"
                >
                  <div>
                    <h4 className="font-heading text-xs font-normal text-foreground leading-snug">
                      {contract.title}
                    </h4>
                    <p className="font-sans text-[11px] text-muted-foreground mt-0.5">
                      Client: {contract.clientName}
                    </p>
                  </div>

                  <div className="rounded-lg bg-background/80 p-2.5 font-sans text-xs border border-border/40">
                    <p className="font-medium text-foreground text-[11px]">{contract.currentMilestone}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <Clock className="h-3 w-3" />
                        {contract.deadline}
                      </span>
                      <span className="font-semibold text-foreground">{contract.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${contract.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-sans text-xs pt-1">
                    <span className="font-bold text-emerald-600 text-xs">{contract.amount}</span>
                    <button
                      onClick={() => setActiveDeliverable(contract.title)}
                      className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {activeDeliverable === contract.title ? "Terkirim" : "Kirim Deliverable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Proposal Submission Modal */}
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
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 font-sans">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-lg font-normal text-foreground">Proposal Terkirim!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Proposalmu telah disampaikan ke <strong>{selectedQuest.clientName}</strong>. Kamu akan menerima notifikasi saat status proposalmu diperbarui.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-[11px] font-semibold text-primary">
                    {selectedQuest.category}
                  </span>
                  <h2 className="font-heading text-base font-normal text-foreground mt-2 leading-snug">
                    Ajukan Proposal: {selectedQuest.title}
                  </h2>
                  <p className="font-sans text-xs text-muted-foreground mt-1">
                    Budget Klien: <strong>{selectedQuest.budget}</strong> ({selectedQuest.budgetType}) • XP Bounty: <strong className="text-amber-600">+{selectedQuest.xpReward} XP</strong>
                  </p>
                </div>

                <form onSubmit={handleSubmitProposal} className="space-y-4 font-sans">
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
                      placeholder="Jelaskan pengalaman relevanmu, pendekatan pengerjaan, dan portfolio terkait..."
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
