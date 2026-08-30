"use client";

import { useState, useEffect } from "react";
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

const STEP_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Info & Kategori Proyek",
    desc: "Tentukan judul dan domain keahlian proyek untuk menarik freelancer pembuat portofolio yang tepat.",
  },
  2: {
    title: "Scope & Tech Stack",
    desc: "Jelaskan kebutuhan fungsional dan pilih teknologi yang ingin digunakan dalam sprint pengerjaan.",
  },
  3: {
    title: "Budget & Milestone Escrow",
    desc: "Atur alokasi anggaran dan simulasi pencairan milestone otomatis dengan proteksi escrow 100%.",
  },
  4: {
    title: "Proyek Siap Dipublikasikan!",
    desc: "Proyekmu kini aktif dalam status hiring dan siap menerima proposal dari talenta terverifikasi.",
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

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Data State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [difficulty, setDifficulty] = useState<"Starter" | "Standard" | "Enterprise">("Starter");
  const [description, setDescription] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Next.js", "Tailwind CSS", "TypeScript"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [budget, setBudget] = useState("5000000");
  const [durationDays, setDurationDays] = useState("14");

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
    }
  }, [isOpen, initialData]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const budgetNum = parseInt(budget.replace(/\D/g, "") || "5000000", 10);
    const formattedBudget = `Rp ${budgetNum.toLocaleString("id-ID")}`;
    const parsedDuration = parseInt(durationDays || "14", 10);
    const m1Amount = Math.round(budgetNum * 0.4);
    const m2Amount = budgetNum - m1Amount;

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let createdProjectId = `proj-${Date.now()}`;

      if (!user) {
        // User is not logged in
        console.warn("User is not authenticated. Project created as local preview.");
        alert("Perhatian: Anda belum login. Silakan login atau daftar akun agar proyek ini tersimpan permanen di database Supabase.");
      } else {
        // 1. Ensure user exists in public.users to satisfy Foreign Key constraints
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
            budget_type: "fixed",
            budget_min: budgetNum,
            budget_max: budgetNum,
            budget_display: formattedBudget,
            timeline_days: parsedDuration,
            status: "hiring",
            posted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (projectError) {
          console.error("Error inserting project into Supabase:", projectError);
          alert(`Gagal menyimpan ke Supabase: ${projectError.message}\nPastikan tabel migrasi telah dijalankan.`);
        } else if (projectData) {
          createdProjectId = projectData.id;

          // 3. Insert milestones into Supabase milestones table
          await supabase.from("milestones").insert([
            {
              project_id: projectData.id,
              phase: "Milestone 1",
              title: "Milestone 1: Prototype & Initial Architecture",
              percentage: 40,
              amount: m1Amount,
              amount_display: `Rp ${m1Amount.toLocaleString("id-ID")}`,
              sort_order: 1,
            },
            {
              project_id: projectData.id,
              phase: "Milestone 2",
              title: "Milestone 2: Final Delivery, Testing & Handover",
              percentage: 60,
              amount: m2Amount,
              amount_display: `Rp ${m2Amount.toLocaleString("id-ID")}`,
              sort_order: 2,
            },
          ]);

          // 4. Auto-generate project tasks for the Gantt timeline
          await supabase.from("project_tasks").insert([
            {
              project_id: projectData.id,
              name: "Project Setup & Tech Architecture",
              status: "in_progress",
              is_auto_generated: true,
              sort_order: 1,
            },
            {
              project_id: projectData.id,
              name: "Sprint Feature Implementation",
              status: "planned",
              is_auto_generated: true,
              sort_order: 2,
            },
            {
              project_id: projectData.id,
              name: "Testing, QA & Client Handover",
              status: "planned",
              is_auto_generated: true,
              sort_order: 3,
            },
          ]);
        }
      }

      const newProj: CreatedProject = {
        id: createdProjectId,
        title: title || "Proyek Baru Doable!",
        category,
        budget: formattedBudget,
        budgetNumeric: budgetNum,
        status: "Hiring",
        proposalsCount: 0,
        dueDate: `${durationDays || "14"} hari`,
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
            dueDate: `${durationDays || "14"} hari`,
          },
        ],
        applicants: [],
      };

      setStep(4);
      if (onSuccess) {
        onSuccess(newProj);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      // Fallback transition so UX doesn't freeze
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentInfo = STEP_INFO[step] || STEP_INFO[1];
  const parsedBudget = parseInt(budget || "0", 10);
  const milestone1Amount = Math.round(parsedBudget * 0.4);
  const milestone2Amount = parsedBudget - milestone1Amount;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Split-Card Modal Box (Matching Onboarding Aesthetics) */}
      <div className="relative z-10 w-full max-w-[1040px] max-h-[92vh] overflow-hidden rounded-3xl border border-white/15 sm:border-slate-200/90 bg-card shadow-2xl shadow-black/40 flex flex-col lg:flex-row my-auto">
        {/* Close Button Top Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all lg:bg-muted/80 lg:text-foreground lg:border-border lg:hover:bg-muted"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Side: WebGL Silk Banner + Dynamic Steps (Referencing Onboarding) */}
        <div className="relative w-full lg:w-[380px] lg:min-w-[380px] h-[160px] sm:h-[185px] lg:h-auto overflow-hidden bg-[#0C0838] flex flex-col justify-between p-6 sm:p-8 text-white select-none shrink-0">
          {/* Animated WebGL Silk Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Silk
              color="#2D1FE0"
              speed={4}
              scale={1.2}
              noiseIntensity={1.7}
              rotation={0.35}
              className="w-full h-full"
            />
          </div>

          {/* Vignette overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

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

          {/* Dynamic Step Title (Updates seamlessly with each step) */}
          <div className="relative z-20 my-auto py-1">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-300 mb-0.5">
              <span>{step === 4 ? "Selesai" : `Langkah ${step} dari 3`}</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
              {currentInfo.title}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/80 leading-relaxed font-light hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>

          {/* Sole Bottom Step Progress Indicator Pills (Identical to Onboarding) */}
          <div className="relative z-20 flex items-center justify-between text-xs text-white/85 pt-3 border-t border-white/15">
            <span className="font-medium text-[11px] sm:text-xs">
              {step === 4 ? "Publikasi Selesai" : `Langkah ${step} dari 3`}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    i === step
                      ? "w-7 bg-white shadow-sm shadow-white/50"
                      : i < step
                      ? "w-2.5 bg-blue-300"
                      : "w-2 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Step Wizard Content */}
        <div className="relative flex-1 bg-card p-5 sm:p-7 lg:p-8 flex flex-col justify-between overflow-y-auto max-h-[70vh] lg:max-h-[640px]">
          {/* STEP 1: Basic Info & Category */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Informasi Utama & Kategori Proyek
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Berikan judul yang jelas dan spesifik agar freelancer memahami gambaran besarnya.
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
                <p className="text-[11px] text-muted-foreground">
                  Gunakan nama yang mudah dipahami dan mencerminkan deliverable utama.
                </p>
              </div>

              {/* Category Grid */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pilih Kategori Utama <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id;

                    return (
                      <div
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 ${
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

              {/* Difficulty / Scale Tier */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Skala & Tingkat Kesulitan Proyek
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "Starter" as const, label: "Starter", desc: "Portofolio awal & bugfix" },
                    { id: "Standard" as const, label: "Standard", desc: "Sprint fitur menengah" },
                    { id: "Enterprise" as const, label: "Enterprise", desc: "Arsitektur kompleks" },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setDifficulty(tier.id)}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        difficulty === tier.id
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border/70 bg-card hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-xs font-bold text-foreground block">{tier.label}</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5 leading-tight">{tier.desc}</span>
                    </button>
                  ))}
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
                  <span>Lanjut: Scope & Tech Stack</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scope & Tech Stack */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Rincian Scope & Kebutuhan Keahlian
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Tuliskan poin ekspektasi deliverable dan pilih tech stack yang disepakati.
                </p>
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Deskripsi Kebutuhan & Brief Proyek <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Jelaskan kebutuhan fitur, flow pengguna, deliverable yang diharapkan, dan referensi desain jika ada..."
                  className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
                  required
                />
              </div>

              {/* Tech Stack Chips Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pilih Tech Stack / Keahlian Terkait
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
                <div className="pt-1">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    onKeyDown={handleAddCustomSkill}
                    placeholder="+ Ketik keahlian kustom dan tekan Enter"
                    className="h-9 w-full sm:w-72 rounded-xl border border-dashed border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                </div>
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
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Lanjut: Budget & Escrow</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Budget & Milestone Escrow */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out">
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-sans text-foreground">
                  Alokasi Anggaran & Rencana Escrow
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dana aman tersimpan di sistem Escrow dan hanya dicairkan per milestone yang telah disetujui.
                </p>
              </div>

              {/* Budget & Duration Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Total Anggaran (Rp) <span className="text-rose-500">*</span>
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
                    Estimasi: Rp {parsedBudget.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Target Durasi Sprint (Hari) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    required
                    placeholder="14"
                    className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Target sprint: {durationDays} hari kalender
                  </p>
                </div>
              </div>

              {/* Escrow Milestone Simulation Card */}
              <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-3.5 sm:p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Simulasi Pencairan Milestone Escrow</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    100% Proteksi Dana
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-2xl bg-card/80 border border-border/50">
                    <div>
                      <span className="font-bold text-foreground block">
                        Milestone 1: Kickoff & Core Setup (40%)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Deliverable awal, arsitektur dasar, dan mockup
                      </span>
                    </div>
                    <span className="font-bold text-primary text-xs sm:text-sm">
                      Rp {milestone1Amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-2xl bg-card/80 border border-border/50">
                    <div>
                      <span className="font-bold text-foreground block">
                        Milestone 2: Final Handover & Testing (60%)
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Full functional deliverables & source code repository
                      </span>
                    </div>
                    <span className="font-bold text-primary text-xs sm:text-sm">
                      Rp {milestone2Amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Dana ditarik ke rekening escrow saat kamu menyetujui pelamar terpilih.</span>
                </div>
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

          {/* STEP 4: Success Screen */}
          {step === 4 && (
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-300 my-auto">
              <div className="mx-auto flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold font-sans text-foreground">
                  Proyek Berhasil Dipublikasikan!
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Proyek <strong>&ldquo;{title}&rdquo;</strong> kini aktif dalam status <strong>Hiring</strong>. Freelancer berbakat akan segera mengajukan proposal.
                </p>
              </div>

              {/* Summary Card */}
              <div className="max-w-md mx-auto rounded-2xl border border-border/80 bg-muted/20 p-3.5 text-left space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Kategori:</span>
                  <span className="font-semibold text-foreground">{category}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Budget:</span>
                  <span className="font-bold text-primary">Rp {parsedBudget.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Target Sprint:</span>
                  <span className="font-semibold text-foreground">{durationDays} Hari Kalender</span>
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <Layers className="h-4 w-4" />
                  <span>Lihat di Dashboard</span>
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
