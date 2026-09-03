"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sparkles,
  Zap,
  Award,
  Layers,
  FileText,
  Send,
  TrendingUp,
  Link as LinkIcon,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Check,
  FileCode
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getProjectById, type ProjectRecord } from "@/lib/services/projects";
import { submitProposal } from "@/lib/services/proposals";

export default function FreelancerProjectDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const projectId = typeof params?.id === "string" ? params.id : "";

  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidNumeric, setBidNumeric] = useState<number>(5000000);
  const [deliveryDays, setDeliveryDays] = useState<number>(7);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [portfolioLink, setPortfolioLink] = useState<string>("");
  const [githubLink, setGithubLink] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!projectId) return;
      setLoading(true);
      const res = await getProjectById(projectId);
      if (res) {
        setProject(res);
        if (res.budgetNumeric && res.budgetNumeric > 0) {
          setBidNumeric(res.budgetNumeric);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [projectId]);

  // Calculations
  const platformFeeRate = 0.05; // 5% Platform Fee
  const platformFeeAmount = Math.round(bidNumeric * platformFeeRate);
  const takeHomeEarnings = Math.max(0, bidNumeric - platformFeeAmount);

  const isOwner = Boolean(user && project && project.ownerId === user.id);

  const formatIDR = (val: number) => {
    return `Rp ${val.toLocaleString("id-ID")}`;
  };

  const handleApplyPreset = (multiplier: number) => {
    if (!project) return;
    const base = project.budgetNumeric || 5000000;
    setBidNumeric(Math.round(base * multiplier));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (isOwner) {
      setSubmitError("Anda tidak dapat mengajukan proposal pada proyek milik Anda sendiri.");
      return;
    }

    if (bidNumeric <= 0) {
      setSubmitError("Nominal penawaran harus lebih besar dari Rp 0.");
      return;
    }

    if (!coverLetter.trim()) {
      setSubmitError("Silakan tuliskan pesan penawaran / cover letter untuk klien.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const fullCover = [
      coverLetter,
      portfolioLink ? `\n\n📌 Portofolio: ${portfolioLink}` : "",
      githubLink ? `\n📌 Repositori / Demo: ${githubLink}` : "",
    ].join("");

    const res = await submitProposal({
      projectId: project.id,
      bidAmount: bidNumeric,
      deliveryDays,
      coverLetter: fullCover,
      skills: project.skills,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setSubmitError(res.error || "Gagal mengirimkan proposal.");
      return;
    }

    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-muted rounded-xl" />
        <div className="h-10 w-3/4 bg-muted rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-64 bg-muted/60 rounded-3xl" />
            <div className="h-48 bg-muted/60 rounded-3xl" />
          </div>
          <div className="h-96 bg-muted/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Proyek Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Proyek yang Anda cari mungkin sudah ditutup atau tidak lagi menerima proposal baru.
        </p>
        <Link
          href="/freelancer/explore"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-600 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Jelajahi Proyek</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
      {/* Top Breadcrumbs & Quick Back */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/freelancer/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <div className="h-8 w-8 rounded-xl bg-card border border-border/80 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Kembali ke Jelajahi Proyek</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Garansi Escrow 100%</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Status: Terbuka</span>
          </span>
        </div>
      </div>

      {/* Main Hero Header */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            {project.category}
          </span>
          <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            Tingkat: {project.difficulty}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Diposting {project.postedDate}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
          {project.title}
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border/50">
          <div>
            <span className="text-[11px] text-muted-foreground block">Estimasi Budget Klien</span>
            <p className="text-base sm:text-lg font-black text-foreground">{project.budget}</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Target Waktu Pengerjaan</span>
            <p className="text-base sm:text-lg font-bold text-foreground">{project.dueDate}</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Pelamar / Proposal</span>
            <p className="text-base sm:text-lg font-bold text-foreground">{project.proposalsCount} Diajukan</p>
          </div>
          <div>
            <span className="text-[11px] text-muted-foreground block">Klien</span>
            <p className="text-sm font-bold text-foreground truncate">{project.owner?.fullName || "Klien Terverifikasi"}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: PROJECT DETAILS & FREELANCER INSIGHTS                        */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Description & Objectives */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xs space-y-6">
            <div className="space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Deskripsi Proyek & Ruang Lingkup</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>

            {/* Project Objectives / Deliverables */}
            {project.objectives && project.objectives.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Objektif & Deliverables Utama
                </h3>
                <ul className="space-y-2">
                  {project.objectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground">
                      <div className="h-4 w-4 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Required Skills & Tags */}
            <div className="space-y-2.5 pt-4 border-t border-border/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Keahlian & Teknologi yang Dibutuhkan
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Milestone Roadmap Breakdown */}
            {project.milestones && project.milestones.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-border/40">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  <span>Rencana Pembagian Milestone Kerja</span>
                </h3>
                <div className="space-y-2">
                  {project.milestones.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-3.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary font-extrabold text-[11px]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-foreground">{m.title}</p>
                          <span className="text-[11px] text-muted-foreground">{m.dueDate}</span>
                        </div>
                      </div>
                      <span className="font-extrabold text-foreground font-heading">
                        {m.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Client Profile & Verification Card */}
          <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span>Informasi Klien</span>
            </h3>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-sm">
                  {project.owner?.fullName?.charAt(0) || "K"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {project.owner?.fullName || "Klien Terverifikasi"}
                    </h4>
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      Terverifikasi
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {project.owner?.location || "Indonesia"} &bull; Anggota Aktif Platform
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-muted-foreground block">Deposit Escrow</span>
                <span className="text-xs font-extrabold text-emerald-600">100% Dijamin</span>
              </div>
            </div>
          </div>

          {/* Card 3: Info Khusus Freelancer (Freelancer Exclusive Insights) */}
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-extrabold text-sm">
                <Sparkles className="h-4 w-4" />
                <span>Info & Wawasan Khusus Freelancer</span>
              </div>
              <span className="rounded-full bg-primary text-white px-2.5 py-0.5 text-[10px] font-bold">
                Eksklusif
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Metric 1: Match Score */}
              <div className="rounded-2xl border border-primary/20 bg-card/80 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">Kecocokan Profil</span>
                  <Zap className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-lg font-black text-foreground">95% Match</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Keahlian teknis Anda sangat selaras dengan kebutuhan proyek ini.
                </p>
              </div>

              {/* Metric 2: Escrow Protection */}
              <div className="rounded-2xl border border-emerald-500/20 bg-card/80 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-muted-foreground">Keamanan Pembayaran</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-lg font-black text-emerald-600">100% Escrow Aman</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dana disimpan di rekening bersama dan dicairkan setiap milestone selesai.
                </p>
              </div>
            </div>

            {/* Winning Tips for Freelancer */}
            <div className="rounded-2xl border border-border/80 bg-card/90 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span>Tips Memenangkan Proposal Ini:</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Sertakan contoh repositori GitHub atau tautan live demo yang serupa.</li>
                <li>Rincikan tahapan deliverable dengan estimasi hari yang realistis.</li>
                <li>Gunakan template pesan profesional dan sampaikan solusi konkret untuk klien.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: PROPOSAL SUBMISSION FORM (DEDICATED FOR FREELANCER)         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 sticky top-20">
          <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-xl space-y-6">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600 shadow-sm">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-bold text-foreground">Proposal Berhasil Diajukan!</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Penawaran Anda telah diteruskan ke <strong>{project.owner?.fullName || "Klien"}</strong>. Anda akan menerima notifikasi saat klien meninjau proposal Anda.
                  </p>
                </div>
                <div className="pt-4 flex flex-col gap-2.5">
                  <Link
                    href="/freelancer/my-work"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-600 transition-all"
                  >
                    <span>Lihat Status Proposal Saya</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/freelancer/explore"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <span>Jelajahi Proyek Lain</span>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Ajukan Penawaran Anda</h2>
                </div>

                {/* Anti self-dealing notification */}
                {isOwner && (
                  <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="h-4 w-4" />
                      <span>Proyek Anda Sendiri</span>
                    </div>
                    <p>
                      Anda adalah pemilik dari proyek ini. Aturan sistem mencegah pengajuan proposal pada proyek sendiri (Anti Self-Dealing).
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Field 1: Bid Amount (Nominal Penawaran) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-foreground">
                        Nominal Penawaran (IDR)
                      </label>
                      <span className="text-muted-foreground text-[11px]">
                        Budget Klien: <strong>{project.budget}</strong>
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        disabled={isOwner}
                        min="100000"
                        step="50000"
                        value={bidNumeric || ""}
                        onChange={(e) => setBidNumeric(parseInt(e.target.value || "0", 10))}
                        required
                        className="h-11 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm font-bold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isOwner}
                        onClick={() => handleApplyPreset(0.9)}
                        className="flex-1 rounded-lg border border-border bg-muted/40 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        90% Budget
                      </button>
                      <button
                        type="button"
                        disabled={isOwner}
                        onClick={() => handleApplyPreset(1.0)}
                        className="flex-1 rounded-lg border border-primary/30 bg-primary/10 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                      >
                        100% Budget
                      </button>
                      <button
                        type="button"
                        disabled={isOwner}
                        onClick={() => handleApplyPreset(1.1)}
                        className="flex-1 rounded-lg border border-border bg-muted/40 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        110% Budget
                      </button>
                    </div>

                    {/* Payout Calculation Card */}
                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-3.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>Potongan Biaya Layanan Platform (5%)</span>
                        <span>- {formatIDR(platformFeeAmount)}</span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-foreground pt-1 border-t border-border/40">
                        <span className="flex items-center gap-1 text-emerald-600">
                          <DollarSign className="h-3.5 w-3.5" />
                          <span>Pendapatan Bersih Diterima (Take-Home)</span>
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {formatIDR(takeHomeEarnings)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field 2: Delivery Duration */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-foreground">
                      Estimasi Waktu Pengerjaan (Hari)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        disabled={isOwner}
                        min="1"
                        max="180"
                        value={deliveryDays || ""}
                        onChange={(e) => setDeliveryDays(parseInt(e.target.value || "1", 10))}
                        required
                        className="h-10 w-24 rounded-2xl border border-border bg-background px-3 text-center text-sm font-bold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                      />
                      <div className="flex items-center gap-1.5 flex-1 overflow-x-auto pb-0.5">
                        {[3, 7, 14, 30].map((days) => (
                          <button
                            key={days}
                            type="button"
                            disabled={isOwner}
                            onClick={() => setDeliveryDays(days)}
                            className={`rounded-xl px-3 py-2 text-xs font-bold transition-all shrink-0 ${
                              deliveryDays === days
                                ? "bg-primary text-white shadow-xs"
                                : "border border-border/70 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {days} Hari
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Cover Letter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Surat Penawaran / Cover Letter
                      </label>
                      <span className="text-[10px] text-muted-foreground">Wajib Diisi</span>
                    </div>

                    <textarea
                      rows={5}
                      disabled={isOwner}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      required
                      placeholder="Jelaskan secara ringkas solusi teknis, metode pengerjaan, dan mengapa Anda adalah pilihan terbaik untuk proyek ini..."
                      className="w-full rounded-2xl border border-border bg-background p-3.5 text-xs text-foreground placeholder:text-muted-foreground leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    />
                  </div>

                  {/* Field 4: Portfolio Attachment Links */}
                  <div className="space-y-2 pt-1 border-t border-border/40">
                    <label className="block text-xs font-bold text-foreground">
                      Lampiran Portofolio & Bukti Karya (Opsional)
                    </label>

                    <div className="space-y-2">
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="url"
                          disabled={isOwner}
                          value={portfolioLink}
                          onChange={(e) => setPortfolioLink(e.target.value)}
                          placeholder="https://behance.net/portofolio atau URL live preview"
                          className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        />
                      </div>

                      <div className="relative">
                        <FileCode className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <input
                          type="url"
                          disabled={isOwner}
                          value={githubLink}
                          onChange={(e) => setGithubLink(e.target.value)}
                          placeholder="https://github.com/username/project-demo"
                          className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || isOwner}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/25 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          <span>Mengirimkan Proposal...</span>
                        </>
                      ) : (
                        <>
                          <span>Kirim Proposal ke Klien Sekarang</span>
                          <Send className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                      Dengan mengirimkan proposal, Anda menyetujui Ketentuan Layanan & Kebijakan Escrow Doable.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
