"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { ArrowLeft, Loader2, Sparkles, Check } from "lucide-react";

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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Customize Your Profile
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose an avatar badge and tell the community a little about yourself.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Avatar Picker */}
      <div>
        <label className="mb-3 block text-sm font-semibold text-center">
          Choose Your Avatar Badge
        </label>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {AVATAR_PRESETS.map((preset) => {
            const isSelected = data.avatarUrl === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onUpdate({ avatarUrl: preset.id })}
                className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${preset.bg} text-2xl shadow-md transition-all duration-200 hover:scale-105 ${
                  isSelected
                    ? "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110 shadow-lg"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <span>{preset.emoji}</span>
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bio / Headline */}
      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold">
          Headline / Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={data.bio}
          onChange={(e) => onUpdate({ bio: e.target.value })}
          placeholder={
            data.role === "freelancer"
              ? "e.g., Full-stack TypeScript & Python developer interested in building AI apps."
              : "e.g., Founder at TechCorp looking for verified React & Python developers."
          }
          className="w-full rounded-xl border border-input bg-background p-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-right text-[11px] text-muted-foreground">
          {data.bio.length}/160 characters
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Complete Setup</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
