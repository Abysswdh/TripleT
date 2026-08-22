import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: "Payout" | "Escrow Release" | "Bonus";
  amount: string;
  projectTitle: string;
  date: string;
  status: "Success" | "Pending";
}

const TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    type: "Escrow Release",
    amount: "+Rp 5.000.000",
    projectTitle: "Company Landing Page Animation with Three.js",
    date: "22 Agustus 2026",
    status: "Success",
  },
  {
    id: "tx-2",
    type: "Payout",
    amount: "-Rp 7.500.000",
    projectTitle: "Penarikan Dana ke Bank BCA (**** 8821)",
    date: "18 Agustus 2026",
    status: "Success",
  },
  {
    id: "tx-3",
    type: "Escrow Release",
    amount: "+Rp 2.800.000",
    projectTitle: "PostgreSQL Database Schema Optimization",
    date: "14 Agustus 2026",
    status: "Success",
  },
];

export default function FreelancerEarningsPage() {
  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Wallet className="h-3.5 w-3.5" />
            <span>Escrow & Wallet</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Penghasilan & Saldo Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola saldo dompet escrow aman, riwayat pencairan, dan rekening bank penarikan.
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
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-2">
          <span className="text-xs font-semibold text-primary">Saldo Tersedia (Dapat Ditarik)</span>
          <h3 className="text-2xl font-bold text-foreground">Rp 12.450.000</h3>
          <button className="mt-2 w-full rounded-xl bg-primary py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors">
            Tarik Saldo ke Rekening
          </button>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Dana di Escrow (Tersimpan Aman)</span>
          <h3 className="text-2xl font-bold text-foreground">Rp 3.250.000</h3>
          <p className="text-xs text-muted-foreground">Otomatis cair setelah milestone disetujui klien</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Total Pendapatan Sepanjang Waktu</span>
          <h3 className="text-2xl font-bold text-foreground">Rp 48.900.000</h3>
          <p className="text-xs text-emerald-600 font-medium">18 Kontrak Selesai</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground">Riwayat Transaksi</h3>
        <div className="rounded-2xl border border-border/60 bg-card overflow-hidden">
          {TRANSACTIONS.map((tx, idx) => (
            <div
              key={tx.id}
              className={`flex items-center justify-between p-4 ${
                idx !== TRANSACTIONS.length - 1 ? "border-b border-border/40" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    tx.type === "Payout"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {tx.type === "Payout" ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{tx.projectTitle}</h4>
                  <p className="text-xs text-muted-foreground">{tx.date} • {tx.type}</p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-sm font-bold ${
                    tx.type === "Payout" ? "text-foreground" : "text-emerald-600"
                  }`}
                >
                  {tx.amount}
                </span>
                <span className="block text-[11px] text-muted-foreground">{tx.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
