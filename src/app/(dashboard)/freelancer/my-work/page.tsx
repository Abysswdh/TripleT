"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  Briefcase,
  CheckCircle2,
  FileCode,
  UploadCloud,
  Clock,
  Send,
  ArrowRight,
  Sparkles,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { getFreelancerContracts, submitMilestoneDeliverable, type ContractItem } from "@/lib/services/contracts";
import { getFreelancerProposals, type FreelancerProposalItem } from "@/lib/services/proposals";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { formatRelativeTime } from "@/lib/utils";

function MyWorkContent() {
  const searchParams = useSearchParams();
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [proposals, setProposals] = useState<FreelancerProposalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "proposals" | "active" | "completed">("all");
  const [mounted, setMounted] = useState(false);

  const [selectedMilestoneContract, setSelectedMilestoneContract] = useState<{
    contractId: string;
    milestoneId: string;
    title: string;
  } | null>(null);
  const [deliverableNote, setDeliverableNote] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync tab from query param e.g. /freelancer/my-work?tab=proposals
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "proposals") {
      setFilter("proposals");
    } else if (tabParam === "active") {
      setFilter("active");
    } else if (tabParam === "completed") {
      setFilter("completed");
    }
  }, [searchParams]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedMilestoneContract) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedMilestoneContract]);

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMilestoneContract) {
        setSelectedMilestoneContract(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMilestoneContract]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [contractsData, proposalsData] = await Promise.all([
        getFreelancerContracts(),
        getFreelancerProposals(),
      ]);
      setContracts(contractsData);
      setProposals(proposalsData);
    } catch (err) {
      console.error("Failed to load freelancer work data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeContracts = useMemo(
    () => contracts.filter((c) => c.status === "active"),
    [contracts]
  );
  const completedContracts = useMemo(
    () => contracts.filter((c) => c.status === "completed"),
    [contracts]
  );
  const pendingProposals = useMemo(
    () => proposals.filter((p) => p.status === "pending"),
    [proposals]
  );

  const handleSubmitDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestoneContract) return;

    setIsSubmitting(true);
    await submitMilestoneDeliverable({
      contractMilestoneId: selectedMilestoneContract.milestoneId,
      deliverableNote,
      fileUrl,
    });
    setIsSubmitting(false);
    setSubmitSuccess(true);
    await loadData();

    setTimeout(() => {
      setSubmitSuccess(false);
      setSelectedMilestoneContract(null);
      setDeliverableNote("");
      setFileUrl("");
    }, 1800);
  };

  const tabs = [
    { id: "all", label: "Semua Aktivitas", count: contracts.length + proposals.length },
    { id: "proposals", label: "Proposal Terkirim", count: proposals.length },
    { id: "active", label: "Kontrak Berjalan", count: activeContracts.length },
    { id: "completed", label: "Selesai", count: completedContracts.length },
  ] as const;

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Pekerjaan & Kontrak</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground font-heading">
            Pekerjaan Saya
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau status proposal yang Anda ajukan, kelola kontrak aktif, milestone, dan serahkan hasil kerja ke klien.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/freelancer/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Cari Proyek Baru</span>
          </Link>
        </div>
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-1.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Proposal Terkirim</span>
            <Send className="h-4 w-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
              {proposals.length}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              ({pendingProposals.length} Menunggu Review)
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">Tawaran diajukan ke klien</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-1.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Kontrak Berjalan</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading text-primary">
              {activeContracts.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Kontrak Aktif</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Sedang dalam pengerjaan</p>
        </div>

        <div className="col-span-2 md:col-span-1 rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-1.5 hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Kontrak Selesai</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading text-emerald-600">
              {completedContracts.length}
            </span>
            <span className="text-xs font-medium text-muted-foreground">Selesai</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Disetujui & dibayar penuh</p>
        </div>
      </div>

      {/* Filter Tabs (Consistent Segmented Pill Design) */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-4 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all inline-flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground border border-border/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-background text-muted-foreground border border-border/40"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/30 space-y-2">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Memuat data pekerjaan & proposal...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* ============================================================ */}
          {/* SECTION A: PROPOSALS LIST */}
          {/* ============================================================ */}
          {(filter === "all" || filter === "proposals") && proposals.length > 0 && (
            <div className="space-y-4">
              {filter === "all" && (
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-amber-500" />
                    <h2 className="text-base font-bold text-foreground font-heading">
                      Proposal Terkirim ({proposals.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setFilter("proposals")}
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fokus Proposal</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="grid gap-4">
                {proposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="group rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 hover:border-primary/40 transition-all hover:shadow-xs"
                  >
                    {/* Header: Status, Category, Project Title */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Status Badge */}
                          {proposal.status === "pending" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                              Menunggu Ditinjau Klien
                            </span>
                          )}
                          {proposal.status === "accepted" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Proposal Diterima 🎉
                            </span>
                          )}
                          {proposal.status === "rejected" && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                              Tidak Terpilih
                            </span>
                          )}

                          <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                            {proposal.projectCategory}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors font-heading">
                          {proposal.projectTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>
                            Klien: <strong className="text-foreground">{proposal.clientName}</strong>
                          </span>
                          <span>•</span>
                          <span>Budget Proyek: <strong>{proposal.projectBudget}</strong></span>
                          <span>•</span>
                          <span>Diajukan {formatRelativeTime(proposal.createdAt)}</span>
                        </div>
                      </div>

                      {/* Bid Info Strip */}
                      <div className="text-left md:text-right shrink-0 bg-muted/40 md:bg-transparent p-3.5 md:p-0 rounded-2xl md:rounded-none border border-border/50 md:border-none">
                        <span className="text-xs text-muted-foreground block font-medium">Nilai Penawaran Anda</span>
                        <span className="text-lg sm:text-xl font-extrabold text-primary font-heading">
                          {proposal.bidDisplay}
                        </span>
                        <span className="text-xs text-muted-foreground block mt-0.5">
                          Estimasi: <strong>{proposal.deliveryDays} hari kerja</strong>
                        </span>
                      </div>
                    </div>

                    {/* Cover Letter / Pitch Snippet */}
                    {proposal.coverLetter && (
                      <div className="rounded-2xl bg-muted/30 border border-border/50 p-3.5 sm:p-4 text-xs space-y-1">
                        <span className="text-[11px] font-semibold text-muted-foreground block">
                          Catatan Penawaran / Pitch Anda:
                        </span>
                        <p className="text-foreground/90 italic font-light line-clamp-2 leading-relaxed">
                          &ldquo;{proposal.coverLetter}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Skills Offered */}
                    {proposal.skills && proposal.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proposal.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                      <div className="text-xs">
                        {proposal.status === "pending" && (
                          <span className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            <span>Klien akan menerima notifikasi dan meninjau tawaran Anda.</span>
                          </span>
                        )}
                        {proposal.status === "accepted" && (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            <span>Kontrak proyek telah aktif. Silakan buka workspace untuk mulai pengerjaan.</span>
                          </span>
                        )}
                        {proposal.status === "rejected" && (
                          <span className="text-muted-foreground">
                            Klien telah memilih proposal lain untuk proyek ini.
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/freelancer/explore/${proposal.projectId}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted px-3.5 py-1.5 text-xs font-semibold text-foreground transition-colors"
                        >
                          <span>Lihat Detail Proyek</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        {proposal.status === "accepted" && (
                          <Link
                            href={`/freelancer/projects/${proposal.projectId}`}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                          >
                            <span>Buka Workspace</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State when filter === "proposals" and no proposals */}
          {filter === "proposals" && proposals.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
                <Send className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground font-heading">Belum ada proposal diajukan</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Anda belum mengajukan penawaran proposal ke proyek manapun. Jelajahi proyek klien yang tersedia dan kirimkan proposal pertama Anda!
              </p>
              <Link
                href="/freelancer/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
              >
                <span>Jelajahi Quest Proyek</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ============================================================ */}
          {/* SECTION B: CONTRACTS LIST */}
          {/* ============================================================ */}
          {(filter === "all" || filter === "active" || filter === "completed") && (
            <div className="space-y-4">
              {filter === "all" && contracts.length > 0 && proposals.length > 0 && (
                <div className="flex items-center justify-between border-b border-border/40 pb-2.5 pt-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h2 className="text-base font-bold text-foreground font-heading">
                      Kontrak Pekerjaan ({contracts.length})
                    </h2>
                  </div>
                  <button
                    onClick={() => setFilter("active")}
                    className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Fokus Kontrak</span>
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Filtered Contracts List */}
              {(() => {
                const currentFilteredContracts = contracts.filter((c) =>
                  filter === "active" ? c.status === "active" : filter === "completed" ? c.status === "completed" : true
                );

                if (currentFilteredContracts.length === 0) {
                  if (filter === "active") {
                    return (
                      <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-foreground font-heading">Belum ada kontrak aktif</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Semua kontrak yang sedang berjalan akan muncul di sini setelah klien menerima proposal Anda.
                        </p>
                        <Link
                          href="/freelancer/explore"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                        >
                          <span>Cari Proyek Klien</span>
                        </Link>
                      </div>
                    );
                  }

                  if (filter === "completed") {
                    return (
                      <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-foreground font-heading">Belum ada kontrak selesai</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Kontrak yang seluruh milestonenya telah disetujui klien akan tercatat di tab ini.
                        </p>
                      </div>
                    );
                  }

                  if (filter === "all" && proposals.length === 0) {
                    return (
                      <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Briefcase className="h-6 w-6" />
                        </div>
                        <h3 className="text-base font-bold text-foreground font-heading">Belum ada pekerjaan atau proposal</h3>
                        <p className="text-xs text-muted-foreground max-w-md mx-auto">
                          Anda belum memiliki kontrak pekerjaan atau proposal yang diajukan. Jelajahi quest proyek untuk memulai.
                        </p>
                        <Link
                          href="/freelancer/explore"
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                        >
                          <span>Jelajahi Quest Proyek</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    );
                  }

                  return null;
                }

                return (
                  <div className="grid gap-4">
                    {currentFilteredContracts.map((contract) => {
                      const currentMs =
                        contract.milestones.find((m) => m.status === "in_progress" || m.status === "submitted") ||
                        contract.milestones[0];
                      const completedMsCount = contract.milestones.filter((m) => m.status === "completed").length;

                      return (
                        <div
                          key={contract.id}
                          className="group rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4 hover:border-primary/40 transition-all hover:shadow-xs"
                        >
                          {/* Header: Status, Category, Project Title */}
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold inline-flex items-center gap-1.5 ${
                                    contract.status === "active"
                                      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                  }`}
                                >
                                  {contract.status === "active" ? (
                                    <>
                                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                      Kontrak Aktif
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-3.5 w-3.5" />
                                      Selesai (Completed)
                                    </>
                                  )}
                                </span>

                                <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  {contract.projectCategory || "Web & IT Engineering"}
                                </span>
                              </div>

                              <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors font-heading">
                                {contract.projectTitle}
                              </h3>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span>
                                  Klien: <strong className="text-foreground">{contract.clientName}</strong>
                                </span>
                                <span>•</span>
                                <span>Total Nilai: <strong>{contract.amountDisplay}</strong></span>
                                <span>•</span>
                                <span>Dimulai {formatRelativeTime(contract.startedAt)}</span>
                              </div>
                            </div>

                            {/* Financial Info Strip */}
                            <div className="text-left md:text-right shrink-0 bg-muted/40 md:bg-transparent p-3.5 md:p-0 rounded-2xl md:rounded-none border border-border/50 md:border-none">
                              <span className="text-xs text-muted-foreground block font-medium">Total Nilai Kontrak</span>
                              <span className="text-lg sm:text-xl font-extrabold text-primary font-heading">
                                {contract.amountDisplay}
                              </span>
                              <span className="text-xs text-muted-foreground block mt-0.5">
                                {completedMsCount} dari {contract.milestones.length} Milestone Selesai ({contract.progress}%)
                              </span>
                            </div>
                          </div>

                          {/* Current Milestone Banner */}
                          {currentMs && (
                            <div className="rounded-2xl bg-muted/30 border border-border/50 p-3.5 sm:p-4 text-xs space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                                    <FileCode className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-bold text-foreground truncate block">{currentMs.title}</span>
                                    <span className="text-[11px] text-muted-foreground">{currentMs.amountDisplay}</span>
                                  </div>
                                </div>

                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                                    currentMs.status === "completed"
                                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20"
                                      : currentMs.status === "submitted"
                                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/20"
                                      : "bg-blue-500/15 text-blue-600 border border-blue-500/20"
                                  }`}
                                >
                                  {currentMs.status === "completed"
                                    ? "Selesai"
                                    : currentMs.status === "submitted"
                                    ? "Dalam Review"
                                    : "Sedang Dikerjakan"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Progress Bar */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span className="text-muted-foreground">Milestone Progress</span>
                              <span className="text-primary font-bold">{contract.progress}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  contract.progress === 100
                                    ? "bg-gradient-to-r from-primary to-emerald-500"
                                    : "bg-primary"
                                }`}
                                style={{ width: `${contract.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Actions Bar (Identical layout to Proposal Card: status on left, buttons on right) */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/40">
                            <div className="text-xs">
                              {contract.status === "active" && currentMs && currentMs.status === "in_progress" && (
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                                  <span>Proyek sedang berjalan. Serahkan deliverable pada milestone aktif.</span>
                                </span>
                              )}
                              {currentMs && currentMs.status === "submitted" && (
                                <span className="text-amber-600 font-medium flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                                  <span>Menunggu review dan persetujuan deliverable dari klien.</span>
                                </span>
                              )}
                              {contract.status === "completed" && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                  <span>Semua milestone telah disetujui & dibayar penuh.</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {contract.status === "active" && currentMs && currentMs.status === "in_progress" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedMilestoneContract({
                                      contractId: contract.id,
                                      milestoneId: currentMs.id,
                                      title: currentMs.title,
                                    })
                                  }
                                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer"
                                >
                                  Serahkan Hasil Kerja
                                </button>
                              )}

                              <Link
                                href={`/freelancer/projects/${contract.projectId}`}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                              >
                                <span>Buka Workspace</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PORTAL MODAL: Submit Deliverable Modal                                    */}
      {/* ========================================================================= */}
      {mounted && selectedMilestoneContract && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setSelectedMilestoneContract(null);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            <ModalCloseButton
              onClick={() => !isSubmitting && setSelectedMilestoneContract(null)}
              aria-label="Tutup Penyerahan"
            />

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.3]" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-heading">Hasil Kerja Berhasil Diserahkan!</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Klien telah menerima notifikasi penyerahan hasil kerja dan akan meninjau deliverables Anda.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-1 pr-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Submit Deliverables</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground font-heading">
                    {selectedMilestoneContract.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Kirim link repositori, preview desain Figma, atau file deliverables untuk ditinjau klien.
                  </p>
                </div>

                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground">
                      Link Deliverables / Preview (GitHub / Figma / Drive)
                    </label>
                    <input
                      type="url"
                      required
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://github.com/... atau https://figma.com/file/..."
                      className="w-full rounded-2xl border border-border/80 bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground">
                      Catatan Penyerahan Hasil Kerja
                    </label>
                    <textarea
                      rows={4}
                      value={deliverableNote}
                      onChange={(e) => setDeliverableNote(e.target.value)}
                      placeholder="Jelaskan fitur yang telah selesai, instruksi pengujian, dan catatan penting untuk klien..."
                      className="w-full rounded-2xl border border-border/80 bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setSelectedMilestoneContract(null)}
                      className="flex-1 rounded-xl border border-border/80 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Mengirim..." : "Kirim ke Klien"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default function FreelancerMyWorkPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Memuat data pekerjaan...</div>}>
      <MyWorkContent />
    </Suspense>
  );
}
