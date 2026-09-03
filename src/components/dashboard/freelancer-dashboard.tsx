"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrency } from "@/context/currency-context";
import {
  Zap,
  Briefcase,
  Clock,
  ChevronRight,
  ArrowUpRight,
  Target,
  ShieldCheck,
  Compass,
  CheckCircle2,
  FileText,
  Award,
  CircleDot,
  Send,
  CreditCard,
  ArrowRight,
  Sparkles,
  BookOpen,
  Check,
} from "lucide-react";
import Link from "next/link";
import Grainient from "@/components/ui/Grainient";
import { getOpenProjects } from "@/lib/services/projects";
import { getFreelancerContracts, submitMilestoneDeliverable } from "@/lib/services/contracts";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { fetchHeatmapData, fetchUserXPBreakdown, getLearnedResources, logActivity, type HeatmapData, type XPBreakdown } from "@/lib/services/activity";
import { getSavedQuizResults, fetchUserQuizResults, SKILL_QUIZZES, type QuizAttemptResult } from "@/lib/services/quizzes";
import { getFreelancerEarnings, type EarningsSummary } from "@/lib/services/earnings";
import { DoableStreakTracker } from "@/components/dashboard/doable-streak-tracker";

interface QuestOpportunity {
  id: string;
  ownerId?: string;
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

// Generate empty placeholder heatmap for pre-load state
function generateEmptyHeatmap(): HeatmapData["weeks"] {
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 7 }, () => ({ date: "", count: 0, level: 0 as const }))
  );
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

  // Fetch live quests from Supabase
  useEffect(() => {
    async function loadLiveQuests() {
      try {
        const liveProjects = await getOpenProjects();
        if (liveProjects && liveProjects.length > 0) {
          const mapped: QuestOpportunity[] = liveProjects.map((p) => ({
            id: p.id,
            ownerId: p.ownerId || p.owner?.id,
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
        // 2. Load live contracts for timeline & daily missions
        const liveContracts = await getFreelancerContracts();
        if (liveContracts && liveContracts.length > 0) {
          const mappedTimeline: TimelineActionItem[] = liveContracts.flatMap((c) =>
            c.milestones.map((m, idx) => ({
              id: m.id,
              projectTitle: c.projectTitle,
              clientName: c.clientName,
              milestoneTitle: m.title,
              milestoneNumber: idx + 1,
              totalMilestones: c.milestones.length || 3,
              amount: m.amount || Math.round(c.totalAmount / (c.milestones.length || 1)),
              currency: "IDR" as const,
              dueDate: m.dueDate || "3 hari lagi",
              urgency: (m.status === "submitted" ? "review" : "normal") as "review" | "normal" | "urgent",
              progress: m.status === "completed" ? 100 : m.status === "submitted" ? 100 : c.progress || 35,
              tasksChecklist: [
                { id: `${m.id}-1`, title: "Setup arsitektur dan komponen", done: m.status === "completed" || m.status === "submitted" },
                { id: `${m.id}-2`, title: "Integrasi API & logic", done: m.status === "completed" || m.status === "submitted" },
                { id: `${m.id}-3`, title: "Testing dan penyerahan", done: m.status === "completed" }
              ],
            }))
          );
          if (mappedTimeline.length > 0) {
            setTimelineItems(mappedTimeline);
          }

          // Daily Missions only populate if freelancer has active client contracts with tasks for today
          const activeContracts = liveContracts.filter((c) => c.status === "active");
          if (activeContracts.length > 0) {
            const missions: DailyMission[] = [];

            for (const c of activeContracts) {
              const activeMilestone =
                c.milestones.find((m) => m.status === "in_progress") ||
                c.milestones.find((m) => m.status !== "completed") ||
                c.milestones[0];

              if (activeMilestone) {
                const tlItem = mappedTimeline.find((t) => t.id === activeMilestone.id);
                const pendingTasks = tlItem?.tasksChecklist.filter((t) => !t.done) || [];

                // 1. Task checklist item for today
                if (pendingTasks.length > 0) {
                  missions.push({
                    id: `mission-task-${pendingTasks[0].id}`,
                    title: `Kerjakan: ${pendingTasks[0].title}`,
                    description: `Target harian proyek "${c.projectTitle}" (Klien: ${c.clientName})`,
                    xpReward: 50,
                    completed: false,
                    actionType: "checkin",
                    actionTarget: pendingTasks[0].id,
                  });
                }

                // 2. Deliverable submission if milestone is active & ready
                if (activeMilestone.status !== "completed") {
                  missions.push({
                    id: `mission-submit-${activeMilestone.id}`,
                    title: `Serahkan Milestone: ${activeMilestone.title}`,
                    description: `Kirim hasil karya ke ${c.clientName} untuk peninjauan rekber`,
                    xpReward: 150,
                    completed: activeMilestone.status === "submitted",
                    actionType: "submit",
                    actionTarget: activeMilestone.id,
                  });
                }
              }
            }

            setDailyMissions(missions);
          } else {
            setDailyMissions([]);
          }
        } else {
          setTimelineItems([]);
          setDailyMissions([]);
        }
      } catch (err) {
        console.error("Error loading quests from Supabase:", err);
      }
    }

    loadLiveQuests();
  }, []);

  // Gamification Profile State (3-Pillar XP Accumulation: Quiz + Work + Learning)
  const freelancerName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Freelancer";

  const [xpBreakdown, setXpBreakdown] = useState<XPBreakdown>({
    quizXP: 0,
    workXP: 0,
    learningXP: 0,
    totalXP: 0,
  });

  const [currentXP, setCurrentXP] = useState<number>(() => {
    try {
      const results = getSavedQuizResults();
      const quizTotal = Object.values(results).reduce((sum, r) => sum + (r.earnedXp || 0), 0);
      return quizTotal > 0 ? quizTotal : (Number(user?.user_metadata?.xp) || 0);
    } catch {
      return Number(user?.user_metadata?.xp) || 0;
    }
  });

  // Freelancer Level: Defaults to 0 for new users (each 1,000 XP = 1 Level)
  const currentLevel = typeof user?.user_metadata?.level === "number"
    ? user.user_metadata.level
    : Math.floor(currentXP / 1000);

  const nextLevelXP = (currentLevel + 1) * 1000;
  const currentLevelBaseXP = currentLevel * 1000;
  const xpInCurrentLevel = Math.max(0, currentXP - currentLevelBaseXP);
  const xpNeededForLevel = 1000;
  const xpPercentage = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));

  // Load real XP breakdown from Supabase / DB
  useEffect(() => {
    fetchUserXPBreakdown().then((data) => {
      setXpBreakdown(data);
      setCurrentXP(data.totalXP);
    });
  }, [user]);

  // Saved quiz results & learned resources tracking from database
  const [quizResults, setQuizResults] = useState<Record<string, QuizAttemptResult>>({});
  const [learnedCount, setLearnedCount] = useState<number>(0);

  useEffect(() => {
    fetchUserQuizResults().then((res) => {
      setQuizResults(res);
    });
    setLearnedCount(getLearnedResources().length);
  }, [user]);

  // Real earnings & wallet balance from database
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);

  useEffect(() => {
    getFreelancerEarnings().then((data) => {
      if (data) setEarnings(data);
    });
  }, [user]);

  // Listen for live XP events (quizzes, milestones, learning)
  useEffect(() => {
    const onQuizCompleted = (e: CustomEvent) => {
      const earnedXp = (e.detail?.earnedXp as number) || 0;
      setCurrentXP((prev) => prev + earnedXp);
      setXpBreakdown((prev) => ({
        ...prev,
        quizXP: prev.quizXP + earnedXp,
        totalXP: prev.totalXP + earnedXp,
      }));
      setQuizResults(getSavedQuizResults());
    };

    const onXpUpdated = (e: CustomEvent) => {
      const earnedXp = (e.detail?.xpEarned as number) || 0;
      const type = e.detail?.type;
      setCurrentXP((prev) => prev + earnedXp);
      setLearnedCount(getLearnedResources().length);
      setXpBreakdown((prev) => {
        const isWork = type === "milestone_delivered" || type === "contract_completed" || type === "proposal_submitted";
        const isLearning = type === "resource_studied";
        const isQuiz = type?.startsWith("quiz_");

        return {
          ...prev,
          workXP: isWork ? prev.workXP + earnedXp : prev.workXP,
          learningXP: isLearning ? prev.learningXP + earnedXp : prev.learningXP,
          quizXP: isQuiz ? prev.quizXP + earnedXp : prev.quizXP,
          totalXP: prev.totalXP + earnedXp,
        };
      });
    };

    window.addEventListener("quiz-completed", onQuizCompleted as EventListener);
    window.addEventListener("xp-updated", onXpUpdated as EventListener);
    return () => {
      window.removeEventListener("quiz-completed", onQuizCompleted as EventListener);
      window.removeEventListener("xp-updated", onXpUpdated as EventListener);
    };
  }, []);

  // Computed Progress Overall Metrics
  const passedQuizzes = useMemo(() => {
    return SKILL_QUIZZES.filter((q) => quizResults[q.id]?.passed);
  }, [quizResults]);

  const nextQuizToTake = useMemo(() => {
    return SKILL_QUIZZES.find((q) => !quizResults[q.id]?.passed) || SKILL_QUIZZES[0];
  }, [quizResults]);

  const verifiedSkillsCount = passedQuizzes.length;
  const totalSkillsCount = SKILL_QUIZZES.length;
  const skillProgressPercent = Math.round((verifiedSkillsCount / totalSkillsCount) * 100);
  const completedMilestonesCount = timelineItems.filter(
    (i) => i.progress === 100 || i.urgency === "review"
  ).length;

  // Real heatmap data from DB
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({
    weeks: generateEmptyHeatmap(),
    totalContributions: 0,
    streakDays: 0,
    monthLabels: [],
    activeDates: [],
  });

  useEffect(() => {
    fetchHeatmapData().then((data) => setHeatmapData(data));
  }, []);

  const streakDays = heatmapData.streakDays;
  const totalContributions = heatmapData.totalContributions;

  const handleOpenSubmit = (item: TimelineActionItem) => {
    setActiveItemToSubmit(item);
    setDeliverableNote("");
    setDeliverableUrl("");
    setSubmissionSuccess(false);
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItemToSubmit) return;

    setIsSubmitting(true);
    try {
      await submitMilestoneDeliverable({
        contractMilestoneId: activeItemToSubmit.id,
        deliverableNote,
        fileUrl: deliverableUrl,
      });
    } catch (err) {
      console.error("Error submitting milestone deliverable:", err);
    }

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
  };

  const toggleTaskCheck = async (itemId: string, taskId: string) => {
    let nowDone = false;
    setTimelineItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const updatedChecklist = item.tasksChecklist.map((t) => {
          if (t.id === taskId) {
            nowDone = !t.done;
            return { ...t, done: nowDone };
          }
          return t;
        });
        const doneCount = updatedChecklist.filter((t) => t.done).length;
        const progress = Math.round((doneCount / updatedChecklist.length) * 100);
        return { ...item, tasksChecklist: updatedChecklist, progress };
      })
    );

    // Sync corresponding daily mission
    setDailyMissions((prev) =>
      prev.map((m) =>
        m.actionTarget === taskId ? { ...m, completed: nowDone } : m
      )
    );

    // If marked done, log activity to advance day streak and award 50 XP
    if (nowDone) {
      await logActivity("milestone_delivered", {
        task_id: taskId,
        milestone_id: itemId,
        xp_earned: 50,
      });
    }
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
      {/* 0. Clean Minimalist Hero Greeting */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-white/10 min-h-[160px] flex items-center">
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

        <div className="relative z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight leading-normal text-white drop-shadow-sm">
              Selamat datang kembali, {freelancerName}!
            </h1>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
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
                      className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden ${isUrgent
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
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 ${isUrgent
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
                          <span>Terkunci Aman di Rekber</span>
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
                  className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
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
                    className={`rounded-2xl border p-4.5 sm:p-5 shadow-xs transition-all hover:border-primary/50 hover:shadow-sm ${quest.isSimulated
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

                        {user && quest.ownerId === user.id ? (
                          <span className="rounded-xl bg-muted/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground border border-border/50 select-none">
                            Proyek Anda Sendiri
                          </span>
                        ) : (
                          <Link
                            href={`/freelancer/explore/${quest.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-colors"
                          >
                            <span>Ajukan Proposal</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )))}
            </div>
          </section>

          {/* 3. RINGKASAN PROGRESS KEAHLIAN & VERIFIKASI (Scroll Section 3) */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                  Progress Keahlian & Verifikasi
                </h2>
              </div>
              <Link
                href="/freelancer/skills"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Direktori Keahlian</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Overall Skill Progress Bar Card */}
            <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-foreground">
                    Verifikasi Keahlian Portofolio
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {verifiedSkillsCount} dari {totalSkillsCount} modul keahlian terverifikasi resmi
                  </p>
                </div>
                <span className="text-xs font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                  {skillProgressPercent}% Lengkap
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${skillProgressPercent}%` }}
                />
              </div>

              {/* Dynamic 2-Column Grid: Verified Modules vs Next Recommendation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Column 1: Verified Skills List */}
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Lencana Terverifikasi ({passedQuizzes.length})
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      Aktif di Profil
                    </span>
                  </div>

                  {passedQuizzes.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">
                      Belum ada kuis yang diselesaikan. Mulai verifikasi keahlian pertamamu untuk meningkatkan match score proyek.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {passedQuizzes.map((pq) => {
                        const result = quizResults[pq.id];
                        return (
                          <div
                            key={pq.id}
                            className="rounded-lg border border-border/60 bg-card/80 p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{pq.badgeName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                Nilai: {result?.score ?? 100}% &bull; +{pq.xpReward} XP
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Lulus
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Column 2: Next Recommended Quiz */}
                <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3.5 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" />
                        Rekomendasi Kuis Berikutnya
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        +{nextQuizToTake.xpReward} XP
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-foreground line-clamp-1">{nextQuizToTake.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {nextQuizToTake.description}
                    </p>
                  </div>

                  <Link
                    href={`/freelancer/skills/quiz/${nextQuizToTake.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary/90 transition-all hover:scale-102 active:scale-98 text-center"
                  >
                    <span>Mulai Kuis ({nextQuizToTake.timeLimitDisplay})</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bottom Overall Accomplishments Strip */}
              <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">Ringkasan Aktivitas:</span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Award className="h-3.5 w-3.5 text-violet-500" />
                    <strong>{verifiedSkillsCount}</strong> Kuis Lulus
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                    <strong>{learnedCount}</strong> Materi Belajar
                  </span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                    <strong>{completedMilestonesCount}</strong> Milestone Selesai
                  </span>
                </div>
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

            <Link
              href="/freelancer/earnings"
              className="group block rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-5 transition-all hover:border-primary/50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                    <span>Saldo Siap Ditarik</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground font-heading mt-0.5">
                    {formatMoney(earnings?.availableBalance ?? 0, "IDR")}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {earnings && earnings.availableBalance > 0
                      ? `Terhubung ke rekening penarikan • a.n. ${freelancerName}`
                      : "Saldo dompet rekber siap ditarik"}
                  </p>
                </div>

                <div className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 group-hover:bg-primary/90 transition-all shrink-0">
                  Tarik Saldo
                </div>
              </div>
            </Link>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY GUIDE (Weekly Streak Tracker, Misi Harian, Level)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          {/* 1. Doable Streak & Activity Tracker (Seminggu dulu + Expand Sebulan) */}
          <DoableStreakTracker
            streakDays={streakDays}
            activeDates={heatmapData.activeDates}
            totalContributions={totalContributions}
            isOwner={true}
          />
          {/* 2. Misi Harian / Daily Quest Checklist */}
          <div id="misi-harian-section" className="rounded-3xl border border-border/70 bg-card p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground font-heading">Misi Harian</h3>
              </div>
              {dailyMissions.length > 0 && (
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                  {completedMissionsCount}/{dailyMissions.length} Selesai
                </span>
              )}
            </div>

            {dailyMissions.length === 0 ? (
              <div className="text-center py-6 px-3 space-y-2 rounded-2xl bg-muted/20 border border-border/50">
                <div className="h-10 w-10 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
                  <Briefcase className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-foreground">Tidak Ada Misi Kontrak Aktif</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  Misi harian hanya muncul ketika Anda memiliki kontrak aktif dengan klien dan terdapat tugas atau penyerahan milestone yang harus dikerjakan hari ini.
                </p>
                <Link
                  href="/freelancer/explore"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline pt-1"
                >
                  <span>Cari Proyek & Ajukan Proposal</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {dailyMissions.map((mission) => (
                  <div
                    key={mission.id}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${mission.completed
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
                          className={`text-xs font-bold truncate ${mission.completed ? "line-through opacity-70" : "text-foreground"
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

                      {!mission.completed && mission.actionType === "checkin" && (
                        <button
                          onClick={() => {
                            const tl = timelineItems.find((i) => i.tasksChecklist.some((t) => t.id === mission.actionTarget));
                            if (tl && mission.actionTarget) {
                              toggleTaskCheck(tl.id, mission.actionTarget);
                            }
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        >
                          <Check className="h-3 w-3" />
                          <span>Tandai Task Selesai (+50 XP)</span>
                        </button>
                      )}

                      {!mission.completed && mission.actionType === "submit" && (
                        <button
                          onClick={() => {
                            const target = timelineItems.find((i) => i.id === mission.actionTarget);
                            if (target) handleOpenSubmit(target);
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                        >
                          <span>Serahkan Milestone (+150 XP)</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                {currentXP.toLocaleString("id-ID")} / {nextLevelXP.toLocaleString("id-ID")} XP
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground">Level {currentLevel} {currentLevel === 0 ? "Starter" : currentLevel === 1 ? "Creator" : "Verified Pro"}</span>
                <span className="text-muted-foreground">Level {currentLevel + 1} {currentLevel === 0 ? "Creator" : "Verified Pro"}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>

              {/* 3-Pillar XP Accumulation Breakdown Pills */}
              <div className="grid grid-cols-3 gap-1.5 pt-1.5 text-[10px]">
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1 text-center">
                  <span className="text-blue-600 block font-bold leading-none">{xpBreakdown.workXP.toLocaleString("id-ID")} XP</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">💼 Pekerjaan</span>
                </div>
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 px-2 py-1 text-center">
                  <span className="text-violet-600 block font-bold leading-none">{xpBreakdown.quizXP.toLocaleString("id-ID")} XP</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">🧪 Kuis</span>
                </div>
                <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 text-center">
                  <span className="text-emerald-600 block font-bold leading-none">{xpBreakdown.learningXP.toLocaleString("id-ID")} XP</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">📖 Belajar</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">
                Tinggal <strong className="text-foreground">{Math.max(0, nextLevelXP - currentXP).toLocaleString("id-ID")} XP lagi</strong> untuk membuka <strong>Level {currentLevel + 1}</strong> dan meningkatkan prioritas rekomendasi di pencarian klien UMKM.
              </p>
              <Link
                href="/freelancer/skills"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-[11px] font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Zap className="h-3.5 w-3.5" />
                Earn XP
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SUBMIT MILESTONE DELIVERABLE                                     */}
      {/* ========================================================================= */}
      {submitModalOpen && activeItemToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95 overflow-hidden">
            <ModalCloseButton onClick={() => setSubmitModalOpen(false)} />
            <div className="border-b border-border/40 pb-3 pr-10">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                Penyerahan Hasil Karya
              </span>
              <h3 className="text-base font-bold text-foreground font-heading">
                {activeItemToSubmit.milestoneTitle}
              </h3>
            </div>

            {submissionSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-foreground">Hasil Karya Berhasil Diserahkan!</h4>
                <p className="text-xs text-muted-foreground">
                  Klien ({activeItemToSubmit.clientName}) telah menerima notifikasi untuk memeriksa dan melepaskan dana rekber sebesar <strong>{formatMoney(activeItemToSubmit.amount, activeItemToSubmit.currency)}</strong>.
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
    </div>
  );
}
