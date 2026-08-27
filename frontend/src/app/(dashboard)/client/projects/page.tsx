"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Plus,
  Clock,
  Users,
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Send,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  budget: string;
  proposalsCount: number;
  status: "Hiring" | "In Progress" | "Completed";
  dueDate: string;
  description?: string;
  skills?: string[];
  difficulty?: "Starter" | "Standard" | "Enterprise";
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile App Development",
    budget: "Rp 15.000.000",
    proposalsCount: 8,
    status: "Hiring",
    dueDate: "14 hari",
    description:
      "Redesign UI/UX komprehensif aplikasi mobile toko online ke Flutter modern dengan state management Riverpod, payment gateway Midtrans, dan push notification.",
    skills: ["Flutter", "Dart", "Riverpod", "Figma", "REST API"],
    difficulty: "Standard",
  },
  {
    id: "proj-2",
    title: "AI Chatbot Integration for Customer Support",
    category: "AI & Machine Learning",
    budget: "Rp 8.500.000",
    proposalsCount: 4,
    status: "In Progress",
    dueDate: "5 hari",
    description:
      "Integrasi LLM OpenAI / LangChain untuk knowledge base internal customer support CS 24/7 dengan vector database Pinecone.",
    skills: ["Python", "FastAPI", "OpenAI API", "Pinecone", "LangChain"],
    difficulty: "Standard",
  },
  {
    id: "proj-3",
    title: "Landing Page & Brand Design System",
    category: "UI/UX & Product Design",
    budget: "Rp 5.000.000",
    proposalsCount: 12,
    status: "Completed",
    dueDate: "Selesai",
    description:
      "Pembuatan visual identity, Figma component tokens, responsive landing page Next.js, dan aset promosi digital marketing.",
    skills: ["Figma", "UI/UX", "Tailwind CSS", "Design System"],
    difficulty: "Starter",
  },
];

export default function ClientProjectsPage() {
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  // 3-Step Project Creation Wizard State (Same as Project Hub)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Frontend & Web");
  const [newDescription, setNewDescription] = useState("");
  const [newDifficulty, setNewDifficulty] = useState<"Starter" | "Standard" | "Enterprise">("Standard");
  const [newBudget, setNewBudget] = useState("7500000");
  const [newDurationDays, setNewDurationDays] = useState("14");
  const [newSkills, setNewSkills] = useState<string[]>(["Next.js", "TypeScript", "Tailwind CSS"]);
  const [skillInput, setSkillInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Skill Tag Handlers
  const handleAddSkill = () => {
    if (skillInput.trim() && !newSkills.includes(skillInput.trim())) {
      setNewSkills([...newSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setNewSkills(newSkills.filter((s) => s !== skill));
  };

  // Submit Handler
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const budgetNum = parseInt(newBudget.replace(/\D/g, ""), 10) || 5000000;
    const formattedBudget = `Rp ${budgetNum.toLocaleString("id-ID")}`;

    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: newTitle || "Proyek Pengembangan Baru",
      category: newCategory,
      budget: formattedBudget,
      proposalsCount: 0,
      status: "Hiring",
      dueDate: `${newDurationDays} hari`,
      description: newDescription || "Deskripsi kebutuhan proyek teknologi.",
      skills: newSkills.length > 0 ? newSkills : ["Next.js", "TypeScript"],
      difficulty: newDifficulty,
    };

    setTimeout(() => {
      setProjects([newProj, ...projects]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        // Reset form
        setNewTitle("");
        setNewDescription("");
        setNewSkills(["Next.js", "TypeScript", "Tailwind CSS"]);
        setNewBudget("7500000");
        setNewDurationDays("14");
        setCreateStep(1);
      }, 1400);
    }, 800);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Proyek Saya
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola postingan proyek, pantau proposal masuk, dan tinjau milestone aktif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            ← Kembali ke Overview
          </Link>
          <button
            onClick={() => {
              setCreateStep(1);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Pasang Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:flex-row sm:items-center hover:border-primary/40 transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {p.category}
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                    p.status === "Hiring"
                      ? "bg-amber-500/10 text-amber-600"
                      : p.status === "In Progress"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {p.status}
                </span>
                {p.difficulty && (
                  <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {p.difficulty}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold font-sans text-foreground">{p.title}</h3>

              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 max-w-3xl">
                  {p.description}
                </p>
              )}

              {p.skills && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="font-semibold text-foreground">{p.budget}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {p.proposalsCount} Proposal
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.dueDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedProject(p)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors"
              >
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* 3-STEP INTERACTIVE "PASANG PROYEK BARU" WIZARD MODAL (PORTAL) */}
      {/* ============================================================ */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with full darkening & glass blur across entire viewport */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {submitSuccess ? (
                <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold font-sans text-foreground">
                      Proyek Berhasil Dipublikasikan!
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Proyekmu kini aktif dalam status <strong>Dalam Seleksi (Hiring)</strong>. Freelancer terverifikasi akan segera mengirimkan proposal pengerjaan.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Project Creation Wizard</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Pasang Proyek / Quest Baru</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rancang kebutuhan proyekmu dengan estimasi milestone dan perlindungan escrow otomatis.
                    </p>
                  </div>

                  {/* Step Indicators */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { step: 1, title: "1. Info & Kategori" },
                      { step: 2, title: "2. Scope & Skills" },
                      { step: 3, title: "3. Budget & Milestone" },
                    ].map((s) => (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setCreateStep(s.step as 1 | 2 | 3)}
                        className={`rounded-xl py-2 px-3 text-xs font-semibold transition-all text-center ${
                          createStep === s.step
                            ? "bg-primary text-white shadow-xs"
                            : createStep > s.step
                            ? "bg-primary/15 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateProjectSubmit} className="space-y-5">
                    {/* STEP 1: Basic Information */}
                    {createStep === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Judul Proyek <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            placeholder="e.g. Membangun SaaS Dashboard Multi-Tenant dengan Next.js 14"
                            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Kategori Spesialisasi <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="Frontend & Web">Frontend & Web Application</option>
                            <option value="Mobile App Development">Mobile App (Flutter / React Native)</option>
                            <option value="AI & Machine Learning">AI, Machine Learning & LLM Integration</option>
                            <option value="UI/UX & Product Design">UI/UX & Product Design System</option>
                            <option value="Backend & Database">Backend, Database & Cloud APIs</option>
                            <option value="DevOps & Cloud Systems">DevOps, Docker & Security</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Deskripsi Kebutuhan & Deliverable <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            required
                            placeholder="Jelaskan tujuan proyek, fitur-fitur utama yang diharapkan, referensi desain/arsitektur, dan ekspektasi hasil akhir..."
                            className="w-full rounded-xl border border-input bg-background p-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setCreateStep(2)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-600 transition-all"
                          >
                            <span>Lanjut ke Kebutuhan Skill</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Scope, Skills, Complexity */}
                    {createStep === 2 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Tingkat Kompleksitas Proyek
                          </label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {[
                              { level: "Starter" as const, desc: "Landing page, bugfix, prototype" },
                              { level: "Standard" as const, desc: "Full feature web/app, AI agent" },
                              { level: "Enterprise" as const, desc: "Arsitektur kompleks skala besar" },
                            ].map((item) => (
                              <button
                                type="button"
                                key={item.level}
                                onClick={() => setNewDifficulty(item.level)}
                                className={`rounded-xl border p-3 text-left transition-all ${
                                  newDifficulty === item.level
                                    ? "border-primary bg-primary/10 text-foreground shadow-xs"
                                    : "border-border/80 bg-background text-muted-foreground hover:border-border"
                                }`}
                              >
                                <div className="text-xs font-bold text-foreground">{item.level}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Kebutuhan Tech Stack & Keahlian
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSkill();
                                }
                              }}
                              placeholder="Ketik skill (e.g. Next.js, Figma, Python) dan tekan Tambah"
                              className="h-10 flex-1 rounded-xl border border-input bg-background px-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={handleAddSkill}
                              className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Tambah
                            </button>
                          </div>

                          {/* Skill Pills */}
                          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-muted/40 border border-border/60">
                            {newSkills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-medium text-foreground"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setCreateStep(1)}
                            className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            ← Kembali
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateStep(3)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-600 transition-all"
                          >
                            <span>Lanjut ke Budget & Escrow</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Budget, Timeline, Escrow Breakdown */}
                    {createStep === 3 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground">
                              Alokasi Budget Proyek (Rp) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={newBudget}
                              onChange={(e) => setNewBudget(e.target.value)}
                              required
                              placeholder="7500000"
                              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Estimasi: Rp {parseInt(newBudget || "0", 10).toLocaleString("id-ID")}
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground">
                              Target Durasi Pengerjaan (Hari) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={newDurationDays}
                              onChange={(e) => setNewDurationDays(e.target.value)}
                              required
                              placeholder="14"
                              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Target: {newDurationDays} hari kalender
                            </p>
                          </div>
                        </div>

                        {/* Escrow Breakdown Box */}
                        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span>Simulasi Pencairan Milestone Escrow</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40">
                              <div>
                                <span className="font-semibold text-foreground block">
                                  Milestone 1: Kickoff & Core Architecture (40%)
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Deliverable awal dan setup repository
                                </span>
                              </div>
                              <span className="font-bold text-foreground">
                                Rp {(parseInt(newBudget || "0", 10) * 0.4).toLocaleString("id-ID")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40">
                              <div>
                                <span className="font-semibold text-foreground block">
                                  Milestone 2: Final QA & Handover (60%)
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                  Source code lengkap, deployment & IP transfer
                                </span>
                              </div>
                              <span className="font-bold text-foreground">
                                Rp {(parseInt(newBudget || "0", 10) * 0.6).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Dana hanya ditarik ke escrow saat kamu menyetujui pelamar terpilih.</span>
                          </div>
                        </div>

                        <div className="pt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCreateStep(2)}
                            className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            ← Kembali
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Mempublikasikan...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Publikasikan Proyek Sekarang</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Project Detail Modal (PORTAL) */}
      {mounted &&
        selectedProject &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedProject(null)}
            />
            <div className="relative z-10 w-full max-w-xl rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProject(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {selectedProject.category}
                  </span>
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                      selectedProject.status === "Hiring"
                        ? "bg-amber-500/10 text-amber-600"
                        : selectedProject.status === "In Progress"
                        ? "bg-blue-500/10 text-blue-600"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {selectedProject.status}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-sans text-foreground">{selectedProject.title}</h3>
              </div>

              {selectedProject.description && (
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Deskripsi Kebutuhan
                  </h4>
                  <p className="text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/50">
                    {selectedProject.description}
                  </p>
                </div>
              )}

              {selectedProject.skills && selectedProject.skills.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Tech Stack
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/40">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Alokasi Anggaran</span>
                  <span className="text-base font-bold text-primary">{selectedProject.budget}</span>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="text-[11px] text-muted-foreground block">Proposal Masuk</span>
                  <span className="text-base font-bold text-foreground">{selectedProject.proposalsCount} Pelamar</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-600 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
