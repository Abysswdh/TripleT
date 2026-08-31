"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { ArrowLeft, Loader2, Check, MapPin, User, ShieldCheck } from "lucide-react";

interface StepProfileProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
  error: string | null;
}

const INDONESIAN_CITIES = [
  "Jakarta, DKI Jakarta",
  "Bandung, Jawa Barat",
  "Surabaya, Jawa Timur",
  "Yogyakarta, DI Yogyakarta",
  "Semarang, Jawa Tengah",
  "Malang, Jawa Timur",
  "Medan, Sumatera Utara",
  "Denpasar, Bali",
  "Makassar, Sulawesi Selatan",
  "Palembang, Sumatera Selatan",
  "Bogor, Jawa Barat",
  "Tangerang, Banten",
  "Bekasi, Jawa Barat",
  "Solo (Surakarta), Jawa Tengah",
  "Lainnya (Indonesia)",
];

const AVATAR_PRESETS = [
  { id: "avatar-1", emoji: "🚀", label: "Rocket", bg: "from-blue-500 to-indigo-600" },
  { id: "avatar-2", emoji: "⚡", label: "Lightning", bg: "from-amber-400 to-orange-500" },
  { id: "avatar-3", emoji: "🧠", label: "AI Sage", bg: "from-purple-500 to-pink-600" },
  { id: "avatar-4", emoji: "🎨", label: "Design Pro", bg: "from-emerald-400 to-teal-600" },
  { id: "avatar-5", emoji: "🛡️", label: "Guardian", bg: "from-cyan-500 to-blue-600" },
  { id: "avatar-6", emoji: "💎", label: "Diamond", bg: "from-violet-500 to-purple-600" },
];

export function StepProfile({
  data,
  onUpdate,
  onSubmit,
  onPrev,
  loading,
  error,
}: StepProfileProps) {
  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Lengkapi Profil & Identitas
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Tentukan nama tampilan dan domisili untuk profil akun Anda.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
        {/* Full Name / Display Name */}
        <div>
          <label htmlFor="fullName" className="mb-1 block text-xs font-semibold text-foreground">
            Nama Lengkap / Tampilan
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              id="fullName"
              type="text"
              value={data.fullName || ""}
              onChange={(e) => onUpdate({ fullName: e.target.value })}
              placeholder={data.role === "freelancer" ? "Contoh: Budi Santoso" : "Contoh: Hendra Wijaya"}
              className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Location / City Selector */}
        <div>
          <label htmlFor="locationCity" className="mb-1 block text-xs font-semibold text-foreground">
            Domisili / Kota
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <select
              id="locationCity"
              value={data.locationCity || "Jakarta, DKI Jakarta"}
              onChange={(e) => onUpdate({ locationCity: e.target.value })}
              className="h-9 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-xs font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              {INDONESIAN_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Avatar Preset Picker */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">
            Pilih Avatar Badge
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = data.avatarUrl === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onUpdate({ avatarUrl: preset.id })}
                  className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${preset.bg} text-lg shadow-xs transition-all duration-200 hover:scale-105 ${
                    isSelected
                      ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-105 shadow-md"
                      : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <span>{preset.emoji}</span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bio / Headline */}
        <div>
          <label htmlFor="bio" className="mb-1 block text-xs font-semibold text-foreground">
            Headline / Bio Singkat
          </label>
          <textarea
            id="bio"
            rows={2}
            value={data.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            placeholder={
              data.role === "freelancer"
                ? "Contoh: UI/UX designer berpengalaman dalam pembuatan prototipe web & mobile di Figma."
                : "Contoh: Pemilik bisnis lokal mencari partner kreatif untuk kebutuhan desain & visual branding."
            }
            className="w-full rounded-xl border border-border bg-card p-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* KTP Verification Readiness */}
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
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Kesiapan Verifikasi Identitas (KTP / Paspor)
            </span>
            Saya bersedia melengkapi verifikasi identitas di menu <strong>Pengaturan Akun</strong> untuk mendapatkan lencana Terverifikasi.
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Menyimpan Profil...</span>
            </>
          ) : (
            <span>Selesaikan & Masuk Dashboard</span>
          )}
        </button>
      </div>
    </div>
  );
}
