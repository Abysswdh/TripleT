"use client";

import { useState, useEffect } from "react";
import { Briefcase, Clock, CheckCircle2, FileCode } from "lucide-react";
import Link from "next/link";
import { getUserContracts } from "@/lib/services/contracts";

interface Contract {
  id: string;
  title: string;
  clientName: string;
  currentMilestone: string;
  deadline: string;
  progress: number;
  amount: string;
  status: "In Progress" | "Under Review" | "Completed";
}

export default function FreelancerMyWorkPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filter, setFilter] = useState<"All" | "In Progress" | "Under Review" | "Completed">("All");

  useEffect(() => {
    async function loadContracts() {
      const data = await getUserContracts();
      if (data && data.length > 0) {
        const mapped: Contract[] = data.map((c) => ({
          id: c.id,
          title: c.projectTitle,
          clientName: c.clientName,
          currentMilestone: c.milestones[0]?.title || "Milestone Aktif",
          deadline: c.deadline,
          progress: c.progress,
          amount: c.amountDisplay,
          status: c.status === "Completed" ? "Completed" : c.status === "Under Review" ? "Under Review" : "In Progress",
        }));
        setContracts(mapped);
      }
    }
    loadContracts();
  }, []);

  const filteredContracts = contracts.filter((c) =>
    filter === "All" ? true : c.status === filter
  );

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Briefcase className="h-3.5 w-3.5" />
            <span>Active Contracts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Pekerjaan & Kontrak Aktif
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pantau milestone, tenggat waktu, dan serahkan hasil kerja untuk persetujuan klien.
          </p>
        </div>

        <Link
          href="/freelancer/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          <span>← Kembali ke Overview</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        {(["All", "In Progress", "Under Review", "Completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === tab
                ? "bg-primary text-white shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab === "All" ? "Semua Kontrak" : tab}
          </button>
        ))}
      </div>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Belum ada kontrak aktif</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Anda belum memiliki kontrak pekerjaan yang sedang berjalan. Ajukan proposal pada proyek yang tersedia untuk memulai.
            </p>
            <Link
              href="/freelancer/explore"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
            >
              <span>Jelajahi Quest Proyek</span>
            </Link>
          </div>
        ) : (
          filteredContracts.map((contract) => (
            <div
              key={contract.id}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                        contract.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-600"
                          : contract.status === "Under Review"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-emerald-500/10 text-emerald-600"
                      }`}
                    >
                      {contract.status}
                    </span>
                    <span className="text-xs text-muted-foreground">Client: <strong>{contract.clientName}</strong></span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{contract.title}</h3>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Nilai Milestone</span>
                  <p className="text-base font-bold text-foreground">{contract.amount}</p>
                </div>
              </div>

              {/* Current Milestone Banner */}
              <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-xs">
                <FileCode className="h-4 w-4 text-primary shrink-0" />
                <div className="flex-1">
                  <span className="font-medium text-foreground">{contract.currentMilestone}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{contract.deadline}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Milestone Progress</span>
                  <span className="text-primary">{contract.progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${contract.progress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {contract.status === "In Progress" && (
                  <button className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-primary/20 hover:bg-primary-600 transition-colors">
                    Serahkan Hasil Kerja (Submit)
                  </button>
                )}
                {contract.status === "Under Review" && (
                  <span className="text-xs text-amber-600 font-medium">
                    Menunggu review dan persetujuan dari klien
                  </span>
                )}
                {contract.status === "Completed" && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Milestone telah disetujui & dibayar
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
