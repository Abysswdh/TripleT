"use client";

import { useState } from "react";
import { ClientBudgetPref, ExperienceLevel, OnboardingData, WeeklyAvailability } from "@/hooks/use-onboarding";
import { ArrowLeft, Loader2, ShieldCheck, Check, TrendingUp, Lightbulb } from "lucide-react";

interface StepRatesBioProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
  error: string | null;
}

const AVAILABILITY_OPTIONS = [
  {
    id: "part_time",
    label: "Side Hustle / Santai",
    hours: "< 15 Jam / Minggu",
    desc: "Mengerjakan proyek fleksibel & akhir pekan",
  },
  {
    id: "semi_full",
    label: "Part-Time Aktif",
    hours: "15 – 30 Jam / Minggu",
    desc: "Siap kolaborasi proyek rutin & berkala",
  },
  {
    id: "full_time",
    label: "Full-Time Freelancer",
    hours: "> 30 Jam / Minggu",
    desc: "Dedikasi penuh waktu & respons cepat",
  },
  {
    id: "flexible",
    label: "Fleksibel / Malam",
    hours: "Sesuai Kebutuhan",
    desc: "Tersedia di luar jam kantor utama",
  },
] as const;

// Market rate benchmark guides mapped by experience level
const BENCHMARK_GUIDES = {
  starter: {
    levelTitle: "Pemula (Starter)",
    tabLabel: "🌱 Pemula",
    badge: "🌱 Beginner / Pemula",
    marketRange: "Rp 150.000 – Rp 400.000",
    recommendedPrice: 300000,
    scopeTitle: "Tugas Ringan, Edit Aset & Revisi Cepat",
    description: "Perbaikan visual minor, adaptasi layout template, data entry, dan tugas asistensi.",
    tip: "Untuk pemula, tarif awal terjangkau mempermudah klien mempercayakan proyek pertamanya padamu untuk mengumpulkan ulasan bintang 5.",
  },
  intermediate: {
    levelTitle: "Menengah (Intermediate)",
    tabLabel: "🚀 Menengah",
    badge: "🚀 Menengah (1–2 Thn)",
    marketRange: "Rp 500.000 – Rp 1.500.000",
    recommendedPrice: 1000000,
    scopeTitle: "Proyek Standar & Fitur Lengkap",
    description: "Desain UI/UX web/mobile, pembuatan landing page, video editing konten/reels, atau modul fitur terintegrasi.",
    tip: "Dengan portofolio aktif, klien siap membayar nilai tambah atas kemampuanmu mengeksekusi kebutuhan proyek secara mandiri.",
  },
  expert: {
    levelTitle: "Mahir (Expert)",
    tabLabel: "👑 Mahir",
    badge: "👑 Mahir (3+ Thn)",
    marketRange: "Rp 2.000.000 – Rp 5.000.000+",
    recommendedPrice: 2500000,
    scopeTitle: "Proyek Kompleks & End-to-End",
    description: "Full-stack system, branding korporat lengkap, arsitektur database, dan kepemimpinan teknis skala besar.",
    tip: "Klien korporat & agensi siap membayar tarif premium untuk jaminan kualitas tinggi, reliabilitas, dan kecepatan eksekusi.",
  },
} as const;

const RATE_PRESET_CARDS = [
  {
    price: 300000,
    label: "Rp 300 Rb",
    tier: "starter" as ExperienceLevel,
    tierBadge: "🌱 Beginner",
    rangeText: "Pasar: 150rb – 400rb",
    sub: "Tugas Ringan / Edit",
  },
  {
    price: 500000,
    label: "Rp 500 Rb",
    tier: "starter" as ExperienceLevel,
    tierBadge: "⚡ Starter–Menengah",
    rangeText: "Pasar: 400rb – 750rb",
    sub: "Desain Sederhana",
  },
  {
    price: 1000000,
    label: "Rp 1 Juta",
    tier: "intermediate" as ExperienceLevel,
    tierBadge: "🚀 Intermediate",
    rangeText: "Pasar: 750rb – 1.8jt",
    sub: "Proyek Standar",
  },
  {
    price: 2500000,
    label: "Rp 2.5 Jt+",
    tier: "expert" as ExperienceLevel,
    tierBadge: "👑 Expert / Pro",
    rangeText: "Pasar: 2jt – 5jt+",
    sub: "Proyek Kompleks",
  },
] as const;

export function StepRatesBio({
  data,
  onUpdate,
  onSubmit,
  onPrev,
  loading,
  error,
}: StepRatesBioProps) {
  const isFreelancer = data.role === "freelancer";
  const userLevel = (data.experienceLevel as ExperienceLevel) || "starter";
  const [activeBenchmarkTab, setActiveBenchmarkTab] = useState<ExperienceLevel>(userLevel);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(
    !RATE_PRESET_CARDS.some((p) => p.price === data.startingPrice)
  );

  const activeGuide = BENCHMARK_GUIDES[activeBenchmarkTab];

  return (
    <div className="flex flex-1 flex-col justify-between min-h-0">
      {/* Form Content: Compact & Scrollable inside wizard */}
      <div className="space-y-3 sm:space-y-3.5 py-1">
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-1.5 text-xs text-destructive">
            {error}
          </div>
        )}

        {isFreelancer ? (
          <>
            {/* Weekly Availability Options */}
            <div>
              <label className="mb-1 block text-xs sm:text-sm font-bold text-foreground">
                Ketersediaan Waktu & Kapasitas Mingguan
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdate({ weeklyAvailability: opt.id as WeeklyAvailability })}
                    className={`rounded-xl border p-2 sm:p-2.5 text-left transition-all cursor-pointer ${
                      data.weeklyAvailability === opt.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-[11px] sm:text-xs font-bold text-foreground leading-tight">{opt.label}</p>
                    <p className="text-[11px] sm:text-xs font-bold text-primary mt-0.5">{opt.hours}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight line-clamp-1 sm:line-clamp-none">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Market Rate Benchmark Guide by Skill & Experience Level */}
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-primary/[0.02] to-background p-3 sm:p-3.5 space-y-2.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    Panduan Rentang Tarif Pasar
                  </span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">
                    (Berdasarkan Level & Keahlian)
                  </span>
                </div>

                {/* Level Tabs: Beginner, Intermediate, Expert */}
                <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-xl border border-border/50 text-[11px]">
                  {(["starter", "intermediate", "expert"] as const).map((lvl) => {
                    const isTabActive = activeBenchmarkTab === lvl;
                    const isUserLevel = userLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setActiveBenchmarkTab(lvl)}
                        className={`px-2 py-0.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                          isTabActive
                            ? "bg-card text-primary shadow-xs font-bold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{BENCHMARK_GUIDES[lvl].tabLabel}</span>
                        {isUserLevel && (
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" title="Level Anda saat ini" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Benchmark Details */}
              <div className="rounded-xl bg-card border border-border/80 p-2.5 sm:p-3 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">
                      {activeGuide.levelTitle}
                    </span>
                    <span className="text-[11px] font-extrabold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      {activeGuide.marketRange}
                    </span>
                  </div>
                  {activeBenchmarkTab === userLevel && (
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      ✓ Level Terpilih di Profil
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-foreground font-medium leading-tight">
                  <span className="text-muted-foreground font-normal">Cakupan Tugas: </span>
                  {activeGuide.scopeTitle} — <span className="text-muted-foreground font-normal">{activeGuide.description}</span>
                </p>

                <div className="flex items-start gap-1.5 pt-0.5 text-[10px] text-muted-foreground leading-relaxed">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span>{activeGuide.tip}</span>
                </div>
              </div>
            </div>

            {/* Expected Starting Project Rate Cards */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-foreground">
                  Ekspektasi Tarif Mulai per Proyek
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  {showCustomInput ? "Pilih Preset Cepat" : "+ Nominal Custom"}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RATE_PRESET_CARDS.map((item) => {
                  const isSelected = data.startingPrice === item.price;
                  const isRecommendedForUser = item.tier === userLevel;
                  return (
                    <button
                      key={item.price}
                      type="button"
                      onClick={() => {
                        onUpdate({ startingPrice: item.price });
                        setShowCustomInput(false);
                      }}
                      className={`relative rounded-xl border p-2 sm:p-2.5 text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                          : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      {isRecommendedForUser && (
                        <span className="absolute -top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs">
                          Disarankan
                        </span>
                      )}
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-foreground">{item.label}</p>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md bg-muted text-muted-foreground">
                          {item.tierBadge}
                        </span>
                      </div>
                      <p className="text-[10px] text-primary font-medium mt-0.5">{item.rangeText}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.sub}</p>
                    </button>
                  );
                })}
              </div>

              {/* Optional Custom Starting Price Input */}
              {showCustomInput && (
                <div className="mt-2 p-2.5 rounded-xl border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in duration-200">
                  <div className="text-[11px] text-muted-foreground">
                    <span>Masukkan nominal tarif mulai kustom per proyek:</span>
                  </div>
                  <div className="relative w-full sm:w-48">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">Rp</span>
                    <input
                      type="number"
                      min="50000"
                      step="50000"
                      value={data.startingPrice || ""}
                      onChange={(e) => onUpdate({ startingPrice: parseInt(e.target.value || "0", 10) })}
                      placeholder="500000"
                      className="h-8 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-xs font-bold text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Bio / Headline */}
            <div>
              <label htmlFor="bio" className="mb-1 block text-xs sm:text-sm font-bold text-foreground">
                Bio & Deskripsi Singkat untuk Klien
              </label>
              <textarea
                id="bio"
                rows={2}
                value={data.bio}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                placeholder="Contoh: UI/UX designer & developer siap membantu UMKM membuat website dan visual profesional."
                className="w-full h-14 sm:h-16 rounded-xl border border-border bg-card p-2.5 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed shadow-xs resize-none"
              />
            </div>
          </>
        ) : (
          <>
            {/* Client Budget Range */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Kisaran Budget Proyek
              </label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {(
                  [
                    { pref: "umkm", label: "Ramah UMKM", range: "< Rp 2 Juta", note: "Untuk kebutuhan esensial & cepat" },
                    { pref: "standard", label: "Standar Bisnis", range: "Rp 2jt - Rp 10jt", note: "Untuk web, aplikasi & fitur komprehensif" },
                    { pref: "enterprise", label: "Enterprise", range: "> Rp 10 Juta", note: "Untuk skala besar & modul custom" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.pref}
                    type="button"
                    onClick={() => onUpdate({ budgetPreference: item.pref as ClientBudgetPref })}
                    className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-3.5 text-left transition-all ${
                      data.budgetPreference === item.pref
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">{item.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-primary mt-0.5 sm:mt-1">{item.range}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 sm:mt-1 leading-tight">{item.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Description / Bio */}
            <div>
              <label htmlFor="bioClient" className="mb-1 block text-xs sm:text-sm font-bold text-foreground">
                Deskripsi Singkat Usaha & Rencana Kolaborasi
              </label>
              <textarea
                id="bioClient"
                rows={2}
                value={data.bio}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                placeholder="Contoh: Kami adalah bisnis F&B yang sedang melakukan digitalisasi menu dan brand identity, mencari talenta kreatif yang komunikatif."
                className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl border border-border bg-card p-2.5 sm:p-3 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed shadow-xs resize-none"
              />
            </div>
          </>
        )}

        {/* Verification Readiness Toggle */}
        <div className="rounded-xl sm:rounded-2xl border border-primary/20 bg-primary/[0.03] p-2.5 sm:p-3.5 flex items-start gap-2.5 sm:gap-3">
          <input
            type="checkbox"
            id="ktpConsent"
            checked={data.willingToVerifyKtp}
            onChange={(e) => onUpdate({ willingToVerifyKtp: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer"
          />
          <label htmlFor="ktpConsent" className="text-[11px] sm:text-xs text-muted-foreground cursor-pointer leading-relaxed">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              Kesiapan Verifikasi Identitas (KTP / Paspor)
            </span>
            Saya bersedia melengkapi verifikasi identitas di menu <strong>Pengaturan Akun</strong> untuk memperoleh badge <strong>Terverifikasi</strong>.
          </label>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-border/40 shrink-0">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 sm:px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Selesaikan Profil</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
