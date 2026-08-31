/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  ShieldCheck,
  Star,
  Plus,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Users,
  X,
  ChevronDown,
  Heart,
  Building2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Grainient from "@/components/ui/Grainient";
import { CreateProjectModal, type CreateProjectModalProps, type CreatedProject } from "@/components/dashboard/create-project-modal";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { createClient } from "@/lib/supabase/client";

interface FeaturedTalent {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  role: string;
  headline: string;
  organization?: string;
  location?: string;
  level: "Verified Pro" | "Top Rated" | "Rising Star" | "Level 2 Seller";
  category: string;
  rating: number;
  reviewsCount: number;
  completedProjects?: number;
  startingPrice: string;
  skills: string[];
}

interface MilestoneItem {
  id: string;
  title: string;
  amount: string;
  status: "completed" | "in_progress" | "pending";
  dueDate: string;
}

interface ProposalApplicant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  reviewsCount: number;
  bidAmount: string;
  deliveryDays: number;
  pitch: string;
  skills: string[];
  badge: "Verified Pro" | "Top Rated" | "Rising Star";
}

interface ClientProject {
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
  milestones: MilestoneItem[];
  applicants: ProposalApplicant[];
}

import { getTalents } from "@/lib/services/talents";

export function ClientDashboard() {
  const router = useRouter();

  // State
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [featuredTalents, setFeaturedTalents] = useState<FeaturedTalent[]>([]);
  const [projectStatusFilter, setProjectStatusFilter] = useState<"All" | "Hiring" | "In Progress" | "Completed">("All");
  const [talentCategory, setTalentCategory] = useState("Semua");
  const [savedTalents, setSavedTalents] = useState<string[]>([]);
  const [quickPrompt, setQuickPrompt] = useState("");

  // Modal State for Project Creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalInitialData, setCreateModalInitialData] = useState<CreateProjectModalProps["initialData"]>(undefined);
  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);

  // Proposal Review Modal State
  const [selectedProjectForProposals, setSelectedProjectForProposals] = useState<ClientProject | null>(null);
  const [acceptedProposalId, setAcceptedProposalId] = useState<string | null>(null);

  // Invite / Direct Hire Talent Modal State
  const [selectedTalentForInvite, setSelectedTalentForInvite] = useState<FeaturedTalent | null>(null);
  const [inviteProjectId, setInviteProjectId] = useState(projects[0]?.id || "");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Linear scroll progress (0 to 1) for the Hero Grainient scale-down
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const range = 550; // scroll distance for linear scale-down (slower, smooth progression)
        const current = window.scrollY;
        const prog = Math.min(Math.max(current / range, 0), 1);
        setScrollProgress(prog);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Fetch live projects and talents from Supabase
  useEffect(() => {
    async function loadDashboardData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // 1. Load Projects (Only for the logged in client)
        if (!user) {
          setProjects([]);
        } else {
          const { data: dbProjects } = await supabase
            .from("projects")
            .select("*, milestones(*)")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: false });

          if (dbProjects && dbProjects.length > 0) {
            const mapped: ClientProject[] = dbProjects.map((p) => ({
              id: p.id,
              title: p.title,
              category: p.category || "Web Development",
              budget: p.budget_display || `Rp ${(p.budget_min || 0).toLocaleString("id-ID")}`,
              budgetNumeric: p.budget_min || 0,
              status: p.status === "hiring" ? "Hiring" : p.status === "in_progress" ? "In Progress" : "Completed",
              proposalsCount: p.proposals_count || 0,
              dueDate: `${p.timeline_days || 14} hari lagi`,
              postedDate: "Baru saja",
              description: p.description,
              skills: p.required_skills || [],
              milestones: (p.milestones || []).map((m: { id: string; title: string; amount_display?: string; amount?: number; status?: string; percentage?: number }) => ({
                id: m.id,
                title: m.title,
                amount: m.amount_display || `Rp ${(m.amount || 0).toLocaleString("id-ID")}`,
                status: (m.status as "completed" | "in_progress" | "pending") || "pending",
                dueDate: `${m.percentage || 50}% phase`,
              })),
              applicants: [],
            }));
            setProjects(mapped);
          } else {
            setProjects([]);
          }
        }

        // 2. Load Talents
        const liveTalents = await getTalents();
        if (liveTalents && liveTalents.length > 0) {
          setFeaturedTalents(
            liveTalents.map((t) => ({
              id: t.id,
              name: t.name,
              avatar: t.avatar,
              coverImage: t.coverImage,
              role: t.role,
              headline: t.headline,
              organization: t.organization,
              location: t.location,
              level: t.level,
              category: t.category,
              rating: t.rating,
              reviewsCount: t.reviewsCount,
              completedProjects: t.completedProjects,
              startingPrice: t.startingPrice,
              skills: t.skills,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load dashboard data from Supabase:", err);
      }
    }

    loadDashboardData();
  }, []);

  const p = scrollProgress;

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    if (projectStatusFilter === "All") return projects;
    return projects.filter((p) => p.status === projectStatusFilter);
  }, [projects, projectStatusFilter]);

  // Filtered Talents
  const filteredTalents = useMemo(() => {
    if (talentCategory === "Semua") return featuredTalents;
    return featuredTalents.filter((t) => t.category.includes(talentCategory));
  }, [featuredTalents, talentCategory]);

  // Toggle Save Talent
  const toggleSaveTalent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTalents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Search Market from Hero
  const handleSearchMarket = () => {
    if (quickPrompt.trim()) {
      router.push(`/client/market?q=${encodeURIComponent(quickPrompt.trim())}`);
    } else {
      router.push("/client/market");
    }
  };

  // Handle Quick Create Project from Hero
  const handleCreateProjectFromHero = () => {
    setCreateModalInitialData({
      title: quickPrompt || "",
      description: quickPrompt ? `Kebutuhan pengerjaan untuk: ${quickPrompt}` : "",
    });
    setIsCreateModalOpen(true);
  };

  // Form submit handler (e.g. on Enter key press) -> Open Choice Modal
  const handleHeroFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPrompt.trim()) {
      setIsChoiceModalOpen(true);
    } else {
      handleCreateProjectFromHero();
    }
  };



  // Handle Project Creation Submission Success
  const handleProjectCreated = (newProj: CreatedProject) => {
    setProjects((prev) => [newProj as unknown as ClientProject, ...prev]);
    setQuickPrompt("");
  };

  // Handle Invite Talent Submit
  const handleSendTalentInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setSelectedTalentForInvite(null);
      setInviteMessage("");
    }, 1500);
  };

  return (
    <div className="w-full space-y-10">
      {/* ============================================================ */}
      {/* 1. HERO PROJECT CREATION HUB & QUICK AI/TEMPLATE LAUNCHER */}
      {/* ============================================================ */}
      <div
        className="w-full flex justify-center mx-auto"
        style={{
          maxWidth: p === 0 ? "100%" : `min(100%, calc(100vw * (1 - ${p}) + 80rem * ${p}))`,
          paddingLeft: `${p * 24}px`,
          paddingRight: `${p * 24}px`,
          paddingTop: `${p * 16}px`,
          width: "100%",
        }}
      >
        <div
          className="relative overflow-hidden text-white shadow-2xl border border-white/10 w-full will-change-transform flex flex-col justify-center"
          style={{
            borderRadius: `${p * 24}px`,
            borderLeftWidth: `${p}px`,
            borderRightWidth: `${p}px`,
            borderTopWidth: `${p}px`,
            minHeight: `calc((100dvh - 4rem) * (1 - ${p}) + ${p * 480}px)`,
            paddingTop: `${Math.round(48 + (1 - p) * 16)}px`,
            paddingBottom: `${Math.round(48 + (1 - p) * 16)}px`,
            paddingLeft: `${Math.round(32 + p * 16)}px`,
            paddingRight: `${Math.round(32 + p * 16)}px`,
          }}
        >
          {/* Grainient Canvas Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Grainient
              color1="#2563EB"
              color2="#4F46E5"
              color3="#0B0F19"
              timeSpeed={0.25}
              colorBalance={0.0}
              warpStrength={1.2}
              warpFrequency={4.0}
              warpSpeed={1.8}
              warpAmplitude={40.0}
              blendAngle={0.0}
              blendSoftness={0.06}
              rotationAmount={450.0}
              noiseScale={2.0}
              grainAmount={0.15}
              grainScale={2.0}
              grainAnimated={false}
              contrast={1.4}
              gamma={1.0}
              saturation={1.1}
              centerX={0.0}
              centerY={0.0}
              zoom={0.95}
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none" />

          {/* Ambient Glows */}
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto w-full space-y-5 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-center">
              Wujudkan Ide Digitalmu Menjadi Proyek Nyata.
            </h1>

            <p className="text-base md:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl mx-auto text-center">
              Pasang proyek dalam hitungan menit, tentukan milestone pengerjaan, dan dapatkan proposal terbaik dari talenta terverifikasi dengan garansi pembayaran aman 100%.
            </p>

            {/* Quick Project Scoper & Market Search Bar */}
            <form onSubmit={handleHeroFormSubmit} className="pt-2 w-full max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur-md">
                <div className="flex-1 flex items-center gap-3 px-3 py-1">
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <input
                    type="text"
                    placeholder='Deskripsikan proyekmu atau cari referensi (e.g. "SaaS AI Dashboard")...'
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSearchMarket}
                    title="Cari proyek serupa di Project Market"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200/90 px-3.5 sm:px-4 py-2.5 text-xs font-bold text-slate-700 transition-all hover:scale-[1.02]"
                  >
                    <Search className="h-3.5 w-3.5 text-slate-600" />
                    <span>Cari di Market</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateProjectFromHero}
                    title="Buat proyek baru dari deskripsi ini"
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-600 transition-all hover:scale-[1.02]"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Buat Proyek</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 w-full">
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-white">{projects.length} Proyek</div>
                <div className="text-xs text-slate-300">Portofolio Klienmu</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-white">
                  {projects.reduce((acc, p) => acc + p.proposalsCount, 0)} Proposal
                </div>
                <div className="text-xs text-slate-300">Total Bids Masuk</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-emerald-400">100% Aman</div>
                <div className="text-xs text-slate-300">Garansi Rekber</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-amber-300">&lt; 15 Menit</div>
                <div className="text-xs text-slate-300">Respon Talent Pertama</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator hint when at top */}
          <div
            className="pt-6 pb-2 flex items-center justify-center"
            style={{
              opacity: Math.max(0, 1 - p * 2.5),
              pointerEvents: p > 0.2 ? "none" : "auto",
            }}
          >
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5 animate-bounce">
              <ChevronDown className="h-4 w-4 text-primary-200" />
              <span>Scroll ke bawah untuk melihat proyek & talenta</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. INNER CONTAINER FOR OTHER DASHBOARD SECTIONS */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full pt-4">

        {/* ============================================================ */}
        {/* 2. ACTIVE PROJECTS PIPELINE & PROPOSAL MANAGEMENT */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Proyek Saya
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Filter Status Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(["All", "Hiring", "In Progress", "Completed"] as const).map((status) => {
                  const label = status === "All" ? "Semua" : status === "Hiring" ? "Dalam Seleksi" : status === "In Progress" ? "Sedang Berjalan" : "Selesai";
                  const isActive = projectStatusFilter === status;

                  return (
                    <button
                      key={status}
                      onClick={() => setProjectStatusFilter(status)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${isActive
                        ? "bg-primary text-white shadow-xs"
                        : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <Link
                href="/client/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-1"
              >
                <span>Semua Proyek</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Project Pipeline List */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Plus className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-foreground">Belum ada proyek dibuat</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Mulai posting kebutuhan proyek teknologi atau desain Anda untuk mendapatkan proposal dari talenta terverifikasi.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Proyek Baru</span>
                </button>
              </div>
            ) : (
              filteredProjects.map((proj) => {
              const completedMilestones = proj.milestones.filter((m) => m.status === "completed").length;
              const totalMilestones = proj.milestones.length;
              const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 space-y-4"
                >
                  <div className="space-y-3">
                    {/* Category & Live Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                        {proj.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${proj.status === "Hiring"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : proj.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${proj.status === "Hiring"
                            ? "bg-amber-500 animate-pulse"
                            : proj.status === "In Progress"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-emerald-500"
                            }`}
                        />
                        {proj.status}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-sans font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {proj.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {/* Budget & Timeline Pill Strip */}
                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/40">
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">Anggaran Proyek</span>
                        <span className="font-bold text-foreground text-sm">{proj.budget}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block font-medium">Target Deadline</span>
                        <span className="font-semibold text-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {proj.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Milestone Selesai ({completedMilestones}/{totalMilestones})
                        </span>
                        <span className="font-bold text-foreground">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Required Skills Chips */}
                    <div className="flex flex-wrap gap-1">
                      {proj.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {proj.skills.length > 3 && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                          +{proj.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                    {proj.applicants.length > 0 ? (
                      <button
                        onClick={() => setSelectedProjectForProposals(proj)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 text-xs font-semibold transition-colors"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Tinjau Proposal ({proj.applicants.length})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Menunggu pelamar...</span>
                      </span>
                    )}

                    <Link
                      href={`/client/projects/${proj.id}`}
                      className="rounded-xl border border-border/80 bg-card hover:bg-muted p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Detail Proyek & Gantt Chart"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>



        {/* ============================================================ */}
        {/* 4. CARI TALENTA & JASA TERVERIFIKASI (TALENT MARKETPLACE ROW) */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Cari Talenta & Jasa Pilihan Teratas
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["Semua", "Frontend", "UI/UX", "AI & Machine", "Mobile"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTalentCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${talentCategory === cat
                      ? "bg-primary text-white shadow-xs"
                      : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Link
                href="/client/talent"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-1"
              >
                <span>Semua Talent</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Talents Grid - Freelancer Profile Summary Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTalents.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-2">
                <p className="text-sm font-semibold text-foreground">Belum ada talenta terdaftar</p>
                <p className="text-xs text-muted-foreground">Undang freelancer atau buka lowongan proyek untuk mulai menerima tawaran kerja sama.</p>
              </div>
            ) : (
              filteredTalents.map((tal) => (
              <Link
                key={tal.id}
                href={`/client/talent/${tal.id}`}
                className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
              >
                <div>
                  {/* Profile Banner / Cover Image */}
                  <div className="relative h-20 w-full overflow-hidden bg-gradient-to-r from-blue-600/30 via-indigo-600/25 to-purple-600/35">
                    {tal.coverImage && (
                      <img
                        src={tal.coverImage}
                        alt="Cover"
                        className="h-full w-full object-cover opacity-50"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Category Badge on Cover */}
                    <span className="absolute top-2.5 left-3 rounded-md bg-black/50 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                      {tal.category}
                    </span>

                    {/* Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleSaveTalent(tal.id, e);
                      }}
                      className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70 z-10"
                      title="Simpan Talent"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${
                          savedTalents.includes(tal.id)
                            ? "fill-rose-500 text-rose-500"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Profile Avatar & Verified Badge (overlapping cover) */}
                  <div className="px-4 -mt-8 flex items-end justify-between">
                    <div className="relative">
                      <img
                        src={tal.avatar}
                        alt={tal.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                        }}
                        className="h-16 w-16 rounded-full object-cover border-4 border-card bg-muted shadow-md shrink-0"
                      />
                    </div>
                    <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      <span>{tal.level}</span>
                    </span>
                  </div>

                  {/* Profile Information Body */}
                  <div className="p-4 pt-3 space-y-3">
                    {/* Name */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-sans font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                          {tal.name}
                        </h3>
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                      </div>
                      {/* Headline */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                        {tal.headline}
                      </p>
                    </div>

                    {/* Location & Organization Badges */}
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      {tal.location && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{tal.location}</span>
                        </div>
                      )}
                      {tal.organization && (
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted/60 px-2 py-1 text-[11px] font-medium text-foreground max-w-full">
                          <Building2 className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{tal.organization}</span>
                        </div>
                      )}
                    </div>

                    {/* Rating & Stats Strip */}
                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/40">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold text-foreground">{tal.rating}</span>
                        <span className="text-muted-foreground text-[11px]">({tal.reviewsCount})</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {tal.completedProjects || 30}+ Selesai
                      </span>
                    </div>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1">
                      {tal.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {tal.skills.length > 3 && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          +{tal.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            )))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. EXPLORE PROJECT MARKET & PEER BENCHMARKS (PROMOTION HUB) */}
        {/* ============================================================ */}
        <div className="space-y-4 rounded-2xl sm:rounded-3xl border border-primary/20 bg-gradient-to-b from-card via-card to-primary/5 p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Jelajahi Proyek yang Sudah Dibuat Sebelumnya
            </h2>

            <Link
              href="/client/market"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-102 shrink-0 self-start sm:self-auto"
            >
              <span>Buka Project Market</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Featured Live Peer Projects Snippet */}
          <div className="relative z-10 pt-1 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Trending di Project Market Minggu Ini
              </span>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Project Card 1 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>Nexa Corporation</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 font-bold text-[10px]">
                      Menerima Proposal
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-2">
                    Enterprise SaaS Analytics Dashboard & Billing
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">Next.js 14</span>
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">PostgreSQL</span>
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">Prisma</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Estimasi Budget</span>
                    <span className="text-xs font-bold text-primary">Rp 18.500.000</span>
                  </div>
                  <Link
                    href="/client/market"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1.5 transition-colors"
                  >
                    <span>Detail Scope</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Project Card 2 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>Alpha Labs Tech</span>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 font-bold text-[10px]">
                      Menerima Proposal
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-2">
                    AI Voice Agent Support & Intelligent Ticket Dispatcher
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">Python</span>
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">OpenAI Realtime</span>
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">LangChain</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Estimasi Budget</span>
                    <span className="text-xs font-bold text-primary">Rp 14.000.000</span>
                  </div>
                  <Link
                    href="/client/market"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1.5 transition-colors"
                  >
                    <span>Detail Scope</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

              {/* Project Card 3 */}
              <div className="flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-md transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                      <span>PT FinTech Solusindo</span>
                    </div>
                    <span className="rounded-full bg-blue-500/10 text-blue-600 px-2 py-0.5 font-bold text-[10px]">
                      In Development
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-foreground line-clamp-2">
                    Cross-Platform Fintech Mobile App (Wallet & QRIS)
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">Flutter</span>
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">Dart</span>
                    <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">Biometrics</span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Estimasi Budget</span>
                    <span className="text-xs font-bold text-primary">Rp 25.000.000</span>
                  </div>
                  <Link
                    href="/client/market"
                    className="inline-flex items-center gap-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold px-2.5 py-1.5 transition-colors"
                  >
                    <span>Detail Scope</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. LIVE PROPOSALS ACTIVITY FEED (RECENT BIDS FROM TALENT) */}
        {/* ============================================================ */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Aktivitas Proposal & Milestone Masuk Terbaru</span>
              </h3>
            </div>

            <Link
              href="/client/projects"
              className="text-xs font-semibold text-primary hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              <span>Buka Semua Proyek</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {projects
              .flatMap((p) => p.applicants.map((a) => ({ ...a, projectTitle: p.title, projId: p.id })))
              .slice(0, 4)
              .map((app) => (
                <div
                  key={app.id}
                  className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 hover:border-primary/40 transition-colors"
                >
                  <img
                    src={app.avatar}
                    alt={app.name}
                    className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">{app.name}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">{app.bidAmount}</span>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{app.role}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {app.rating}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 line-clamp-1 italic font-light">
                      &ldquo;{app.pitch}&rdquo;
                    </p>

                    <div className="text-xs text-muted-foreground pt-1 flex items-center justify-between">
                      <span className="truncate">Proyek: <strong className="text-foreground">{app.projectTitle}</strong></span>
                      <span className="font-semibold text-emerald-600 shrink-0">{app.deliveryDays} hari</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. ESCROW & SAFE MILESTONE TRUST GUARANTEE BANNER */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-blue-500/5 to-indigo-500/5 p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Garansi Pembayaran 100% Aman (Rekber)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dana proyekmu tersimpan aman di rekening bersama terproteksi dan hanya akan dicairkan ke freelancer setelah kamu menyetujui hasil kerja.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Talenta Teruji & Bebas Resiko</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Setiap freelancer yang mengajukan proposal telah lulus verifikasi portofolio dan asesmen skill coding komprehensif.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Turnaround Cepat & Milestone Jelas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dapatkan proposal pertama dalam 15 menit, sepakati deliverable per milestone, dan nikmati serah terima source code 100% legal milikmu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. CHOICE MODAL (PROMPTED WHEN PRESSING ENTER IN HERO BAR) */}
      {/* ============================================================ */}
      {mounted &&
        isChoiceModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setIsChoiceModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 overflow-hidden">
              <ModalCloseButton onClick={() => setIsChoiceModalOpen(false)} />

              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Pilihan Aksi Cerdas</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Apa yang ingin Anda lakukan?
                </h3>
                {quickPrompt && (
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/60 text-xs text-foreground font-medium italic line-clamp-2">
                    &ldquo;{quickPrompt}&rdquo;
                  </div>
                )}
              </div>

              {/* 2 Choice Options */}
              <div className="grid gap-3.5 sm:grid-cols-2">
                {/* Option 1: Buat Proyek Baru */}
                <button
                  type="button"
                  onClick={() => {
                    setIsChoiceModalOpen(false);
                    handleCreateProjectFromHero();
                  }}
                  className="group flex flex-col justify-between text-left p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10 transition-all hover:scale-[1.02] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/25">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-md">
                      Rekomendasi
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Pasang Proyek Baru
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Buat draf spesifikasi proyek dari ide ini, tentukan milestone, dan buka tender proposal ke freelancer.
                    </p>
                  </div>
                </button>

                {/* Option 2: Cari di Market */}
                <button
                  type="button"
                  onClick={() => {
                    setIsChoiceModalOpen(false);
                    handleSearchMarket();
                  }}
                  className="group flex flex-col justify-between text-left p-5 rounded-2xl border-2 border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40 transition-all hover:scale-[1.02] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-muted border border-border text-foreground flex items-center justify-center shadow-xs">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      Eksplorasi
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      Cari di Market
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      Lihat proyek serupa yang pernah dibuat, bandingkan estimasi budget riil, dan temukan referensi.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ============================================================ */}
      {/* 9. INTERACTIVE ONBOARDING-STYLED "PASANG PROYEK BARU" MODAL */}
      {/* ============================================================ */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
        initialData={createModalInitialData}
      />

      {/* ============================================================ */}
      {/* 9. PROPOSAL REVIEW MODAL */}
      {/* ============================================================ */}
      {mounted &&
        selectedProjectForProposals &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedProjectForProposals(null)}
            />
            <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-hidden">
              <ModalCloseButton onClick={() => setSelectedProjectForProposals(null)} />

              <div>
                <span className="text-xs font-semibold text-primary">{selectedProjectForProposals.category}</span>
                <h2 className="text-xl font-bold text-foreground">
                  Tinjau Pelamar Proposal: {selectedProjectForProposals.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alokasi Budget: <strong className="text-foreground">{selectedProjectForProposals.budget}</strong> • {selectedProjectForProposals.applicants.length} Proposal Masuk
                </p>
              </div>

              <div className="space-y-4">
                {selectedProjectForProposals.applicants.map((app) => {
                  const isAccepted = acceptedProposalId === app.id;

                  return (
                    <div
                      key={app.id}
                      className={`rounded-2xl border p-5 transition-all space-y-3 ${isAccepted
                        ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                        : "border-border/70 bg-card hover:border-primary/40"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.avatar}
                            alt={app.name}
                            className="h-12 w-12 rounded-xl object-cover border border-border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span className="rounded-md bg-primary/10 px-2 py-0.2 text-[10px] font-semibold text-primary">
                                {app.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{app.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-bold text-primary block">{app.bidAmount}</span>
                            <span className="text-[11px] text-muted-foreground">{app.deliveryDays} hari kerja</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span>{app.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pitch */}
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40">
                        &ldquo;{app.pitch}&rdquo;
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {app.skills.map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Telah Diterima & Dana Diamankan</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedProjectForProposals(null);
                                  setSelectedTalentForInvite({
                                    id: app.id,
                                    name: app.name,
                                    avatar: app.avatar,
                                    role: app.role,
                                    headline: app.pitch || app.role,
                                    level: "Verified Pro",
                                    category: selectedProjectForProposals.category,
                                    rating: app.rating,
                                    reviewsCount: app.reviewsCount,
                                    startingPrice: app.bidAmount,
                                    skills: app.skills,
                                  });
                                }}
                                className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                              >
                                Hubungi Chat
                              </button>
                              <button
                                onClick={() => {
                                  setAcceptedProposalId(app.id);
                                  setTimeout(() => {
                                    setSelectedProjectForProposals(null);
                                  }, 1800);
                                }}
                                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                              >
                                Terima Proposal & Amankan Dana
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ============================================================ */}
      {/* 10. INVITE TALENT TO PROJECT MODAL */}
      {/* ============================================================ */}
      {mounted &&
        selectedTalentForInvite &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedTalentForInvite(null)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-hidden">
              <ModalCloseButton onClick={() => setSelectedTalentForInvite(null)} />

              {inviteSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Undangan Berhasil Terkirim!</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTalentForInvite.name} telah menerima notifikasi undangan proyek dan akan segera menghubungimu.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTalentForInvite.avatar}
                      alt={selectedTalentForInvite.name}
                      className="h-12 w-12 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-foreground">{selectedTalentForInvite.name}</h3>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedTalentForInvite.role}</p>
                      <span className="text-xs font-bold text-primary">{selectedTalentForInvite.startingPrice}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSendTalentInvite} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-foreground">
                        Pilih Proyek yang Ingin Ditawarkan
                      </label>
                      <select
                        value={inviteProjectId}
                        onChange={(e) => setInviteProjectId(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.budget})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-foreground">
                        Pesan Tambahan / Catatan Singkat
                      </label>
                      <textarea
                        rows={3}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Hai! Saya tertarik dengan portofoliomu dan ingin mengundangmu mengajukan proposal untuk proyek ini..."
                        className="w-full rounded-xl border border-input bg-background p-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTalentForInvite(null)}
                        className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                      >
                        Kirim Undangan Proyek
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Onboarding-Styled Create Project Modal Popup */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
        initialData={createModalInitialData}
      />
    </div>
  );
}
