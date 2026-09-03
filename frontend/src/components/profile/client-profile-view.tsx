/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  CheckCircle2,
  Star,
  Banknote,
  Briefcase,
  Award,
  ArrowRight,
  Edit3,
  Share2,
  Plus,
  ExternalLink,
  Check,
  Clock,
  FileText,
  Camera
} from "lucide-react";

export interface ClientProjectItem {
  id: string;
  title: string;
  category: string;
  budget: string;
  proposalsCount: number;
  status: "Hiring" | "In Progress" | "Completed" | "Open" | "Draft";
  dueDate: string;
  skills: string[];
}

export interface ClientReviewItem {
  id: string;
  freelancerName: string;
  freelancerRole: string;
  freelancerAvatar: string;
  rating: number;
  date: string;
  comment: string;
  projectTitle: string;
}

export interface ClientProfileData {
  id: string;
  companyName: string;
  tagline: string;
  avatar: string;
  coverImage?: string;
  industry: string;
  companySize: string;
  location: string;
  website: string;
  foundedYear: string;
  totalSpent: string;
  projectsPosted: number;
  activeProjectsCount: number;
  hireRate: string;
  rating: number;
  reviewsCount: number;
  about: string[];
  hiringInterests: string[];
  recentProjects: ClientProjectItem[];
  reviews: ClientReviewItem[];
}

interface ClientProfileViewProps {
  clientId?: string;
  isOwner?: boolean;
}

export function ClientProfileView({ clientId, isOwner = true }: ClientProfileViewProps) {
  const { user } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);

  // Check if current authenticated user is the owner
  const targetId = clientId || user?.id;
  const isActualOwner = Boolean(user && targetId && (user.id === targetId || (!clientId && isOwner)));

  // Initialize with reactive user metadata
  const meta = isActualOwner ? (user?.user_metadata || {}) : {};
  const [profile, setProfile] = useState<ClientProfileData>({
    id: targetId || "client-user",
    companyName: meta.company_name || meta.full_name || (user?.email ? user.email.split("@")[0] : "Perusahaan Klien"),
    tagline: meta.tagline || meta.bio || "",
    avatar: meta.avatar_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80",
    industry: meta.industry || "Teknologi & Bisnis",
    companySize: meta.company_size || "1-10 Karyawan",
    location: meta.location || "Jakarta, Indonesia",
    website: meta.company_website || meta.website || "",
    foundedYear: "2025",
    totalSpent: "Rp 0",
    projectsPosted: 0,
    activeProjectsCount: 0,
    hireRate: "100%",
    rating: 5.0,
    reviewsCount: 0,
    about: meta.bio ? [meta.bio] : [
      "Perusahaan pemberi kerja terdaftar di ekosistem TripleT."
    ],
    hiringInterests: ["Web Development", "UI/UX Design", "Mobile App"],
    recentProjects: [],
    reviews: []
  });

  useEffect(() => {
    async function loadClientData() {
      if (!targetId) {
        return;
      }

      try {
        const supabase = createClient();
        let clientData: Record<string, unknown> | null = null;
        let userData: Record<string, unknown> | null = null;

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

        if (isUuid) {
          // 1. Ambil data dari tabel client_profiles & users di Supabase
          try {
            const { data: cData } = await supabase
              .from("client_profiles")
              .select(`
                *,
                user:users!user_id(id, full_name, avatar_url, location, bio, created_at, email)
              `)
              .or(`user_id.eq.${targetId},id.eq.${targetId}`)
              .maybeSingle();

            if (cData) {
              clientData = cData;
              userData = Array.isArray(cData.user) ? cData.user[0] : cData.user;
            }
          } catch (e) {
            console.warn("Could not query client_profiles join:", e);
          }

          // 2. Jika user data belum ditemukan, ambil langsung dari tabel users
          if (!userData) {
            try {
              const { data: uData } = await supabase
                .from("users")
                .select("id, full_name, avatar_url, location, bio, created_at, email")
                .eq("id", targetId)
                .maybeSingle();

              if (uData) {
                userData = uData;
              }
            } catch (e) {
              console.warn("Could not query users table directly:", e);
            }
          }

          // 3. Jika clientData belum ditemukan, query client_profiles berdasarkan user_id
          if (!clientData && (userData?.id || targetId)) {
            try {
              const uid = userData?.id || targetId;
              const { data: cpByUid } = await supabase
                .from("client_profiles")
                .select("*")
                .eq("user_id", uid)
                .maybeSingle();

              if (cpByUid) {
                clientData = cpByUid;
              }
            } catch (e) {
              console.warn("Could not query client_profiles by user_id:", e);
            }
          }
        }

        const cData = clientData;
        const actualOwnerId = cData?.user_id || userData?.id || targetId;

        // 2. Ambil proyek nyata yang dibuat oleh user client ini
        const { data: pData } = await supabase
          .from("projects")
          .select("*")
          .eq("owner_id", actualOwnerId)
          .order("created_at", { ascending: false });

        // 3. Ambil ulasan nyata yang masuk untuk client ini
        const { data: rData } = await supabase
          .from("reviews")
          .select(`
            *,
            reviewer:users!reviewer_id(full_name, avatar_url, role),
            project:projects!project_id(title)
          `)
          .eq("reviewee_id", actualOwnerId);

        const u = userData || (isActualOwner ? user?.user_metadata : {}) || {};

        // Hitung statistik riil dari database
        const projectsList: ClientProjectItem[] = ((pData as Array<Record<string, unknown>>) || []).map((p) => ({
          id: String(p.id || ""),
          title: String(p.title || "Proyek Tanpa Judul"),
          category: String(p.category || "General").toUpperCase(),
          budget: String(p.budget || (p.budget_min ? `Rp ${(Number(p.budget_min)).toLocaleString("id-ID")}` : "Rp 0")),
          proposalsCount: Number(p.proposals_count) || 0,
          status: (p.status as "Hiring" | "In Progress" | "Completed" | "Open" | "Draft") || "Hiring",
          dueDate: p.due_date
            ? new Date(String(p.due_date)).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
            : "Fleksibel",
          skills: Array.isArray(p.skills) && p.skills.length > 0 ? (p.skills as string[]) : ["Digital Specialist"]
        }));

        // Hitung total dana proyek dari semua proyek
        const totalBudgetCalc = ((pData as Array<Record<string, unknown>>) || []).reduce((acc: number, cur) => {
          return acc + (Number(cur.budget_numeric) || Number(cur.budget_min) || 0);
        }, 0);

        const totalSpentText = totalBudgetCalc > 0
          ? `Rp ${totalBudgetCalc.toLocaleString("id-ID")}`
          : (cData?.total_spent ? `Rp ${cData.total_spent.toLocaleString("id-ID")}` : "Rp 0");

        const activeCount = projectsList.filter((p) => p.status === "In Progress" || p.status === "Hiring" || p.status === "Open").length;
        const hireRateText = projectsList.length > 0
          ? `${Math.round((projectsList.filter((p) => p.status !== "Draft").length / projectsList.length) * 100)}%`
          : "100%";

        // Ekstrak kebutuhan talenta dari proyek yang pernah dibuat
        const extractedSkills = Array.from(
          new Set(projectsList.flatMap((p) => p.skills))
        ).slice(0, 6);

        const hiringInterests = extractedSkills.length > 0
          ? extractedSkills
          : (cData?.hiring_needs && cData.hiring_needs.length > 0 ? cData.hiring_needs : ["Web Development", "UI/UX Design", "Mobile App"]);

        const reviewsList: ClientReviewItem[] = ((rData as Array<Record<string, unknown>>) || []).map((r) => {
          const rev = r.reviewer as Record<string, unknown> | undefined;
          const proj = r.project as Record<string, unknown> | undefined;
          return {
            id: String(r.id || ""),
            freelancerName: String(rev?.full_name || "Freelancer Terverifikasi"),
            freelancerRole: String(rev?.role || "Talenta Spesialis"),
            freelancerAvatar: String(rev?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
            rating: Number(r.rating) || 5,
            date: r.created_at ? new Date(String(r.created_at)).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "Baru saja",
            comment: String(r.comment || "Kerjasama yang sangat baik dan pembayaran milestone tepat waktu."),
            projectTitle: String(proj?.title || "Proyek Selesai")
          };
        });

        const joinedYear = u?.created_at
          ? new Date(u.created_at).getFullYear().toString()
          : "2025";

        const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
        const DEFAULT_BANNER = "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80";
        const cleanAvatar = (url?: string | null) => (url && typeof url === "string" && url.startsWith("http")) ? url : DEFAULT_AVATAR;
        const cleanBanner = (url?: string | null) => (url && typeof url === "string" && url.startsWith("http")) ? url : DEFAULT_BANNER;

        const companyDisplayName = isActualOwner
          ? (meta.company_name || meta.full_name || u.full_name || (u.email ? u.email.split("@")[0] : (user?.email ? user.email.split("@")[0] : "Perusahaan Klien")))
          : (cData?.company_name || u.full_name || (u.email ? u.email.split("@")[0] : "Perusahaan Klien"));

        const companyTagline = isActualOwner
          ? (meta.tagline || meta.bio || (cData?.industry ? `Perusahaan di bidang ${cData.industry}` : "Pemberi kerja terdaftar di platform TripleT"))
          : (cData?.tagline || u.bio || (cData?.industry ? `Perusahaan di bidang ${cData.industry}` : "Pemberi kerja terdaftar di platform TripleT"));

        setProfile({
          id: targetId,
          companyName: companyDisplayName,
          tagline: companyTagline,
          avatar: cleanAvatar(isActualOwner ? (meta.avatar_url || u.avatar_url) : u.avatar_url),
          coverImage: cleanBanner(isActualOwner ? (meta.banner_url || meta.cover_image || cData?.banner_url || u.banner_url) : (cData?.banner_url || u.banner_url)),
          industry: cData?.industry || (isActualOwner && meta.industry) || "Teknologi & Bisnis",
          companySize: cData?.company_size || (isActualOwner && meta.company_size) || "1-10 Karyawan (Startup)",
          location: (isActualOwner && meta.location) || u.location || "Jakarta, Indonesia",
          website: cData?.company_website || (isActualOwner && (meta.company_website || meta.website)) || "",
          foundedYear: joinedYear,
          totalSpent: totalSpentText,
          projectsPosted: projectsList.length,
          activeProjectsCount: activeCount,
          hireRate: hireRateText,
          rating: reviewsList.length > 0
            ? Number((reviewsList.reduce((a, b) => a + b.rating, 0) / reviewsList.length).toFixed(1))
            : 5.0,
          reviewsCount: reviewsList.length,
          about: (isActualOwner && meta.bio) ? [meta.bio] : (u.bio ? [u.bio] : [
            "Perusahaan pemberi kerja terdaftar di ekosistem TripleT. Mengutamakan kolaborasi profesional, scope kerja terdefinisi jelas, dan pencairan milestone tepat waktu."
          ]),
          hiringInterests: hiringInterests,
          recentProjects: projectsList,
          reviews: reviewsList
        });
      } catch (err) {
        console.error("Gagal membaca profil dari database Supabase:", err);
      }
    }

    loadClientData();
  }, [user, targetId, isActualOwner, meta]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Main 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Company Identity, Key Stats & Details (4 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Company Identity Card */}
            <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
              {/* Header Cover Banner */}
              <div className="relative h-28 w-full bg-gradient-to-br from-blue-600/30 via-indigo-600/20 to-purple-600/30 overflow-hidden group">
                {profile.coverImage && (
                  <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="h-full w-full object-cover opacity-75 transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
                {isOwner && (
                  <Link
                    href="/client/settings?tab=profile"
                    className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-white/20"
                    title="Ubah Banner Profil"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Ubah Banner</span>
                  </Link>
                )}
              </div>

              {/* Avatar / Logo & Main Info */}
              <div className="px-6 pb-6 -mt-12 space-y-4 text-center">
                <div className="relative inline-block mx-auto">
                  <img
                    src={profile.avatar}
                    alt={profile.companyName}
                    className="h-24 w-24 rounded-2xl object-cover border-4 border-card shadow-lg bg-muted mx-auto"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h1 className="text-xl font-bold text-foreground">{profile.companyName}</h1>
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs font-semibold text-primary">{profile.industry}</p>
                  
                  {profile.location && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{profile.location}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  {isActualOwner ? (
                    <Link
                      href="/client/settings?tab=profile"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-3 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Profil</span>
                    </Link>
                  ) : (
                    <Link
                      href="#projects-section"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-3 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      <span>Lihat Lowongan</span>
                    </Link>
                  )}

                  <button
                    onClick={handleCopyLink}
                    className="p-3 rounded-2xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                    title={copiedLink ? "Link Disalin!" : "Bagikan Profil"}
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. 4 Real Stat Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Stat 1: Projects Posted */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.projectsPosted}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Proyek Diposting</div>
              </div>

              {/* Stat 2: Rating */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.rating}</div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {profile.reviewsCount > 0 ? `Rating (${profile.reviewsCount})` : "Rating Talenta"}
                </div>
              </div>

              {/* Stat 3: Hire Rate */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.hireRate}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Tingkat Hire</div>
              </div>

              {/* Stat 4: Total Spent */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Banknote className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-emerald-600 truncate px-1">{profile.totalSpent}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Dana Proyek</div>
              </div>
            </div>

            {/* 3. Company Details from DB */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <span>Detail Perusahaan</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    Ukuran Tim
                  </span>
                  <span className="font-semibold text-foreground">{profile.companySize}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" />
                    Website
                  </span>
                  {profile.website ? (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      <span>{profile.website.replace("https://", "").replace("http://", "")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <Link href="/client/settings?tab=profile" className="text-muted-foreground hover:text-primary underline">
                      Tambah website
                    </Link>
                  )}
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    Verifikasi Pembayaran
                  </span>
                  <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">Terverifikasi</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Respon Milestone
                  </span>
                  <span className="font-semibold text-foreground">&lt; 2 Jam</span>
                </div>
              </div>
            </div>

            {/* 4. Hiring Needs */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span>Keahlian yang Sering Dicari</span>
              </h3>

              <div className="flex flex-wrap gap-1.5">
                {profile.hiringInterests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: About, Projects & Reviews (8 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. About Company Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground">Tentang Perusahaan & Kultur Hiring</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {profile.about.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* 3. Real Projects Posted by Client */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h2 className="text-base font-bold text-foreground">Proyek & Lowongan Terbuka ({profile.projectsPosted})</h2>
                  <p className="text-xs text-muted-foreground">Daftar proyek aktif dan riwayat kontrak yang dibuat oleh akun Anda.</p>
                </div>
                <Link
                  href="/client/projects"
                  className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
                >
                  <span>KELOLA PROYEK</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {profile.recentProjects.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border/80 p-8 text-center bg-card/50 space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Belum Ada Proyek yang Diposting</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Buat proyek pertama Anda untuk mulai menerima proposal dari talenta terverifikasi.
                  </p>
                  <Link
                    href="/client/projects?create=true"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Buat Proyek Pertama</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.recentProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="group rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                            {proj.category}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              proj.status === "Hiring" || proj.status === "Open"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : proj.status === "In Progress"
                                ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}
                          >
                            {proj.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                          {proj.title}
                        </h3>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {proj.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40 shrink-0 gap-1.5">
                        <div className="text-base font-extrabold text-foreground">{proj.budget}</div>
                        <div className="text-[11px] text-muted-foreground font-medium">
                          {proj.proposalsCount} Proposal Masuk
                        </div>
                        <Link
                          href={`/client/projects/${proj.id}`}
                          className="rounded-xl border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-foreground hover:bg-primary hover:text-white transition-colors"
                        >
                          Detail Proyek
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Real Freelancer Reviews for Client */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span>Ulasan dari Talenta & Freelancer ({profile.reviewsCount})</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Testimoni dari freelancer terverifikasi yang pernah menyelesaikan milestone dengan perusahaan ini.
                  </p>
                </div>
                {profile.reviewsCount > 0 && (
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-xl">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{profile.rating} / 5.0</span>
                  </div>
                )}
              </div>

              {profile.reviews.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Belum Ada Ulasan</p>
                  <p>Ulasan bintang dan testimoni akan otomatis muncul setelah Anda menyelesaikan milestone proyek bersama freelancer.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {profile.reviews.map((review) => (
                    <div key={review.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.freelancerAvatar}
                            alt={review.freelancerName}
                            className="h-10 w-10 rounded-full object-cover border border-border"
                          />
                          <div>
                            <div className="text-xs font-bold text-foreground">{review.freelancerName}</div>
                            <div className="text-[11px] text-muted-foreground">{review.freelancerRole}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-0.5 justify-end">
                            {[...Array(review.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{review.date}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed pl-13">
                        &ldquo;{review.comment}&rdquo;
                      </p>

                      <div className="pl-13 text-[10px] text-primary font-semibold flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        <span>Proyek: {review.projectTitle}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
