"use client";

import { useState, useEffect } from "react";
import { ArrowDownRight, ArrowUpRight, Wallet, CheckCircle2, Building2 } from "lucide-react";
import Link from "next/link";
import { getFreelancerEarnings, requestPayout, type EarningsSummary } from "@/lib/services/earnings";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

export default function FreelancerEarningsPage() {
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("5000000");
  const [bankName, setBankName] = useState("Bank Central Asia (BCA)");
  const [accountNumber, setAccountNumber] = useState("8829-1029-44");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const loadEarnings = async () => {
    const data = await getFreelancerEarnings();
    if (data) {
      setEarnings(data);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const numericAmount = parseInt(payoutAmount.replace(/\D/g, "") || "0", 10) || 5000000;

    await requestPayout({
      amount: numericAmount,
      bankName,
      accountNumber,
    });

    setIsSubmitting(false);
    setPayoutSuccess(true);
    await loadEarnings();

    setTimeout(() => {
      setPayoutSuccess(false);
      setIsPayoutModalOpen(false);
    }, 1800);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Wallet className="h-3.5 w-3.5" />
            <span>Rekber & Wallet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Penghasilan & Saldo Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola saldo dompet rekber aman, riwayat pencairan, dan rekening bank penarikan.
          </p>
        </div>

        <Link
          href="/freelancer/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          <span>← Kembali ke Overview</span>
        </Link>
      </div>

      {/* Wallet Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 space-y-3 shadow-xs">
          <span className="text-xs font-semibold text-primary">Saldo Tersedia (Dapat Ditarik)</span>
          <h3 className="text-3xl font-extrabold text-foreground">
            {earnings?.availableBalanceDisplay || "Rp 14.850.000"}
          </h3>
          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="mt-2 w-full rounded-2xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-102"
          >
            Tarik Saldo ke Rekening
          </button>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Dana di Rekber (Tersimpan Aman)</span>
          <h3 className="text-3xl font-extrabold text-foreground">
            {earnings?.inEscrowBalanceDisplay || "Rp 7.500.000"}
          </h3>
          <p className="text-xs text-muted-foreground">Otomatis cair setelah milestone disetujui klien</p>
        </div>

        <div className="rounded-3xl border border-border/70 bg-card p-6 space-y-2 shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground">Total Penarikan Sukses</span>
          <h3 className="text-3xl font-extrabold text-foreground">
            {earnings?.totalWithdrawnDisplay || "Rp 24.500.000"}
          </h3>
          <p className="text-xs text-emerald-600 font-medium">Rekening Terverifikasi</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Riwayat Transaksi Realtime</h3>
        <div className="rounded-3xl border border-border/70 bg-card overflow-hidden shadow-xs">
          {(earnings?.transactions || []).map((tx, idx) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between p-4 sm:p-5 ${
                idx !== (earnings?.transactions || []).length - 1 ? "border-b border-border/40" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 ${
                    tx.type === "payout"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {tx.type === "payout" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{tx.projectTitle}</h4>
                  <span className="text-xs text-muted-foreground">{tx.date}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-extrabold ${
                    tx.type === "payout" ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {tx.amountDisplay}
                </span>
                <span className="block text-[11px] font-semibold text-muted-foreground uppercase">
                  {tx.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payout Withdrawal Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            <ModalCloseButton onClick={() => setIsPayoutModalOpen(false)} />

            {payoutSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Permintaan Pencairan Diterima!</h3>
                <p className="text-xs text-muted-foreground">
                  Dana sedang diproses dan akan ditransfer ke rekening bank Anda dalam 1x24 jam kerja.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>Bank Withdrawal</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Tarik Saldo ke Rekening</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Pilih nominal penarikan dari saldo yang tersedia.
                  </p>
                </div>

                <form onSubmit={handleRequestPayout} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Bank Tujuan
                    </label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                      <option value="Bank Mandiri">Bank Mandiri</option>
                      <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                      <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                      <option value="GoPay / OVO E-Wallet">GoPay / OVO E-Wallet</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Nomor Rekening / Akun
                    </label>
                    <input
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Nominal Penarikan (Rp)
                    </label>
                    <input
                      type="number"
                      required
                      min={100000}
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <span className="text-[11px] text-muted-foreground mt-1 block">
                      Maksimal penarikan: {earnings?.availableBalanceDisplay || "Rp 14.850.000"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsPayoutModalOpen(false)}
                      className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Memproses..." : "Konfirmasi Tarik Dana"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
