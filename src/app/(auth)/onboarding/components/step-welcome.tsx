"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { ArrowRight, CheckCircle2, LayoutDashboard, MapPin } from "lucide-react";

interface StepWelcomeProps {
  data: OnboardingData;
  onFinish: () => void;
}

export function StepWelcome({ data, onFinish }: StepWelcomeProps) {
  const isFreelancer = data.role === "freelancer";
  const displayName = data.fullName || (isFreelancer ? "Talenta Muda Doable!" : (data.businessName || "Klien Doable!"));

  return (
    <div className="text-center flex h-full flex-col justify-between py-1">
      <div className="my-auto space-y-3.5 sm:space-y-4 animate-fade-in">
        {/* Success Celebration Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
          <CheckCircle2 className="h-7 w-7 stroke-[2.5]" />
        </div>

        {/* Header */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Selamat Datang, <span className="text-primary">{displayName}</span>!
          </h2>
          {data.username && (
            <p className="text-xs font-semibold text-primary/80 mt-0.5">
              @{data.username.toLowerCase()}
            </p>
          )}
          <p className="mt-1.5 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {isFreelancer
              ? "Akun talenta Anda telah selesai disiapkan. Mulai jelajahi quest proyek, kerjakan tantangan, dan bangun portofolio terpercaya."
              : "Akun klien Anda telah selesai disiapkan. Mulai posting kebutuhan proyek dan temukan talenta muda terverifikasi."}
          </p>
        </div>

        {/* Summary Card */}
        <div className="mx-auto max-w-md rounded-2xl border border-border/80 bg-card p-3.5 sm:p-4 text-left space-y-2 shadow-sm text-xs sm:text-sm">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground font-medium text-xs">Peran Akun:</span>
            <span className="font-bold text-foreground text-xs inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
              {isFreelancer ? "Freelancer / Talenta" : "Klien / Pemberi Kerja"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-muted-foreground font-medium text-xs">Domisili:</span>
            <span className="font-semibold text-foreground text-xs flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {data.locationCity || "Jakarta, Indonesia"}
            </span>
          </div>

          {isFreelancer ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Skill Unggulan:</span>
                <span className="font-bold text-foreground truncate max-w-[220px]">
                  {data.skills.slice(0, 3).join(", ") || "General"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Kapasitas Kerja:</span>
                <span className="font-bold text-primary text-xs sm:text-sm">
                  {data.weeklyAvailability === "part_time"
                    ? "< 15 Jam / Mgg (Side Hustle)"
                    : data.weeklyAvailability === "full_time"
                    ? "> 30 Jam / Mgg (Full-Time)"
                    : data.weeklyAvailability === "flexible"
                    ? "Fleksibel (Malam & Weekend)"
                    : "15 – 30 Jam / Mgg (Part-Time)"}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Nama Usaha / Brand:</span>
                <span className="font-bold text-foreground truncate max-w-[220px]">
                  {data.businessName || "Bisnis Mandiri"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Kategori Kebutuhan:</span>
                <span className="font-bold text-foreground truncate max-w-[220px]">
                  {data.projectCategories[0] || "Semua Kategori"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-4">
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex h-12 w-full max-w-md mx-auto items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl active:scale-[0.98]"
        >
          <LayoutDashboard className="h-5 w-5" />
          <span>{isFreelancer ? "Mulai Karir & Masuk Dashboard Freelancer" : "Masuk ke Dashboard Klien"}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
