"use client";

import { useState, useEffect } from "react";
import { Briefcase, CheckCircle2, FileCode, UploadCloud } from "lucide-react";
import Link from "next/link";
import { getFreelancerContracts, submitMilestoneDeliverable, type ContractItem } from "@/lib/services/contracts";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

export default function FreelancerMyWorkPage() {
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [filter, setFilter] = useState<"All" | "active" | "completed">("All");
  const [selectedMilestoneContract, setSelectedMilestoneContract] = useState<{
    contractId: string;
    milestoneId: string;
    title: string;
  } | null>(null);
  const [deliverableNote, setDeliverableNote] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadContracts = async () => {
    const data = await getFreelancerContracts();
    if (data && data.length > 0) {
      setContracts(data);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  const filteredContracts = contracts.filter((c) =>
    filter === "All" ? true : c.status === filter
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
    await loadContracts();

    setTimeout(() => {
      setSubmitSuccess(false);
      setSelectedMilestoneContract(null);
      setDeliverableNote("");
      setFileUrl("");
    }, 1800);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
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
        {(["All", "active", "completed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === tab
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            {tab === "All" ? "Semua Kontrak" : tab === "active" ? "Sedang Berjalan" : "Selesai"}
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
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              <span>Jelajahi Quest Proyek</span>
            </Link>
          </div>
        ) : (
          filteredContracts.map((contract) => {
            const currentMs = contract.milestones.find((m) => m.status === "in_progress" || m.status === "submitted") || contract.milestones[0];
            return (
              <div
                key={contract.id}
                className="rounded-3xl border border-border/70 bg-card p-6 shadow-xs space-y-4 hover:border-primary/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          contract.status === "active"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        }`}
                      >
                        {contract.status === "active" ? "In Progress" : "Completed"}
                      </span>
                      <span className="text-xs text-muted-foreground">Client: <strong>{contract.clientName}</strong></span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">{contract.projectTitle}</h3>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-xs text-muted-foreground">Total Nilai Kontrak</span>
                    <p className="text-base font-bold text-foreground">{contract.amountDisplay}</p>
                  </div>
                </div>

                {/* Current Milestone Banner */}
                {currentMs && (
                  <div className="flex items-center gap-3 rounded-2xl bg-muted/40 p-3.5 text-xs border border-border/50">
                    <FileCode className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-foreground truncate block">{currentMs.title}</span>
                      <span className="text-[11px] text-muted-foreground">{currentMs.amountDisplay}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold shrink-0">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        currentMs.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-600"
                          : currentMs.status === "submitted"
                          ? "bg-amber-500/15 text-amber-600"
                          : "bg-blue-500/15 text-blue-600"
                      }`}>
                        {currentMs.status === "completed" ? "Selesai" : currentMs.status === "submitted" ? "Dalam Review" : "Sedang Dikerjakan"}
                      </span>
                    </div>
                  </div>
                )}

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
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/40">
                  {contract.status === "active" && currentMs && currentMs.status === "in_progress" && (
                    <button
                      onClick={() =>
                        setSelectedMilestoneContract({
                          contractId: contract.id,
                          milestoneId: currentMs.id,
                          title: currentMs.title,
                        })
                      }
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-102"
                    >
                      Serahkan Hasil Kerja (Submit)
                    </button>
                  )}
                  {currentMs && currentMs.status === "submitted" && (
                    <span className="text-xs text-amber-600 font-medium">
                      Menunggu review dan persetujuan dari klien
                    </span>
                  )}
                  {contract.status === "completed" && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Semua milestone telah disetujui & dibayar penuh
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Submit Deliverable Modal */}
      {selectedMilestoneContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            <ModalCloseButton onClick={() => setSelectedMilestoneContract(null)} />

            {submitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Hasil Kerja Berhasil Diserahkan!</h3>
                <p className="text-xs text-muted-foreground">
                  Klien telah menerima notifikasi penyerahan hasil kerja dan akan meninjau deliverables Anda.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Submit Deliverables</span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedMilestoneContract.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kirim link repositori, preview desain Figma, atau file deliverables untuk ditinjau klien.
                  </p>
                </div>

                <form onSubmit={handleSubmitDeliverable} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Link Deliverables / Preview (GitHub / Figma / Drive)
                    </label>
                    <input
                      type="url"
                      required
                      value={fileUrl}
                      onChange={(e) => setFileUrl(e.target.value)}
                      placeholder="https://github.com/... atau https://figma.com/file/..."
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1 text-foreground">
                      Catatan Penyerahan Hasil Kerja
                    </label>
                    <textarea
                      rows={4}
                      value={deliverableNote}
                      onChange={(e) => setDeliverableNote(e.target.value)}
                      placeholder="Jelaskan fitur yang telah selesai, instruksi pengujian, dan catatan penting untuk klien..."
                      className="w-full rounded-2xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMilestoneContract(null)}
                      className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? "Mengirim..." : "Kirim ke Klien"}
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
