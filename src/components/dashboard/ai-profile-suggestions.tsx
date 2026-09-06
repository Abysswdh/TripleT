"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  Code2,
  Globe,
  ShieldCheck,
  UserCheck,
  Award,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Check,
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

  const [aiTip, setAiTip] = useState<string>(
    "Klien teknologi & UMKM 3x lebih cepat memprioritaskan talenta dengan tautan GitHub atau portofolio terverifikasi."
  );
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Profile gap assessments
  const hasGitHub = Boolean(profile?.github_url);
  const hasPortfolio = Boolean(profile?.portfolio_url || profile?.linkedin_url);
  const hasKtp = Boolean(profile?.is_verified);
  const hasAvatar = Boolean(
    profile?.avatar_url && !profile.avatar_url.includes("default-avatar")
  );
  const verifiedSkills = profile?.verified_skills || [];
  const hasQuiz = verifiedSkills.length > 0;

  // Compute completed count
  const suggestionsList = useMemo(() => {
    return [
      {
        id: "github-portfolio",
        title: "Tautkan GitHub / Portofolio",
        description:
          "Klien UMKM & korporat 3x lebih cepat memilih talenta dengan repositori atau karya terhubung.",
        isDone: hasGitHub || hasPortfolio,
        actionUrl: "/freelancer/settings?tab=profile",
        actionLabel: "Tautkan Link",
        xpReward: 75,
        icon: <Code2 className="h-4 w-4 text-primary" />,
        badgeText: "Rekomendasi Utama",
      },
      {
        id: "ktp-verify",
        title: "Verifikasi Identitas & KTP",
        description:
          "Buka badge 'Verified Talent' untuk meningkatkan kepercayaan klien dan prioritas proposal.",
        isDone: hasKtp,
        actionUrl: "/freelancer/settings?tab=profile",
        actionLabel: "Verifikasi KTP",
        xpReward: 100,
        icon: <ShieldCheck className="h-4 w-4 text-emerald-500" />,
        badgeText: "Kredibilitas",
      },
      {
        id: "profile-avatar",
        title: "Foto Profil Profesional",
        description:
          "Foto yang jelas dan ramah meningkatkan peluang respons proposal pertama Anda hingga 40%.",
        isDone: hasAvatar,
        actionUrl: "/freelancer/settings?tab=profile",
        actionLabel: "Unggah Foto",
        xpReward: 50,
        icon: <UserCheck className="h-4 w-4 text-purple-500" />,
        badgeText: "Impresi",
      },
      {
        id: "skill-quiz",
        title: "Kuis Verifikasi Keahlian",
        description:
          "Selesaikan 1 kuis kompetensi singkat (5 menit) untuk menampilkan badge skor terverifikasi di proposal.",
        isDone: hasQuiz,
        actionUrl: "/freelancer/skills",
        actionLabel: "Mulai Kuis",
        xpReward: 150,
        icon: <Award className="h-4 w-4 text-amber-500" />,
        badgeText: "Keahlian",
      },
    ];
  }, [hasGitHub, hasPortfolio, hasKtp, hasAvatar, hasQuiz]);

  const completedCount = suggestionsList.filter((s) => s.isDone).length;
  const allCompleted = completedCount === suggestionsList.length;

  // Fetch Personalized Gemini AI Suggestion Tip
  useEffect(() => {
    let isMounted = true;
    async function fetchAiSuggestion() {
      setLoadingAi(true);
      try {
        const res = await fetch("/api/ai/profile-suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: profile?.full_name || profile?.name || "Talenta",
            skills: profile?.skills || [],
            hasGitHub,
            hasPortfolio,
            hasKtp,
            hasAvatar,
            headline: profile?.headline || "",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.aiTip) {
            setAiTip(data.aiTip);
          }
        }
      } catch (err) {
        // Fallback to local heuristic
      } finally {
        if (isMounted) setLoadingAi(false);
      }
    }

    fetchAiSuggestion();
    return () => {
      isMounted = false;
    };
  }, [profile?.full_name, hasGitHub, hasPortfolio, hasKtp, hasAvatar]);

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

      {/* AI Generated Tip Card */}
      <div className="rounded-2xl p-3.5 border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-primary/5 text-xs flex items-start gap-2.5">
        <div className="pt-0.5 shrink-0 text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
            Insight Kredibilitas Talenta
          </span>
          <p className="text-[11px] leading-relaxed text-foreground/90 font-medium">
            {aiTip}
          </p>
        </div>
      </div>

      {/* Actionable Suggestions Checklist */}
      <div className="space-y-2.5">
        {suggestionsList.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-3 sm:p-3.5 transition-all flex items-start gap-3 ${
              item.isDone
                ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                : "bg-card border-border/70 hover:border-primary/40 hover:bg-muted/20"
            }`}
          >
            {/* Status Icon */}
            <div className="pt-0.5 shrink-0">
              {item.isDone ? (
                <div className="h-5 w-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                  <Check className="h-3 w-3 stroke-[3]" />
                </div>
              ) : (
                <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  {item.icon}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-xs font-bold ${
                    item.isDone
                      ? "line-through text-muted-foreground"
                      : "text-foreground font-heading"
                  }`}
                >
                  {item.title}
                </h4>

                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  +{item.xpReward} XP
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.description}
              </p>

              {!item.isDone && (
                <div className="pt-1">
                  <Link
                    href={item.actionUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 hover:underline"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Completion Banner */}
      {allCompleted && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-center text-xs space-y-1">
          <span className="font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            Profil Anda 100% Siap & Kredibel! 🎉
          </span>
          <p className="text-[11px] text-muted-foreground">
            Kredibilitas Anda berada di persentil teratas untuk menarik klien UMKM berkualitas.
          </p>
        </div>
      )}
    </div>
  );
}
