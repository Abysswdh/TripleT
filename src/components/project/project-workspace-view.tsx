"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Plus,
  MessageSquare,
  X,
  UserCheck,
  Check,
  AlertTriangle,
  Edit3,
  UploadCloud,
  Zap,
  Award,
  Target,
  Send,
  FileText,
  ChevronDown,
  ChevronRight,
  LayoutList,
  CalendarDays,
  BarChart3,
  Star,
  Paperclip,
  CheckCircle,
  TrendingUp,
  Users,
  Briefcase,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRole } from "@/context/role-context";
import { useCurrency } from "@/context/currency-context";
import { createClient } from "@/lib/supabase/client";
import {
  getProjectById,
  generateSprintTasksForCategory,
  type ProjectRecord,
} from "@/lib/services/projects";
import {
  getProposalsForProject,
  acceptProposal,
  type ProposalItem,
} from "@/lib/services/proposals";
import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureItem,
  GanttToday,
  type GanttFeature,
  type GanttStatus,
} from "@/components/kibo-ui/gantt";

const STATUS_ACTIVE: GanttStatus = { id: "active", name: "In Progress", color: "#3b82f6" };
const STATUS_PLANNED: GanttStatus = { id: "planned", name: "Planned", color: "#8b5cf6" };

export interface MilestoneComment {
  id: string;
  author: string;
  role: "freelancer" | "client";
  avatar: string;
  content: string;
  time: string;
}

export interface MilestoneState {
  id: string;
  title: string;
  amount: number;
  amountDisplay: string;
  percentage: number;
  status: "Completed" | "In Progress" | "Locked";
  dueDate: string;
  deliverableHint: string;
  deliverableFileUrl?: string;
  deliverableNote?: string;
  isSubmittedForReview?: boolean;
  tasks: { id: string; name: string; done: boolean }[];
  comments: MilestoneComment[];
}

export function ProjectWorkspaceView() {
  const params = useParams();
  const pathname = usePathname();
  const projectId = (params?.id as string) || "proj-1";

  // Global Contexts
  const { user } = useAuth();
  const { isClient: contextIsClient } = useRole();
  const { formatMoney } = useCurrency();


  // Determine active view mode (route takes priority: /client vs /freelancer)
  const isClientRoute = pathname.startsWith("/client");
  const isFreelancerRoute = pathname.startsWith("/freelancer");
  const isClientMode = isClientRoute || (!isFreelancerRoute && contextIsClient);

  // Current logged in user synced profile
  const [userProfile, setUserProfile] = useState<{
    fullName: string;
    avatarUrl: string;
    role: string;
  }>({
    fullName: user?.user_metadata?.full_name || (isClientMode ? "Klien Doable!" : "Freelancer"),
    avatarUrl: user?.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: isClientMode ? "customer" : "freelancer",
  });

  // Project state
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<MilestoneState[]>([]);
  const [features, setFeatures] = useState<GanttFeature[]>([]);

  // Active Tab: if project is in "Hiring", open proposals tab by default
  const [activeTab, setActiveTab] = useState<"overview" | "proposals" | "timeline" | "files">("overview");

  // Interactive state
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string>("");
  const [activeSubmitId, setActiveSubmitId] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNote, setDeliverableNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [hiringApplicant, setHiringApplicant] = useState<ProposalItem | null>(null);
  const [isHiringProcessing, setIsHiringProcessing] = useState(false);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  // Gantt Chart interactive states
  const [ganttRange, setGanttRange] = useState<"daily" | "weekly">("daily");
  const [selectedTaskToMove, setSelectedTaskToMove] = useState<GanttFeature | null>(null);
  const [shiftStartStr, setShiftStartStr] = useState("");
  const [shiftEndStr, setShiftEndStr] = useState("");
  const [shiftNote, setShiftNote] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStart, setNewTaskStart] = useState("");
  const [newTaskEnd, setNewTaskEnd] = useState("");
  const [pendingChange, setPendingChange] = useState<{
    targetTaskId: string;
    taskName: string;
    newStart: Date;
    newEnd: Date;
    note: string;
    isNewTask?: boolean;
  } | null>(null);
  const [changeApproved, setChangeApproved] = useState(false);

  // 1. Sync User Profile from Supabase & Listen to update events
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();

    const fetchUserProfile = async () => {
      try {
        const { data } = await supabase
          .from("users")
          .select("full_name, avatar_url, role")
          .eq("id", user.id)
          .single();

        if (data) {
          setUserProfile({
            fullName: data.full_name || user.user_metadata?.full_name || "User",
            avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            role: data.role || "customer",
          });
        }
      } catch (err) {
        console.warn("User profile sync notice:", err);
      }
    };

    fetchUserProfile();

    const handleAvatarUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ avatarUrl?: string; fullName?: string }>;
      if (customEvent?.detail?.avatarUrl) {
        setUserProfile((prev) => ({ ...prev, avatarUrl: customEvent.detail.avatarUrl! }));
      }
      if (customEvent?.detail?.fullName) {
        setUserProfile((prev) => ({ ...prev, fullName: customEvent.detail.fullName! }));
      }
    };

    window.addEventListener("doable-avatar-updated", handleAvatarUpdate);
    return () => window.removeEventListener("doable-avatar-updated", handleAvatarUpdate);
  }, [user]);

  // 2. Load Project, Proposals, Milestones, and Gantt Features
  const loadProjectData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      const projectData = await getProjectById(projectId);
      const proposalsData = await getProposalsForProject(projectId);
      setProposals(proposalsData);

      if (projectData) {
        setProject(projectData);

        // Auto-select tab: if Hiring and proposals exist, show proposals by default
        if (projectData.status === "Hiring" && proposalsData.length > 0) {
          setActiveTab("proposals");
        } else {
          setActiveTab("overview");
        }

        // Initialize Milestones from project data or build defaults
        const baseBudget = projectData.budgetNumeric || 1500000;
        let initialMilestones: MilestoneState[] = [];

        if (projectData.milestones && projectData.milestones.length > 0) {
          initialMilestones = projectData.milestones.map((m, idx) => ({
            id: m.id,
            title: m.title,
            amount: m.amountNumeric || Math.round(baseBudget / projectData.milestones.length),
            amountDisplay: m.amount || formatMoney(m.amountNumeric || Math.round(baseBudget / projectData.milestones.length)),
            percentage: idx === 0 ? 40 : 60,
            status: idx === 0 ? "In Progress" : "Locked",
            dueDate: m.dueDate || (idx === 0 ? "5 hari" : "10 hari"),
            deliverableHint: (m.deliverables && m.deliverables.join(", ")) || "Serah terima deliverable sprint",
            tasks: [
              { id: `t-${idx}-1`, name: `Kickoff & Ruang Lingkup: ${m.title}`, done: idx === 0 },
              { id: `t-${idx}-2`, name: `Pengerjaan Hasil Utama ${idx + 1}`, done: false },
            ],
            comments: [],
          }));
        } else {
          // Default 2 milestones
          initialMilestones = [
            {
              id: "ms-1",
              title: "Milestone 1: Konsep, Draft Awal & Aset Desain",
              amount: Math.round(baseBudget * 0.4),
              amountDisplay: formatMoney(Math.round(baseBudget * 0.4)),
              percentage: 40,
              status: projectData.status === "In Progress" ? "In Progress" : "Locked",
              dueDate: "5 hari",
              deliverableHint: "File Draft Desain / Figma / Dokumen Konsep Awal",
              tasks: [
                { id: "t-1-1", name: "Riset kebutuhan & moodboard proyek", done: true },
                { id: "t-1-2", name: "Draft awal dan struktur komponen", done: false },
              ],
              comments: [],
            },
            {
              id: "ms-2",
              title: "Milestone 2: Finalisasi Output & Serah Terima Master",
              amount: Math.round(baseBudget * 0.6),
              amountDisplay: formatMoney(Math.round(baseBudget * 0.6)),
              percentage: 60,
              status: "Locked",
              dueDate: "10 hari",
              deliverableHint: "File Master Siap Pakai, Dokumentasi & Source Code",
              tasks: [
                { id: "t-2-1", name: "Penyempurnaan feedback revisi klien", done: false },
                { id: "t-2-2", name: "Ekspor deliverable master & dokumentasi", done: false },
              ],
              comments: [],
            },
          ];
        }

        // Restore persisted comments from localStorage
        if (typeof window !== "undefined") {
          initialMilestones = initialMilestones.map((ms) => {
            const saved = localStorage.getItem(`doable_comments_${projectId}_${ms.id}`);
            if (saved) {
              try {
                return { ...ms, comments: JSON.parse(saved) };
              } catch {
                return ms;
              }
            }
            return ms;
          });
        }

        setMilestones(initialMilestones);
        if (initialMilestones.length > 0) {
          setExpandedMilestoneId(initialMilestones[0].id);
        }

        // Initialize Gantt Features (use existing tasks or synthesize dynamically)
        const now = new Date();
        const durationDays = parseInt(projectData.dueDate?.replace(/\D/g, "") || "14", 10) || 14;

        let sprintTasks = projectData.tasks;
        if (!sprintTasks || sprintTasks.length === 0) {
          sprintTasks = generateSprintTasksForCategory(projectData.category, durationDays, now);
        }

        const mappedGantt: GanttFeature[] = sprintTasks.map((t, idx) => ({
          id: t.id || `gantt-${idx}`,
          name: t.name,
          startAt: t.startDate ? new Date(t.startDate) : new Date(now.getTime() + idx * 3 * 86400000),
          endAt: t.endDate ? new Date(t.endDate) : new Date(now.getTime() + (idx * 3 + 3) * 86400000),
          status: idx === 0 ? STATUS_ACTIVE : STATUS_PLANNED,
        }));

        setFeatures(mappedGantt);
      }
    } catch (err) {
      console.error("Error loading project workspace:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, formatMoney]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // Dynamic Gantt bounds calculation
  const ganttBounds = useMemo(() => {
    if (features.length === 0) {
      const today = new Date();
      return {
        startDate: new Date(today.getTime() - 2 * 86400000),
        endDate: new Date(today.getTime() + 18 * 86400000),
        todayDate: today,
      };
    }

    const startTimes = features.map((f) => f.startAt.getTime());
    const endTimes = features.map((f) => f.endAt.getTime());
    const minStart = new Date(Math.min(...startTimes) - 2 * 86400000);
    const maxEnd = new Date(Math.max(...endTimes) + 3 * 86400000);

    return {
      startDate: minStart,
      endDate: maxEnd,
      todayDate: new Date(),
    };
  }, [features]);

  // 3. Hire / Accept Freelancer Action
  const handleHireFreelancer = async (applicant: ProposalItem) => {
    setIsHiringProcessing(true);

    try {
      const result = await acceptProposal({
        proposalId: applicant.id,
        projectId,
        freelancerId: applicant.freelancerId,
        bidAmount: applicant.bidAmount,
      });

      if (result.success) {
        // Update local project state immediately
        setProject((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "In Progress",
            freelancer: {
              id: applicant.freelancerId,
              fullName: applicant.freelancerName,
              avatarUrl: applicant.freelancerAvatar,
              headline: applicant.freelancerTitle,
              rating: applicant.freelancerRating,
              completedProjects: applicant.freelancerReviewsCount,
              skills: applicant.freelancerSkills,
            },
          };
        });

        // Unlock milestone 1
        setMilestones((prev) =>
          prev.map((m, idx) => (idx === 0 ? { ...m, status: "In Progress" } : m))
        );

        // Update proposals status
        setProposals((prev) =>
          prev.map((p) =>
            p.id === applicant.id ? { ...p, status: "accepted" } : { ...p, status: "rejected" }
          )
        );

        setHiringApplicant(null);
        setActiveTab("overview");
      } else {
        alert(`Gagal merekrut freelancer: ${result.error || "Terjadi kesalahan"}`);
      }
    } catch (err) {
      console.error("Error hiring freelancer:", err);
      alert("Terjadi kesalahan saat memproses perekrutan.");
    } finally {
      setIsHiringProcessing(false);
    }
  };

  // 4. Milestone Deliverable Submission (Freelancer Side)
  const handleSubmitDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitId) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === activeSubmitId
            ? {
                ...m,
                isSubmittedForReview: true,
                deliverableFileUrl: deliverableUrl || "https://drive.google.com/folder/deliverables",
                deliverableNote: deliverableNote || "File hasil karya telah siap untuk ditinjau oleh klien.",
              }
            : m
        )
      );

      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setActiveSubmitId(null);
        setSubmitSuccess(false);
        setDeliverableUrl("");
        setDeliverableNote("");
      }, 1500);
    }, 1000);
  };

  // 5. Client Review Milestone: Approve & Release Escrow
  const handleApproveMilestone = (milestoneId: string) => {
    setMilestones((prev) => {
      const idx = prev.findIndex((m) => m.id === milestoneId);
      if (idx === -1) return prev;

      return prev.map((m, i) => {
        if (i === idx) {
          return { ...m, status: "Completed", isSubmittedForReview: false };
        }
        // Unlock next milestone if available
        if (i === idx + 1) {
          return { ...m, status: "In Progress" };
        }
        return m;
      });
    });
  };

  // 6. Client Review Milestone: Request Revision
  const handleRequestRevision = (milestoneId: string) => {
    const note = prompt("Tuliskan catatan revisi untuk freelancer:");
    if (!note) return;

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              isSubmittedForReview: false,
              comments: [
                ...m.comments,
                {
                  id: `rev-${Date.now()}`,
                  author: userProfile.fullName,
                  role: "client",
                  avatar: userProfile.avatarUrl,
                  content: `[PERMINTAAN REVISI]: ${note}`,
                  time: "Baru saja",
                },
              ],
            }
          : m
      )
    );
  };

  // 7. Two-Way Persistent Milestone Commenting
  const handleAddComment = (msId: string) => {
    const text = newCommentText[msId]?.trim();
    if (!text) return;

    const newComment: MilestoneComment = {
      id: `c-${Date.now()}`,
      author: userProfile.fullName,
      role: isClientMode ? "client" : "freelancer",
      avatar: userProfile.avatarUrl,
      content: text,
      time: "Baru saja",
    };

    setMilestones((prev) => {
      const updated = prev.map((m) =>
        m.id === msId ? { ...m, comments: [...m.comments, newComment] } : m
      );

      // Persist to localStorage
      if (typeof window !== "undefined") {
        const ms = updated.find((m) => m.id === msId);
        if (ms) {
          localStorage.setItem(`doable_comments_${projectId}_${msId}`, JSON.stringify(ms.comments));
        }
      }

      return updated;
    });

    setNewCommentText((prev) => ({ ...prev, [msId]: "" }));
  };

  // 8. Toggle Checklist Task
  const toggleTask = (msId: string, taskId: string) => {
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === msId
          ? {
              ...m,
              tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
            }
          : m
      )
    );
  };

  // 9. Gantt Task Shift Handlers
  const handleOpenMoveModal = (feat: GanttFeature) => {
    setSelectedTaskToMove(feat);
    setShiftStartStr(feat.startAt.toISOString().split("T")[0]);
    setShiftEndStr(feat.endAt.toISOString().split("T")[0]);
    setShiftNote("");
  };

  const handleQuickShift = (days: number) => {
    if (!selectedTaskToMove) return;
    const s = new Date(selectedTaskToMove.startAt.getTime() + days * 86400000);
    const e = new Date(selectedTaskToMove.endAt.getTime() + days * 86400000);
    setShiftStartStr(s.toISOString().split("T")[0]);
    setShiftEndStr(e.toISOString().split("T")[0]);
  };

  const handleSubmitShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToMove) return;
    const start = new Date(shiftStartStr);
    const end = new Date(shiftEndStr);

    setPendingChange({
      targetTaskId: selectedTaskToMove.id,
      taskName: selectedTaskToMove.name,
      newStart: start,
      newEnd: end,
      note: shiftNote,
    });
    setSelectedTaskToMove(null);
  };

  const handleApproveGanttChange = () => {
    if (!pendingChange) return;
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === pendingChange.targetTaskId
          ? { ...f, startAt: pendingChange.newStart, endAt: pendingChange.newEnd, status: STATUS_ACTIVE }
          : f
      )
    );
    setPendingChange(null);
    setChangeApproved(true);
    setTimeout(() => setChangeApproved(false), 3000);
  };

  const handleDeclineGanttChange = () => {
    setPendingChange(null);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const start = newTaskStart ? new Date(newTaskStart) : new Date();
    const end = newTaskEnd ? new Date(newTaskEnd) : new Date(start.getTime() + 3 * 86400000);
    const newTask: GanttFeature = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      startAt: start,
      endAt: end,
      status: STATUS_ACTIVE,
    };
    setFeatures((prev) => [...prev, newTask]);
    setNewTaskName("");
    setNewTaskStart("");
    setNewTaskEnd("");
    setIsAddingTask(false);
  };


  // Stats calculation
  const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);
  const completedTasks = milestones.reduce(
    (sum, m) => sum + m.tasks.filter((t) => t.done).length,
    0
  );
  const completedMilestones = milestones.filter((m) => m.status === "Completed").length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Active milestone focus
  const activeMilestone = milestones.find((m) => m.status === "In Progress") || milestones[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-xs text-muted-foreground font-medium animate-pulse">
          Memuat Workspace Proyek...
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <Briefcase className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <h2 className="text-lg font-bold text-foreground">Proyek Tidak Ditemukan</h2>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Proyek dengan ID &ldquo;{projectId}&rdquo; tidak tersedia atau telah dihapus.
        </p>
        <Link
          href={isClientMode ? "/client/projects" : "/freelancer/my-work"}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">

        {/* ── BREADCRUMB & CONTEXT SWITCHER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href={isClientMode ? "/client/projects" : "/freelancer/my-work"}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isClientMode ? "Kelola Proyek" : "Pekerjaan Saya"}
            </Link>
            <span className="text-muted-foreground/40 text-xs">/</span>
            <span className="text-xs font-medium text-foreground truncate max-w-[260px]">
              {project.title}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] text-muted-foreground font-medium">Mode Tampilan:</span>
            <span
              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                isClientMode
                  ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {isClientMode ? "Client (Pemberi Kerja)" : "Freelancer (Pelaksana)"}
            </span>
          </div>
        </div>

        {/* ── PROJECT HEADER HERO ── */}
        <div className="rounded-2xl border border-border/60 bg-card mb-6 overflow-hidden shadow-xs">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border rounded-md px-2 py-0.5">
                    {project.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      project.status === "In Progress"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : project.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}
                  >
                    {project.status === "Hiring" ? "Mencari Talenta (Hiring)" : project.status}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                    Skala {project.difficulty}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                  {project.title}
                </h1>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  {project.description}
                </p>

                {/* Required Skills */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-primary/8 text-primary px-2.5 py-1 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Financial & Time Badges */}
              <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 min-w-[150px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Budget</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatMoney(project.budgetNumeric)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <ShieldCheck className="h-3 w-3" /> Dana Aman di Escrow
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 min-w-[130px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Target Tenggat</p>
                  <p className="text-base font-bold text-foreground flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {project.dueDate}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Sprint Roadmap</span>
                </div>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mt-6 pt-5 border-t border-border/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Progress Keseluruhan</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>
                    <strong className="text-foreground">{completedTasks}</strong>/{totalTasks} tasks
                  </span>
                  <span className="font-bold text-foreground">{overallProgress}%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── ROLE-SPECIFIC ACTIVE BANNER ── */}
        {project.status === "Hiring" ? (
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                    Tahap Seleksi Proposal
                  </span>
                  <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                    {proposals.length} Proposal Masuk
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground">
                  {isClientMode
                    ? "Tinjau proposal dari para freelancer dan pilih kandidat terbaik"
                    : "Proyek ini sedang membuka pengajuan proposal dari talenta"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Setelah kandidat diterima, Milestone 1 akan resmi dimulai dan dana diamankan di escrow.
                </p>
              </div>
            </div>

            {isClientMode && activeTab !== "proposals" && (
              <button
                onClick={() => setActiveTab("proposals")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all shrink-0"
              >
                <Users className="h-3.5 w-3.5" />
                Tinjau Proposal ({proposals.length})
              </button>
            )}
          </div>
        ) : (
          /* When project is in progress */
          activeMilestone && (
            <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <Target className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {isClientMode
                        ? activeMilestone.isSubmittedForReview
                          ? "Butuh Tindakan Klien"
                          : "Pengerjaan Berjalan"
                        : "Fokus Milestone Kamu"}
                    </span>
                    <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-bold">
                      Tenggat {activeMilestone.dueDate}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">{activeMilestone.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
                    {activeMilestone.isSubmittedForReview
                      ? "Freelancer telah menyerahkan hasil karya untuk milestone ini."
                      : activeMilestone.deliverableHint}
                  </p>
                </div>
              </div>

              {/* Action depending on role */}
              <div className="flex items-center gap-2 shrink-0">
                {isClientMode ? (
                  activeMilestone.isSubmittedForReview ? (
                    <>
                      <button
                        onClick={() => handleApproveMilestone(activeMilestone.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Setujui & Cairkan Escrow
                      </button>
                      <button
                        onClick={() => handleRequestRevision(activeMilestone.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                      >
                        Minta Revisi
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2 border border-border/50">
                      Menunggu pengerjaan freelancer
                    </span>
                  )
                ) : (
                  /* Freelancer action */
                  <button
                    onClick={() => {
                      setActiveSubmitId(activeMilestone.id);
                      setExpandedMilestoneId(activeMilestone.id);
                      setActiveTab("overview");
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    Serahkan Hasil Karya
                  </button>
                )}
              </div>
            </div>
          )
        )}

        {/* ── TIMELINE CHANGE NOTIFICATION ── */}
        {pendingChange && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">
                  Perubahan jadwal diajukan: &ldquo;{pendingChange.taskName}&rdquo;
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Catatan: &ldquo;{pendingChange.note || "Penyesuaian estimasi pengerjaan"}&rdquo;
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleApproveGanttChange}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-700"
              >
                <Check className="h-3.5 w-3.5" /> Setujui
              </button>
              <button
                onClick={handleDeclineGanttChange}
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-card text-muted-foreground px-2.5 py-1.5 text-xs font-semibold hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" /> Tolak
              </button>
            </div>
          </div>
        )}
        {changeApproved && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-3.5 flex items-center gap-2.5 text-xs font-semibold text-emerald-700 mb-4">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Jadwal telah disepakati dan Gantt Chart diperbarui.
          </div>
        )}

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-1 border-b border-border mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutList className="h-3.5 w-3.5" />
            Tahapan Milestone ({milestones.length})
          </button>

          <button
            onClick={() => setActiveTab("proposals")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "proposals"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Proposal Masuk
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === "proposals"
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {proposals.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            Timeline Gantt
          </button>

          <button
            onClick={() => setActiveTab("files")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              activeTab === "files"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            File & Deliverable
          </button>
        </div>

        {/* ── TAB 1: PROPOSAL REVIEW ── */}
        {activeTab === "proposals" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 p-4 rounded-2xl border border-border/60">
              <div>
                <h2 className="text-sm font-bold text-foreground">Daftar Pengajuan Proposal Freelancer</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tinjau tawaran harga, estimasi waktu, dan pitching dari para pelamar terverifikasi.
                </p>
              </div>
              <div className="text-xs font-semibold text-muted-foreground">
                Total: <strong className="text-foreground">{proposals.length}</strong> pelamar
              </div>
            </div>

            {proposals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-foreground">Belum Ada Proposal Masuk</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  Proyek ini baru saja dipublikasikan ke marketplace. Proposal dari freelancer akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {proposals.map((applicant) => (
                  <div
                    key={applicant.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      applicant.status === "accepted"
                        ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
                        : "border-border/60 bg-card hover:border-border"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Freelancer profile */}
                      <div className="flex items-start gap-3.5">
                        <img
                          src={applicant.freelancerAvatar}
                          alt={applicant.freelancerName}
                          className="h-12 w-12 rounded-full object-cover border border-border shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-foreground">
                              {applicant.freelancerName}
                            </h3>
                            {applicant.status === "accepted" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                                <CheckCircle className="h-3 w-3" /> Diterima & Terikat Kontrak
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{applicant.freelancerTitle}</p>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <Star className="h-3 w-3 fill-amber-500" />
                              {applicant.freelancerRating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{applicant.freelancerReviewsCount} Proyek Selesai</span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {applicant.freelancerSkills.map((sk) => (
                              <span
                                key={sk}
                                className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bid Info & Action */}
                      <div className="flex flex-row md:flex-col items-end justify-between md:justify-start gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border/40">
                        <div className="text-right">
                          <p className="text-base font-bold text-foreground">
                            {formatMoney(applicant.bidAmount)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Estimasi pengerjaan: <strong>{applicant.deliveryDays} hari</strong>
                          </p>
                        </div>

                        {/* Client hire actions */}
                        {isClientMode && (
                          <div className="flex items-center gap-2 mt-2">
                            <Link
                              href={`/client/talent/${applicant.freelancerId}`}
                              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                            >
                              <ExternalLink className="h-3 w-3" /> Profil
                            </Link>

                            {applicant.status !== "accepted" && project.status === "Hiring" && (
                              <button
                                onClick={() => setHiringApplicant(applicant)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Terima & Rekrut
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Letter */}
                    <div className="mt-4 rounded-xl bg-muted/20 border border-border/40 p-3 text-xs text-foreground leading-relaxed">
                      <p className="font-semibold text-muted-foreground mb-1 text-[11px] uppercase tracking-wider">
                        Pesan Pengajuan (Cover Letter):
                      </p>
                      &ldquo;{applicant.coverLetter}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: OVERVIEW & MILESTONES ── */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Milestones Accordion */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-sm font-bold text-foreground">
                  Tahapan Pengerjaan & Pembayaran ({milestones.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  {completedMilestones} selesai
                </span>
              </div>

              {milestones.map((ms, idx) => {
                const isExpanded = expandedMilestoneId === ms.id;
                const doneTasks = ms.tasks.filter((t) => t.done).length;

                return (
                  <div
                    key={ms.id}
                    className={`rounded-2xl border transition-all overflow-hidden ${
                      ms.status === "Completed"
                        ? "border-emerald-500/25 bg-emerald-500/4"
                        : ms.status === "In Progress"
                        ? "border-primary/30 bg-card ring-1 ring-primary/10 shadow-xs"
                        : "border-border/60 bg-muted/10 opacity-75"
                    }`}
                  >
                    {/* Header bar */}
                    <div
                      onClick={() => setExpandedMilestoneId(isExpanded ? "" : ms.id)}
                      className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-muted/10 select-none transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            ms.status === "Completed"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : ms.status === "In Progress"
                              ? "bg-primary/15 text-primary"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase">
                              Milestone {idx + 1}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                ms.status === "Completed"
                                  ? "bg-emerald-500/15 text-emerald-600"
                                  : ms.status === "In Progress"
                                  ? "bg-blue-500/15 text-blue-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {ms.status === "Completed"
                                ? "Selesai"
                                : ms.status === "In Progress"
                                ? "Sedang Dikerjakan"
                                : "Terkunci"}
                            </span>
                            {ms.isSubmittedForReview && (
                              <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                                Menunggu Review Klien
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-foreground">{ms.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {doneTasks}/{ms.tasks.length} tasks selesai
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-foreground">
                            {formatMoney(ms.amount)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{ms.percentage}% dari total</p>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-border/40 space-y-4">
                        {/* Tasks Checklist */}
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Checklist Pengerjaan
                          </p>
                          <div className="space-y-1.5">
                            {ms.tasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => toggleTask(ms.id, task.id)}
                                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-muted/20 cursor-pointer transition-colors"
                              >
                                <div
                                  className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                                    task.done
                                      ? "bg-primary border-primary text-white"
                                      : "border-border bg-card"
                                  }`}
                                >
                                  {task.done && <Check className="h-3 w-3" />}
                                </div>
                                <span
                                  className={`text-xs ${
                                    task.done
                                      ? "line-through text-muted-foreground"
                                      : "text-foreground font-medium"
                                  }`}
                                >
                                  {task.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Deliverables Info Box */}
                        <div className="rounded-xl bg-muted/20 border border-border/40 p-3.5 space-y-2 text-xs">
                          <div className="flex items-center gap-2 font-bold text-foreground">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            Format Deliverable yang Diserahkan:
                          </div>
                          <p className="text-muted-foreground">{ms.deliverableHint}</p>

                          {ms.deliverableFileUrl && (
                            <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Link Hasil Karya:
                              </span>
                              <a
                                href={ms.deliverableFileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                              >
                                Buka Link <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Deliverable Action Buttons */}
                        {ms.status === "In Progress" && (
                          <div className="pt-1 flex items-center gap-2">
                            {isClientMode ? (
                              ms.isSubmittedForReview ? (
                                <div className="flex items-center gap-2 w-full">
                                  <button
                                    onClick={() => handleApproveMilestone(ms.id)}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-all"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Setujui & Cairkan Pembayaran ({formatMoney(ms.amount)})
                                  </button>
                                  <button
                                    onClick={() => handleRequestRevision(ms.id)}
                                    className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                                  >
                                    Minta Revisi
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">
                                  Menunggu freelancer menyerahkan hasil karya untuk milestone ini.
                                </p>
                              )
                            ) : (
                              /* Freelancer submission */
                              <button
                                onClick={() => setActiveSubmitId(ms.id)}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all"
                              >
                                <UploadCloud className="h-3.5 w-3.5" />
                                Serahkan Hasil Karya
                              </button>
                            )}
                          </div>
                        )}

                        {/* Milestone Comments & Chat */}
                        <div className="pt-3 border-t border-border/40 space-y-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3" /> Diskusi Milestone
                          </p>

                          {ms.comments.length > 0 ? (
                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                              {ms.comments.map((c) => (
                                <div
                                  key={c.id}
                                  className={`flex items-start gap-2.5 ${
                                    c.role === "client" ? "flex-row-reverse" : ""
                                  }`}
                                >
                                  <img
                                    src={c.avatar}
                                    alt={c.author}
                                    className="h-7 w-7 rounded-full object-cover shrink-0 border border-border"
                                  />
                                  <div
                                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 space-y-1 ${
                                      c.role === "client"
                                        ? "bg-primary/10 border border-primary/20 text-right"
                                        : "bg-card border border-border/60"
                                    }`}
                                  >
                                    <div
                                      className={`flex items-center gap-2 ${
                                        c.role === "client" ? "justify-end" : ""
                                      }`}
                                    >
                                      <span className="text-[10px] font-bold text-foreground">
                                        {c.author} ({c.role === "client" ? "Klien" : "Freelancer"})
                                      </span>
                                      <span className="text-[9px] text-muted-foreground">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-foreground leading-relaxed">{c.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              Belum ada diskusi untuk milestone ini.
                            </p>
                          )}

                          {/* Message Input Box */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              value={newCommentText[ms.id] || ""}
                              onChange={(e) =>
                                setNewCommentText((prev) => ({ ...prev, [ms.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment(ms.id);
                              }}
                              placeholder={
                                isClientMode
                                  ? "Tulis instruksi atau catatan ke freelancer..."
                                  : "Tulis pertanyaan atau update ke klien..."
                              }
                              className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                            />
                            <button
                              onClick={() => handleAddComment(ms.id)}
                              className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/90 shrink-0 transition-colors"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Counterparty & Project Stats Sidebar */}
            <div className="space-y-4">
              {/* Partner Card: If Client, show Freelancer Partner */}
              {isClientMode ? (
                project.freelancer ? (
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                    <div className="p-4 border-b border-border/40 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Freelancer Partner
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <UserCheck className="h-3 w-3" /> Terikat Kontrak
                      </span>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            project.freelancer.avatarUrl ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                          }
                          alt={project.freelancer.fullName}
                          className="h-11 w-11 rounded-full object-cover border border-border shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">
                            {project.freelancer.fullName}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {project.freelancer.headline}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mt-1">
                            <Star className="h-3 w-3 fill-amber-500" />
                            {project.freelancer.rating?.toFixed(1) || "5.0"}
                            <span className="text-muted-foreground font-normal">
                              • {project.freelancer.completedProjects || 0} proyek
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/client/talent/${project.freelancer.id}`}
                          className="flex-1 inline-flex items-center justify-center rounded-xl border border-border bg-muted/40 hover:bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors"
                        >
                          Lihat Profil
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center space-y-2">
                    <Users className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                    <p className="text-xs font-bold text-foreground">Belum Ada Freelancer Terpilih</p>
                    <p className="text-[11px] text-muted-foreground">
                      Proyek masih dalam tahap pencarian talenta. Buka tab Proposal untuk meninjau pelamar.
                    </p>
                    <button
                      onClick={() => setActiveTab("proposals")}
                      className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
                    >
                      Lihat Proposal ({proposals.length})
                    </button>
                  </div>
                )
              ) : (
                /* Freelancer view: Show Client info & Career Impact */
                <>
                  <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Klien (Pemberi Kerja)
                    </p>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          project.owner?.avatarUrl ||
                          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
                        }
                        alt={project.owner?.fullName || "Klien"}
                        className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                      />
                      <div>
                        <p className="text-xs font-bold text-foreground">
                          {project.owner?.fullName || "Klien Doable!"}
                        </p>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" /> Klien Terverifikasi
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {project.owner?.location || "Indonesia"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-600" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Dampak Karir & Portfolio
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reward XP</span>
                        <span className="font-bold text-amber-600 flex items-center gap-1">
                          <Zap className="h-3 w-3" /> +{project.difficulty === "Enterprise" ? 650 : 350} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Skill Badge</span>
                        <span className="font-bold text-primary">{project.skills[0] || "Verified"}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2.5 leading-relaxed">
                      Karya ini otomatis tampil sebagai <strong className="text-foreground">studi kasus terverifikasi</strong> di profil Anda setelah milestone selesai.
                    </p>
                  </div>
                </>
              )}

              {/* Project Stats Widget */}
              <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Statistik Sprint
                </p>
                {[
                  {
                    icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />,
                    label: "Milestone selesai",
                    value: `${completedMilestones}/${milestones.length}`,
                  },
                  {
                    icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />,
                    label: "Task dikerjakan",
                    value: `${completedTasks}/${totalTasks}`,
                  },
                  {
                    icon: <BarChart3 className="h-3.5 w-3.5 text-amber-600" />,
                    label: "Progress keseluruhan",
                    value: `${overallProgress}%`,
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {icon}
                      {label}
                    </div>
                    <span className="font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: TIMELINE GANTT ── */}
        {activeTab === "timeline" && (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-border/40 gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Sprint Gantt Chart</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visualisasi jadwal pengerjaan otomatis berbasis durasi proyek ({features.length} task)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-border bg-muted/30 p-0.5 text-xs font-semibold">
                  {(["daily", "weekly"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setGanttRange(r)}
                      className={`rounded-lg px-3 py-1.5 capitalize transition-all ${
                        ganttRange === r
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r === "daily" ? "Harian" : "Mingguan"}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Task
                </button>
              </div>
            </div>

            {/* Shift Task Form */}
            {selectedTaskToMove && (
              <form onSubmit={handleSubmitShift} className="m-5 rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">
                      Geser Jadwal: &ldquo;{selectedTaskToMove.name}&rdquo;
                    </span>
                  </div>
                  <button type="button" onClick={() => setSelectedTaskToMove(null)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 5, -1].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleQuickShift(d)}
                      className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                    >
                      {d > 0 ? `+${d}` : d} Hari
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={shiftStartStr}
                    onChange={(e) => setShiftStartStr(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={shiftEndStr}
                    onChange={(e) => setShiftEndStr(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <input
                  type="text"
                  value={shiftNote}
                  onChange={(e) => setShiftNote(e.target.value)}
                  placeholder="Catatan penyesuaian jadwal..."
                  className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTaskToMove(null)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
                  >
                    Ajukan Pergeseran
                  </button>
                </div>
              </form>
            )}

            {/* Add Task Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="m-5 rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plus className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">Tambah Task Baru ke Roadmap</span>
                  </div>
                  <button type="button" onClick={() => setIsAddingTask(false)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Nama tahapan / task baru..."
                  className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  required
                />
                <div className="grid sm:grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                    required
                  />
                  <input
                    type="date"
                    value={newTaskEnd}
                    onChange={(e) => setNewTaskEnd(e.target.value)}
                    className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90"
                  >
                    Tambahkan Task
                  </button>
                </div>
              </form>
            )}

            {/* Dynamic Gantt Chart Component */}
            <div className="p-5 pt-0">
              <div className="w-full overflow-hidden rounded-xl border border-border">
                <GanttProvider
                  key={ganttRange}
                  className="h-[400px] w-full"
                  range={ganttRange}
                  zoom={100}
                  startDate={ganttBounds.startDate}
                  endDate={ganttBounds.endDate}
                  todayDate={ganttBounds.todayDate}
                >
                  <GanttSidebar>
                    {features.map((f) => (
                      <GanttSidebarItem key={f.id} feature={f} onClick={handleOpenMoveModal} />
                    ))}
                  </GanttSidebar>
                  <GanttTimeline>
                    <GanttHeader />
                    <GanttFeatureList>
                      {features.map((f) => (
                        <GanttFeatureItem key={f.id} {...f} onClick={handleOpenMoveModal} />
                      ))}
                    </GanttFeatureList>
                    <GanttToday />
                  </GanttTimeline>
                </GanttProvider>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-3">
                {[
                  { color: "bg-emerald-500", label: "Selesai" },
                  { color: "bg-blue-500", label: "Dikerjakan" },
                  { color: "bg-amber-500", label: "Review" },
                  { color: "bg-purple-500", label: "Direncanakan" },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: FILE & DELIVERABLE ── */}
        {activeTab === "files" && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-foreground mb-1">Penyimpanan File & Deliverable</h2>
              <p className="text-xs text-muted-foreground">
                Daftar file hasil karya dan deliverable sprint yang telah diserahkan.
              </p>
            </div>

            <div className="space-y-4">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${
                    ms.status === "Completed"
                      ? "border-emerald-500/25 bg-emerald-500/4"
                      : "border-border/50 bg-muted/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ms.status === "Completed"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ms.status === "Completed" ? "Selesai & Diserahkan" : "Belum Diserahkan"}
                      </span>
                      <span className="text-xs font-bold text-foreground">{ms.title}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {formatMoney(ms.amount)}
                    </span>
                  </div>

                  {ms.deliverableFileUrl ? (
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-card border border-border/60 p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground truncate max-w-sm">
                            {ms.deliverableFileUrl}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Catatan: {ms.deliverableNote || "Tidak ada catatan tambahan."}
                          </p>
                        </div>
                      </div>
                      <a
                        href={ms.deliverableFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
                      >
                        Akses File <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Format deliverable: {ms.deliverableHint}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MODAL: HIRE FREELANCER CONFIRMATION ── */}
        {hiringApplicant && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <Sparkles className="h-4 w-4" /> Konfirmasi Perekrutan
                </div>
                <button
                  onClick={() => setHiringApplicant(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40">
                <img
                  src={hiringApplicant.freelancerAvatar}
                  alt={hiringApplicant.freelancerName}
                  className="h-12 w-12 rounded-full object-cover border border-border"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {hiringApplicant.freelancerName}
                  </p>
                  <p className="text-xs text-muted-foreground">{hiringApplicant.freelancerTitle}</p>
                  <p className="text-xs font-bold text-primary mt-1">
                    Tawaran: {formatMoney(hiringApplicant.bidAmount)} ({hiringApplicant.deliveryDays} hari)
                  </p>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Dengan mengonfirmasi perekrutan, freelancer ini resmi terikat kontrak proyek. Milestone 1 akan dimulai dan dana proyek akan diamankan dalam sistem Escrow Doable.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHiringApplicant(null)}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isHiringProcessing}
                  onClick={() => handleHireFreelancer(hiringApplicant)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                >
                  {isHiringProcessing ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Memproses...
                    </>
                  ) : (
                    "Konfirmasi & Rekrut"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: SUBMIT DELIVERABLE (FREELANCER SIDE) ── */}
        {activeSubmitId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-primary" /> Serahkan Hasil Karya
                </h3>
                <button
                  onClick={() => setActiveSubmitId(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto animate-bounce" />
                  <p className="text-sm font-bold text-foreground">Hasil Karya Berhasil Diserahkan!</p>
                  <p className="text-xs text-muted-foreground">
                    Klien akan memeriksa deliverable dan menyetujui pencairan dana milestone.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitDeliverable} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Link Penyimpanan Cloud / Deliverable
                    </label>
                    <input
                      type="url"
                      value={deliverableUrl}
                      onChange={(e) => setDeliverableUrl(e.target.value)}
                      placeholder="https://drive.google.com/... atau https://figma.com/..."
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Catatan Penyerahan untuk Klien
                    </label>
                    <textarea
                      rows={3}
                      value={deliverableNote}
                      onChange={(e) => setDeliverableNote(e.target.value)}
                      placeholder="Jelaskan deliverable apa saja yang telah diselesaikan pada sprint ini..."
                      className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveSubmitId(null)}
                      className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                    >
                      {isSubmitting ? "Mengunggah..." : "Serahkan Sekarang"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
