"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sparkles,
  Flame,
  Award,
  Zap,
  Briefcase,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Code2,
  BookOpen,
  DollarSign,
  Star,
  Target,
  ShieldCheck,
  Compass,
  X,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

interface QuestOpportunity {
  id: string;
  title: string;
  clientName: string;
  category: string;
  budget: string;
  budgetType: "Fixed" | "Hourly";
  matchingSkills: string[];
  matchScore: number;
  proposalsCount: number;
  postedAt: string;
  difficulty: "Entry" | "Intermediate" | "Expert";
  description?: string;
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
    category: "Frontend Development",
    budget: "Rp 6.500.000",
    budgetType: "Fixed",
    matchingSkills: ["Next.js", "TypeScript", "Tailwind CSS"],
    matchScore: 98,
    proposalsCount: 5,
    postedAt: "1 jam lalu",
    difficulty: "Intermediate",
    description: "Membangun dashboard SaaS responsif dengan dark mode, visual chart, dan interaksi micro-animation.",
  },
  {
    id: "quest-2",
    title: "FastAPI Backend & Supabase Auth API Integration",
    clientName: "Studio Kreatif ID",
    category: "Backend Development",
    budget: "Rp 8.000.000",
    budgetType: "Fixed",
    matchingSkills: ["Python", "FastAPI", "PostgreSQL", "Supabase"],
    matchScore: 94,
    proposalsCount: 3,
    postedAt: "3 jam lalu",
    difficulty: "Expert",
    description: "Membangun REST API performa tinggi dengan FastAPI dan otentikasi role-based Supabase.",
  },
  {
    id: "quest-3",
    title: "Mobile App Wireframe & UI Design System in Figma",
    clientName: "PT FinTech Solusindo",
    category: "UI/UX Design",
    budget: "Rp 4.500.000",
    budgetType: "Fixed",
    matchingSkills: ["Figma", "Design Systems", "Prototyping"],
    matchScore: 89,
    proposalsCount: 9,
    postedAt: "6 jam lalu",
    difficulty: "Intermediate",
    description: "Desain sistem UI/UX lengkap aplikasi fintech dari onboarding hingga transaksi.",
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

export function FreelancerDashboard() {
  const { user } = useAuth();
  const freelancerName = user?.user_metadata?.full_name || "Freelancer";

  const [selectedQuest, setSelectedQuest] = useState<QuestOpportunity | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [proposalCover, setProposalCover] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("7");
  const [submitted, setSubmitted] = useState(false);
  const [activeDeliverable, setActiveDeliverable] = useState<string | null>(null);

  // Gamification state (XP, Level, Streak from database schema)
  const currentLevel = user?.user_metadata?.level || 3;
  const currentXP = user?.user_metadata?.xp || 2450;
  const nextLevelXP = 3000;
  const xpPercentage = Math.round((currentXP / nextLevelXP) * 100);
  const streakDays = user?.user_metadata?.streak_days || 6;

  const scrollToQuests = () => {
    const el = document.getElementById("recommended-quests");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  const stats = [
    {
      label: "Active Quests",
      value: "2",
      change: "2 in progress",
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Proposals Submitted",
      value: "9",
      change: "3 shortlisted",
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Earnings",
      value: "Rp 18.5M",
      change: "Rp 7.0M in escrow",
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Client Rating",
      value: "4.9 ★",
      change: "100% on-time",
      icon: Star,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Gamification Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#110C42] via-[#1E1475] to-[#2B1CEB] p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="space-y-3 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                <Code2 className="h-3.5 w-3.5 text-blue-300" />
                <span>Freelancer Talent Mode</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                <Flame className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{streakDays} Hari Streak!</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              Semangat berkreasi, {freelancerName}! 🚀
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Temukan quest proyek baru sesuai keahlianmu, kumpulkan XP, dan tingkatkan reputasimu di Doable!.
            </p>

            {/* Level & XP Progress */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-medium text-white/90 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-400/20 px-2 py-0.5 font-bold text-amber-300">
                    Level {currentLevel}
                  </span>
                  <span>Master Developer</span>
                </div>
                <span>{currentXP} / {nextLevelXP} XP ({xpPercentage}%)</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
            <Link
              href="/dashboard/explore"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-black/10 transition-all hover:bg-slate-100 hover:scale-[1.02]"
            >
              <Compass className="h-4 w-4 text-primary" />
              <span className="text-slate-900 font-bold">Jelajahi Quest Proyek</span>
            </Link>
            <button
              onClick={scrollToQuests}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <Zap className="h-4 w-4 text-amber-300" />
              <span>Lihat Rekomendasi Terdekat</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Recommended Quests & Active In-Progress Contracts */}
      <div id="recommended-quests" className="grid gap-6 lg:grid-cols-3 scroll-mt-6">
        {/* Left 2 Cols: Recommended Quests For You */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Recommended Quests For You
              </h2>
              <p className="text-xs text-muted-foreground">
                Matched according to your verified skills & experience
              </p>
            </div>
            <Link
              href="/dashboard/explore"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              <span>Explore All Quests</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockQuests.map((quest) => (
              <div
                key={quest.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        {quest.category}
                      </span>
                      <span className="rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {quest.difficulty}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                      <Sparkles className="h-3.5 w-3.5" />
                      {quest.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                    {quest.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {quest.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="font-bold text-foreground text-sm">{quest.budget}</span>
                    <span>•</span>
                    <span>Client: <strong className="text-foreground font-medium">{quest.clientName}</strong></span>
                    <span>•</span>
                    <span>{quest.proposalsCount} Proposals</span>
                    <span>•</span>
                    <span>{quest.postedAt}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {quest.matchingSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border/60 bg-background px-2 py-0.5 text-[11px] font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                  <button
                    onClick={() => handleOpenProposal(quest)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 hover:bg-primary-600 transition-all hover:scale-[1.02]"
                  >
                    <span>Ajukan Proposal</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Active Contracts & Skill Badges */}
        <div className="space-y-6">
          {/* Active Work In-Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">
                  Active Projects
                </h2>
                <p className="text-xs text-muted-foreground">
                  Milestones and deadlines
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mockActiveContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm space-y-3"
                >
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      {contract.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Client: {contract.clientName}
                    </p>
                  </div>

                  <div className="rounded-lg bg-muted/50 p-2.5 text-xs">
                    <p className="font-medium text-foreground">{contract.currentMilestone}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground mb-1">
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

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-emerald-600">{contract.amount}</span>
                    <button
                      onClick={() => setActiveDeliverable(contract.title)}
                      className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      {activeDeliverable === contract.title ? "Terkirim ✓" : "Kirim Deliverable"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Verification / Quest Level Up Card */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-tertiary/5 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Award className="h-4 w-4" />
              <span>Verifikasi Skill & Badge</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Freelancer dengan badge skill terverifikasi mendapatkan <strong>3x lebih banyak</strong> tawaran proyek dan prioritas di halaman pencarian klien.
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between rounded-xl bg-background border border-border/60 p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">Next.js & React Expert</span>
                </div>
                <span className="text-xs font-bold text-emerald-600">Verified</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-background border border-border/60 p-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-amber-500" />
                  <span className="font-medium">FastAPI & Python API</span>
                </div>
                <Link
                  href="/dashboard/explore"
                  className="rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-white hover:bg-primary-600 transition-colors"
                >
                  Take Quiz
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Submission Modal */}
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
                  Proposalmu telah disampaikan ke <strong>{selectedQuest.clientName}</strong>. Kamu akan menerima notifikasi saat status proposalmu diperbarui.
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
