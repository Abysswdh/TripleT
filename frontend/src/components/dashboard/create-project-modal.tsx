"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  X,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Send,
  Smartphone,
  Palette,
  Bot,
  Globe,
  Database,
  Calendar,
  Clock,
  Check,
  Plus,
  Trash2,
  FileCode,
  Link as LinkIcon,
  CreditCard,
  Building2,
  QrCode,
  Users,
  Lock,
  Star,
  CheckSquare,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import logoWithoutText from "@/assets/logo_wo_text.svg";

// Dynamically import Silk with SSR disabled so WebGL canvas initializes cleanly on client
const Silk = dynamic(() => import("@/components/ui/silk"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-[#120B54] via-[#1E1794] to-[#2C1BDE] animate-pulse" />
  ),
});

const TOTAL_STEPS = 6;

const STEP_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Info & Klasifikasi Proyek",
    desc: "Tentukan judul, kategori keahlian, skala kesulitan, dan mode visibilitas rekrutmen proyek.",
  },
  2: {
    title: "Scope & Fitur Deliverables",
    desc: "Jelaskan latar belakang kebutuhan, checklist fitur utama, dan target pengguna akhir.",
  },
  3: {
    title: "Tech Stack & Kriteria Talenta",
    desc: "Pilih teknologi yang digunakan, tingkat pengalaman talenta, dan pertanyaan skrining.",
  },
  4: {
    title: "Referensi & Serah Terima",
    desc: "Lampirkan link desain atau repositori serta tentukan format serah terima dan batas revisi.",
  },
  5: {
    title: "Timeline & Gantt Roadmap",
    desc: "Tentukan target durasi sprint dan tinjau pembagian tugas Gantt chart otomatis.",
  },
  6: {
    title: "Budget & Proteksi Escrow",
    desc: "Atur alokasi anggaran, simulasi milestone escrow, dan preferensi metode pembayaran aman.",
  },
  7: {
    title: "Proyek Siap Dipublikasikan!",
    desc: "Proyekmu kini aktif dalam status hiring dan siap menerima proposal serta undangan langsung.",
  },
};

const CATEGORIES = [
  { id: "Mobile App Development", label: "Mobile App", icon: Smartphone, desc: "Flutter, React Native, Swift" },
  { id: "Web Development", label: "Web Development", icon: Globe, desc: "Next.js, React, Vue, Laravel" },
  { id: "UI/UX & Product Design", label: "UI/UX Design", icon: Palette, desc: "Figma, Wireframe, Prototype" },
  { id: "AI & Machine Learning", label: "AI & Machine Learning", icon: Bot, desc: "OpenAI, LangChain, Python" },
  { id: "Backend & API Engineering", label: "Backend API", icon: Database, desc: "FastAPI, Node.js, Go, PostgreSQL" },
];

const POPULAR_SKILLS = [
  "Flutter",
  "React",
  "Next.js",
  "TypeScript",
  "Figma",
  "Tailwind CSS",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "OpenAI API",
  "Node.js",
  "UI/UX",
  "REST API",
  "Docker",
];

export interface GanttTaskDraft {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  milestonePhase: "Milestone 1" | "Milestone 2";
}

export interface CreatedProject {
  id: string;
  title: string;
  category: string;
  budget: string;
  budgetNumeric: number;
  status: "Hiring" | "In Progress" | "Completed";
  proposalsCount: number;
  dueDate: string;
  postedDate: string;
  description: string;
  skills: string[];
  difficulty: "Starter" | "Standard" | "Enterprise";
  milestones?: Array<{
    id: string;
    title: string;
    amount: string;
    status: string;
    dueDate: string;
  }>;
  applicants?: unknown[];
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProject: CreatedProject) => void;
  initialData?: {
    title?: string;
    category?: string;
    description?: string;
    skills?: string[];
    budget?: string;
    durationDays?: string;
    difficulty?: "Starter" | "Standard" | "Enterprise";
  };
}

// Quick helper to calculate dates for Gantt sprint generator
function computeSprintTasks(category: string, durationDays: number): GanttTaskDraft[] {
  const parsedDays = Math.max(3, durationDays || 14);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const p1Days = Math.max(2, Math.round(parsedDays * 0.35));
  const p2Days = Math.max(2, parsedDays - p1Days);

  const d1Start = new Date(now);
  const d1End = new Date(d1Start.getTime() + (p1Days - 1) * dayMs);

  const d2Start = new Date(d1End.getTime() + dayMs);
  const d2End = new Date(now.getTime() + (parsedDays - 1) * dayMs);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  if (category === "Mobile App Development") {
    return [
      {
        id: "task-1",
        name: "Discovery, Wireframing & App Architecture",
        startDate: fmt(d1Start),
        endDate: fmt(d1End),
        milestonePhase: "Milestone 1",
      },
      {
        id: "task-2",
        name: "State Management & Core Features Sprint",
        startDate: fmt(d2Start),
        endDate: fmt(new Date(d2Start.getTime() + Math.round(p2Days * 0.55) * dayMs)),
        milestonePhase: "Milestone 2",
      },
      {
        id: "task-3",
        name: "Payment Midtrans, QA & APK Release Build",
        startDate: fmt(new Date(d2Start.getTime() + Math.round(p2Days * 0.55) * dayMs)),
        endDate: fmt(d2End),
        milestonePhase: "Milestone 2",
      },
    ];
  }

  if (category === "UI/UX & Product Design") {
    return [
      {
        id: "task-1",
        name: "Moodboard, User Flow & Lo-Fi Wireframe",
        startDate: fmt(d1Start),
        endDate: fmt(d1End),
        milestonePhase: "Milestone 1",
      },
      {
        id: "task-2",
        name: "Atomic Design System & Hi-Fi Components",
        startDate: fmt(d2Start),
        endDate: fmt(new Date(d2Start.getTime() + Math.round(p2Days * 0.5) * dayMs)),
        milestonePhase: "Milestone 2",
      },
      {
        id: "task-3",
        name: "Interactive Prototype & Dev Handoff Specs",
        startDate: fmt(new Date(d2Start.getTime() + Math.round(p2Days * 0.5) * dayMs)),
        endDate: fmt(d2End),
        milestonePhase: "Milestone 2",
      },
    ];
  }

  // Default Web Development / General Tech
  return [
    {
      id: "task-1",
      name: "Project Setup, UI Wireframe & Database Schema",
      startDate: fmt(d1Start),
      endDate: fmt(d1End),
      milestonePhase: "Milestone 1",
    },
    {
      id: "task-2",
      name: "Core Features Implementation & API Integration",
      startDate: fmt(d2Start),
      endDate: fmt(new Date(d2Start.getTime() + Math.round(p2Days * 0.6) * dayMs)),
      milestonePhase: "Milestone 2",
    },
    {
      id: "task-3",
      name: "Testing, Bugfixes, Handover & Deployment",
      startDate: fmt(new Date(d2Start.getTime() + Math.round(p2Days * 0.6) * dayMs)),
      endDate: fmt(d2End),
      milestonePhase: "Milestone 2",
    },
  ];
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State - Step 1: Info & Classification
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState<"Starter" | "Standard" | "Enterprise">("Starter");
  const [hiringMode, setHiringMode] = useState<"public" | "private">("public");

  // Form State - Step 2: Scope & Deliverables
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState<string[]>([
    "Setup arsitektur dan struktur komponen utama",
    "Integrasi API & state management responsif",
    "Dokumentasi instruksi deploy dan panduan source code",
  ]);
  const [newObjectiveInput, setNewObjectiveInput] = useState("");
  const [targetAudience, setTargetAudience] = useState("B2C / Pengguna Umum");

  // Form State - Step 3: Tech Stack & Talent Tier
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Next.js", "Tailwind CSS", "TypeScript"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"Junior" | "Intermediate" | "Senior">("Intermediate");
  const [screeningQuestion, setScreeningQuestion] = useState("Sertakan link portofolio proyek serupa yang pernah Anda kerjakan.");

  // Form State - Step 4: References & Handover Terms
  const [figmaUrl, setFigmaUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [freeRevisions, setFreeRevisions] = useState<"1x" | "2x" | "3x">("2x");
  const [requiredDeliverables, setRequiredDeliverables] = useState<string[]>([
    "Source Code Repository (GitHub/GitLab)",
    "File Desain Master (Figma Editor Link)",
    "Dokumentasi Teknis README",
  ]);

  // Form State - Step 5: Timeline & Gantt Tasks
  const [durationDays, setDurationDays] = useState("14");
  const [ganttTasks, setGanttTasks] = useState<GanttTaskDraft[]>([]);
  const [newTaskName, setNewTaskName] = useState("");

  // Form State - Step 6: Budget & Escrow Preference
  const [budget, setBudget] = useState("5000000");
  const [paymentMethodPreference, setPaymentMethodPreference] = useState<"va" | "qris" | "cc">("va");

  // Fast-Match Talent State (Step 7)
  const [invitedTalents, setInvitedTalents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update initial data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSubmitting(false);
      if (initialData) {
        if (initialData.title !== undefined) setTitle(initialData.title);
        if (initialData.category !== undefined) setCategory(initialData.category);
        if (initialData.description !== undefined) setDescription(initialData.description);
        if (initialData.skills !== undefined && initialData.skills.length > 0) setSelectedSkills(initialData.skills);
        if (initialData.budget !== undefined) setBudget(initialData.budget);
        if (initialData.durationDays !== undefined) setDurationDays(initialData.durationDays);
        if (initialData.difficulty !== undefined) setDifficulty(initialData.difficulty);
      }
      // Initialize Gantt tasks
      const days = parseInt(initialData?.durationDays || durationDays || "14", 10);
      setGanttTasks(computeSprintTasks(initialData?.category || category, days));
    }
  }, [isOpen, initialData]);

  // Matched talents demo list based on selected skills (Hook declared unconditionally)
  const matchedTalents = useMemo(
    () => [
      {
        id: "t-1",
        name: "Budi Santoso",
        role: `${category} Specialist`,
        skills: selectedSkills.slice(0, 3),
        rating: 4.9,
        reviewsCount: 14,
        matchScore: 98,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "t-2",
        name: "Annisa Rahmawati",
        role: "Senior Tech Freelancer",
        skills: selectedSkills.slice(1, 4),
        rating: 5.0,
        reviewsCount: 22,
        matchScore: 94,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "t-3",
        name: "Rian Hidayat",
        role: "Fullstack & UI Engineer",
        skills: [selectedSkills[0] || "TypeScript", "Tailwind CSS"],
        rating: 4.8,
        reviewsCount: 9,
        matchScore: 89,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
    ],
    [category, selectedSkills]
  );

  // Re-compute default Gantt tasks when category or duration changes
  const handleDurationChange = (val: string) => {
    setDurationDays(val);
    const parsed = parseInt(val || "14", 10);
    if (!isNaN(parsed) && parsed > 0) {
      setGanttTasks(computeSprintTasks(category, parsed));
    }
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!mounted || !isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customSkillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(customSkillInput.trim())) {
        setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      }
      setCustomSkillInput("");
    }
  };

  const handleAddObjective = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || !("key" in e)) {
      if ("preventDefault" in e) e.preventDefault();
      if (newObjectiveInput.trim()) {
        setObjectives([...objectives, newObjectiveInput.trim()]);
        setNewObjectiveInput("");
      }
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const toggleDeliverableCheck = (item: string) => {
    if (requiredDeliverables.includes(item)) {
      setRequiredDeliverables(requiredDeliverables.filter((d) => d !== item));
    } else {
      setRequiredDeliverables([...requiredDeliverables, item]);
    }
  };

  const handleAddGanttTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const newTask: GanttTaskDraft = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      startDate: fmt(now),
      endDate: fmt(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
      milestonePhase: "Milestone 2",
    };
    setGanttTasks([...ganttTasks, newTask]);
    setNewTaskName("");
  };

  const handleRemoveGanttTask = (taskId: string) => {
    setGanttTasks(ganttTasks.filter((t) => t.id !== taskId));
  };

  const handleInviteTalent = (talentId: string) => {
    setInvitedTalents((prev) => ({ ...prev, [talentId]: true }));
  };

  const parsedBudget = parseInt(budget.replace(/\D/g, "") || "5000000", 10);
  const formattedBudget = `Rp ${parsedBudget.toLocaleString("id-ID")}`;
  const parsedDuration = parseInt(durationDays || "14", 10);
  const m1Amount = Math.round(parsedBudget * 0.4);
  const m2Amount = parsedBudget - m1Amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let createdProjectId = `proj-${Date.now()}`;

      if (!user) {
        console.warn("User is not authenticated. Project created as local preview.");
        alert("Perhatian: Anda belum login. Proyek disimpan secara lokal untuk sesi ini.");
      } else {
        // 1. Ensure user exists in public.users
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email || `${user.id}@user.local`,
            full_name: user.user_metadata?.full_name || "Klien Doable!",
            role: "customer",
            is_active: true,
            is_verified: true,
            onboarding_completed: true,
          },
          { onConflict: "id" }
        );

        // 2. Insert into Supabase projects table
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .insert({
            owner_id: user.id,
            title: title || "Proyek Baru Doable!",
            description: description || "Deskripsi kebutuhan proyek teknologi.",
            category: category,
            required_skills: selectedSkills.length > 0 ? selectedSkills : ["Next.js", "TypeScript"],
            difficulty: difficulty,
            experience_level: experienceLevel,
            budget_type: "fixed",
            budget_min: parsedBudget,
            budget_max: parsedBudget,
            budget_display: formattedBudget,
            timeline_days: parsedDuration,
            status: "hiring",
            objectives: objectives,
            posted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (projectError) {
          console.error("Error inserting project into Supabase:", projectError);
          alert(`Gagal menyimpan ke Supabase: ${projectError.message}`);
        } else if (projectData) {
          createdProjectId = projectData.id;

          // 3. Insert milestones into Supabase milestones table
          const { data: createdMilestones, error: msError } = await supabase
            .from("milestones")
            .insert([
              {
                project_id: projectData.id,
                phase: "Milestone 1",
                title: "Milestone 1: Prototype & Initial Architecture",
                percentage: 40,
                amount: m1Amount,
                amount_display: `Rp ${m1Amount.toLocaleString("id-ID")}`,
                deliverables: requiredDeliverables.slice(0, 2),
                sort_order: 1,
              },
              {
                project_id: projectData.id,
                phase: "Milestone 2",
                title: "Milestone 2: Final Delivery, Testing & Handover",
                percentage: 60,
                amount: m2Amount,
                amount_display: `Rp ${m2Amount.toLocaleString("id-ID")}`,
                deliverables: requiredDeliverables,
                sort_order: 2,
              },
            ])
            .select();

          if (msError) {
            console.error("Error inserting milestones:", msError);
          }

          // 4. Insert Gantt Tasks into Supabase project_tasks table
          const m1Id = createdMilestones?.[0]?.id || null;
          const m2Id = createdMilestones?.[1]?.id || null;

          const tasksToInsert = ganttTasks.map((t, idx) => ({
            project_id: projectData.id,
            milestone_id: t.milestonePhase === "Milestone 1" ? m1Id : m2Id,
            name: t.name,
            status: idx === 0 ? "in_progress" : "planned",
            start_date: t.startDate,
            end_date: t.endDate,
            sort_order: idx + 1,
            is_auto_generated: true,
          }));

          if (tasksToInsert.length > 0) {
            const { error: taskError } = await supabase
              .from("project_tasks")
              .insert(tasksToInsert);
            if (taskError) {
              console.error("Error inserting project_tasks:", taskError);
            }
          }
        }
      }

      const newProj: CreatedProject = {
        id: createdProjectId,
        title: title || "Proyek Baru Doable!",
        category,
        budget: formattedBudget,
        budgetNumeric: parsedBudget,
        status: "Hiring",
        proposalsCount: 0,
        dueDate: `${parsedDuration} hari`,
        postedDate: "Baru saja",
        description: description || "Deskripsi kebutuhan proyek teknologi.",
        skills: selectedSkills.length > 0 ? selectedSkills : ["Next.js", "TypeScript"],
        difficulty,
        milestones: [
          {
            id: `m-${Date.now()}-1`,
            title: "Milestone 1: Prototype & Initial Architecture",
            amount: `Rp ${m1Amount.toLocaleString("id-ID")}`,
            status: "pending",
            dueDate: `${Math.round(parsedDuration * 0.4)} hari`,
          },
          {
            id: `m-${Date.now()}-2`,
            title: "Milestone 2: Final Delivery, Testing & Handover",
            amount: `Rp ${m2Amount.toLocaleString("id-ID")}`,
            status: "pending",
            dueDate: `${parsedDuration} hari`,
          },
        ],
        applicants: [],
      };

      setStep(7);
      if (onSuccess) {
        onSuccess(newProj);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      setStep(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentInfo = STEP_INFO[step] || STEP_INFO[1];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Split-Card Modal Box */}
      <div className="relative z-10 w-full max-w-[1080px] max-h-[94vh] overflow-hidden rounded-3xl border border-white/15 sm:border-slate-200/90 bg-card shadow-2xl shadow-black/50 flex flex-col lg:flex-row my-auto">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all lg:bg-muted/80 lg:text-foreground lg:border-border lg:hover:bg-muted"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: WebGL Silk Banner + Dynamic Step Visuals */}
        <div className="relative w-full lg:w-[360px] lg:min-w-[360px] h-[150px] sm:h-[180px] lg:h-auto overflow-hidden bg-[#0C0838] flex flex-col justify-between p-6 sm:p-7 text-white select-none shrink-0">
          {/* Animated WebGL Silk Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Silk
              color="#2D1FE0"
              speed={3.8}
              scale={1.25}
              noiseIntensity={1.6}
              rotation={0.35}
              className="w-full h-full"
            />
          </div>

          {/* Vignette overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

          {/* Top Branding & Builder Badge */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src={logoWithoutText}
                alt="Doable! Logo"
                height={26}
                width={26}
                className="h-6 w-6 object-contain brightness-0 invert"
              />
              <span className="text-lg font-heading font-extrabold tracking-tight text-white">
                Doable<span className="text-blue-300">!</span>
              </span>
            </div>

            <span className="rounded-full bg-white/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white/90 border border-white/15 flex items-center gap-1 mr-8 lg:mr-0">
              <Sparkles className="h-3 w-3 text-blue-300" />
              <span>Project Builder</span>
            </span>
          </div>

          {/* Dynamic Step Title */}
          <div className="relative z-20 my-auto py-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-0.5">
              <span>{step === 7 ? "Publikasi Berhasil" : `Langkah ${step} dari ${TOTAL_STEPS}`}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
              {currentInfo.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/80 leading-relaxed font-light hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>

          {/* Step Progress Indicator Pills */}
          <div className="relative z-20 flex items-center justify-between text-xs text-white/85 pt-3 border-t border-white/15">
            <span className="font-medium text-[11px] sm:text-xs">
              {step === 7 ? "Selesai & Fast-Match" : `Langkah ${step} dari ${TOTAL_STEPS}`}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-400 ease-out ${
                    i === step
                      ? "w-6 bg-white shadow-sm shadow-white/60"
                      : i < step
                      ? "w-2.5 bg-blue-300"
                      : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Step Wizard Form Content */}
        <div className="relative flex-1 bg-card p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto max-h-[72vh] lg:max-h-[660px]">
          {/* STEP 1: Info, Category & Hiring Mode */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Informasi Utama & Kategori Proyek
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tentukan judul yang spesifik dan pilih klasifikasi proyek yang sesuai.
                </p>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Judul Proyek / Quest <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Redesign UI/UX Aplikasi Mobile E-Commerce ke Flutter"
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {/* Category Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pilih Kategori Utama <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setCategory(cat.id);
                          setGanttTasks(computeSprintTasks(cat.id, parsedDuration));
                        }}
                        className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                            : "border-border/70 bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground truncate">{cat.label}</h4>
                          <p className="text-[11px] text-muted-foreground truncate">{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty & Hiring Mode Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Skala & Kesulitan Proyek
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "Starter" as const, label: "Starter" },
                      { id: "Standard" as const, label: "Standard" },
                      { id: "Enterprise" as const, label: "Enterprise" },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setDifficulty(tier.id)}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-all ${
                          difficulty === tier.id
                            ? "border-primary bg-primary/10 text-primary font-bold"
                            : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hiring Mode */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Mode Rekrutmen
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHiringMode("public")}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        hiringMode === "public"
                          ? "border-primary bg-primary/10 text-foreground font-bold"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Users className="h-3 w-3 text-primary" />
                        <span>Publik</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground block leading-tight mt-0.5">
                        Semua talenta bisa melamar
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHiringMode("private")}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        hiringMode === "private"
                          ? "border-primary bg-primary/10 text-foreground font-bold"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[11px] font-bold">
                        <Lock className="h-3 w-3 text-primary" />
                        <span>Privat / Invite</span>
                      </div>
                      <span className="text-[9px] text-muted-foreground block leading-tight mt-0.5">
                        Hanya talenta yang diundang
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-3 flex items-center justify-end border-t border-border/40">
                <button
                  type="button"
                  disabled={!title.trim()}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Lanjut: Scope & Fitur</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scope & Deliverables */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Rincian Scope & Kebutuhan Fitur
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tuliskan latar belakang masalah dan poin-poin fitur yang ingin dicapai.
                </p>
              </div>

              {/* Description Brief */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Deskripsi Kebutuhan & Problem Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan gambaran umum kebutuhan fitur, alur kerja sistem, dan ekspektasi hasil akhir..."
                  className="w-full rounded-2xl border border-input bg-background p-3 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                  required
                />
              </div>

              {/* Objectives Checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Checklist Deliverables / Fitur Kunci
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {objectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-muted/40 border border-border/60 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckSquare className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="truncate text-foreground font-medium">{obj}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Objective Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newObjectiveInput}
                    onChange={(e) => setNewObjectiveInput(e.target.value)}
                    onKeyDown={handleAddObjective}
                    placeholder="+ Tambah fitur ekspektasi (Tekan Enter)"
                    className="h-9 flex-1 rounded-xl border border-dashed border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="h-9 px-3 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Target Pengguna Akhir
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs font-medium focus:border-primary focus:outline-none"
                >
                  <option value="B2C / Pengguna Umum">B2C / Konsumen & Pengguna Umum</option>
                  <option value="B2B / Bisnis Enterprise">B2B / Klien Korporasi & Bisnis</option>
                  <option value="Internal Tim / Karyawan">Internal Tim / Operasional Perusahaan</option>
                </select>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  disabled={!description.trim()}
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                >
                  <span>Lanjut: Tech Stack & Skill</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tech Stack & Talent Criteria */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Tech Stack & Kriteria Talenta
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tentukan keahlian teknis yang diharapkan dan level pengalaman talenta.
                </p>
              </div>

              {/* Tech Stack Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pilih Tech Stack / Keahlian
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {POPULAR_SKILLS.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-xs"
                            : "bg-muted/70 text-foreground hover:bg-muted"
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : skill}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Skill Input */}
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="+ Ketik keahlian kustom dan tekan Enter"
                  className="h-9 w-full sm:w-80 rounded-xl border border-dashed border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Experience Level & Screening Question */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {[
                  { id: "Junior" as const, label: "Junior / Starter", desc: "Cocok untuk portofolio & task terstruktur" },
                  { id: "Intermediate" as const, label: "Intermediate", desc: "Berpengalaman mengerjakan end-to-end" },
                  { id: "Senior" as const, label: "Senior / Expert", desc: "Arsitektur kompleks & best practices" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setExperienceLevel(lvl.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      experienceLevel === lvl.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-border/70 bg-card hover:bg-muted/50"
                    }`}
                  >
                    <span className="text-xs font-bold text-foreground block">{lvl.label}</span>
                    <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">{lvl.desc}</span>
                  </button>
                ))}
              </div>

              {/* Screening Question Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pertanyaan Skrining Pelamar (Opsional)
                </label>
                <input
                  type="text"
                  value={screeningQuestion}
                  onChange={(e) => setScreeningQuestion(e.target.value)}
                  placeholder="Contoh: Sertakan link portofolio proyek serupa yang pernah Anda buat."
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Step 3 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <span>Lanjut: Dokumen & Referensi</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: References & Handover Terms */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Referensi & Ketentuan Serah Terima
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lampirkan materi awal dan sepakati format deliverable serta jatah revisi.
                </p>
              </div>

              {/* Links input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                    <LinkIcon className="h-3 w-3 text-primary" />
                    <span>Link Figma / Desain (Opsional)</span>
                  </label>
                  <input
                    type="url"
                    value={figmaUrl}
                    onChange={(e) => setFigmaUrl(e.target.value)}
                    placeholder="https://figma.com/file/..."
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1">
                    <FileCode className="h-3 w-3 text-primary" />
                    <span>Link Repo / Docs API (Opsional)</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/... atau docs link"
                    className="h-10 w-full rounded-xl border border-input bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Deliverables checklist */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Format Deliverable Serah Terima Wajib
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Source Code Repository (GitHub/GitLab)",
                    "File Desain Master (Figma Editor Link)",
                    "Dokumentasi Teknis README",
                    "Live Demo Staging / APK Build",
                  ].map((item) => {
                    const isChecked = requiredDeliverables.includes(item);
                    return (
                      <div
                        key={item}
                        onClick={() => toggleDeliverableCheck(item)}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 text-xs transition-all ${
                          isChecked
                            ? "border-primary bg-primary/10 text-foreground font-semibold"
                            : "border-border/60 bg-card text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-md flex items-center justify-center border ${
                            isChecked ? "bg-primary border-primary text-white" : "border-border"
                          }`}
                        >
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Free revisions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Jatah Garansi Revisi Minor
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["1x", "2x", "3x"] as const).map((rev) => (
                    <button
                      key={rev}
                      type="button"
                      onClick={() => setFreeRevisions(rev)}
                      className={`py-2 text-center rounded-xl border text-xs font-semibold transition-all ${
                        freeRevisions === rev
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {rev} Revisi Minor {rev === "2x" && "(Standar)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <span>Lanjut: Timeline & Gantt</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Timeline & Gantt Sprint Roadmap */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Timeline & Gantt Sprint Roadmap
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tentukan durasi sprint. Sistem secara otomatis menyusun jadwal tugas Gantt chart.
                </p>
              </div>

              {/* Duration Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Target Durasi Pengerjaan Total (Hari Kalender) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    min={3}
                    max={180}
                    className="h-11 w-36 rounded-2xl border border-input bg-background px-4 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-xs text-muted-foreground">
                    Estimasi pengerjaan: {parsedDuration} hari kerja
                  </span>
                </div>
              </div>

              {/* Gantt Tasks Timeline Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Jadwal Tugas Gantt Chart (Auto-Generated)</span>
                  </label>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {ganttTasks.length} fase tugas
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {ganttTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-2xl border border-border/70 bg-card/80 flex items-center justify-between gap-3 text-xs hover:border-primary/40 transition-all"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                            {t.milestonePhase}
                          </span>
                          <span className="font-semibold text-foreground truncate">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {t.startDate} &rarr; {t.endDate}
                          </span>
                        </div>
                      </div>

                      {ganttTasks.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGanttTask(t.id)}
                          className="text-muted-foreground hover:text-rose-500 p-1 transition-colors shrink-0"
                          aria-label="Hapus tugas"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Custom Task */}
                <form onSubmit={handleAddGanttTask} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="+ Tambah tugas sprint kustom..."
                    className="h-9 flex-1 rounded-xl border border-dashed border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newTaskName.trim()}
                    className="h-9 px-3 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah Task</span>
                  </button>
                </form>
              </div>

              {/* Step 5 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <span>Lanjut: Budget & Escrow</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Budget & Escrow Preference */}
          {step === 6 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Alokasi Anggaran & Proteksi Escrow
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dana aman tersimpan di sistem Escrow dan hanya dicairkan per milestone yang telah disetujui.
                </p>
              </div>

              {/* Budget Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Total Anggaran Proyek (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  placeholder="5000000"
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[11px] text-muted-foreground">
                  Estimasi nilai kontrak: Rp {parsedBudget.toLocaleString("id-ID")}
                </p>
              </div>

              {/* Escrow Milestone Breakdown */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Simulasi Pencairan Milestone Escrow</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    100% Proteksi Dana
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-xl bg-card border border-border/50">
                    <span className="text-[11px] font-bold text-foreground block">
                      Milestone 1 (40%)
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Prototype & Initial Architecture
                    </span>
                    <span className="text-xs font-bold text-primary block mt-1">
                      Rp {m1Amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border/50">
                    <span className="text-[11px] font-bold text-foreground block">
                      Milestone 2 (60%)
                    </span>
                    <span className="text-[10px] text-muted-foreground block">
                      Final Delivery & Handover
                    </span>
                    <span className="text-xs font-bold text-primary block mt-1">
                      Rp {m2Amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferred Payment Method for Escrow Funding */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Preferensi Metode Pendanaan Escrow
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "va" as const, label: "Virtual Account", icon: Building2, desc: "BCA, Mandiri, BRI" },
                    { id: "qris" as const, label: "QRIS & E-Wallet", icon: QrCode, desc: "GoPay, OVO, ShopeePay" },
                    { id: "cc" as const, label: "Kartu Kredit", icon: CreditCard, desc: "Visa, Mastercard" },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethodPreference === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethodPreference(pm.id)}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-border/70 bg-card hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-4 w-4 text-primary mb-1" />
                        <span className="text-[11px] font-bold text-foreground block">{pm.label}</span>
                        <span className="text-[9px] text-muted-foreground block leading-tight">{pm.desc}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                  <span>
                    Anda tidak perlu bayar sekarang. Tagihan baru terbit saat menyetujui proposal freelancer.
                  </span>
                </p>
              </div>

              {/* Step 6 Actions */}
              <div className="pt-3 flex items-center justify-between border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || parsedBudget <= 0}
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mempublikasikan Proyek...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Publikasikan Proyek Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 7: Success Screen & Fast-Match Talent Preview */}
          {step === 7 && (
            <div className="py-2 space-y-4 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Proyek Berhasil Dipublikasikan!
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Proyek <strong>&ldquo;{title}&rdquo;</strong> kini aktif di status <strong>Hiring</strong>.
                </p>
              </div>

              {/* Fast-Match Recommendation Cards */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>AI Fast-Match: Rekomendasi Talenta Cocok</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">Berdasarkan Tech Stack</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {matchedTalents.map((talent) => {
                    const isInvited = invitedTalents[talent.id];
                    return (
                      <div
                        key={talent.id}
                        className="p-3 rounded-2xl border border-border/80 bg-card/80 flex flex-col justify-between gap-2 shadow-xs hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                            <Image
                              src={talent.avatar}
                              alt={talent.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground truncate">{talent.name}</h4>
                            <p className="text-[10px] text-muted-foreground truncate">{talent.role}</p>
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-500 mt-0.5">
                              <Star className="h-3 w-3 fill-amber-500" />
                              <span>{talent.rating}</span>
                              <span className="text-muted-foreground font-normal">({talent.reviewsCount})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px]">
                          <span className="font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            {talent.matchScore}% Match
                          </span>

                          <button
                            type="button"
                            onClick={() => handleInviteTalent(talent.id)}
                            disabled={isInvited}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                              isInvited
                                ? "bg-emerald-500/15 text-emerald-600"
                                : "bg-primary text-white hover:bg-primary-600 shadow-xs"
                            }`}
                          >
                            {isInvited ? "Undangan Terkirim ✓" : "Undang Proyek"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <Layers className="h-4 w-4" />
                  <span>Lihat di Dashboard Proyek</span>
                </button>

                <Link
                  href="/client/projects"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <span>Buka Daftar Proyek</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
