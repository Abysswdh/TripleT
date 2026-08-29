"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  Users,
  CheckCircle2,
  Plus,
  Layers,
  MessageSquare,
  X,
  UserCheck,
  Check,
  AlertTriangle,
  Edit3
} from "lucide-react";
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

// Predefined status constants
const STATUS_ACTIVE: GanttStatus = { id: "active", name: "In Progress", color: "#3b82f6" };
const STATUS_DONE: GanttStatus = { id: "done", name: "Completed", color: "#10b981" };
const STATUS_REVIEW: GanttStatus = { id: "review", name: "In Review", color: "#f59e0b" };
const STATUS_PLANNED: GanttStatus = { id: "planned", name: "Planned", color: "#8b5cf6" };

interface ProjectDetailData {
  id: string;
  title: string;
  category: string;
  budget: string;
  escrowSecured: string;
  proposalsCount: number;
  status: "Hiring" | "In Progress" | "Completed";
  dueDate: string;
  description: string;
  skills: string[];
  difficulty: "Starter" | "Standard" | "Enterprise";
  clientName: string;
  assignedFreelancer?: {
    name: string;
    role: string;
    avatar: string;
    rating: number;
    completedProjects: number;
    portfolioGoal: string;
  };
  milestones: Array<{
    id: string;
    title: string;
    amount: string;
    percentage: number;
    status: "Completed" | "In Progress" | "Locked";
    dueDate: string;
  }>;
  initialFeatures: GanttFeature[];
}

const PROJECTS_DATA: Record<string, ProjectDetailData> = {
  "proj-1": {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile App Development",
    budget: "Rp 6.500.000",
    escrowSecured: "Rp 6.500.000 (100% Escrow Protected)",
    proposalsCount: 8,
    status: "In Progress",
    dueDate: "14 hari sprint",
    description:
      "Redesign UI/UX komprehensif aplikasi mobile toko online ke Flutter modern dengan state management Riverpod, payment gateway Midtrans, dan push notification.",
    skills: ["Flutter", "Dart", "Riverpod", "Figma", "REST API"],
    difficulty: "Starter",
    clientName: "PT FinTech Solusindo",
    assignedFreelancer: {
      name: "Budi Santoso",
      role: "Junior Mobile Developer (Portfolio Quest)",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      rating: 4.9,
      completedProjects: 6,
      portfolioGoal: "Membangun portfolio showcase Flutter e-commerce siap kerja",
    },
    milestones: [
      {
        id: "ms-1",
        title: "Milestone 1: Design System & Wireframe UI",
        amount: "Rp 2.000.000",
        percentage: 30,
        status: "Completed",
        dueDate: "05 Mar 2026",
      },
      {
        id: "ms-2",
        title: "Milestone 2: Riverpod State & Product Flow",
        amount: "Rp 2.500.000",
        percentage: 40,
        status: "In Progress",
        dueDate: "12 Mar 2026",
      },
      {
        id: "ms-3",
        title: "Milestone 3: Payment Midtrans & Portfolio Review",
        amount: "Rp 2.000.000",
        percentage: 30,
        status: "Locked",
        dueDate: "18 Mar 2026",
      },
    ],
    initialFeatures: [
      {
        id: "f-1",
        name: "Discovery & Setup Figma Kit",
        startAt: new Date("2026-03-01"),
        endAt: new Date("2026-03-04"),
        status: STATUS_DONE,
      },
      {
        id: "f-2",
        name: "Riverpod Boilerplate & Auth UI",
        startAt: new Date("2026-03-04"),
        endAt: new Date("2026-03-08"),
        status: STATUS_ACTIVE,
      },
      {
        id: "f-3",
        name: "Product Catalog & Cart Flow",
        startAt: new Date("2026-03-08"),
        endAt: new Date("2026-03-13"),
        status: STATUS_PLANNED,
      },
      {
        id: "f-4",
        name: "Midtrans Snap & Final Testing",
        startAt: new Date("2026-03-13"),
        endAt: new Date("2026-03-18"),
        status: STATUS_PLANNED,
      },
    ],
  },
  "proj-2": {
    id: "proj-2",
    title: "AI Chatbot Integration for Customer Support",
    category: "AI & Machine Learning",
    budget: "Rp 5.500.000",
    escrowSecured: "Rp 5.500.000 (100% Escrow Protected)",
    proposalsCount: 4,
    status: "In Progress",
    dueDate: "10 hari sprint",
    description:
      "Integrasi LLM OpenAI / LangChain untuk knowledge base internal customer support CS 24/7 dengan vector database Pinecone.",
    skills: ["Python", "FastAPI", "OpenAI API", "Pinecone", "LangChain"],
    difficulty: "Starter",
    clientName: "Nexa Corporation",
    assignedFreelancer: {
      name: "Dimas Arya Pratama",
      role: "AI Engineer Aspirant",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: 5.0,
      completedProjects: 8,
      portfolioGoal: "Showcase implementasi RAG pipeline dengan FastAPI",
    },
    milestones: [
      {
        id: "ms-1",
        title: "Milestone 1: Vector DB Pinecone & Ingestion",
        amount: "Rp 2.200.000",
        percentage: 40,
        status: "Completed",
        dueDate: "04 Mar 2026",
      },
      {
        id: "ms-2",
        title: "Milestone 2: RAG Pipeline & FastAPI Endpoint",
        amount: "Rp 2.200.000",
        percentage: 40,
        status: "In Progress",
        dueDate: "10 Mar 2026",
      },
      {
        id: "ms-3",
        title: "Milestone 3: Evaluation & Documentation",
        amount: "Rp 1.100.000",
        percentage: 20,
        status: "Locked",
        dueDate: "15 Mar 2026",
      },
    ],
    initialFeatures: [
      {
        id: "f-1",
        name: "Vector Ingestion & Embedding",
        startAt: new Date("2026-03-01"),
        endAt: new Date("2026-03-04"),
        status: STATUS_DONE,
      },
      {
        id: "f-2",
        name: "LangChain RAG Logic",
        startAt: new Date("2026-03-04"),
        endAt: new Date("2026-03-09"),
        status: STATUS_ACTIVE,
      },
      {
        id: "f-3",
        name: "FastAPI Endpoint & QA",
        startAt: new Date("2026-03-09"),
        endAt: new Date("2026-03-14"),
        status: STATUS_PLANNED,
      },
    ],
  },
  "proj-3": {
    id: "proj-3",
    title: "Landing Page & Brand Design System",
    category: "UI/UX & Product Design",
    budget: "Rp 3.500.000",
    escrowSecured: "Rp 3.500.000 (100% Selesai)",
    proposalsCount: 12,
    status: "Completed",
    dueDate: "7 hari sprint",
    description:
      "Pembuatan visual identity, Figma component tokens, responsive landing page Next.js, dan aset promosi digital marketing.",
    skills: ["Figma", "UI/UX", "Tailwind CSS", "Design System"],
    difficulty: "Starter",
    clientName: "Studio Kreatif ID",
    assignedFreelancer: {
      name: "Siti Rahmawati",
      role: "Junior UI/UX Designer",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      rating: 4.95,
      completedProjects: 12,
      portfolioGoal: "Design system showcase untuk landing page portofolio",
    },
    milestones: [
      {
        id: "ms-1",
        title: "Milestone 1: Brand Tokens & Moodboard",
        amount: "Rp 1.500.000",
        percentage: 40,
        status: "Completed",
        dueDate: "03 Mar 2026",
      },
      {
        id: "ms-2",
        title: "Milestone 2: High-Fi Responsive Figma Kit",
        amount: "Rp 2.000.000",
        percentage: 60,
        status: "Completed",
        dueDate: "08 Mar 2026",
      },
    ],
    initialFeatures: [
      {
        id: "f-1",
        name: "Moodboard & Typography Tokens",
        startAt: new Date("2026-03-01"),
        endAt: new Date("2026-03-04"),
        status: STATUS_DONE,
      },
      {
        id: "f-2",
        name: "Component Library & Auto-Layout",
        startAt: new Date("2026-03-04"),
        endAt: new Date("2026-03-08"),
        status: STATUS_DONE,
      },
    ],
  },
};

export default function ClientProjectDetailPage() {
  const params = useParams();
  const projectId = (params?.id as string) || "proj-1";

  // Fallback to proj-1 if ID is unrecognized
  const project = useMemo(() => {
    return (
      PROJECTS_DATA[projectId] || {
        ...PROJECTS_DATA["proj-1"],
        id: projectId,
        title: `Proyek: ${projectId.toUpperCase()}`,
      }
    );
  }, [projectId]);

  // Gantt State (Daily / Weekly focused)
  const [features, setFeatures] = useState<GanttFeature[]>(project.initialFeatures);
  const [range, setRange] = useState<"daily" | "weekly">("daily");

  // Selected task to move/shift/reschedule
  const [selectedTaskToMove, setSelectedTaskToMove] = useState<GanttFeature | null>(null);
  const [shiftStartStr, setShiftStartStr] = useState("");
  const [shiftEndStr, setShiftEndStr] = useState("");
  const [shiftNote, setShiftNote] = useState("Menyesuaikan waktu pengerjaan agar milestone lebih optimal.");

  // Proposed change state (Mutual approval workflow)
  const [pendingChange, setPendingChange] = useState<{
    targetTaskId?: string;
    taskName: string;
    oldStart?: Date;
    oldEnd?: Date;
    newStart: Date;
    newEnd: Date;
    note: string;
    isNewTask?: boolean;
  } | null>(null);
  const [changeApprovedToast, setChangeApprovedToast] = useState(false);

  // New task drawer state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskStartDate, setNewTaskStartDate] = useState("2026-03-08");
  const [newTaskEndDate, setNewTaskEndDate] = useState("2026-03-14");
  const [proposalNote, setProposalNote] = useState(
    "Menyesuaikan target integrasi modul agar freelancer punya waktu persiapan testing."
  );

  // When clicking on a task to move/shift
  const handleOpenMoveModal = (task: GanttFeature) => {
    setSelectedTaskToMove(task);
    const s = new Date(task.startAt).toISOString().slice(0, 10);
    const e = new Date(task.endAt).toISOString().slice(0, 10);
    setShiftStartStr(s);
    setShiftEndStr(e);
  };

  // Quick shift by days (+1, +2, +3, -1, -2)
  const handleQuickShiftDays = (days: number) => {
    if (!shiftStartStr || !shiftEndStr) return;
    const s = new Date(shiftStartStr);
    const e = new Date(shiftEndStr);
    s.setDate(s.getDate() + days);
    e.setDate(e.getDate() + days);
    setShiftStartStr(s.toISOString().slice(0, 10));
    setShiftEndStr(e.toISOString().slice(0, 10));
  };

  // Submit move/shift proposal
  const handleSubmitShiftProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskToMove) return;

    const newStart = new Date(shiftStartStr);
    const newEnd = new Date(shiftEndStr);

    // Update the task to show pending draft state
    setFeatures((prev) =>
      prev.map((f) =>
        f.id === selectedTaskToMove.id
          ? {
              ...f,
              startAt: newStart,
              endAt: newEnd,
              isPendingApproval: true,
              approvalNote: shiftNote,
            }
          : f
      )
    );

    setPendingChange({
      targetTaskId: selectedTaskToMove.id,
      taskName: selectedTaskToMove.name,
      oldStart: selectedTaskToMove.startAt,
      oldEnd: selectedTaskToMove.endAt,
      newStart,
      newEnd,
      note: shiftNote,
      isNewTask: false,
    });

    setSelectedTaskToMove(null);
  };

  // Handle Client proposing a brand new task
  const handleSubmitNewTaskProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    const start = new Date(newTaskStartDate);
    const end = new Date(newTaskEndDate);

    const pendingTask: GanttFeature = {
      id: `pending-${Date.now()}`,
      name: newTaskName.trim(),
      startAt: start,
      endAt: end,
      status: STATUS_REVIEW,
      isPendingApproval: true,
      approvalNote: proposalNote,
    };

    setFeatures([...features, pendingTask]);
    setPendingChange({
      targetTaskId: pendingTask.id,
      taskName: newTaskName.trim(),
      newStart: start,
      newEnd: end,
      note: proposalNote,
      isNewTask: true,
    });

    setNewTaskName("");
    setIsAddingTask(false);
  };

  // Simulate Freelancer approving the change
  const handleFreelancerApproveChange = () => {
    setFeatures((prev) =>
      prev.map((f) =>
        f.isPendingApproval
          ? {
              ...f,
              isPendingApproval: false,
              status: STATUS_ACTIVE,
            }
          : f
      )
    );
    setPendingChange(null);
    setChangeApprovedToast(true);
    setTimeout(() => setChangeApprovedToast(false), 4000);
  };

  // Simulate Freelancer rejecting the change
  const handleFreelancerDeclineChange = () => {
    if (pendingChange?.isNewTask) {
      setFeatures((prev) => prev.filter((f) => f.id !== pendingChange.targetTaskId));
    } else if (pendingChange?.oldStart && pendingChange?.oldEnd) {
      setFeatures((prev) =>
        prev.map((f) =>
          f.id === pendingChange.targetTaskId
            ? {
                ...f,
                startAt: pendingChange.oldStart!,
                endAt: pendingChange.oldEnd!,
                isPendingApproval: false,
              }
            : f
        )
      );
    }
    setPendingChange(null);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
      {/* 1. TOP NAVIGATION & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-6">
        <div className="space-y-2">
          <Link
            href="/client/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-foreground hover:bg-muted hover:text-primary transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Kembali ke Daftar Proyek Saya</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {project.title}
            </h1>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-bold shrink-0 ${
                project.status === "In Progress"
                  ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  : project.status === "Completed"
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROJECT METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Total Anggaran Proyek
          </span>
          <p className="text-xl font-bold text-primary">{project.budget}</p>
          <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Escrow Terproteksi 100%</span>
          </span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Kategori & Skala
          </span>
          <p className="text-sm font-bold text-foreground truncate">{project.category}</p>
          <span className="text-[11px] text-muted-foreground font-medium">Fokus: Starter Portfolio Quest</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Sprint Durasi
          </span>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span>{project.dueDate}</span>
          </p>
          <span className="text-[11px] text-muted-foreground">Sprint 14 Hari Kalender</span>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Freelancer Partner
          </span>
          <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" />
            <span className="truncate">{project.assignedFreelancer?.name || "Menunggu Seleksi"}</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Kolaborasi Aktif</span>
        </div>
      </div>

      {/* 3. MUTUAL APPROVAL ALERT BANNER (If change proposed) */}
      {pendingChange && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
                <span>Perubahan Jadwal Diajukan: Menunggu Persetujuan Freelancer</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  Mutual Agreement Protocol
                </span>
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                Klien mengajukan penyesuaian jadwal pada task <strong>&ldquo;{pendingChange.taskName}&rdquo;</strong>.
                {pendingChange.oldStart && pendingChange.oldEnd && (
                  <span className="ml-1 font-medium text-foreground">
                    (Semula: {new Date(pendingChange.oldStart).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – {new Date(pendingChange.oldEnd).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} &rarr; Menjadi: {new Date(pendingChange.newStart).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – {new Date(pendingChange.newEnd).toLocaleDateString("id-ID", { day: "numeric", month: "short" })})
                  </span>
                )}
              </p>
              <p className="text-[11px] text-amber-700/90 dark:text-amber-300/80 italic">
                Catatan: &ldquo;{pendingChange.note}&rdquo;
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto bg-card/60 p-2 rounded-xl border border-amber-500/20">
            <span className="text-[11px] font-bold text-muted-foreground hidden lg:inline">Simulasi Freelancer:</span>
            <button
              onClick={handleFreelancerApproveChange}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Setujui (Approve)</span>
            </button>
            <button
              onClick={handleFreelancerDeclineChange}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground px-2.5 py-1.5 text-xs font-semibold transition-colors"
            >
              <X className="h-3.5 w-3.5" />
              <span>Tolak</span>
            </button>
          </div>
        </div>
      )}

      {/* Success notification banner */}
      {changeApprovedToast && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Perubahan jadwal telah disepakati bersama oleh Klien dan Freelancer! Timeline Gantt Chart telah diperbarui.</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
            Tersinkronisasi
          </span>
        </div>
      )}

      {/* 4. WORK ORGANIZER & GANTT CHART SECTION */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-6">
        {/* Gantt Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-primary">
              <Layers className="h-4 w-4" />
              <span>WORK ORGANIZER & SPRINT GANTT CHART</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">
              Jadwal Pengerjaan Sprint Proyek
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Range Toggle (Daily / Weekly) */}
            <div className="flex items-center rounded-xl border border-border bg-muted/30 p-1 text-xs font-semibold">
              <button
                onClick={() => setRange("daily")}
                className={`rounded-lg px-3 py-1 transition-all ${
                  range === "daily" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Harian (Daily)
              </button>
              <button
                onClick={() => setRange("weekly")}
                className={`rounded-lg px-3 py-1 transition-all ${
                  range === "weekly" ? "bg-background text-foreground shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mingguan (Weekly)
              </button>
            </div>

            {/* Propose New Task Button */}
            <button
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-102"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Task Baru</span>
            </button>
          </div>
        </div>

        {/* 4A. Modal / Drawer to Shift Existing Task Dates */}
        {selectedTaskToMove && (
          <form
            onSubmit={handleSubmitShiftProposal}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4 animate-in zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Geser Jadwal Task: &ldquo;{selectedTaskToMove.name}&rdquo;
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaskToMove(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Shift Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">Aksi Cepat Geser Hari:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickShiftDays(1)}
                  className="rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                >
                  +1 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickShiftDays(2)}
                  className="rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                >
                  +2 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickShiftDays(3)}
                  className="rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                >
                  +3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickShiftDays(5)}
                  className="rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                >
                  +5 Hari
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickShiftDays(-1)}
                  className="rounded-lg border border-border bg-card hover:bg-muted px-2.5 py-1 text-xs font-medium text-foreground transition-colors"
                >
                  -1 Hari
                </button>
              </div>
            </div>

            {/* Precise Date Pickers */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Tanggal Mulai Baru</label>
                <input
                  type="date"
                  value={shiftStartStr}
                  onChange={(e) => setShiftStartStr(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Tanggal Selesai Baru</label>
                <input
                  type="date"
                  value={shiftEndStr}
                  onChange={(e) => setShiftEndStr(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">
                Alasan Pergeseran untuk Freelancer
              </label>
              <input
                type="text"
                value={shiftNote}
                onChange={(e) => setShiftNote(e.target.value)}
                placeholder="Misal: Penyesuaian waktu review API atau kebutuhan brief tambahan..."
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground">
                Pergeseran jadwal akan dikonfirmasi ke freelancer partner.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTaskToMove(null)}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                >
                  Ajukan Pergeseran ke Freelancer
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 4B. Form to Propose a Brand New Task */}
        {isAddingTask && (
          <form
            onSubmit={handleSubmitNewTaskProposal}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Tambah Task / Milestone Baru ke Sprint
                </h4>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Memerlukan Approval Freelancer
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Nama Task / Deliverable</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  placeholder="Contoh: Integrasi Riverpod & Auth State"
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Target Tanggal Mulai</label>
                <input
                  type="date"
                  value={newTaskStartDate}
                  onChange={(e) => setNewTaskStartDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-foreground block mb-1">Target Tanggal Selesai</label>
                <input
                  type="date"
                  value={newTaskEndDate}
                  onChange={(e) => setNewTaskEndDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground block mb-1">
                Catatan untuk Freelancer <span className="text-muted-foreground font-normal">(Opsional)</span>
              </label>
              <input
                type="text"
                value={proposalNote}
                onChange={(e) => setProposalNote(e.target.value)}
                placeholder="Jelaskan detail task baru..."
                className="h-10 w-full rounded-xl border border-border bg-card px-3 text-xs focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground">
                Task baru akan dikirimkan ke ruang koordinasi freelancer.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                >
                  Kirim Ajuan ke Freelancer
                </button>
              </div>
            </div>
          </form>
        )}

        {/* The Interactive Gantt Chart Canvas */}
        <div className="w-full overflow-hidden rounded-2xl border border-border shadow-xs">
          <GanttProvider
            key={range}
            className="h-[420px] w-full rounded-2xl"
            range={range}
            zoom={100}
            startDate={new Date("2026-03-01")}
            endDate={new Date("2026-03-21")}
            todayDate={new Date("2026-03-06")}
          >
            <GanttSidebar>
              {features.map((feature) => (
                <GanttSidebarItem
                  key={feature.id}
                  feature={feature}
                  onClick={handleOpenMoveModal}
                />
              ))}
            </GanttSidebar>
            <GanttTimeline>
              <GanttHeader />
              <GanttFeatureList>
                {features.map((feature) => (
                  <GanttFeatureItem
                    key={feature.id}
                    {...feature}
                    onClick={handleOpenMoveModal}
                  />
                ))}
              </GanttFeatureList>
              <GanttToday />
            </GanttTimeline>
          </GanttProvider>
        </div>

        {/* Legend & Hint */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-foreground">Status:</span>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Selesai (Completed)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>Sedang Dikerjakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>Menunggu Review / Approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span>Direncanakan</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. FREELANCER WORKSPACE & MILESTONES PROGRESS */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Milestones Escrow Breakdown */}
        <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Tahapan Milestone & Pembayaran Escrow</h3>
              <p className="text-xs text-muted-foreground">Dana dicairkan bertahap setelah deliverables disetujui klien.</p>
            </div>
            <span className="text-xs font-bold text-primary">3 Milestone</span>
          </div>

          <div className="space-y-3 pt-1">
            {project.milestones.map((ms) => (
              <div
                key={ms.id}
                className={`rounded-2xl border p-4 transition-all ${
                  ms.status === "Completed"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : ms.status === "In Progress"
                    ? "border-blue-500/30 bg-blue-500/5"
                    : "border-border/60 bg-muted/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground">{ms.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          ms.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : ms.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ms.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tenggat Waktu: {ms.dueDate}</p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-sm font-bold text-foreground block">{ms.amount}</span>
                      <span className="text-[10px] text-muted-foreground">({ms.percentage}% dari total)</span>
                    </div>

                    {ms.status === "In Progress" && (
                      <button
                        onClick={() => alert("Deliverable dalam tahap review. Dana akan dicairkan saat verifikasi selesai.")}
                        className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                      >
                        Tinjau Deliverable
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Assigned Freelancer & Portfolio Goal */}
        <div className="space-y-6">
          {project.assignedFreelancer ? (
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Freelancer Partner
                </span>
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Aktif Bekerja</span>
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <img
                  src={project.assignedFreelancer.avatar}
                  alt={project.assignedFreelancer.name}
                  className="h-12 w-12 rounded-full object-cover border border-primary/20"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-foreground truncate">
                    {project.assignedFreelancer.name}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">{project.assignedFreelancer.role}</p>
                  <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mt-0.5">
                    <span>★ {project.assignedFreelancer.rating}</span>
                    <span className="text-muted-foreground">• {project.assignedFreelancer.completedProjects} Proyek Sukses</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/50 pt-3 flex gap-2">
                <button
                  onClick={() => alert("Membuka ruang koordinasi dan pesan instan bersama freelancer...")}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Kirim Pesan</span>
                </button>
                <Link
                  href="/client/talent"
                  className="inline-flex items-center justify-center rounded-xl border border-border bg-muted/40 hover:bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-colors"
                >
                  <span>Profil</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-6 text-center space-y-3">
              <Users className="mx-auto h-8 w-8 text-muted-foreground" />
              <h4 className="text-sm font-bold text-foreground">Menunggu Seleksi Pelamar</h4>
              <p className="text-xs text-muted-foreground">
                Terdapat {project.proposalsCount} proposal masuk dari talenta terverifikasi.
              </p>
              <Link
                href="/client/projects"
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <span>Tinjau Proposal Masuk</span>
              </Link>
            </div>
          )}

          {/* Tech Stack Box */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Tech Stack & Keahlian Terkait
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {project.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
