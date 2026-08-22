"use client";

import { useState } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Star,
  Plus,
  ArrowRight,
  Code2,
  Palette,
  Bot,
  Smartphone,
  Server,
  Cloud,
  CheckCircle2,
  Clock,
  Users,
  FolderOpen,
  Heart,
} from "lucide-react";
import Link from "next/link";

interface GigService {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  sellerLevel: "Top Rated" | "Level 2 Seller" | "Verified Pro";
  gigTitle: string;
  category: string;
  thumbnail: string;
  rating: number;
  reviewsCount: number;
  startingPrice: string;
  deliveryTime: string;
  skills: string[];
}

interface ClientProjectSummary {
  id: string;
  title: string;
  category: string;
  budget: string;
  status: "Hiring" | "In Progress" | "Completed";
  proposalsCount: number;
  dueDate: string;
}

const CATEGORIES = [
  { name: "Frontend & Web", icon: Code2, count: "140+ Talents", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20" },
  { name: "UI/UX & Product Design", icon: Palette, count: "95+ Talents", color: "from-pink-500/10 to-rose-500/10 text-pink-600 border-pink-500/20" },
  { name: "AI & Machine Learning", icon: Bot, count: "60+ Talents", color: "from-purple-500/10 to-violet-500/10 text-purple-600 border-purple-500/20" },
  { name: "Mobile App Development", icon: Smartphone, count: "80+ Talents", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20" },
  { name: "Backend & Database", icon: Server, count: "110+ Talents", color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20" },
  { name: "DevOps & Cloud", icon: Cloud, count: "45+ Talents", color: "from-cyan-500/10 to-sky-500/10 text-cyan-600 border-cyan-500/20" },
];

const FEATURED_GIGS: GigService[] = [
  {
    id: "gig-1",
    sellerName: "Dimas Arya Pratama",
    sellerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    sellerLevel: "Verified Pro",
    gigTitle: "Membangun SaaS Dashboard Fullstack Modern dengan Next.js 14, Tailwind & Supabase",
    category: "Frontend & Web",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 38,
    startingPrice: "Rp 3.500.000",
    deliveryTime: "5 hari",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
  },
  {
    id: "gig-2",
    sellerName: "Siti Rahmawati",
    sellerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    sellerLevel: "Top Rated",
    gigTitle: "Desain UI/UX Mobile & Web App Lengkap dengan Figma Atomic Design System & Prototype",
    category: "UI/UX & Product Design",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 52,
    startingPrice: "Rp 2.800.000",
    deliveryTime: "4 hari",
    skills: ["Figma", "Design Systems", "Prototyping", "Wireframing"],
  },
  {
    id: "gig-3",
    sellerName: "Reza Mahendra",
    sellerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    sellerLevel: "Verified Pro",
    gigTitle: "Integrasi AI Voice Agent & LLM Chatbot dengan FastAPI, WebSockets & OpenAI",
    category: "AI & Machine Learning",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 29,
    startingPrice: "Rp 5.500.000",
    deliveryTime: "7 hari",
    skills: ["Python", "FastAPI", "OpenAI", "WebSockets"],
  },
  {
    id: "gig-4",
    sellerName: "Budi Santoso",
    sellerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    sellerLevel: "Level 2 Seller",
    gigTitle: "Aplikasi Mobile Flutter Cross-Platform (iOS & Android) dengan Midtrans Payment",
    category: "Mobile App Development",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 24,
    startingPrice: "Rp 4.200.000",
    deliveryTime: "8 hari",
    skills: ["Flutter", "Dart", "Midtrans", "Firebase"],
  },
];

const MY_ACTIVE_PROJECTS: ClientProjectSummary[] = [
  {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile Development",
    budget: "Rp 15.000.000",
    status: "Hiring",
    proposalsCount: 8,
    dueDate: "14 hari lagi",
  },
  {
    id: "proj-2",
    title: "AI Chatbot Integration for Customer Support",
    category: "AI & Automation",
    budget: "Rp 8.500.000",
    status: "In Progress",
    proposalsCount: 4,
    dueDate: "5 hari lagi",
  },
];

export function ClientDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [savedGigs, setSavedGigs] = useState<string[]>([]);

  const toggleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedGigs((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredGigs = FEATURED_GIGS.filter((gig) => {
    const matchesSearch =
      !searchQuery ||
      gig.gigTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "Semua" || gig.category.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in space-y-10">
      {/* 1. FIVERR-STYLE HERO SEARCH BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#111827] to-[#1E1B4B] p-8 md:p-12 text-white shadow-2xl border border-border/40">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold backdrop-blur-md border border-white/10">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Doable! Tech Talent Marketplace</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Temukan Freelancer & Jasa Tech Terbaik untuk Proyekmu.
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-light">
            Rekrut developer, UI/UX designer, dan AI engineer terverifikasi dengan proteksi pembayaran escrow 100% aman.
          </p>

          {/* Large Marketplace Search Bar */}
          <div className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl bg-white p-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-3 px-3">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder='Coba cari "Next.js 14", "Figma UI/UX", "AI Voice Agent"...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>
              <button
                onClick={() => {}}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-600 transition-all hover:scale-[1.01]"
              >
                <span>Cari Talent</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Popular Searches Tags */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-slate-400">Populer:</span>
              {["Next.js 14", "Figma UI/UX", "FastAPI", "AI Voice Agent", "Flutter", "Tailwind"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/90 hover:bg-white/15 transition-colors backdrop-blur-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CLIENT'S ACTIVE POSTINGS & QUICK STATS STRIP */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              <span>Proyek Saya yang Sedang Berjalan ({MY_ACTIVE_PROJECTS.length})</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Pantau status hiring, pelamar proposal, dan milestone pengerjaan.
            </p>
          </div>

          <Link
            href="/client/projects"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 text-xs font-semibold transition-colors self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Pasang Proyek Baru</span>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {MY_ACTIVE_PROJECTS.map((proj) => (
            <div
              key={proj.id}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {proj.category}
                </span>
                <span
                  className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                    proj.status === "Hiring"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-blue-500/10 text-blue-600"
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-foreground line-clamp-1">{proj.title}</h4>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{proj.budget}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {proj.proposalsCount} Proposal
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {proj.dueDate}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <Link
                  href="/client/projects"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat Semua Proposal →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. EXPLORE CATEGORIES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Jelajahi Kategori Layanan
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Pilih spesialisasi yang dibutuhkan untuk mempercepat pengembangan produkmu.
            </p>
          </div>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                href={`/client/talent?category=${encodeURIComponent(cat.name)}`}
                className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br ${cat.color} transition-transform group-hover:scale-105 shrink-0`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{cat.count}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. FEATURED FREELANCER GIGS & SERVICES (FIVERR CARD STYLE) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>100% Talent Telah Diverifikasi & Lulus Skill Test</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Jasa & Freelancer Pilihan Teratas
            </h2>
          </div>

          <Link
            href="/client/talent"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            <span>Lihat Semua Talent Terverifikasi</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {["Semua", "Frontend", "UI/UX", "AI & Machine", "Mobile"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-xs"
                  : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gigs Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {filteredGigs.map((gig) => (
            <div
              key={gig.id}
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-1"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img
                    src={gig.thumbnail}
                    alt={gig.gigTitle}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => toggleSave(gig.id, e)}
                    className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                    title="Simpan Jasa"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        savedGigs.includes(gig.id)
                          ? "fill-rose-500 text-rose-500"
                          : "text-white"
                      }`}
                    />
                  </button>
                  <span className="absolute bottom-2 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                    {gig.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Seller Header */}
                  <div className="flex items-center gap-2.5">
                    <img
                      src={gig.sellerAvatar}
                      alt={gig.sellerName}
                      className="h-7 w-7 rounded-full object-cover border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-foreground truncate">{gig.sellerName}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium">{gig.sellerLevel}</span>
                    </div>
                  </div>

                  {/* Gig Title */}
                  <h3 className="text-xs font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {gig.gigTitle}
                  </h3>

                  {/* Rating & Reviews */}
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-bold text-foreground">{gig.rating}</span>
                    <span className="text-muted-foreground text-[11px]">({gig.reviewsCount})</span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1">
                    {gig.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer: Starting Price & Hire CTA */}
              <div className="border-t border-border/40 p-4 pt-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Mulai dari</span>
                  <span className="text-sm font-bold text-primary">{gig.startingPrice}</span>
                </div>

                <Link
                  href="/client/talent"
                  className="rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                >
                  Hire Talent
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. TRUST & ESCROW GUARANTEE BANNER */}
      <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-blue-500/5 to-indigo-500/5 p-8 md:p-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Proteksi Escrow 100%</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dana proyekmu tersimpan aman di rekening escrow dan hanya akan dicairkan setelah kamu menyetujui hasil milestone.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Keahlian Teruji & Terverifikasi</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Seluruh freelancer melalui uji keahlian kuis coding dan verifikasi portofolio sebelum dapat mengajukan proposal.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Turnaround Cepat & Tepat Waktu</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dapatkan proposal dari talenta berbakat dalam hitungan menit dan mulai pengerjaan proyek tanpa birokrasi berbelit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
