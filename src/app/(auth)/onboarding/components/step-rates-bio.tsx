"use client";

import { ClientBudgetPref, OnboardingData, WeeklyAvailability } from "@/hooks/use-onboarding";
import { ArrowLeft, Loader2, ShieldCheck, Sparkles } from "lucide-react";

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

export function StepRatesBio({
  data,
  onUpdate,
  onSubmit,
  onPrev,
  loading,
  error,
}: StepRatesBioProps) {
  const isFreelancer = data.role === "freelancer";

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Scaled-up Form Content (No redundant header/badge pill) */}
      <div className="my-auto space-y-4">
        {error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
            {error}
          </div>
        )}

        {isFreelancer ? (
          <>
            {/* Weekly Availability Options */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Ketersediaan Waktu & Kapasitas Mingguan
              </label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdate({ weeklyAvailability: opt.id as WeeklyAvailability })}
                    className={`rounded-2xl border p-3 text-left transition-all ${
                      data.weeklyAvailability === opt.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">{opt.label}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{opt.hours}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Bio / Headline */}
            <div>
              <label htmlFor="bio" className="mb-1.5 block text-xs sm:text-sm font-bold text-foreground">
                Headline & Bio Profil Singkat
              </label>
              <textarea
                id="bio"
                rows={2}
                value={data.bio}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                placeholder="Contoh: UI/UX designer berfokus pada pengalaman pengguna yang intuitif, prototipe cepat di Figma, dan siap mendukung UMKM naik kelas."
                className="w-full rounded-2xl border border-border bg-card p-3.5 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed shadow-xs"
              />
            </div>
          </>
        ) : (
          <>
            {/* Client Budget Range */}
            <div>
              <label className="mb-2 block text-xs sm:text-sm font-bold text-foreground">
                Kisaran Budget Proyek
              </label>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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
                    className={`rounded-2xl border p-3.5 text-left transition-all ${
                      data.budgetPreference === item.pref
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-foreground">{item.label}</p>
                    <p className="text-xs sm:text-sm font-bold text-primary mt-1">{item.range}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-tight">{item.note}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Description / Bio */}
            <div>
              <label htmlFor="bioClient" className="mb-1.5 block text-xs sm:text-sm font-bold text-foreground">
                Deskripsi Singkat Usaha & Rencana Kolaborasi
              </label>
              <textarea
                id="bioClient"
                rows={2}
                value={data.bio}
                onChange={(e) => onUpdate({ bio: e.target.value })}
                placeholder="Contoh: Kami adalah bisnis F&B yang sedang melakukan digitalisasi menu dan brand identity, mencari talenta kreatif yang komunikatif."
                className="w-full rounded-2xl border border-border bg-card p-3.5 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed shadow-xs"
              />
            </div>
          </>
        )}

        {/* Verification Readiness Toggle */}
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-3.5 flex items-start gap-3">
          <input
            type="checkbox"
            id="ktpConsent"
            checked={data.willingToVerifyKtp}
            onChange={(e) => onUpdate({ willingToVerifyKtp: e.target.checked })}
            className="mt-0.5 h-4 w-4 rounded-md border-border text-primary focus:ring-primary/20 cursor-pointer"
          />
          <label htmlFor="ktpConsent" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Kesiapan Verifikasi Identitas (KTP / Paspor)
            </span>
            Saya bersedia melengkapi verifikasi identitas di menu <strong>Pengaturan Akun</strong> untuk memperoleh badge <strong>Terverifikasi</strong>.
          </label>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Menyimpan Profil...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Selesaikan & Buat Profil</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
