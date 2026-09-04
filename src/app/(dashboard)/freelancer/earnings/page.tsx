"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Info,
  AlertCircle,
  CreditCard,
  Lock,
  Receipt,
  FileCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  getFreelancerEarnings,
  requestPayout,
  type EarningsSummary,
  type EscrowTransactionItem,
} from "@/lib/services/earnings";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

const BANK_OPTIONS = [
  { id: "bca", name: "Bank Central Asia (BCA)", code: "BCA", icon: "🏦", badge: "Utama" },
  { id: "mandiri", name: "Bank Mandiri", code: "MANDIRI", icon: "🏛️" },
  { id: "bri", name: "Bank Rakyat Indonesia (BRI)", code: "BRI", icon: "🏦" },
  { id: "bni", name: "Bank Negara Indonesia (BNI)", code: "BNI", icon: "🏛️" },
  { id: "seabank", name: "SeaBank Indonesia", code: "SEABANK", icon: "🌊" },
  { id: "gopay", name: "GoPay E-Wallet", code: "GOPAY", icon: "🟢" },
  { id: "ovo", name: "OVO E-Wallet", code: "OVO", icon: "🟣" },
  { id: "dana", name: "DANA E-Wallet", code: "DANA", icon: "🔵" },
];

export default function FreelancerEarningsPage() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState(BANK_OPTIONS[0].name);
  const [accountNumber, setAccountNumber] = useState("8829-1029-44");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [lastSubmittedPayout, setLastSubmittedPayout] = useState<{
    amount: number;
    bankName: string;
    accountNumber: string;
  } | null>(null);

  // Transaction Receipt Modal State
  const [selectedTx, setSelectedTx] = useState<EscrowTransactionItem | null>(null);

  // Transaction Filter & Search
  const [txFilter, setTxFilter] = useState<"all" | "release" | "payout">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const accountHolderName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "I Wayan Gede Arika Sanjaya";

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadEarnings = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    try {
      const data = await getFreelancerEarnings();
      if (data) {
        setEarnings(data);
      }
    } catch (err) {
      console.error("Failed to load earnings:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isPayoutModalOpen || selectedTx) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPayoutModalOpen, selectedTx]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPayoutModalOpen) setIsPayoutModalOpen(false);
        if (selectedTx) setSelectedTx(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPayoutModalOpen, selectedTx]);

  const handleOpenPayout = () => {
    const available = earnings?.availableBalance || 0;
    // Preset with available balance if small, or standard 100k
    if (available > 0) {
      setPayoutAmount(String(available));
    } else {
      setPayoutAmount("0");
    }
    setPayoutSuccess(false);
    setIsPayoutModalOpen(true);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadEarnings(false);
  };

  const numericPayout = useMemo(() => {
    const cleaned = payoutAmount.replace(/\D/g, "");
    return parseInt(cleaned || "0", 10);
  }, [payoutAmount]);

  const availableBalance = earnings?.availableBalance || 0;
  const isAmountTooHigh = numericPayout > availableBalance;
  const isAmountTooLow = numericPayout > 0 && numericPayout < 20000;
  const isFormValid = numericPayout >= 20000 && numericPayout <= availableBalance;

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await requestPayout({
        amount: numericPayout,
        bankName: selectedBank,
        accountNumber: accountNumber.trim(),
      });

      if (res.success) {
        setLastSubmittedPayout({
          amount: numericPayout,
          bankName: selectedBank,
          accountNumber: accountNumber.trim(),
        });
        setPayoutSuccess(true);
        await loadEarnings(false);
      } else {
        alert(res.error || "Gagal memproses penarikan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat memproses penarikan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const list = earnings?.transactions || [];
    return list.filter((tx) => {
      const matchType =
        txFilter === "all" ? true : txFilter === "release" ? tx.type === "release" : tx.type === "payout";
      const matchSearch =
        !searchQuery.trim() ||
        tx.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.date.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [earnings?.transactions, txFilter, searchQuery]);

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
          <Wallet className="h-3.5 w-3.5" />
          <span>Rekber & Wallet</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground font-heading">
          Penghasilan & Saldo Wallet
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kelola saldo dompet rekber aman, riwayat pencairan, dan rekening bank penarikan.
        </p>
      </div>

          {/* 3 Metric Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {/* Card 1: Saldo Tersedia (Primary Hero Gradient Card) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary to-indigo-700 p-6 text-white shadow-xl shadow-primary/20 border border-primary/30 flex flex-col justify-between group">
              {/* Subtle visual decoration */}
              <div className="pointer-events-none absolute -right-10 -bottom-10 h-44 w-44 rounded-full bg-white/10 blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="pointer-events-none absolute top-0 right-0 p-6 text-white/15">
                <Wallet className="h-28 w-28 -rotate-12" />
              </div>

              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white tracking-wide uppercase">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    Saldo Tersedia
                  </span>
                  <span className="text-[11px] font-medium text-white/80">Siap Ditarik</span>
                </div>

                <div>
                  <span className="text-xs text-white/75 font-medium">Bebas Biaya Admin • Instan</span>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-0.5">
                    {isLoading ? (
                      <span className="inline-block h-9 w-40 bg-white/20 animate-pulse rounded-lg" />
                    ) : (
                      earnings?.availableBalanceDisplay || "Rp 0"
                    )}
                  </h2>
                </div>
              </div>

              <div className="pt-6 relative z-10">
                <button
                  type="button"
                  onClick={handleOpenPayout}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-bold text-primary shadow-lg shadow-black/10 hover:bg-slate-50 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  <span>Tarik Saldo ke Rekening</span>
                </button>
              </div>
            </div>

            {/* Card 2: Dana di Rekber (Escrow) */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-border transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <Lock className="h-3 w-3" />
                    Dana di Rekber (Escrow)
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">Tersimpan Aman</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Milestone Proyek Berjalan</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-0.5">
                    {isLoading ? (
                      <span className="inline-block h-9 w-32 bg-muted animate-pulse rounded-lg" />
                    ) : (
                      earnings?.inEscrowBalanceDisplay || "Rp 0"
                    )}
                  </h2>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 mt-4">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>Otomatis cair saat hasil deliverable disetujui klien</span>
                </p>
              </div>
            </div>

            {/* Card 3: Total Penarikan Sukses */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-border transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    <Building2 className="h-3 w-3" />
                    Total Penarikan Sukses
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Lifetime</span>
                </div>

                <div>
                  <span className="text-xs text-muted-foreground">Dana Berhasil Diterima</span>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mt-0.5">
                    {isLoading ? (
                      <span className="inline-block h-9 w-32 bg-muted animate-pulse rounded-lg" />
                    ) : (
                      earnings?.totalWithdrawnDisplay || "Rp 0"
                    )}
                  </h2>
                </div>
              </div>

              <div className="pt-4 border-t border-border/60 mt-4 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Rekening Terdaftar:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  BCA (8829-***)
                </span>
              </div>
            </div>
          </div>

          {/* Registered Bank Account Info Banner */}
          <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">Rekening Penarikan Utama</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Terverifikasi
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Bank Central Asia (BCA) • No. Rek: <span className="font-mono font-semibold text-foreground">8829-1029-44</span> • a.n. <span className="font-medium text-foreground">{accountHolderName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleOpenPayout}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>Tarik Sekarang</span>
              </button>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground">Riwayat Transaksi Realtime</h3>
                <p className="text-xs text-muted-foreground">
                  Catatan mutasi dana pencairan escrow dan riwayat penarikan ke rekening Anda.
                </p>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Cari proyek / mutasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 pr-3 text-xs rounded-xl border border-border/80 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-44 sm:w-56"
                  />
                </div>

                <div className="inline-flex rounded-xl border border-border/70 bg-muted/40 p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setTxFilter("all")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      txFilter === "all"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Semua ({earnings?.transactions?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter("release")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      txFilter === "release"
                        ? "bg-card text-emerald-600 shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pencairan Escrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxFilter("payout")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                      txFilter === "payout"
                        ? "bg-card text-primary shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Penarikan
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions Card List */}
            <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-xs">
              {isLoading ? (
                <div className="p-8 text-center space-y-3">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">Memuat riwayat transaksi dompet...</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-foreground">Tidak Ada Transaksi Ditemukan</h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada transaksi yang cocok dengan kata kunci "${searchQuery}".`
                      : "Belum ada transaksi di kategori ini. Transaksi otomatis muncul saat milestone proyek selesai disetujui."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {filteredTransactions.map((tx) => {
                    const isPayout = tx.type === "payout";
                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTx(tx)}
                        className="flex items-center justify-between p-4 sm:p-5 hover:bg-muted/40 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0 pr-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-2xl shrink-0 transition-transform group-hover:scale-105 ${
                              isPayout
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {isPayout ? (
                              <ArrowUpRight className="h-5 w-5 stroke-[2.2]" />
                            ) : (
                              <ArrowDownLeft className="h-5 w-5 stroke-[2.2]" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                {tx.projectTitle}
                              </h4>
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  isPayout
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-emerald-500/10 text-emerald-600"
                                }`}
                              >
                                {isPayout ? "Penarikan Rekening" : "Pencairan Milestone"}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                              <span>{tx.date}</span>
                              {tx.notes && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-xs">{tx.notes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0 flex items-center gap-3">
                          <div>
                            <span
                              className={`text-sm sm:text-base font-black ${
                                isPayout ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              {tx.amountDisplay}
                            </span>
                            <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              ✓ {tx.status === "success" ? "Berhasil" : tx.status}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors hidden sm:block" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Security & Rekber Guarantee Box */}
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
              <h4 className="text-sm font-bold">Jaminan Keamanan Rekber Doable!</h4>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 text-xs text-muted-foreground">
              <div className="space-y-1">
                <span className="font-bold text-foreground block">100% Proteksi Dana</span>
                <p>Klien wajib mendepositkan dana ke rekber sebelum Anda mulai mengerjakan milestone.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-foreground block">Pencairan Otomatis</span>
                <p>Saat deliverable disetujui, dana langsung masuk ke Saldo Tersedia tanpa potongan tersembunyi.</p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-foreground block">Bebas Biaya Transfer</span>
                <p>Nikmati promo 0% biaya penarikan ke seluruh bank nasional dan dompet digital terdaftar.</p>
              </div>
            </div>
          </div>

      {/* ========================================================================= */}
      {/* PORTAL MODAL 1: Payout Withdrawal Modal (Tarik Saldo ke Rekening) */}
      {/* ========================================================================= */}
      {mounted && isPayoutModalOpen && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isSubmitting) {
              setIsPayoutModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            <ModalCloseButton
              onClick={() => !isSubmitting && setIsPayoutModalOpen(false)}
              aria-label="Tutup Penarikan"
            />

            {payoutSuccess ? (
              /* Success State */
              <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-9 w-9 stroke-[2.3]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Permintaan Pencairan Diterima!</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Dana sebesar{" "}
                    <span className="font-bold text-foreground">
                      Rp {lastSubmittedPayout?.amount.toLocaleString("id-ID")}
                    </span>{" "}
                    sedang ditransfer ke rekening{" "}
                    <span className="font-semibold text-foreground">
                      {lastSubmittedPayout?.bankName} ({lastSubmittedPayout?.accountNumber})
                    </span>.
                  </p>
                </div>

                <div className="rounded-2xl bg-muted/60 p-3.5 text-xs text-muted-foreground text-left space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span>Estimasi Dana Masuk:</span>
                    <span className="font-semibold text-foreground">1x24 jam kerja</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Transfer:</span>
                    <span className="font-semibold text-emerald-600">Rp 0 (Bebas Biaya)</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Tutup & Cek Riwayat Saldo
                </button>
              </div>
            ) : (
              /* Form State */
              <>
                {/* Header */}
                <div className="space-y-1 pr-8">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Pencairan Rekber Resmi</span>
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Tarik Saldo ke Rekening
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Transfer saldo dompet rekber langsung ke rekening bank atau dompet digital Anda.
                  </p>
                </div>

                {/* Available Balance Box */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium block">
                      Saldo Tersedia untuk Ditarik
                    </span>
                    <span className="text-xl font-extrabold text-foreground">
                      {earnings?.availableBalanceDisplay || "Rp 0"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPayoutAmount(String(availableBalance))}
                    className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 active:scale-95 transition-all cursor-pointer"
                  >
                    Tarik Semua (100%)
                  </button>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-4">
                  {/* Bank Selector */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground">
                      Bank / E-Wallet Tujuan
                    </label>
                    <div className="relative">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full rounded-2xl border border-border/80 bg-background p-3 text-xs text-foreground font-medium focus:border-primary focus:outline-none cursor-pointer appearance-none"
                      >
                        {BANK_OPTIONS.map((b) => (
                          <option key={b.id} value={b.name}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <ChevronRight className="h-4 w-4 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                    </div>
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-foreground">
                      Nomor Rekening / Akun Tujuan
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 8829-1029-44"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full rounded-2xl border border-border/80 bg-background p-3 text-xs font-mono font-medium text-foreground focus:border-primary focus:outline-none"
                    />
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Nama Pemilik: <span className="font-semibold text-foreground">{accountHolderName}</span> (Sesuai KTP)
                    </span>
                  </div>

                  {/* Payout Amount */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Nominal Penarikan (Rp)
                      </label>
                      <span className="text-[11px] text-muted-foreground">Min. Rp 20.000</span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                        Rp
                      </span>
                      <input
                        type="number"
                        required
                        min={20000}
                        max={availableBalance}
                        value={payoutAmount}
                        onChange={(e) => setPayoutAmount(e.target.value)}
                        placeholder="Contoh: 100000"
                        className={`w-full rounded-2xl border p-3 pl-10 text-sm font-extrabold text-foreground focus:outline-none ${
                          isAmountTooHigh
                            ? "border-destructive focus:border-destructive bg-destructive/5"
                            : "border-border/80 bg-background focus:border-primary"
                        }`}
                      />
                    </div>

                    {/* Validation Warnings */}
                    {isAmountTooHigh && (
                      <div className="flex items-center justify-between text-[11px] text-destructive mt-1.5">
                        <span className="flex items-center gap-1 font-semibold">
                          <AlertCircle className="h-3 w-3" />
                          Nominal melebihi saldo tersedia!
                        </span>
                        <button
                          type="button"
                          onClick={() => setPayoutAmount(String(availableBalance))}
                          className="font-bold underline cursor-pointer hover:opacity-80"
                        >
                          Pakai Maksimal
                        </button>
                      </div>
                    )}
                    {isAmountTooLow && (
                      <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
                        Minimal penarikan adalah Rp 20.000
                      </span>
                    )}

                    {/* Quick Amount Preset Chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {[50000, 100000, 200000, 500000].map((amt) => {
                        const canAfford = availableBalance >= amt;
                        return (
                          <button
                            key={amt}
                            type="button"
                            disabled={!canAfford}
                            onClick={() => setPayoutAmount(String(amt))}
                            className={`rounded-xl border px-2.5 py-1 text-[11px] font-semibold transition-all ${
                              numericPayout === amt
                                ? "border-primary bg-primary text-primary-foreground"
                                : canAfford
                                ? "border-border/80 bg-card hover:bg-muted text-foreground cursor-pointer"
                                : "border-border/40 bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                            }`}
                          >
                            Rp {amt.toLocaleString("id-ID")}
                          </button>
                        );
                      })}
                      {availableBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setPayoutAmount(String(availableBalance))}
                          className="rounded-xl border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                        >
                          Semua Saldo
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="rounded-2xl bg-muted/40 border border-border/60 p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Nominal Penarikan:</span>
                      <span className="font-semibold text-foreground">
                        Rp {numericPayout.toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Biaya Layanan & Admin:</span>
                      <span className="font-bold text-emerald-600">Rp 0 (Gratis)</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimasi Pengiriman:</span>
                      <span className="font-medium text-foreground">1x24 jam kerja</span>
                    </div>
                    <div className="border-t border-border/60 pt-2 flex justify-between font-bold text-foreground">
                      <span>Total Diterima di Rekening:</span>
                      <span className="text-primary font-black">
                        Rp {numericPayout.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsPayoutModalOpen(false)}
                      className="flex-1 rounded-xl border border-border/80 py-3 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Memproses...</span>
                        </>
                      ) : (
                        <>
                          <span>Konfirmasi Tarik Saldo</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ========================================================================= */}
      {/* PORTAL MODAL 2: Transaction Detail / Receipt Modal */}
      {/* ========================================================================= */}
      {mounted && selectedTx && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTx(null);
          }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden my-auto">
            <ModalCloseButton onClick={() => setSelectedTx(null)} aria-label="Tutup Rincian" />

            <div className="text-center space-y-2 pt-2">
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                  selectedTx.type === "payout"
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-emerald-500/10 text-emerald-600"
                }`}
              >
                {selectedTx.type === "payout" ? (
                  <ArrowUpRight className="h-7 w-7 stroke-[2.5]" />
                ) : (
                  <ArrowDownLeft className="h-7 w-7 stroke-[2.5]" />
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                ✓ Transaksi Selesai
              </span>
              <h3 className="text-2xl font-black text-foreground">{selectedTx.amountDisplay}</h3>
              <p className="text-xs text-muted-foreground">{selectedTx.projectTitle}</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipe Transaksi:</span>
                <span className="font-bold text-foreground">
                  {selectedTx.type === "payout" ? "Penarikan ke Rekening" : "Pencairan Milestone Escrow"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tanggal & Waktu:</span>
                <span className="font-semibold text-foreground">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID Transaksi:</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[180px]">
                  {selectedTx.id}
                </span>
              </div>
              {selectedTx.notes && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-muted-foreground block mb-1">Catatan:</span>
                  <p className="text-foreground font-medium bg-background p-2 rounded-xl text-[11px]">
                    {selectedTx.notes}
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              className="w-full rounded-xl bg-card border border-border/80 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Tutup Rincian
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
