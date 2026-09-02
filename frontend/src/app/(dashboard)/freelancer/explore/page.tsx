"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  Search,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { getOpenProjects } from "@/lib/services/projects";

interface Quest {
  id: string;
  ownerId?: string;
  title: string;
  clientName: string;
  category: string;
  budget: string;
  budgetType: "Fixed" | "Hourly";
  skills: string[];
  matchScore: number;
  proposalsCount: number;
  postedAt: string;
  difficulty: "Entry" | "Intermediate" | "Expert";
  description: string;
  deadline: string;
}

const CATEGORIES = ["Semua", "Web Development", "Backend & API Engineering", "UI/UX & Product Design", "AI & Machine Learning", "Mobile App Development"];

export default function FreelancerExploreQuestsPage() {
  const { user } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      const liveProjects = await getOpenProjects();
      if (liveProjects && liveProjects.length > 0) {
        const mapped: Quest[] = liveProjects.map((p) => ({
          id: p.id,
          ownerId: p.ownerId,
          title: p.title,
          clientName: p.owner?.fullName || "Klien Terverifikasi",
          category: p.category,
          budget: p.budget,
          budgetType: "Fixed",
          skills: p.skills,
          matchScore: 95,
          proposalsCount: p.proposalsCount,
          postedAt: p.postedDate,
          difficulty: p.difficulty === "Enterprise" ? "Expert" : p.difficulty === "Standard" ? "Intermediate" : "Entry",
          description: p.description,
          deadline: p.dueDate,
        }));
        setQuests(mapped);
      }
      setLoading(false);
    }
    loadProjects();
  }, []);

  const filteredQuests = quests.filter((quest) => {
    const matchesSearch =
      quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quest.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "Semua" || quest.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Compass className="h-3.5 w-3.5" />
            <span>Papan Proyek Freelancer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Jelajahi Proyek
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Temukan proyek terverifikasi dengan sistem garansi pembayaran escrow yang aman
          </p>
        </div>

        <Link
          href="/freelancer/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          <span>← Kembali ke Overview</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari judul proyek, keahlian (React, FastAPI, Figma)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-2xl border border-border/80 bg-card pl-10 pr-4 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${selectedCategory === cat
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "border border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quest Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted/40 animate-pulse border border-border/60" />
          ))
        ) : filteredQuests.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-2">
            <p className="text-base font-bold text-foreground">Tidak ada proyek yang ditemukan</p>
            <p className="text-xs text-muted-foreground">Belum ada proyek yang sesuai dengan kriteria pencarian atau kategori ini.</p>
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <div
              key={quest.id}
              className="group flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {quest.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                    <Sparkles className="h-3 w-3" />
                    {quest.matchScore}% Match
                  </span>
                </div>

                <div>
                  <Link
                    href={`/freelancer/explore/${quest.id}`}
                    className="block text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2"
                  >
                    {quest.title}
                  </Link>
                  <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {quest.description}
                  </p>
                </div>

                <div className="space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-black text-foreground font-heading">{quest.budget}</span>
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      Tingkat: {quest.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Klien: <strong className="text-foreground">{quest.clientName}</strong></span>
                    <span className="font-semibold text-primary">{quest.proposalsCount} Proposal</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {quest.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/40">
                {user && quest.ownerId === user.id ? (
                  <div className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-muted/80 py-2.5 text-xs font-semibold text-muted-foreground border border-border/60 select-none cursor-not-allowed">
                    <span>Proyek Anda Sendiri</span>
                  </div>
                ) : (
                  <Link
                    href={`/freelancer/explore/${quest.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-primary py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/20 hover:bg-primary-600 active:scale-[0.99] transition-all"
                  >
                    <span>Ajukan Proposal</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

