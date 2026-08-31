"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { ArrowRight, CheckCircle2, LayoutDashboard } from "lucide-react";

interface StepWelcomeProps {
  data: OnboardingData;
  onFinish: () => void;
}

export function StepWelcome({ data, onFinish }: StepWelcomeProps) {
  const isFreelancer = data.role === "freelancer";

  return (
    <div className="text-center space-y-6 animate-fade-in py-4">
      {/* Success Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 mb-2">
          <span>Profil Berhasil Dibuat</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Selamat Datang di <span className="text-primary">Doable!</span>
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          {isFreelancer
            ? "Akun talenta Anda telah siap. Mulai jelajahi quest proyek dan bangun portofolio profesional Anda."
            : "Akun klien Anda telah siap. Mulai buat proyek dan temukan talenta yang sesuai."}
        </p>
      </div>

      {/* Summary Box */}
      <div className="mx-auto max-w-sm rounded-2xl border border-border/80 bg-card p-4 text-left space-y-2.5 shadow-sm text-xs">
        <div className="flex items-center justify-between border-b border-border/40 pb-2">
          <span className="text-muted-foreground">Peran:</span>
          <span className="font-bold text-foreground">
            {isFreelancer ? "Freelancer / Talenta" : "Klien / Pemberi Kerja"}
          </span>
        </div>

        {isFreelancer ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Skill Utama:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {data.skills.slice(0, 3).join(", ") || "General"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tarif Mulai Proyek:</span>
              <span className="font-bold text-primary">
                Rp {(data.startingPrice || 500000).toLocaleString("id-ID")}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nama Brand / Usaha:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {data.businessName || "Bisnis Mandiri"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Kategori Kebutuhan:</span>
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {data.projectCategories[0] || "Semua Kategori"}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex h-11 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-primary text-xs sm:text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Masuk ke Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
