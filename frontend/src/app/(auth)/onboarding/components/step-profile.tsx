"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { ArrowLeft, Loader2, Check } from "lucide-react";

interface StepProfileProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onSubmit: () => void;
  onPrev: () => void;
  loading: boolean;
  error: string | null;
}

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
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
          Lengkapi Profil Kamu
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Pilih avatar badge dan tulis deskripsi singkat tentang dirimu.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2.5 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Avatar Picker */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-foreground">
          Pilih Avatar Badge
        </label>
        <div className="flex flex-wrap items-center gap-2.5">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = data.avatarUrl === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onUpdate({ avatarUrl: preset.id })}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${preset.bg} text-xl shadow-sm transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? "ring-4 ring-primary ring-offset-2 ring-offset-white scale-105 shadow-md"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <span>{preset.emoji}</span>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white shadow">
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
          rows={3}
          value={data.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder={
            data.role === "freelancer"
              ? "Contoh: Full-stack developer yang fokus membangun web app modern dengan Next.js & Python."
              : "Contoh: Founder startup mencari talent React & UI/UX terverifikasi untuk proyek jangka panjang."
          }
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-right text-[10px] text-muted-foreground">
          {data.bio.length}/160 karakter
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>Selesaikan Pendaftaran</span>
          )}
        </button>
      </div>
    </div>
  );
}
