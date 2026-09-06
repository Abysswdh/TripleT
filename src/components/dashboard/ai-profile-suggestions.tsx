"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Code2,
  ShieldCheck,
  UserCheck,
  Award,
  CheckCircle2,
  Brain,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AIProfileSuggestionsProps {
  userProfile?: any;
  className?: string;
}

export function AIProfileSuggestions({
  userProfile,
  className = "",
}: AIProfileSuggestionsProps) {
  const { user } = useAuth();
  const profile = userProfile || user || {};

  // Profile gap assessments
  const hasGitHub = Boolean(profile?.github_url);
  const hasPortfolio = Boolean(profile?.portfolio_url || profile?.linkedin_url);
  const hasKtp = Boolean(profile?.is_verified);
  const hasAvatar = Boolean(
    profile?.avatar_url && !profile.avatar_url.includes("default-avatar")
  );
  const verifiedSkills = profile?.verified_skills || [];
  const hasQuiz = verifiedSkills.length > 0;

  // Compute suggestions list with priority
  const suggestionsList = useMemo(() => {
    return [
      {
        id: "github-portfolio",
        title: "Tautkan GitHub / Portofolio",
        description:
          "Klien UMKM & korporat 3x lebih cepat memilih talenta dengan repositori atau karya terhubung.",
        isDone: hasGitHub || hasPortfolio,
        actionUrl: "/freelancer/settings?tab=profile",
        xpReward: 75,
        icon: <Code2 className="h-4 w-4 text-primary" />,
      },
      {
        id: "ktp-verify",
        title: "Verifikasi Identitas & KTP",
        description:
          "Buka badge 'Verified Talent' untuk meningkatkan kepercayaan klien dan prioritas proposal.",
        isDone: hasKtp,
        actionUrl: "/freelancer/settings?tab=profile",
        xpReward: 100,
        icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
      },
      {
        id: "profile-avatar",
        title: "Foto Profil Profesional",
        description:
          "Foto yang jelas dan ramah meningkatkan peluang respons proposal pertama Anda hingga 40%.",
        isDone: hasAvatar,
        actionUrl: "/freelancer/settings?tab=profile",
        xpReward: 50,
        icon: <UserCheck className="h-4 w-4 text-purple-500" />,
      },
      {
        id: "skill-quiz",
        title: "Kuis Verifikasi Keahlian",
        description:
          "Selesaikan 1 kuis kompetensi singkat (5 menit) untuk menampilkan badge skor terverifikasi di proposal.",
        isDone: hasQuiz,
        actionUrl: "/freelancer/skills",
        xpReward: 150,
        icon: <Award className="h-4 w-4 text-amber-500" />,
      },
    ];
  }, [hasGitHub, hasPortfolio, hasKtp, hasAvatar, hasQuiz]);

  const completedCount = suggestionsList.filter((s) => s.isDone).length;
  const allCompleted = completedCount === suggestionsList.length;
  // Show only 1 top active recommendation
  const activeSuggestion = suggestionsList.find((s) => !s.isDone);

  return (
    <div
      id="ai-suggestions-box"
      className={`rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 p-5 sm:p-6 shadow-sm space-y-4 relative overflow-hidden transition-all ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
            Rekomendasi AI
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
            <Brain className="h-3 w-3" />
            AI Generated
          </span>
        </div>

        <span className="text-xs font-bold text-muted-foreground">
          <span className="text-primary font-black">{completedCount}</span>/
          {suggestionsList.length} Lengkap
        </span>
      </div>

      {/* Actionable Suggestion Card (1 item only, whole card clickable) */}
      {allCompleted ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-center text-xs space-y-1">
          <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Profil Anda 100% Siap & Kredibel! 🎉
          </span>
          <p className="text-[11px] text-muted-foreground">
            Kredibilitas Anda berada di persentil teratas untuk menarik klien UMKM berkualitas.
          </p>
        </div>
      ) : activeSuggestion ? (
        <Link
          href={activeSuggestion.actionUrl}
          className="group block rounded-2xl border border-border/70 bg-card p-3.5 sm:p-4 hover:border-primary/50 hover:bg-primary/[0.03] transition-all duration-200 shadow-xs hover:shadow-sm cursor-pointer"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="pt-0.5 shrink-0">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                {activeSuggestion.icon}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-foreground font-heading group-hover:text-primary transition-colors">
                  {activeSuggestion.title}
                </h4>

                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  +{activeSuggestion.xpReward} XP
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {activeSuggestion.description}
              </p>
            </div>
          </div>
        </Link>
      ) : null}
    </div>
  );
}
