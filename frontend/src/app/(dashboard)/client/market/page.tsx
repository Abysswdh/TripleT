"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  Building2,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Plus,
  Eye,
  Copy,
  Check,
  X
} from "lucide-react";
import Link from "next/link";
import { getOpenProjects } from "@/lib/services/projects";

interface Milestone {
  phase: string;
  title: string;
  percentage: number;
  amount: string;
  deliverables: string[];
}

interface MarketProject {
  id: string;
  title: string;
  clientName: string;
  clientType: "Enterprise" | "Scale-Up" | "Startup" | "Agensi";
  clientLocation: string;
  clientVerified: boolean;
  category: "Web & Fullstack" | "Mobile Apps" | "UI/UX & Design" | "AI & Machine Learning" | "Backend & Cloud" | "DevOps & Data";
  budget: string;
  rawBudget: number;
  budgetType: "Fixed Scope" | "Hourly Milestone";
  timeline: string;
  status: "Menerima Proposal" | "Sedang Dikerjakan" | "Selesai (Blueprint)";
  difficulty: "Starter" | "Standard" | "Enterprise";
  proposalsCount: number;
  postedAt: string;
  description: string;
  objectives: string[];
  skills: string[];
  milestones: Milestone[];
  benchmarkScore: string;
  benchmarkNote: string;
}

const CATEGORY_TABS = [
  "Semua Kategori",
  "Web & Fullstack",
  "Mobile Apps",
  "UI/UX & Design",
  "AI & Machine Learning",
  "Backend & Cloud",
  "DevOps & Data"
] as const;

export default function ProjectMarketPage() {
  const [marketProjects, setMarketProjects] = useState<MarketProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Kategori");
  const [selectedStatus, setSelectedStatus] = useState<string>("Semua Status");
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"newest" | "budget_high" | "proposals" | "name">("newest");
  
  // Selected project for inspection modal
  const [activeProject, setActiveProject] = useState<MarketProject | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarket() {
      const data = await getOpenProjects();
      if (data && data.length > 0) {
        const mapped: MarketProject[] = data.map((p) => ({
          id: p.id,
          title: p.title,
          clientName: p.owner?.fullName || "Klien Terverifikasi",
          clientType: "Startup",
          clientLocation: p.owner?.location || "Indonesia",
          clientVerified: true,
          category: p.category.includes("Mobile")
            ? "Mobile Apps"
            : p.category.includes("UI/UX")
            ? "UI/UX & Design"
            : p.category.includes("AI")
            ? "AI & Machine Learning"
            : p.category.includes("Backend")
            ? "Backend & Cloud"
            : "Web & Fullstack",
          budget: p.budget,
          rawBudget: p.budgetNumeric,
          budgetType: "Fixed Scope",
          timeline: p.dueDate,
          status: p.status === "Completed" ? "Selesai (Blueprint)" : p.status === "In Progress" ? "Sedang Dikerjakan" : "Menerima Proposal",
          difficulty: p.difficulty,
          proposalsCount: p.proposalsCount,
          postedAt: p.postedDate,
          description: p.description,
          objectives: p.objectives && p.objectives.length > 0 ? p.objectives : ["Menyelesaikan milestone sesuai timeline"],
          skills: p.skills,
          milestones: p.milestones.map((m) => ({
            phase: m.dueDate,
            title: m.title,
            percentage: 50,
            amount: m.amount,
            deliverables: m.deliverables && m.deliverables.length > 0 ? m.deliverables : ["Source Code", "Dokumentasi"],
          })),
          benchmarkScore: "Benchmark Terverifikasi",
          benchmarkNote: "Spesifikasi proyek terverifikasi dengan milestone escrow.",
        }));

        setMarketProjects(mapped);
      }
    }
    loadMarket();
  }, []);

  // Filtered & Sorted Projects
  const filteredProjects = useMemo(() => {
    return marketProjects.filter((proj) => {
      // Search
      const matchesSearch =
        proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        proj.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category
      const matchesCategory =
        selectedCategory === "Semua Kategori" || proj.category === selectedCategory;

      // Status
      const matchesStatus =
        selectedStatus === "Semua Status" || proj.status.toLowerCase().includes(selectedStatus.toLowerCase());

      // Budget tier
      let matchesBudget = true;
      if (selectedBudgetTier === "< 10jt") matchesBudget = proj.rawBudget < 10000000;
      else if (selectedBudgetTier === "10jt - 20jt") matchesBudget = proj.rawBudget >= 10000000 && proj.rawBudget <= 20000000;
      else if (selectedBudgetTier === "> 20jt") matchesBudget = proj.rawBudget > 20000000;

      return matchesSearch && matchesCategory && matchesStatus && matchesBudget;
    }).sort((a, b) => {
      if (sortBy === "budget_high") return b.rawBudget - a.rawBudget;
      if (sortBy === "proposals") return b.proposalsCount - a.proposalsCount;
      if (sortBy === "name") return a.title.localeCompare(b.title);
      return 0; // default newest
    });
  }, [marketProjects, searchQuery, selectedCategory, selectedStatus, selectedBudgetTier, sortBy]);

  const handleCopyLink = (projId: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/client/market#${projId}`);
      setCopiedId(projId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
          Project Market
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Jelajahi proyek yang dibuat klien lain, pantau referensi budget, dan tinjau spesifikasi teknis.
        </p>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="space-y-4">
        {/* Search Bar & Primary Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama proyek, perusahaan, stack teknologi (Next.js, Python, Flutter, Figma)..."
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Status Selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              aria-label="Filter status proyek"
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Menerima Proposal">Menerima Proposal</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Selesai">Selesai (Blueprint)</option>
            </select>

            {/* Budget Range Selector */}
            <select
              value={selectedBudgetTier}
              onChange={(e) => setSelectedBudgetTier(e.target.value)}
              aria-label="Filter rentang budget"
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="Semua">Semua Budget</option>
              <option value="< 10jt">&lt; Rp 10 Juta</option>
              <option value="10jt - 20jt">Rp 10jt - Rp 20jt</option>
              <option value="> 20jt">&gt; Rp 20 Juta</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "budget_high" | "proposals" | "name")}
              aria-label="Urutkan proyek"
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="newest">Terbaru</option>
              <option value="budget_high">Budget Tertinggi</option>
              <option value="proposals">Paling Populer</option>
              <option value="name">Nama Proyek (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-102"
                    : "border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PROJECT GRID */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
          <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-bold text-foreground">Tidak Ada Proyek yang Cocok</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Coba ubah kata kunci pencarian atau sesuaikan opsi kategori dan rentang budget.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua Kategori");
              setSelectedStatus("Semua Status");
              setSelectedBudgetTier("Semua");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-primary hover:bg-muted transition-colors"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
            >
              <div className="space-y-3.5">
                {/* Header: Client & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary font-bold text-xs border border-primary/20 shrink-0">
                      {proj.clientName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground truncate">{proj.clientName}</span>
                        {proj.clientVerified && (
                          <span title="Verified Client">
                            <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {proj.clientType} • {proj.clientLocation}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      proj.status === "Menerima Proposal"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : proj.status === "Sedang Dikerjakan"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                    }`}
                  >
                    {proj.status}
                  </span>
                </div>

                {/* Category & Title */}
                <div>
                  <span className="text-[11px] font-semibold text-primary">{proj.category}</span>
                  <h3 className="mt-0.5 text-base font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {proj.title}
                  </h3>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-foreground/80 border border-border/50"
                    >
                      {skill}
                    </span>
                  ))}
                  {proj.skills.length > 4 && (
                    <span className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      +{proj.skills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Scope & Action Footer */}
              <div className="mt-5 pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Estimasi Budget
                    </p>
                    <p className="text-sm font-bold text-foreground">{proj.budget}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Durasi & Pelamar
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      {proj.timeline} • {proj.proposalsCount} Proposal
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => setActiveProject(proj)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl border border-border/80 bg-muted/40 hover:bg-muted px-2.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/40"
                  >
                    <Eye className="h-3.5 w-3.5 text-primary" />
                    <span>Lihat Scope</span>
                  </button>

                  <Link
                    href={`/client/projects`}
                    className="w-full flex items-center justify-center gap-1 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 px-2.5 py-2 text-xs font-semibold text-primary transition-all hover:scale-102"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Pakai Template</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. CALL TO ACTION SECTION */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Siap Mempublikasikan Kebutuhan Proyek Anda?
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
            Terapkan benchmark budget dan struktur milestone yang telah Anda pelajari untuk menarik talenta terbaik dalam hitungan jam.
          </p>
        </div>
        <Link
          href="/client/projects"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-105 shrink-0"
        >
          <span>Buat Proyek Anda Sekarang</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* 5. PROJECT DETAIL & BENCHMARK MODAL */}
      {activeProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl overflow-y-auto animate-in zoom-in-95">
            {/* Close Button */}
            <button
              onClick={() => setActiveProject(null)}
              className="absolute right-4 top-4 rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="space-y-3 border-b border-border/60 pb-5">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary border border-primary/20">
                  {activeProject.category}
                </span>
                <span className="text-xs text-muted-foreground">• Diposting {activeProject.postedAt}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{activeProject.title}</h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <Building2 className="h-4 w-4 text-primary" />
                  <span>{activeProject.clientName}</span>
                </div>
                <span>•</span>
                <span>{activeProject.clientType}</span>
                <span>•</span>
                <span>{activeProject.clientLocation}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6">
              {/* Benchmark Assessment Badge */}
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Analisis Benchmark Pasar: {activeProject.benchmarkScore}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeProject.benchmarkNote}
                  </p>
                </div>
              </div>

              {/* Key Specs Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-[11px] text-muted-foreground">Anggaran Total</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{activeProject.budget}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-[11px] text-muted-foreground">Model Kontrak</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{activeProject.budgetType}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-[11px] text-muted-foreground">Target Durasi</p>
                  <p className="text-sm font-bold text-foreground mt-0.5">{activeProject.timeline}</p>
                </div>
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3">
                  <p className="text-[11px] text-muted-foreground">Tingkat Kesulitan</p>
                  <p className="text-sm font-bold text-primary mt-0.5">{activeProject.difficulty}</p>
                </div>
              </div>

              {/* Description & Objectives */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground">Deskripsi & Tujuan Proyek</h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {activeProject.description}
                </p>
                <div className="space-y-2 pt-1">
                  {activeProject.objectives.map((obj, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tech Stack Required */}
              <div className="space-y-2.5">
                <h4 className="text-sm font-bold text-foreground">Tech Stack & Keahlian</h4>
                <div className="flex flex-wrap gap-2">
                  {activeProject.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestone Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground">
                  Struktur Milestone & Deliverables ({activeProject.milestones.length} Tahapan)
                </h4>
                <div className="space-y-3">
                  {activeProject.milestones.map((ms, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/80 bg-muted/20 p-4 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold">
                            {ms.phase}
                          </span>
                          <span className="text-xs font-bold text-foreground">{ms.title}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-primary">{ms.amount}</span>
                          <span className="text-[10px] text-muted-foreground ml-1">({ms.percentage}%)</span>
                        </div>
                      </div>

                      <div className="border-t border-border/40 pt-2 space-y-1.5">
                        <p className="text-[11px] font-medium text-muted-foreground">Deliverables Kunci:</p>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                          {ms.deliverables.map((del, dIdx) => (
                            <div key={dIdx} className="flex items-center gap-1.5 text-xs text-foreground/90">
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{del}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="border-t border-border/60 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => handleCopyLink(activeProject.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                {copiedId === activeProject.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Link Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin Referensi</span>
                  </>
                )}
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  onClick={() => setActiveProject(null)}
                  className="flex-1 sm:flex-none rounded-xl border border-border px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  Tutup
                </button>
                <Link
                  href="/client/projects"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all hover:scale-102"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Proyek dengan Format Ini</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
