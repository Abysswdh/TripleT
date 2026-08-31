"use client";

import {
  ExperienceLevel,
  FreelancerBackground,
  ClientHiringType,
  OnboardingData,
} from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, Briefcase } from "lucide-react";

interface StepBackgroundProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepBackground({
  data,
  onUpdate,
  onNext,
  onPrev,
}: StepBackgroundProps) {
  const isFreelancer = data.role === "freelancer";

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Scaled-up Form Content (No redundant header/badge pill) */}
      <div className="my-auto space-y-5">
        {isFreelancer ? (
          <>
            {/* Status / Background */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Status / Latar Belakang
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {(
                  [
                    { id: "mahasiswa", label: "Mahasiswa / Pelajar", desc: "Sedang studi aktif" },
                    { id: "fresh_grad", label: "Fresh Graduate", desc: "Lulus < 1 tahun" },
                    { id: "switch_career", label: "Switch Career", desc: "Mendalami bidang baru" },
                    { id: "professional", label: "Profesional", desc: "Berpengalaman industri" },
                  ] as const
                ).map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => onUpdate({ backgroundType: bg.id as FreelancerBackground })}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      data.backgroundType === bg.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">{bg.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{bg.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Tingkat Pengalaman Komersial
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {(
                  [
                    {
                      level: "starter",
                      label: "Pemula (Starter)",
                      sub: "0 Portofolio",
                      desc: "Ingin membangun reputasi awal lewat quest & proyek perdana.",
                    },
                    {
                      level: "intermediate",
                      label: "Menengah (1-2 Thn)",
                      sub: "Portofolio Aktif",
                      desc: "Siap berkolaborasi freelance dan mengerjakan modul komprehensif.",
                    },
                    {
                      level: "expert",
                      label: "Expert (3+ Thn)",
                      sub: "Portofolio Matang",
                      desc: "Mampu memimpin teknis proyek dengan standar industri tinggi.",
                    },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => onUpdate({ experienceLevel: item.level as ExperienceLevel })}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      data.experienceLevel === item.level
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-bold text-foreground">{item.label}</p>
                      <span className="text-[10px] font-semibold text-primary">{item.sub}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Entity / Business Type */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Tipe Usaha / Skala Organisasi
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(
                  [
                    { type: "umkm", label: "UMKM / Bisnis Lokal", desc: "Kedai, Toko, Retail & F&B" },
                    { type: "startup", label: "Startup Teknologi", desc: "Produk & platform digital" },
                    { type: "agency", label: "Agensi / Studio", desc: "Eksekusi proyek klien" },
                    { type: "individual", label: "Individu / Personal", desc: "Proyek personal mandiri" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => onUpdate({ hiringType: item.type as ClientHiringType })}
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      data.hiringType === item.type
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">{item.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-tight">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Business / Company Name */}
            <div>
              <label htmlFor="businessName" className="mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Nama Usaha / Brand / Perusahaan
              </label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  id="businessName"
                  type="text"
                  value={data.businessName || ""}
                  onChange={(e) => onUpdate({ businessName: e.target.value })}
                  placeholder="Contoh: Kopi Seduh Kenari, PT Inovasi Solusi..."
                  className="h-12 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 ml-1">
                Nama usaha ini akan tertera pada postingan proyek yang Anda buka.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
