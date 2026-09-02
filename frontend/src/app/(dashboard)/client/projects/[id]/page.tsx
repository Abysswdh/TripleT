"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getProjectById } from "@/lib/services/projects";
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
  ArrowRight,
  Lock,
  ChevronDown,
  ChevronRight,
  LayoutList,
  CalendarDays,
  BarChart3,
  Star,
  Paperclip,
  Circle,
  CheckCircle,
  Timer,
  TrendingUp,
} from "lucide-react";
import { PaymentModal } from "@/components/payment/payment-modal";
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
  type GanttStatus
} from "@/components/kibo-ui/gantt";

const STATUS_ACTIVE: GanttStatus = { id: "active", name: "In Progress", color: "#3b82f6" };
const STATUS_DONE: GanttStatus = { id: "done", name: "Completed", color: "#10b981" };
const STATUS_REVIEW: GanttStatus = { id: "review", name: "In Review", color: "#f59e0b" };
const STATUS_PLANNED: GanttStatus = { id: "planned", name: "Planned", color: "#8b5cf6" };

interface MilestoneComment {
  id: string;
  author: string;
  role: "freelancer" | "client";
  avatar: string;
  content: string;
  time: string;
}

interface Milestone {
  id: string;
  title: string;
  amount: string;
  percentage: number;
  status: "Completed" | "In Progress" | "Locked";
  dueDate: string;
  deliverableHint: string;
  tasks: { id: string; name: string; done: boolean }[];
  comments: MilestoneComment[];
}

interface ProjectDetailData {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: "Hiring" | "In Progress" | "Completed";
  dueDate: string;
  description: string;
  deliverables: string[];
  skills: string[];
  difficulty: "Starter" | "Standard" | "Enterprise";
  clientName: string;
  clientAvatar: string;
  xpReward: number;
  assignedFreelancer?: {
    name: string;
    role: string;
    avatar: string;
    rating: number;
    completedProjects: number;
    portfolioGoal: string;
    university?: string;
    initials: string;
  };
  milestones: Milestone[];
  initialFeatures: GanttFeature[];
}

const PROJECTS_DATA: Record<string, ProjectDetailData> = {
  "proj-1": {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile App Development",
    budget: "Rp 6.500.000",
    status: "In Progress",
    dueDate: "18 Mar 2026",
    description: "Redesign UI/UX komprehensif aplikasi mobile toko online ke Flutter modern dengan state management Riverpod, payment gateway Midtrans, dan push notification Firebase. Tujuan utama meningkatkan checkout funnel dari 12 menjadi 4 step.",
    deliverables: [
      "Design system & component library di Figma (atomic design)",
      "Flutter codebase dengan Riverpod state management",
      "Integrasi Midtrans Snap payment gateway + webhook handler",
      "Firebase Push Notification setup",
      "README dokumentasi teknis & APK release build",
    ],
    skills: ["Flutter", "Dart", "Riverpod", "Figma", "REST API"],
    difficulty: "Starter",
    clientName: "PT FinTech Solusindo",
    clientAvatar: "FS",
    xpReward: 450,
    assignedFreelancer: {
      name: "Budi Santoso",
      role: "Junior Mobile Developer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.9,
      completedProjects: 6,
      portfolioGoal: "Membangun portofolio showcase Flutter e-commerce siap kerja",
      university: "Universitas Bina Nusantara",
      initials: "BS",
    },
    milestones: [
      {
        id: "ms-1",
        title: "Design System & Wireframe UI",
        amount: "Rp 2.000.000",
        percentage: 30,
        status: "Completed",
        dueDate: "5 Mar 2026",
        deliverableHint: "File Figma design system + 47 komponen atomic, wireframe seluruh flow dikirim via Google Drive.",
        tasks: [
          { id: "t-1", name: "Riset kompetitor & mood board", done: true },
          { id: "t-2", name: "Color tokens & typography system", done: true },
          { id: "t-3", name: "47 komponen atomic Figma", done: true },
          { id: "t-4", name: "Wireframe checkout flow (4 step)", done: true },
        ],
        comments: [
          { id: "c-1", author: "Budi Santoso", role: "freelancer", avatar: "BS", content: "Design system selesai dengan 47 komponen. Figma link sudah di-share ke email klien.", time: "05 Mar, 14:20" },
          { id: "c-2", author: "PT FinTech Solusindo", role: "client", avatar: "FS", content: "Approved! Warna brand sangat sesuai. Silakan lanjut ke Milestone 2.", time: "05 Mar, 16:45" },
        ],
      },
      {
        id: "ms-2",
        title: "Riverpod State & Product Flow",
        amount: "Rp 2.500.000",
        percentage: 40,
        status: "In Progress",
        dueDate: "12 Mar 2026",
        deliverableHint: "Upload link GitHub branch feature/riverpod-product-flow dan video demo flow produk & keranjang belanja.",
        tasks: [
          { id: "t-5", name: "Riverpod boilerplate & folder structure", done: true },
          { id: "t-6", name: "Auth screen & state management", done: true },
          { id: "t-7", name: "Product catalog dengan lazy-load", done: false },
          { id: "t-8", name: "Cart & checkout flow (4 step)", done: false },
        ],
        comments: [
          { id: "c-3", author: "PT FinTech Solusindo", role: "client", avatar: "FS", content: "Pastikan product list lazy-load saat scroll ya, user base kami pakai HP mid-range.", time: "07 Mar, 09:10" },
          { id: "c-4", author: "Budi Santoso", role: "freelancer", avatar: "BS", content: "Siap! Sudah implementasi pagination offset + shimmer loading. Test di Redmi Note 11 smooth.", time: "07 Mar, 11:30" },
        ],
      },
      {
        id: "ms-3",
        title: "Payment Midtrans & Final Build",
        amount: "Rp 2.000.000",
        percentage: 30,
        status: "Locked",
        dueDate: "18 Mar 2026",
        deliverableHint: "APK release build, dokumentasi README, dan video walkthrough keseluruhan fitur.",
        tasks: [
          { id: "t-9", name: "Midtrans Snap payment integration", done: false },
          { id: "t-10", name: "Firebase push notification", done: false },
          { id: "t-11", name: "QA & bug fixes", done: false },
          { id: "t-12", name: "README docs & APK build", done: false },
        ],
        comments: [],
      },
    ],
    initialFeatures: [
      { id: "f-1", name: "Discovery & Figma Kit", startAt: new Date("2026-03-01"), endAt: new Date("2026-03-04"), status: STATUS_DONE },
      { id: "f-2", name: "Riverpod Boilerplate & Auth", startAt: new Date("2026-03-04"), endAt: new Date("2026-03-08"), status: STATUS_ACTIVE },
      { id: "f-3", name: "Product Catalog & Cart Flow", startAt: new Date("2026-03-08"), endAt: new Date("2026-03-13"), status: STATUS_PLANNED },
      { id: "f-4", name: "Midtrans Snap & Final QA", startAt: new Date("2026-03-13"), endAt: new Date("2026-03-18"), status: STATUS_PLANNED },
    ],
  },
};

type TabId = "overview" | "timeline" | "files";

function MilestoneStatusPill({ status }: { status: Milestone["status"] }) {
  if (status === "Completed")
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600"><CheckCircle className="h-3 w-3" />Selesai</span>;
  if (status === "In Progress")
    return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[11px] font-bold text-blue-600"><Circle className="h-3 w-3 fill-blue-600" />Sedang Dikerjakan</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold text-muted-foreground"><Lock className="h-3 w-3" />Terkunci</span>;
}

export default function ClientProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "proj-1";

  const defaultStatic = useMemo(
    () => PROJECTS_DATA[projectId] || { ...PROJECTS_DATA["proj-1"], id: projectId },
    [projectId]
  );

  const [project, setProject] = useState<ProjectDetailData>(defaultStatic);
  const [milestones, setMilestones] = useState<Milestone[]>(defaultStatic.milestones);
  const [features, setFeatures] = useState<GanttFeature[]>(defaultStatic.initialFeatures);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    async function loadLiveProject() {
      if (!projectId) return;

      // 1. Check local storage first (instant responsiveness for guest / local tests)
      if (typeof window !== "undefined") {
        const cachedRaw = localStorage.getItem(`doable_project_${projectId}`);
        if (cachedRaw) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cached: any = JSON.parse(cachedRaw);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedMs: Milestone[] = (cached.milestones || []).map((m: any, idx: number) => ({
              id: m.id || `ms-${idx}`,
              title: m.title || `Milestone ${idx + 1}`,
              amount: m.amount || "Rp 0",
              percentage: idx === 0 ? 40 : 60,
              status: idx === 0 ? "In Progress" : "Locked",
              dueDate: m.dueDate || "3 hari",
              deliverableHint: (cached.deliverables && cached.deliverables.join(", ")) || "Format serah terima deliverable",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tasks: (cached.tasks || []).map((t: any, tIdx: number) => ({
                id: t.id || `t-${idx}-${tIdx}`,
                name: t.name || "Tahapan Pengerjaan",
                done: tIdx === 0,
              })),
              comments: [],
            }));

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const mappedFeatures: GanttFeature[] = (cached.tasks || []).map((t: any, idx: number) => ({
              id: t.id || `feat-${idx}`,
              name: t.name || `Tahapan ${idx + 1}`,
              startAt: t.startDate ? new Date(t.startDate) : new Date(),
              endAt: t.endDate ? new Date(t.endDate) : new Date(Date.now() + 3 * 86400000),
              status: idx === 0 ? STATUS_ACTIVE : STATUS_PLANNED,
            }));

            setProject({
              id: cached.id,
              title: cached.title,
              category: cached.category,
              budget: cached.budget,
              status: cached.status || "Hiring",
              dueDate: cached.dueDate || "3 hari",
              description: cached.description || "Deskripsi kebutuhan proyek.",
              deliverables: cached.deliverables || ["File Final High-Res", "Link Cloud Storage"],
              skills: cached.skills || ["Canva", "Kreatif"],
              difficulty: cached.difficulty || "Starter",
              clientName: "Saya (Klien)",
              clientAvatar: "ME",
              xpReward: cached.difficulty === "Enterprise" ? 650 : cached.difficulty === "Standard" ? 350 : 150,
              milestones: mappedMs,
              initialFeatures: mappedFeatures,
            });

            if (mappedMs.length > 0) setMilestones(mappedMs);
            if (mappedFeatures.length > 0) setFeatures(mappedFeatures);
          } catch (e) {
            console.warn("Error reading local project cache:", e);
          }
        }
      }

      // 2. Fetch from Supabase PostgreSQL (if saved to database)
      if (projectId !== "proj-1") {
        const liveData = await getProjectById(projectId);
        if (liveData) {
          const mappedMs: Milestone[] = liveData.milestones.map((m, idx) => ({
            id: m.id,
            title: m.title,
            amount: m.amount,
            percentage: idx === 0 ? 40 : 60,
            status: idx === 0 ? "In Progress" : "Locked",
            dueDate: m.dueDate,
            deliverableHint: (m.deliverables && m.deliverables.join(", ")) || "Deliverable sprint",
            tasks: [
              { id: `t-${idx}-1`, name: `Sprint Deliverables: ${m.title}`, done: false },
            ],
            comments: [],
          }));

          const mappedFeatures: GanttFeature[] = liveData.tasks.map((t, idx) => ({
            id: t.id,
            name: t.name,
            startAt: t.startDate ? new Date(t.startDate) : new Date(),
            endAt: t.endDate ? new Date(t.endDate) : new Date(Date.now() + 5 * 86400000),
            status: idx === 0 ? STATUS_ACTIVE : STATUS_PLANNED,
          }));

          setProject({
            id: liveData.id,
            title: liveData.title,
            category: liveData.category,
            budget: liveData.budget,
            status: liveData.status === "In Progress" ? "In Progress" : liveData.status === "Completed" ? "Completed" : "Hiring",
            dueDate: liveData.dueDate,
            description: liveData.description,
            deliverables: liveData.milestones.flatMap((m) => m.deliverables || []),
            skills: liveData.skills,
            difficulty: liveData.difficulty,
            clientName: liveData.owner?.fullName || "Klien Doable!",
            clientAvatar: (liveData.owner?.fullName || "KL").slice(0, 2).toUpperCase(),
            xpReward: liveData.difficulty === "Enterprise" ? 650 : liveData.difficulty === "Standard" ? 350 : 150,
            milestones: mappedMs,
            initialFeatures: mappedFeatures,
          });

          if (mappedMs.length > 0) setMilestones(mappedMs);
          if (mappedFeatures.length > 0) setFeatures(mappedFeatures);
        }
      }
    }
    loadLiveProject();
  }, [projectId]);

  const [ganttRange, setGanttRange] = useState<"daily" | "weekly">("daily");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string>("ms-2");
  const [activeSubmitId, setActiveSubmitId] = useState<string | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");
  const [deliverableNote, setDeliverableNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});
  const [selectedTaskToMove, setSelectedTaskToMove] = useState<GanttFeature | null>(null);
  const [shiftStartStr, setShiftStartStr] = useState("");
  const [shiftEndStr, setShiftEndStr] = useState("");
  const [shiftNote, setShiftNote] = useState("");
  const [pendingChange, setPendingChange] = useState<{ taskName: string; oldStart?: Date; oldEnd?: Date; newStart: Date; newEnd: Date; note: string; targetTaskId?: string; isNewTask?: boolean } | null>(null);
  const [changeApproved, setChangeApproved] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStart, setNewTaskStart] = useState("2026-03-08");
  const [newTaskEnd, setNewTaskEnd] = useState("2026-03-14");

  const activeMilestone = milestones.find((m) => m.status === "In Progress");
  const completedCount = milestones.filter((m) => m.status === "Completed").length;
  const progress = Math.round((completedCount / milestones.length) * 100);
  const completedTasks = milestones.flatMap((m) => m.tasks).filter((t) => t.done).length;
  const totalTasks = milestones.flatMap((m) => m.tasks).length;

  const handleOpenMoveModal = (task: GanttFeature) => {
    setSelectedTaskToMove(task);
    setShiftStartStr(new Date(task.startAt).toISOString().slice(0, 10));
    setShiftEndStr(new Date(task.endAt).toISOString().slice(0, 10));
    setShiftNote("Menyesuaikan waktu pengerjaan agar milestone lebih optimal.");
  };
  const handleQuickShift = (days: number) => {
    const s = new Date(shiftStartStr); s.setDate(s.getDate() + days);
    const e = new Date(shiftEndStr); e.setDate(e.getDate() + days);
    setShiftStartStr(s.toISOString().slice(0, 10));
    setShiftEndStr(e.toISOString().slice(0, 10));
  };
  const handleSubmitShift = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selectedTaskToMove) return;
    const ns = new Date(shiftStartStr), ne = new Date(shiftEndStr);
    setFeatures((p) => p.map((f) => f.id === selectedTaskToMove.id ? { ...f, startAt: ns, endAt: ne, isPendingApproval: true, approvalNote: shiftNote } : f));
    setPendingChange({ targetTaskId: selectedTaskToMove.id, taskName: selectedTaskToMove.name, oldStart: selectedTaskToMove.startAt, oldEnd: selectedTaskToMove.endAt, newStart: ns, newEnd: ne, note: shiftNote, isNewTask: false });
    setSelectedTaskToMove(null);
  };
  const handleApprove = () => {
    setFeatures((p) => p.map((f) => f.isPendingApproval ? { ...f, isPendingApproval: false, status: STATUS_ACTIVE } : f));
    setPendingChange(null); setChangeApproved(true);
    setTimeout(() => setChangeApproved(false), 4000);
  };
  const handleDecline = () => {
    if (pendingChange?.isNewTask) setFeatures((p) => p.filter((f) => f.id !== pendingChange.targetTaskId));
    else if (pendingChange?.oldStart && pendingChange?.oldEnd) setFeatures((p) => p.map((f) => f.id === pendingChange.targetTaskId ? { ...f, startAt: pendingChange.oldStart!, endAt: pendingChange.oldEnd!, isPendingApproval: false } : f));
    setPendingChange(null);
  };
  const handleAddTask = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!newTaskName.trim()) return;
    const start = new Date(newTaskStart), end = new Date(newTaskEnd);
    const pt: GanttFeature = { id: `p-${Date.now()}`, name: newTaskName, startAt: start, endAt: end, status: STATUS_REVIEW, isPendingApproval: true };
    setFeatures([...features, pt]);
    setPendingChange({ targetTaskId: pt.id, taskName: newTaskName, newStart: start, newEnd: end, note: "", isNewTask: true });
    setNewTaskName(""); setIsAddingTask(false);
  };
  const handleSubmitDeliverable = (ev: React.FormEvent) => {
    ev.preventDefault(); setIsSubmitting(true);
    setTimeout(() => {
      setMilestones((p) => p.map((m) => m.id === activeSubmitId ? { ...m, status: "Completed" } : m));
      setIsSubmitting(false); setSubmitSuccess(true);
      setTimeout(() => { setActiveSubmitId(null); setSubmitSuccess(false); setDeliverableUrl(""); setDeliverableNote(""); }, 2200);
    }, 1400);
  };
  const handleAddComment = (msId: string) => {
    const txt = newCommentText[msId]?.trim();
    if (!txt) return;
    const c: MilestoneComment = { id: `c-${Date.now()}`, author: project.assignedFreelancer?.name || "Freelancer", role: "freelancer", avatar: project.assignedFreelancer?.initials || "F", content: txt, time: "Baru saja" };
    setMilestones((p) => p.map((m) => m.id === msId ? { ...m, comments: [...m.comments, c] } : m));
    setNewCommentText((p) => ({ ...p, [msId]: "" }));
  };
  const toggleTask = (msId: string, taskId: string) => {
    setMilestones((p) => p.map((m) => m.id === msId ? { ...m, tasks: m.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) } : m));
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutList className="h-3.5 w-3.5" /> },
    { id: "timeline", label: "Timeline Gantt", icon: <CalendarDays className="h-3.5 w-3.5" /> },
    { id: "files", label: "File & Deliverable", icon: <Paperclip className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">

        {/* ── BREADCRUMB ── */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/client/projects" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Proyek Saya
          </Link>
          <span className="text-muted-foreground/40 text-xs">/</span>
          <span className="text-xs font-medium text-foreground truncate max-w-[260px]">{project.title}</span>
        </div>

        {/* ── PROJECT HEADER ── */}
        <div className="rounded-2xl border border-border/60 bg-card mb-6 overflow-hidden">
          {/* Top color accent bar */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left info */}
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border rounded-md px-2 py-0.5">{project.category}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    project.status === "In Progress" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                    project.status === "Completed" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                    "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}>{project.status}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 border border-amber-500/20">Skala {project.difficulty}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">{project.title}</h1>

                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{project.description}</p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.skills.map((s) => (
                    <span key={s} className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary">{s}</span>
                  ))}
                </div>
              </div>

              {/* Right stats column */}
              <div className="flex lg:flex-col gap-3 flex-wrap lg:min-w-[200px]">
                {/* Budget */}
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 flex-1 lg:flex-none min-w-[130px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Total Anggaran</p>
                  <p className="text-lg font-bold text-foreground">{project.budget}</p>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <ShieldCheck className="h-3 w-3" />Garansi Pembayaran Aman
                  </span>
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="mt-2 w-full text-center text-[10px] font-bold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 py-1.5 rounded-lg transition-colors"
                  >
                    Deposit Rekber 🛡️
                  </button>
                </div>

                {/* Deadline */}
                <div className="rounded-xl border border-border/70 bg-muted/30 p-3.5 flex-1 lg:flex-none min-w-[130px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Deadline Sprint</p>
                  <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-amber-500" />
                    {project.dueDate}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Sprint 14 hari</span>
                </div>

                {/* XP Reward */}
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-3.5 flex-1 lg:flex-none min-w-[130px]">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Reward XP</p>
                  <p className="text-lg font-bold text-amber-600 flex items-center gap-1">
                    <Zap className="h-4 w-4" />+{project.xpReward}
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">Saat proyek selesai</span>
                </div>
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="mt-6 pt-5 border-t border-border/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">Progress Keseluruhan</span>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{completedTasks}</strong>/{totalTasks} tasks</span>
                  <span className="font-bold text-foreground">{progress}%</span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── FREELANCER ACTIVE FOCUS BANNER ── */}
        {activeMilestone && (
          <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/8 to-transparent p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Target className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Giliran Kamu Sekarang</span>
                  <span className="rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-[10px] font-bold">Deadline {activeMilestone.dueDate}</span>
                </div>
                <p className="text-sm font-bold text-foreground">{activeMilestone.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">{activeMilestone.deliverableHint}</p>
              </div>
            </div>
            <button
              onClick={() => { setActiveSubmitId(activeMilestone.id); setExpandedMilestoneId(activeMilestone.id); setActiveTab("overview"); }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Serahkan Hasil Karya
            </button>
          </div>
        )}

        {/* ── MUTUAL APPROVAL BANNERS ── */}
        {pendingChange && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/8 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Perubahan jadwal menunggu persetujuan freelancer</p>
                <p className="text-xs text-muted-foreground mt-0.5">Task &ldquo;{pendingChange.taskName}&rdquo; — Catatan: &ldquo;{pendingChange.note}&rdquo;</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-muted-foreground font-medium hidden sm:block">Simulasi freelancer:</span>
              <button onClick={handleApprove} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold hover:bg-emerald-700">
                <Check className="h-3.5 w-3.5" /> Setujui
              </button>
              <button onClick={handleDecline} className="inline-flex items-center gap-1 rounded-lg border border-border bg-card text-muted-foreground px-2.5 py-1.5 text-xs font-semibold hover:bg-muted">
                <X className="h-3.5 w-3.5" /> Tolak
              </button>
            </div>
          </div>
        )}
        {changeApproved && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/8 p-3.5 flex items-center gap-2.5 text-xs font-semibold text-emerald-700 mb-4">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> Jadwal telah disepakati. Gantt Chart diperbarui.
          </div>
        )}

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-0.5 border-b border-border mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-6">
            {/* Left: Milestone List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground">Tahapan Pengerjaan & Pembayaran ({milestones.length})</h2>
                <span className="text-xs text-muted-foreground">{completedCount} selesai</span>
              </div>

              {milestones.map((ms, idx) => {
                const isExpanded = expandedMilestoneId === ms.id;
                const isActive = ms.status === "In Progress";
                const isDone = ms.status === "Completed";
                const isLocked = ms.status === "Locked";
                const isSubmitOpen = activeSubmitId === ms.id;
                const doneTaskCount = ms.tasks.filter((t) => t.done).length;

                return (
                  <div
                    key={ms.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isDone ? "border-emerald-500/25 bg-emerald-500/4" :
                      isActive ? "border-primary/30 bg-primary/3 ring-1 ring-primary/10" :
                      "border-border/50 bg-card opacity-60"
                    }`}
                  >
                    {/* Milestone row header */}
                    <button
                      onClick={() => setExpandedMilestoneId(isExpanded ? "" : ms.id)}
                      disabled={isLocked}
                      className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-muted/20 transition-colors disabled:cursor-not-allowed"
                    >
                      {/* Status icon */}
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                        isDone ? "bg-emerald-500 text-white" :
                        isActive ? "bg-primary text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {isDone ? <Check className="h-4 w-4" /> : isActive ? <Circle className="h-4 w-4 fill-white" /> : <Lock className="h-4 w-4" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold text-muted-foreground">Milestone {idx + 1}</span>
                          <MilestoneStatusPill status={ms.status} />
                          {isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold px-2 py-0.5">
                              <Clock className="h-2.5 w-2.5" />{ms.dueDate}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-foreground truncate">{ms.title}</p>
                        {!isLocked && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">{doneTaskCount}/{ms.tasks.length} tasks</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-foreground">{ms.amount}</p>
                        <p className="text-[10px] text-muted-foreground">{ms.percentage}% dari total</p>
                      </div>

                      {!isLocked && (isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />)}
                    </button>

                    {/* Expanded content */}
                    {isExpanded && !isLocked && (
                      <div className="border-t border-border/30">
                        {/* Task checklist */}
                        <div className="p-4 sm:p-5 space-y-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Checklist Pengerjaan</p>
                          {ms.tasks.map((task) => (
                            <label key={task.id} className="flex items-center gap-3 cursor-pointer group">
                              <div
                                onClick={() => !isDone && toggleTask(ms.id, task.id)}
                                className={`h-4.5 w-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                  task.done ? "bg-emerald-500 border-emerald-500" : "border-border group-hover:border-primary"
                                } ${isDone ? "cursor-default" : "cursor-pointer"}`}
                              >
                                {task.done && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className={`text-xs ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{task.name}</span>
                            </label>
                          ))}
                        </div>

                        {/* Deliverable hint */}
                        <div className="px-4 sm:px-5 pb-4">
                          <div className="rounded-xl bg-muted/40 border border-border/40 p-3 text-xs flex items-start gap-2">
                            <FileText className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-foreground">Yang diserahkan: </span>
                              <span className="text-muted-foreground">{ms.deliverableHint}</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions row */}
                        {isActive && !isSubmitOpen && (
                          <div className="px-4 sm:px-5 pb-4 flex items-center gap-2">
                            <button
                              onClick={() => setActiveSubmitId(ms.id)}
                              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
                            >
                              <UploadCloud className="h-3.5 w-3.5" />
                              Serahkan Hasil Karya
                            </button>
                          </div>
                        )}

                        {/* Next milestone hint */}
                        {isDone && idx < milestones.length - 1 && (
                          <div className="px-4 sm:px-5 pb-4">
                            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-500/10 rounded-xl px-3.5 py-2.5">
                              <CheckCircle2 className="h-4 w-4 shrink-0" />
                              Milestone selesai — lanjutkan ke <strong className="ml-1">{milestones[idx + 1]?.title}</strong>
                              <ArrowRight className="h-3.5 w-3.5 ml-auto shrink-0" />
                            </div>
                          </div>
                        )}

                        {/* ── SUBMIT DELIVERABLE PANEL ── */}
                        {isSubmitOpen && (
                          <div className="mx-4 sm:mx-5 mb-5 rounded-2xl border border-primary/20 bg-card overflow-hidden">
                            <div className="bg-primary/8 border-b border-primary/15 px-4 py-3 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UploadCloud className="h-4 w-4 text-primary" />
                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Penyerahan Hasil Karya</h4>
                              </div>
                              <button onClick={() => setActiveSubmitId(null)}><X className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                            </div>

                            {submitSuccess ? (
                              <div className="p-6 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h4 className="text-sm font-bold text-foreground">Berhasil Diserahkan!</h4>
                                <p className="text-xs text-muted-foreground">{project.clientName} akan meninjau dan melepaskan dana <strong>{ms.amount}</strong>.</p>
                              </div>
                            ) : (
                              <form onSubmit={handleSubmitDeliverable} className="p-4 sm:p-5 space-y-4">
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wide">Link File Deliverable</label>
                                  <input
                                    type="url" required value={deliverableUrl} onChange={(e) => setDeliverableUrl(e.target.value)}
                                    placeholder="https://figma.com/file/... atau https://github.com/..."
                                    className="h-10 w-full rounded-xl border border-border bg-muted/30 px-3.5 text-xs text-foreground focus:border-primary focus:outline-none focus:bg-background transition-colors"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-foreground uppercase tracking-wide">Catatan & Metodologi</label>
                                  <textarea
                                    rows={3} required value={deliverableNote} onChange={(e) => setDeliverableNote(e.target.value)}
                                    placeholder="Jelaskan apa yang sudah dikerjakan, keputusan teknis, dan hal yang perlu dicek klien..."
                                    className="w-full rounded-xl border border-border bg-muted/30 p-3 text-xs text-foreground focus:border-primary focus:outline-none focus:bg-background transition-colors resize-none"
                                  />
                                </div>
                                <div className="flex items-center justify-end gap-2 pt-1">
                                  <button type="button" onClick={() => setActiveSubmitId(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-muted">Batal</button>
                                  <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all">
                                    <Send className="h-3.5 w-3.5" />
                                    {isSubmitting ? "Mengirim..." : `Kirim & Minta Rilis ${ms.amount}`}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}

                        {/* ── COMMENT THREAD ── */}
                        <div className="border-t border-border/30 bg-muted/10 p-4 sm:p-5 space-y-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Diskusi Milestone</p>

                          {ms.comments.length > 0 ? (
                            <div className="space-y-3">
                              {ms.comments.map((c) => (
                                <div key={c.id} className={`flex items-start gap-2.5 ${c.role === "client" ? "flex-row-reverse" : ""}`}>
                                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${c.role === "freelancer" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                                    {c.avatar}
                                  </div>
                                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 space-y-1 ${c.role === "freelancer" ? "bg-primary/8 border border-primary/15" : "bg-card border border-border/60"}`}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold text-foreground">{c.author}</span>
                                      <span className="text-[10px] text-muted-foreground">{c.time}</span>
                                    </div>
                                    <p className="text-xs text-foreground leading-relaxed">{c.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">Belum ada diskusi. Tanyakan sesuatu ke klien!</p>
                          )}

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newCommentText[ms.id] || ""}
                              onChange={(e) => setNewCommentText((p) => ({ ...p, [ms.id]: e.target.value }))}
                              onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(ms.id); }}
                              placeholder="Tulis pesan ke klien..."
                              className="flex-1 h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all"
                            />
                            <button onClick={() => handleAddComment(ms.id)} className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white hover:bg-primary/90 shrink-0 transition-colors">
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

            {/* Right: Sidebar */}
            <div className="space-y-4">
              {/* Freelancer Card */}
              {project.assignedFreelancer && (
                <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
                  <div className="p-4 border-b border-border/40 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Freelancer Partner</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      <UserCheck className="h-3 w-3" />Aktif
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/15 text-primary font-bold text-base flex items-center justify-center shrink-0 border-2 border-primary/20">
                        {project.assignedFreelancer.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{project.assignedFreelancer.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{project.assignedFreelancer.role}</p>
                        {project.assignedFreelancer.university && (
                          <p className="text-[10px] text-primary font-semibold mt-0.5 truncate">{project.assignedFreelancer.university}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mt-1">
                          <Star className="h-3 w-3 fill-amber-500" />{project.assignedFreelancer.rating}
                          <span className="text-muted-foreground font-normal">• {project.assignedFreelancer.completedProjects} proyek</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => alert("Membuka pesan...")} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-all">
                        <MessageSquare className="h-3.5 w-3.5" />Kirim Pesan
                      </button>
                      <Link href="/client/talent" className="inline-flex items-center justify-center rounded-xl border border-border bg-muted/40 hover:bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors">
                        Profil
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Portfolio & Career Impact */}
              {project.assignedFreelancer && (
                <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-card overflow-hidden">
                  <div className="p-4 border-b border-amber-500/15 flex items-center gap-2">
                    <Award className="h-4 w-4 text-amber-600" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Dampak Karir & Portfolio</span>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/15 p-3 text-xs text-foreground leading-relaxed">
                      {project.assignedFreelancer.portfolioGoal}
                    </div>
                    <div className="space-y-2 text-xs">
                      {[
                        { label: "XP diperoleh saat selesai", value: `+${project.xpReward} XP`, color: "text-amber-600" },
                        { label: "Skill Badge terbuka", value: `${project.skills[0]} Verified`, color: "text-primary" },
                        { label: "Review klien terverifikasi", value: "Tampil di Profil", color: "text-emerald-600" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-muted-foreground">{label}</span>
                          <span className={`font-bold ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-3 leading-relaxed">
                      Karya ini akan otomatis tampil sebagai <strong className="text-foreground">studi kasus terverifikasi</strong> di profil publik kamu setelah proyek selesai.
                    </p>
                  </div>
                </div>
              )}

              {/* Client info */}
              <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Klien</p>
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-foreground shrink-0">
                    {project.clientAvatar}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{project.clientName}</p>
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />Klien Terverifikasi
                    </span>
                  </div>
                </div>
              </div>

              {/* Project stats mini */}
              <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statistik Proyek</p>
                {[
                  { icon: <TrendingUp className="h-3.5 w-3.5 text-primary" />, label: "Milestone selesai", value: `${completedCount}/${milestones.length}` },
                  { icon: <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />, label: "Task dikerjakan", value: `${completedTasks}/${totalTasks}` },
                  { icon: <BarChart3 className="h-3.5 w-3.5 text-amber-600" />, label: "Progress keseluruhan", value: `${progress}%` },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {icon}{label}
                    </div>
                    <span className="font-bold text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: TIMELINE GANTT ── */}
        {activeTab === "timeline" && (
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
              <div>
                <h2 className="text-sm font-bold text-foreground">Sprint Gantt Chart</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Klik task untuk menggeser jadwal</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-xl border border-border bg-muted/30 p-0.5 text-xs font-semibold">
                  {(["daily", "weekly"] as const).map((r) => (
                    <button key={r} onClick={() => setGanttRange(r)} className={`rounded-lg px-3 py-1.5 capitalize transition-all ${ganttRange === r ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"}`}>
                      {r === "daily" ? "Harian" : "Mingguan"}
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsAddingTask(!isAddingTask)} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary/90">
                  <Plus className="h-3.5 w-3.5" />Tambah Task
                </button>
              </div>
            </div>

            {/* Pending shift form */}
            {selectedTaskToMove && (
              <form onSubmit={handleSubmitShift} className="m-5 rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">Geser: &ldquo;{selectedTaskToMove.name}&rdquo;</span>
                  </div>
                  <button type="button" onClick={() => setSelectedTaskToMove(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 2, 3, 5, -1].map((d) => (
                    <button key={d} type="button" onClick={() => handleQuickShift(d)} className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted">
                      {d > 0 ? `+${d}` : d} Hari
                    </button>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <input type="date" value={shiftStartStr} onChange={(e) => setShiftStartStr(e.target.value)} className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none" required />
                  <input type="date" value={shiftEndStr} onChange={(e) => setShiftEndStr(e.target.value)} className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none" required />
                </div>
                <input type="text" value={shiftNote} onChange={(e) => setShiftNote(e.target.value)} placeholder="Alasan pergeseran..." className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none" />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setSelectedTaskToMove(null)} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">Batal</button>
                  <button type="submit" className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90">Ajukan ke Freelancer</button>
                </div>
              </form>
            )}

            {/* Add task form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="m-5 rounded-xl border border-primary/25 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Tambah Task Baru</span>
                  <button type="button" onClick={() => setIsAddingTask(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                  <input type="text" value={newTaskName} onChange={(e) => setNewTaskName(e.target.value)} placeholder="Nama task..." className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none" required />
                  <input type="date" value={newTaskStart} onChange={(e) => setNewTaskStart(e.target.value)} className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none" required />
                  <input type="date" value={newTaskEnd} onChange={(e) => setNewTaskEnd(e.target.value)} className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none" required />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setIsAddingTask(false)} className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted">Batal</button>
                  <button type="submit" className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary/90">Kirim Ajuan</button>
                </div>
              </form>
            )}

            {/* Gantt chart */}
            <div className="p-5 pt-0">
              <div className="w-full overflow-hidden rounded-xl border border-border">
                <GanttProvider key={ganttRange} className="h-[400px] w-full" range={ganttRange} zoom={100} startDate={new Date("2026-03-01")} endDate={new Date("2026-03-21")} todayDate={new Date("2026-03-06")}>
                  <GanttSidebar>
                    {features.map((f) => <GanttSidebarItem key={f.id} feature={f} onClick={handleOpenMoveModal} />)}
                  </GanttSidebar>
                  <GanttTimeline>
                    <GanttHeader />
                    <GanttFeatureList>
                      {features.map((f) => <GanttFeatureItem key={f.id} {...f} onClick={handleOpenMoveModal} />)}
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

        {/* ── TAB: FILES ── */}
        {activeTab === "files" && (
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-foreground mb-1">File & Deliverable</h2>
              <p className="text-xs text-muted-foreground">Semua file yang diserahkan oleh freelancer akan muncul di sini.</p>
            </div>

            <div className="space-y-4">
              {milestones.map((ms) => (
                <div key={ms.id} className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${ms.status === "Completed" ? "border-emerald-500/25 bg-emerald-500/4" : "border-border/50 bg-muted/10"}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MilestoneStatusPill status={ms.status} />
                      <span className="text-xs font-bold text-foreground">{ms.title}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground">{ms.amount}</span>
                  </div>

                  {ms.status === "Completed" ? (
                    <div className="flex items-center gap-3 rounded-xl bg-card border border-border/60 p-3 text-xs">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">Figma Design System — 47 Komponen</p>
                        <p className="text-muted-foreground mt-0.5">Diserahkan 5 Mar 2026 · Disetujui klien</p>
                      </div>
                      <button className="text-primary hover:underline font-semibold">Lihat</button>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                      {ms.status === "Locked" ? "Milestone belum terbuka." : "Menunggu penyerahan dari freelancer."}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payment Gateway & Escrow Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        projectId={projectId}
        projectTitle={project.title}
        amount={parseInt(project.budget.replace(/\D/g, "") || "5000000", 10)}
        onSuccess={() => {
          // Success state displayed in modal
        }}
      />
    </div>
  );
}
