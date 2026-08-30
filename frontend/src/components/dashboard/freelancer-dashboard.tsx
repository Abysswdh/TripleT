"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/context/currency-context";
import {
  Flame,
  Zap,
  Briefcase,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Target,
  ShieldCheck,
  Compass,
  X,
  CheckCircle2,
  FileText,
  Award,
  CircleDot,
  Send,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import Grainient from "@/components/ui/Grainient";
import { getOpenProjects } from "@/lib/services/projects";
import { submitProposal } from "@/lib/services/proposals";

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
  isSimulated?: boolean;
}

interface TimelineActionItem {
  id: string;
  projectTitle: string;
  clientName: string;
  milestoneTitle: string;
  milestoneNumber: number;
  totalMilestones: number;
  amount: number;
  currency: "IDR" | "USD";
  dueDate: string;
  urgency: "urgent" | "normal" | "review";
  progress: number;
  tasksChecklist: Array<{ id: string; title: string; done: boolean }>;
  deliverableLink?: string;
  submittedAt?: string;
}

interface DailyMission {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
  actionType: "checkin" | "submit" | "quiz" | "proposal";
  actionTarget?: string;
}

const mockQuests: QuestOpportunity[] = [];
const initialTimelineItems: TimelineActionItem[] = [];
const initialMissions: DailyMission[] = [];

// Generate 16 weeks of GitHub-style contribution data
function generateGitHubHeatmap() {
  const weeks = 16;
  const days = 7;
  const heatmap: Array<Array<{ level: number; date: string; count: number }>> = [];

  // Seeded pattern to simulate an active freelancer streak
  const pattern = [
    [0, 1, 0, 2, 0, 1, 0],
    [1, 0, 2, 1, 3, 0, 1],
    [0, 2, 1, 0, 2, 1, 0],
    [1, 1, 0, 3, 2, 0, 1],
    [2, 0, 1, 1, 4, 1, 0],
    [0, 1, 3, 2, 0, 2, 1],
    [1, 2, 0, 1, 3, 1, 0],
    [2, 1, 2, 0, 1, 2, 1],
    [0, 3, 1, 2, 4, 0, 1],
    [1, 0, 2, 3, 1, 2, 0],
    [2, 1, 0, 2, 3, 1, 1],
    [1, 3, 2, 1, 0, 2, 1],
    [3, 2, 4, 1, 2, 3, 0],
    [2, 3, 1, 4, 2, 1, 2],
    [1, 2, 3, 2, 4, 3, 1],
    [2, 4, 3, 3, 4, 3, 0], // Most recent week (active streak)
  ];

  for (let w = 0; w < weeks; w++) {
    const weekCol: Array<{ level: number; date: string; count: number }> = [];
    for (let d = 0; d < days; d++) {
      const level = pattern[w] ? pattern[w][d] : Math.floor(Math.random() * 3);
      const count = level === 0 ? 0 : level * 2 + 1;
      weekCol.push({
        level,
        date: `Minggu ${w + 1}, Hari ${d + 1}`,
        count,
      });
    }
    heatmap.push(weekCol);
  }

  return heatmap;
}

const CATEGORIES = ["Semua", "Desain Grafis", "Simulasi Portofolio", "Frontend", "Backend", "UI/UX"];

export function FreelancerDashboard() {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();

  // Timeline & Missions State
  const [timelineItems, setTimelineItems] = useState<TimelineActionItem[]>(initialTimelineItems);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(initialMissions);

  // Submit Modal State
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeItemToSubmit, setActiveItemToSubmit] = useState<TimelineActionItem | null>(null);
  const [deliverableNote, setDeliverableNote] = useState("");
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  // Quest Feed State
  const [quests, setQuests] = useState<QuestOpportunity[]>(mockQuests);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedQuest, setSelectedQuest] = useState<QuestOpportunity | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [proposalCover, setProposalCover] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("2");
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  // Fetch live quests from Supabase
  useEffect(() => {
    async function loadLiveQuests() {
      try {
        const liveProjects = await getOpenProjects();
        if (liveProjects && liveProjects.length > 0) {
          const mapped: QuestOpportunity[] = liveProjects.map((p) => ({
            id: p.id,
            title: p.title,
            clientName: p.owner?.fullName || "Klien Terverifikasi",
            clientRating: 5.0,
            category: p.category,
            budget: p.budget,
            budgetNumeric: p.budgetNumeric,
            budgetType: "Fixed",
            matchingSkills: p.skills.length > 0 ? p.skills : ["Digital", "Creative"],
            matchScore: Math.floor(Math.random() * 10) + 90,
            proposalsCount: p.proposalsCount,
            postedAt: p.postedDate,
            difficulty: (p.difficulty as "Entry" | "Intermediate" | "Expert") || "Intermediate",
            description: p.description,
            xpReward: 350,
            escrowGuaranteed: true,
            isSimulated: p.isDummy,
          }));

          setQuests((prev) => {
            const liveIds = new Set(mapped.map((m) => m.id));
            const remainingMock = prev.filter((q) => !liveIds.has(q.id));
            return [...mapped, ...remainingMock];
          });
        }
      } catch (err) {
        console.error("Error loading quests from Supabase:", err);
      }
    }

    loadLiveQuests();
  }, []);

  // Gamification Profile State
  const freelancerName = user?.user_metadata?.full_name || "Rania Putri";
  const [currentXP, setCurrentXP] = useState<number>((user?.user_metadata?.xp as number) || 2450);
  const currentLevel = (user?.user_metadata?.level as number) || 3;
  const nextLevelXP = 3000;
  const xpPercentage = Math.min(100, Math.round((currentXP / nextLevelXP) * 100));
  const streakDays = 6;

  const githubHeatmap = useMemo(() => generateGitHubHeatmap(), []);

  const handleOpenSubmit = (item: TimelineActionItem) => {
    setActiveItemToSubmit(item);
    setDeliverableNote("");
    setDeliverableUrl("");
    setSubmissionSuccess(false);
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemToSubmit) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Update item in timeline to "review"
      setTimelineItems((prev) =>
        prev.map((item) =>
          item.id === activeItemToSubmit.id
            ? {
                ...item,
                urgency: "review",
                dueDate: "Menunggu Review Klien",
                submittedAt: "Baru saja",
                progress: 100,
                tasksChecklist: item.tasksChecklist.map((t) => ({ ...t, done: true })),
              }
            : item
        )
      );

      // Complete corresponding mission
      setDailyMissions((prev) =>
        prev.map((m) => (m.actionTarget === activeItemToSubmit.id ? { ...m, completed: true } : m))
      );

      // Add XP reward
      setCurrentXP((prev: number) => prev + 150);

      setIsSubmitting(false);
      setSubmissionSuccess(true);

      setTimeout(() => {
        setSubmitModalOpen(false);
      }, 1600);
    }, 1000);
  };

  const toggleTaskCheck = (itemId: string, taskId: string) => {
    setTimelineItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedChecklist = item.tasksChecklist.map((t) =>
          t.id === taskId ? { ...t, done: !t.done } : t
        );
        const doneCount = updatedChecklist.filter((t) => t.done).length;
        const progress = Math.round((doneCount / updatedChecklist.length) * 100);
        return { ...item, tasksChecklist: updatedChecklist, progress };
      })
    );
  };

  const handleOpenProposal = (quest: QuestOpportunity) => {
    setSelectedQuest(quest);
    setBidAmount(quest.budget);
    setProposalSubmitted(false);
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuest) return;

    const numericBid = parseInt(bidAmount.replace(/\D/g, "") || "0", 10) || selectedQuest.budgetNumeric;

    try {
      await submitProposal({
        projectId: selectedQuest.id,
        bidAmount: numericBid,
        deliveryDays: parseInt(deliveryDays || "7", 10),
        coverLetter: proposalCover || "Halo! Saya sangat tertarik mengerjakan proyek ini dengan kualitas terbaik.",
        skills: selectedQuest.matchingSkills,
      });
    } catch (err) {
      console.error("Error submitting proposal to Supabase:", err);
    }

    setProposalSubmitted(true);
    setTimeout(() => {
      setSelectedQuest(null);
      setProposalSubmitted(false);
    }, 1600);
  };

  // Filtered Quests
  const filteredQuests = useMemo(() => {
    return quests.filter((quest) => {
      const matchesCategory =
        selectedCategory === "Semua" || quest.category === selectedCategory;

      return matchesCategory;
    });
  }, [quests, selectedCategory]);

  const completedMissionsCount = dailyMissions.filter((m) => m.completed).length;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in font-sans">
      {/* Role Identity Strip */}
      <div className="flex items-center justify-between rounded-2xl border border-violet-500/20 bg-gradient-to-r from-violet-500/8 via-transparent to-transparent px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Briefcase className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground leading-none">
              {freelancerName}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Mode: Freelancer</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-1">
            <Zap className="h-2.5 w-2.5" />
            Portfolio Quest Mode
          </span>
        </div>
      </div>

      {/* 0. Clean Minimalist Hero Greeting (Buttons & Badges Removed as requested) */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Grainient
            color1="#10B981"
            color2="#2563EB"
            color3="#0F172A"
            timeSpeed={0.2}
            colorBalance={0.0}
            warpStrength={1.0}
            warpFrequency={5.0}
            warpSpeed={2.0}
            warpAmplitude={50.0}
            blendAngle={0.0}
            blendSoftness={0.05}
            rotationAmount={500.0}
            noiseScale={2.0}
            grainAmount={0.1}
            grainScale={2.0}
            grainAnimated={false}
            contrast={1.4}
            gamma={1.0}
            saturation={1.05}
            centerX={0.0}
            centerY={0.0}
            zoom={0.9}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/45 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-snug">
              Selamat datang kembali, {freelancerName}!
            </h1>
            <p className="max-w-2xl text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
              Pantau alur pekerjaan aktifmu, selesaikan misi harian untuk menjaga konsistensi streak, dan bangun portofolio profesionalmu.
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left Scrollable Feed (Col 7) vs Right Sticky Guide (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCROLLABLE FEED (Pekerjaan Saya, Proyek, Keahlian, Pendapatan)*/}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* 1. PEKERJAAN SAYA (Paling Atas) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                  Pekerjaan Saya ({timelineItems.length})
                </h2>
              </div>
              <Link
                href="/freelancer/my-work"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Detail Kontrak</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Active Contracts & Timeline Items */}
            <div className="space-y-4">
              {timelineItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-2">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Belum ada kontrak aktif</p>
                  <p className="text-xs text-muted-foreground">Jelajahi quest yang tersedia dan ajukan proposal untuk memulai pekerjaan pertama Anda.</p>
                </div>
              ) : (
                timelineItems.map((item) => {
                const isUrgent = item.urgency === "urgent";
                const isReview = item.urgency === "review";

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden ${
                      isUrgent
                        ? "border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-card to-card hover:border-amber-500/60"
                        : isReview
                        ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                        : "border-border/70 bg-card hover:border-primary/40"
                    }`}
                  >
                    {/* Top Status & Amount */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 ${
                            isUrgent
                              ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                              : isReview
                              ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          <span>{item.dueDate}</span>
                        </span>

                        <span className="text-xs text-muted-foreground font-medium">
                          Klien: <strong className="text-foreground">{item.clientName}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-foreground font-heading">
                          {formatMoney(item.amount, item.currency)}
                        </span>
                      </div>
                    </div>

                    {/* Project Title & Milestone */}
                    <div className="space-y-1 mb-3.5">
                      <h3 className="text-sm sm:text-base font-bold text-foreground leading-snug">
                        {item.projectTitle}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">{item.milestoneTitle}</span>
                        <span>&bull;</span>
                        <span>Milestone {item.milestoneNumber} dari {item.totalMilestones}</span>
                      </div>
                    </div>

                    {/* Notion-Style Task Checklist */}
                    <div className="rounded-2xl bg-muted/30 border border-border/50 p-3.5 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-1">
                        <span>Checklist Tugas ({item.tasksChecklist.filter((t) => t.done).length}/{item.tasksChecklist.length})</span>
                        <span>{item.progress}% Selesai</span>
                      </div>

                      <div className="space-y-1.5">
                        {item.tasksChecklist.map((task) => (
                          <label
                            key={task.id}
                            className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer hover:text-primary transition-colors select-none"
                          >
                            <input
                              type="checkbox"
                              checked={task.done}
                              disabled={isReview}
                              onChange={() => toggleTaskCheck(item.id, task.id)}
                              className="h-4 w-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
                            />
                            <span className={task.done ? "line-through opacity-60 text-muted-foreground" : "font-medium"}>
                              {task.title}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>Escrow Terkunci di Rekening Bersama</span>
                      </div>

                      <Link
                        href="/client/projects/proj-1"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Detail Proyek</span>
                      </Link>
                    </div>
                  </div>
                );
              }))}
            </div>
          </section>

          {/* 2. PROYEK LAIN YANG SELARAS DENGAN KAMU (Scroll Section 2) */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                  Proyek Selaras dengan Kamu
                </h2>
              </div>
              <Link
                href="/freelancer/explore"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Jelajahi Semua</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quests List Cards */}
            <div className="grid gap-3.5">
              {filteredQuests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-2">
                  <p className="text-sm font-semibold text-foreground">Belum ada quest proyek tersedia</p>
                  <p className="text-xs text-muted-foreground">Kembali lagi nanti atau pantau lowongan baru yang diposting oleh klien.</p>
                </div>
              ) : (
                filteredQuests.slice(0, 3).map((quest) => (
                <div
                  key={quest.id}
                  className={`rounded-2xl border p-4.5 sm:p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-sm ${
                    quest.isSimulated
                      ? "border-indigo-500/30 bg-indigo-500/5"
                      : "border-border/70 bg-card"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {quest.category}
                        </span>
                        <span className="text-xs text-muted-foreground">&bull;</span>
                        <span className="text-xs font-medium text-foreground">{quest.clientName}</span>
                        {quest.isSimulated && (
                          <span className="rounded-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                            Simulasi Portofolio
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                        {quest.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {quest.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {quest.matchingSkills.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 border-border/40 pt-3 sm:pt-0">
                      <div className="sm:text-right">
                        <span className="text-sm font-bold text-foreground font-heading block">
                          {quest.budgetNumeric > 0 ? formatMoney(quest.budgetNumeric, "IDR") : quest.budget}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 sm:justify-end">
                          <Zap className="h-3 w-3" />
                          +{quest.xpReward} XP
                        </span>
                      </div>

                      <button
                        onClick={() => handleOpenProposal(quest)}
                        className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
                      >
                        Ajukan Proposal
                      </button>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </section>

          {/* 3. RINGKASAN KEAHLIAN & KUIS (Scroll Section 3) */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                  Keahlian & Verifikasi
                </h2>
              </div>
              <Link
                href="/freelancer/skills"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Skill Quizzes</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl border border-border/70 bg-card space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Figma Auto-Layout & UI Kit</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Score: 92/100 &bull; Menambah bobot Match Score di proyek UI/UX sebesar +15%.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-xs font-bold text-foreground block">Tantangan Kuis Baru</span>
                  <p className="text-xs text-muted-foreground">
                    Selesaikan kuis <strong>Social Media Poster Typography</strong> untuk mendapat badge ekstra.
                  </p>
                </div>
                <Link
                  href="/freelancer/skills"
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 self-start"
                >
                  <span>Mulai Kuis (+300 XP)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </section>

          {/* 4. RINGKASAN PENDAPATAN & SALDO (Scroll Section 4) */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                  Pendapatan & Saldo
                </h2>
              </div>
              <Link
                href="/freelancer/earnings"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Kelola Rekening</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">Saldo Siap Ditarik</span>
                <h3 className="text-2xl font-bold text-foreground font-heading mt-0.5">
                  {formatMoney(14850000, "IDR")}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Terhubung ke rekening BCA &bull; a.n. {freelancerName}
                </p>
              </div>

              <Link
                href="/freelancer/earnings"
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all shrink-0"
              >
                Tarik Saldo
              </Link>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY GUIDE (GitHub Streak Heatmap, Misi Harian, Level)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* 1. GitHub-Style Green Contribution Heatmap & Streak */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                  <Flame className="h-4.5 w-4.5 fill-emerald-500 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground font-heading">
                    {streakDays} Hari Streak Konsisten
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Total 48 kontribusi aktif dalam 4 bulan terakhir
                  </p>
                </div>
              </div>
            </div>

            {/* True GitHub-Style Contribution Heatmap Matrix */}
            <div className="rounded-2xl bg-muted/20 border border-border/50 p-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold px-1">
                <span>Jun</span>
                <span>Jul</span>
                <span>Agu</span>
                <span>Sep</span>
              </div>

              {/* Heatmap Grid: 16 Week Columns x 7 Day Rows */}
              <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1 scrollbar-none">
                {githubHeatmap.map((week, wIdx) =>
                  week.map((day, dIdx) => (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      title={`${day.count} aktivitas pada ${day.date}`}
                      className={`h-2.5 w-2.5 rounded-[2.5px] transition-all hover:scale-125 cursor-pointer ${
                        day.level === 0
                          ? "bg-muted/60"
                          : day.level === 1
                          ? "bg-emerald-500/30"
                          : day.level === 2
                          ? "bg-emerald-500/60"
                          : day.level === 3
                          ? "bg-emerald-500/85"
                          : "bg-emerald-600 dark:bg-emerald-400"
                      }`}
                    />
                  ))
                )}
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground font-medium">
                <span>Kurang</span>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-[2px] bg-muted/60" />
                  <span className="h-2 w-2 rounded-[2px] bg-emerald-500/30" />
                  <span className="h-2 w-2 rounded-[2px] bg-emerald-500/60" />
                  <span className="h-2 w-2 rounded-[2px] bg-emerald-500/85" />
                  <span className="h-2 w-2 rounded-[2px] bg-emerald-600 dark:bg-emerald-400" />
                </div>
                <span>Lebih</span>
              </div>
            </div>
          </div>

          {/* 2. Misi Harian / Daily Quest Checklist */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground font-heading">Misi Harian</h3>
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {completedMissionsCount}/{dailyMissions.length} Selesai
              </span>
            </div>

            <div className="space-y-3">
              {dailyMissions.map((mission) => (
                <div
                  key={mission.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    mission.completed
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
                      : "bg-muted/20 border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    {mission.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <CircleDot className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4
                        className={`text-xs font-bold truncate ${
                          mission.completed ? "line-through opacity-70" : "text-foreground"
                        }`}
                      >
                        {mission.title}
                      </h4>
                      <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        +{mission.xpReward} XP
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {mission.description}
                    </p>

                    {!mission.completed && mission.actionType === "submit" && (
                      <button
                        onClick={() => {
                          const target = timelineItems.find((i) => i.id === mission.actionTarget);
                          if (target) handleOpenSubmit(target);
                        }}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        <span>Serahkan Milestone</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    )}

                    {!mission.completed && mission.actionType === "quiz" && (
                      <Link
                        href="/freelancer/explore"
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        <span>Buka Simulasi</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Level & Career Progression Road */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Jalur Karir Talenta
                </span>
              </div>
              <span className="text-xs font-bold text-foreground font-heading">
                {currentXP} / {nextLevelXP} XP
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Level {currentLevel} Creator</span>
                <span className="text-muted-foreground">Level {currentLevel + 1} Verified Pro</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Tinggal <strong className="text-foreground">{nextLevelXP - currentXP} XP lagi</strong> untuk membuka lencana <strong>Verified Pro</strong> dan prioritas rekomendasi di pencarian klien UMKM.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SUBMIT MILESTONE DELIVERABLE                                     */}
      {/* ========================================================================= */}
      {submitModalOpen && activeItemToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Penyerahan Hasil Karya
                </span>
                <h3 className="text-base font-bold text-foreground font-heading">
                  {activeItemToSubmit.milestoneTitle}
                </h3>
              </div>
              <button
                onClick={() => setSubmitModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submissionSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">Hasil Karya Berhasil Diserahkan!</h4>
                <p className="text-xs text-muted-foreground">
                  Klien ({activeItemToSubmit.clientName}) telah menerima notifikasi untuk memeriksa dan melepaskan dana escrow sebesar <strong>{formatMoney(activeItemToSubmit.amount, activeItemToSubmit.currency)}</strong>.
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1 rounded-full">
                  <Zap className="h-3.5 w-3.5" />
                  <span>+150 XP Diperoleh!</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="text-[10px] text-muted-foreground uppercase">Proyek Terkait</span>
                  <p className="font-bold text-foreground">{activeItemToSubmit.projectTitle}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Tautan File / Preview Karya (Google Drive, Figma, GitHub, Imgur)
                  </label>
                  <input
                    type="url"
                    required
                    value={deliverableUrl}
                    onChange={(e) => setDeliverableUrl(e.target.value)}
                    placeholder="https://www.figma.com/file/... atau https://drive.google.com/..."
                    className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">
                    Catatan Metodologi & Rangkuman Desain
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={deliverableNote}
                    onChange={(e) => setDeliverableNote(e.target.value)}
                    placeholder="Jelaskan konsep, pilihan warna, atau petunjuk file yang Anda serahkan..."
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSubmitting ? "Menyerahkan..." : "Kirim ke Klien"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUBMIT BID PROPOSAL TO CLIENT                                    */}
      {/* ========================================================================= */}
      {selectedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Ajukan Proposal Quest
                </span>
                <h3 className="text-base font-bold text-foreground font-heading">
                  {selectedQuest.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedQuest(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {proposalSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">Proposal Berhasil Terkirim!</h4>
                <p className="text-xs text-muted-foreground">
                  Klien ({selectedQuest.clientName}) akan meninjau portofolio Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitProposal} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Tawaran Harga</label>
                    <input
                      type="text"
                      required
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Estimasi Selesai (Hari)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Pesan Pendukung & Tautan Portofolio</label>
                  <textarea
                    rows={4}
                    required
                    value={proposalCover}
                    onChange={(e) => setProposalCover(e.target.value)}
                    placeholder={`Halo ${selectedQuest.clientName}, saya siap mengerjakan proyek ini dengan hasil berkualitas tinggi dan tepat waktu...`}
                    className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedQuest(null)}
                    className="px-4 py-2 rounded-xl text-muted-foreground hover:bg-muted font-semibold"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Kirim Proposal</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
