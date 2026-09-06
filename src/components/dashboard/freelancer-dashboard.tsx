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
  Flame,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import Grainient from "@/components/ui/Grainient";
import { getOpenProjects } from "@/lib/services/projects";
import { getFreelancerContracts, submitMilestoneDeliverable } from "@/lib/services/contracts";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { fetchHeatmapData, fetchUserXPBreakdown, getLearnedResources, logActivity, type HeatmapData, type XPBreakdown } from "@/lib/services/activity";
import { getSavedQuizResults, fetchUserQuizResults, SKILL_QUIZZES, type QuizAttemptResult } from "@/lib/services/quizzes";
import { getFreelancerEarnings, type EarningsSummary } from "@/lib/services/earnings";
import { getFreelancerProposals, type FreelancerProposalItem } from "@/lib/services/proposals";
import { formatRelativeTime } from "@/lib/utils";
import { UnifiedSmartCalendarPlanner } from "@/components/dashboard/unified-calendar-planner";
import { AIProfileSuggestions } from "@/components/dashboard/ai-profile-suggestions";
import { AlertTriangle } from "lucide-react";
import { matchCategory, DEFAULT_CLIENT_CATEGORIES } from "@/lib/constants/categories";
import { createClient } from "@/lib/supabase/client";

interface QuestOpportunity {
  id: string;
  ownerId?: string;
  title: string;
  clientName: string;
  clientRating: number;
  category: string;
  budget: string;
  budgetNumeric: number;
  budgetType: "Fixed" | "Milestone";
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

export function FreelancerDashboard() {
  const { user } = useAuth();
  const { formatMoney } = useCurrency();
  const [preferredCategories, setPreferredCategories] = useState<string[]>([]);

  // Timeline & Missions State
  const [timelineItems, setTimelineItems] = useState<TimelineActionItem[]>(initialTimelineItems);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(initialMissions);
  const [submittedProposals, setSubmittedProposals] = useState<FreelancerProposalItem[]>([]);
  const [rawContracts, setRawContracts] = useState<any[]>([]);

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
  const [activeFeedTab, setActiveFeedTab] = useState<"all" | "work" | "explore" | "skills">("all");

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
          // Only active contracts that are not completed appear in the Pekerjaan Saya dashboard timeline
          const activeContracts = liveContracts.filter((c) => c.status === "active");
          setRawContracts(activeContracts);

          const mappedTimeline: TimelineActionItem[] = activeContracts.flatMap((c) =>
            c.milestones
              .filter((m) => m.status !== "completed")
              .map((m, idx) => {
                let isOverdue = false;
                if (m.dueDate) {
                  const d = new Date(m.dueDate);
                  d.setHours(0, 0, 0, 0);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (d < today) isOverdue = true;
                }
                return {
                  id: m.id,
                  projectTitle: c.projectTitle,
                  clientName: c.clientName,
                  milestoneTitle: m.title,
                  milestoneNumber: idx + 1,
                  totalMilestones: c.milestones.length || 3,
                  amount: m.amount || Math.round(c.totalAmount / (c.milestones.length || 1)),
                  currency: "IDR" as const,
                  dueDate: isOverdue ? "⚠️ Terlambat" : (m.dueDate || "3 hari lagi"),
                  urgency: (m.status === "submitted" ? "review" : isOverdue ? "urgent" : "normal") as "review" | "normal" | "urgent",
                  progress: m.status === "submitted" ? 100 : c.progress || 35,
                  tasksChecklist: [
                    { id: `${m.id}-1`, title: "Setup arsitektur dan komponen", done: m.status === "submitted" },
                    { id: `${m.id}-2`, title: "Integrasi API & logic", done: m.status === "submitted" },
                    { id: `${m.id}-3`, title: "Testing dan penyerahan", done: false }
                  ],
                };
              })
          );
          setTimelineItems(mappedTimeline);

          // Daily Missions only populate if freelancer has active client contracts with tasks for today
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

        // 3. Load live submitted proposals
        try {
          const liveProps = await getFreelancerProposals();
          if (liveProps && liveProps.length > 0) {
            setSubmittedProposals(liveProps);
          }
        } catch (propErr) {
          console.error("Error loading live proposals:", propErr);
        }
      } catch (err) {
        console.error("Error loading quests from Supabase:", err);
      }
    }

    loadLiveQuests();
  }, []);

  // Load Freelancer preferred categories
  useEffect(() => {
    async function loadFreelancerPreferences() {
      try {
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        let prefCats: string[] = [];
        if (Array.isArray(authUser.user_metadata?.preferred_categories) && authUser.user_metadata.preferred_categories.length > 0) {
          prefCats = [...authUser.user_metadata.preferred_categories];
        } else if (Array.isArray(authUser.user_metadata?.project_categories) && authUser.user_metadata.project_categories.length > 0) {
          prefCats = [...authUser.user_metadata.project_categories];
        }

        const { data: profile } = await supabase
          .from("freelancer_profiles")
          .select("category")
          .eq("user_id", authUser.id)
          .maybeSingle();

        if (profile?.category && !prefCats.includes(profile.category)) {
          prefCats.unshift(profile.category);
        }

        if (prefCats.length === 0 && typeof window !== "undefined") {
          const raw = localStorage.getItem("doable_preferred_categories");
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) prefCats = parsed;
            } catch {}
          }
        }

        setPreferredCategories(prefCats);
      } catch (err) {
        console.warn("Could not load freelancer preferences:", err);
      }
    }

    loadFreelancerPreferences();

    const handlePref = (e: Event) => {
      const customEvent = e as CustomEvent<{ categories?: string[] }>;
      if (customEvent.detail?.categories && Array.isArray(customEvent.detail.categories)) {
        setPreferredCategories(customEvent.detail.categories);
      }
    };
    window.addEventListener("doable-preferences-updated", handlePref);
    return () => window.removeEventListener("doable-preferences-updated", handlePref);
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
    const unpassed = SKILL_QUIZZES.filter((q) => !quizResults[q.id]?.passed);
    if (preferredCategories.length > 0) {
      const prefQuiz = unpassed.find((q) =>
        preferredCategories.some((pref) => matchCategory(q.category, pref))
      );
      if (prefQuiz) return prefQuiz;
    }
    return unpassed[0] || SKILL_QUIZZES[0];
  }, [quizResults, preferredCategories]);

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
    if (!user?.id) {
      setHeatmapData({
        weeks: generateEmptyHeatmap(),
        totalContributions: 0,
        streakDays: 0,
        monthLabels: [],
        activeDates: [],
      });
      return;
    }
    fetchHeatmapData(user.id).then((data) => setHeatmapData(data));
  }, [user?.id]);

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

  // Dynamic Category Tabs starting with user's preferred categories
  const dashboardCategoryTabs = useMemo(() => {
    const tabs: string[] = ["Semua"];
    if (preferredCategories.length > 0) {
      preferredCategories.forEach((c) => {
        if (!tabs.includes(c)) tabs.push(c);
      });
    }
    if (!tabs.includes("Simulasi Portofolio")) {
      tabs.push("Simulasi Portofolio");
    }
    DEFAULT_CLIENT_CATEGORIES.forEach((c) => {
      if (!tabs.includes(c)) tabs.push(c);
    });
    return tabs;
  }, [preferredCategories]);

  // Filter Quests and prioritize matching category quests
  const filteredQuests = useMemo(() => {
    return quests
      .filter((quest) => {
        if (user && quest.ownerId && quest.ownerId === user.id && !quest.isSimulated) {
          return false;
        }

        if (selectedCategory === "Semua") return true;
        if (selectedCategory === "Simulasi Portofolio") return Boolean(quest.isSimulated);

        return matchCategory(quest.category, selectedCategory);
      })
      .map((quest) => {
        const isPrefMatch = preferredCategories.some((pref) => matchCategory(quest.category, pref));
        return {
          ...quest,
          isPrefMatch,
          matchScore: isPrefMatch ? Math.min(99, Math.max(95, quest.matchScore + 4)) : quest.matchScore,
        };
      })
      .sort((a, b) => {
        if (selectedCategory === "Semua" && preferredCategories.length > 0) {
          if (a.isPrefMatch && !b.isPrefMatch) return -1;
          if (!a.isPrefMatch && b.isPrefMatch) return 1;
        }
        return b.matchScore - a.matchScore;
      });
  }, [quests, selectedCategory, user, preferredCategories]);

  const completedMissionsCount = dailyMissions.filter((m) => m.completed).length;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fade-in font-sans">
      {/* 0. Clean Minimalist Hero Greeting */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 md:p-8 text-white shadow-xl border border-white/10 flex items-center">
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

        <div className="relative z-20 flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-2.5 py-0.5 text-[11px] font-medium text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dashboard Talenta Terverifikasi</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight leading-normal text-white drop-shadow-sm">
              Selamat datang kembali, {freelancerName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Pantau alur pekerjaan aktifmu, selesaikan misi harian untuk menjaga konsistensi streak, dan bangun portofolio profesionalmu.
            </p>
          </div>

          {/* Quick Metrics Cluster on Hero Right (Frosted Glass Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 shrink-0">
            {/* Stat 1: Streak */}
            <div className="flex items-center gap-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-3 text-white transition-all shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/25 text-amber-400 border border-amber-400/30 shrink-0">
                <Flame className="h-4 w-4 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-white leading-tight">
                  {streakDays} Hari
                </div>
                <div className="text-[10px] text-slate-300 font-medium truncate">
                  Streak Aktif
                </div>
              </div>
            </div>

            {/* Stat 2: Active Work / Proposals */}
            <Link
              href="/freelancer/my-work"
              className="group flex items-center gap-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-3 text-white transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/25 text-blue-400 border border-blue-400/30 shrink-0 group-hover:bg-blue-500/35 transition-colors">
                <Briefcase className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm sm:text-base font-bold text-white leading-tight group-hover:text-blue-200 transition-colors">
                  {timelineItems.length > 0 ? `${timelineItems.length} Kontrak` : "0 Kontrak"}
                </div>
                <div className="text-[10px] text-slate-300 font-medium truncate">
                  {submittedProposals.length > 0 ? `${submittedProposals.length} Proposal` : "Pekerjaan Aktif"}
                </div>
              </div>
            </Link>

            {/* Stat 3: Available Balance */}
            <Link
              href="/freelancer/earnings"
              className="col-span-2 sm:col-span-1 group flex items-center gap-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-3 text-white transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/25 text-emerald-400 border border-emerald-400/30 shrink-0 group-hover:bg-emerald-500/35 transition-colors">
                <Wallet className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold text-white leading-tight truncate group-hover:text-emerald-200 transition-colors">
                  {formatMoney(earnings?.availableBalance ?? 0, "IDR")}
                </div>
                <div className="text-[10px] text-slate-300 font-medium flex items-center justify-between gap-1">
                  <span>Saldo Rekber</span>
                  <ArrowUpRight className="h-2.5 w-2.5 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Left Feed (Col 7) vs Right Sticky Guide (Col 5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: SCROLLABLE FEED (Pekerjaan Saya, Proyek, Keahlian, Pendapatan)*/}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
          {/* Feed Filter Tabs (Prevents vertical clutter & allows focused view) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
            <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-muted/50 border border-border/60">
              <button
                type="button"
                onClick={() => setActiveFeedTab("all")}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFeedTab === "all"
                    ? "bg-card text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("work")}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFeedTab === "work"
                    ? "bg-card text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Pekerjaan Saya</span>
                {(timelineItems.length > 0 || submittedProposals.length > 0) && (
                  <span className="rounded-full bg-primary/10 text-primary text-[10px] px-1.5 py-0.2 font-extrabold">
                    {timelineItems.length > 0 ? timelineItems.length : submittedProposals.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("explore")}
                className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFeedTab === "explore"
                    ? "bg-card text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>Cari Proyek</span>
                <span className="rounded-full bg-muted text-muted-foreground text-[10px] px-1.5 py-0.2 font-bold">
                  {filteredQuests.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveFeedTab("skills")}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFeedTab === "skills"
                    ? "bg-card text-foreground shadow-xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Keahlian & Saldo
              </button>
            </div>

            {activeFeedTab !== "all" && (
              <button
                type="button"
                onClick={() => setActiveFeedTab("all")}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Tampilkan Semua ↓
              </button>
            )}
          </div>

          {/* 1. PEKERJAAN SAYA (Paling Atas) */}
          {(activeFeedTab === "all" || activeFeedTab === "work") && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-bold tracking-tight text-foreground font-heading">
                    Pekerjaan Saya ({timelineItems.length > 0 ? timelineItems.length : submittedProposals.length > 0 ? `${submittedProposals.length} Proposal` : 0})
                  </h2>
                </div>
              <Link
                href="/freelancer/my-work"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Lihat Pekerjaan & Proposal</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Active Contracts & Timeline Items */}
            <div className="space-y-4">
              {/* Proposals Banner when active contracts also exist */}
              {timelineItems.length > 0 && submittedProposals.length > 0 && (
                <div className="flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-2.5 text-xs text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Anda memiliki <strong>{submittedProposals.length} proposal</strong> yang sedang menunggu review klien.</span>
                  </div>
                  <Link href="/freelancer/my-work?tab=proposals" className="font-bold text-primary hover:underline shrink-0">
                    Lihat Status →
                  </Link>
                </div>
              )}

              {timelineItems.length === 0 ? (
                submittedProposals.length > 0 ? (
                  <div className="space-y-3">
                    {submittedProposals.map((prop) => (
                      <div
                        key={prop.id}
                        className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-xs hover:border-amber-500/50 transition-all space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            {prop.status === "pending"
                              ? "Proposal Menunggu Review Klien"
                              : prop.status === "accepted"
                              ? "Proposal Diterima 🎉"
                              : "Proposal Tidak Terpilih"}
                          </span>
                          <span className="text-xs font-bold text-foreground font-heading">
                            {prop.bidDisplay}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-foreground line-clamp-1">
                            {prop.projectTitle}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Klien: <strong className="text-foreground">{prop.clientName}</strong> • {prop.projectCategory} • Estimasi: {prop.deliveryDays} hari
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-amber-500/20 text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" />
                            <span>Diajukan {formatRelativeTime(prop.createdAt)}</span>
                          </span>
                          <Link
                            href="/freelancer/my-work?tab=proposals"
                            className="font-bold text-primary hover:underline inline-flex items-center gap-1"
                          >
                            <span>Pantau Status di Pekerjaan Saya</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-2">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Belum ada kontrak aktif</p>
                    <p className="text-xs text-muted-foreground">Jelajahi quest yang tersedia dan ajukan proposal untuk memulai pekerjaan pertama Anda.</p>
                  </div>
                )
              ) : (
                timelineItems.map((item) => {
                  const isUrgent = item.urgency === "urgent";
                  const isReview = item.urgency === "review";

                  return (
                    <div
                      key={item.id}
                      className={`rounded-3xl border p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden ${isUrgent
                          ? "border-rose-500/50 bg-gradient-to-br from-rose-500/10 via-card to-card hover:border-rose-500/70 ring-1 ring-rose-500/20 shadow-xs shadow-rose-500/10"
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
                                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse font-extrabold"
                                : isReview
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                                  : "bg-primary/10 text-primary"
                              }`}
                          >
                            {isUrgent ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
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
                          href="/freelancer/projects/proj-1"
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
        )}

        {/* 2. PROYEK LAIN YANG SELARAS DENGAN KAMU (Scroll Section 2) */}
        {(activeFeedTab === "all" || activeFeedTab === "explore") && (
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
              {dashboardCategoryTabs.map((cat) => {
                const isPref = preferredCategories.includes(cat);
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all inline-flex items-center gap-1 cursor-pointer ${
                      isActive
                        ? "bg-primary text-white shadow-xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {isPref && cat !== "Semua" && <Sparkles className="h-3 w-3 text-amber-400" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
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
                          {quest.isPrefMatch && (
                            <span className="rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold inline-flex items-center gap-1">
                              <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                              Sesuai Preferensimu
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
                            {quest.isSimulated
                              ? "Akses Gratis (Praktik)"
                              : quest.budgetNumeric > 0
                              ? formatMoney(quest.budgetNumeric, "IDR")
                              : quest.budget}
                          </span>
                          <span className="text-[10px] font-semibold text-amber-600 flex items-center gap-1 sm:justify-end">
                            <Zap className="h-3 w-3" />
                            +{quest.xpReward} XP
                          </span>
                        </div>

                        {user && quest.ownerId === user.id && !quest.isSimulated ? (
                          <span className="rounded-xl bg-muted/80 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground border border-border/50 select-none">
                            Proyek Anda Sendiri
                          </span>
                        ) : quest.isSimulated ? (
                          <Link
                            href={`/freelancer/explore/${quest.id}`}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                          >
                            <span>Mulai Simulasi</span>
                          </Link>
                        ) : submittedProposals.some((p) => p.projectId === quest.id) ? (
                          <Link
                            href={`/freelancer/explore/${quest.id}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-3.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                            <span>Sudah Diajukan</span>
                          </Link>
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
        )}

        {/* 3. RINGKASAN PROGRESS KEAHLIAN & VERIFIKASI (Scroll Section 3) & 4. PENDAPATAN */}
        {(activeFeedTab === "all" || activeFeedTab === "skills") && (
          <>
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
                <div className={`rounded-xl border p-3.5 space-y-2.5 ${
                  passedQuizzes.length > 0
                    ? "border-emerald-500/20 bg-emerald-500/5"
                    : "border-border/60 bg-muted/20"
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      {passedQuizzes.length > 0 ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Award className="h-4 w-4 text-muted-foreground" />
                      )}
                      Lencana Terverifikasi ({passedQuizzes.length})
                    </span>
                    {passedQuizzes.length > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        Aktif di Profil
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        Belum Aktif
                      </span>
                    )}
                  </div>

                  {passedQuizzes.length === 0 ? (
                    <div className="py-2 space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Belum ada kuis yang diselesaikan. Mulai verifikasi keahlian pertamamu untuk meningkatkan match score proyek.
                      </p>
                      <Link
                        href="/freelancer/skills"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Ikuti Kuis Keahlian</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
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
          </>
        )}
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY GUIDE (Plan Anda, Rekomendasi AI, Jalur Karir Talenta)*/}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-5 order-1 lg:order-2 lg:sticky lg:top-20">
          {/* 1. Unified Smart Calendar & MRP Workload Planner (Tugas Hari Ini + Streak + Kalender Harian) */}
          <UnifiedSmartCalendarPlanner
            streakDays={streakDays}
            activeDates={heatmapData.activeDates}
            totalContributions={totalContributions}
            activeContracts={rawContracts}
            userProfile={user}
            onOpenSubmitMilestone={(target) => {
              handleOpenSubmit(target as any);
            }}
          />

          {/* 2. AI Profile & Career Suggestions Box */}
          <AIProfileSuggestions userProfile={user} />

          {/* 3. Level & Career Progression Road */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-4 sm:p-5 shadow-xs space-y-3">
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
                <span className="text-muted-foreground text-[11px]">Level {currentLevel + 1}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>

              {/* 3-Pillar XP Accumulation Breakdown Pills */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2 py-1 text-center">
                  <span className="text-blue-600 block font-bold leading-none">{xpBreakdown.workXP.toLocaleString("id-ID")} XP</span>
                  <span className="text-[9px] text-muted-foreground mt-0.5 block">💼 Kerja</span>
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

            <div className="flex items-center justify-between gap-3 pt-0.5">
              <p className="text-[11px] text-muted-foreground leading-tight flex-1">
                Tinggal <strong className="text-foreground">{Math.max(0, nextLevelXP - currentXP).toLocaleString("id-ID")} XP lagi</strong> menuju Level {currentLevel + 1}.
              </p>
              <Link
                href="/freelancer/skills"
                className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Zap className="h-3 w-3" />
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
