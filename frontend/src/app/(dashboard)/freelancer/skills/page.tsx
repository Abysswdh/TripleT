"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Trophy,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  Flame,
  Check,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  SKILL_QUIZZES,
  type SkillQuizDefinition,
  type QuizAttemptResult,
  getSavedQuizResults,
} from "@/lib/services/quizzes";
import { createClient } from "@/lib/supabase/client";
import CountUp from "@/components/ui/CountUp";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import Grainient from "@/components/ui/Grainient";

const CATEGORIES = ["Semua", "Frontend", "Backend", "UI/UX", "Frontend 3D", "Database"];

export default function FreelancerSkillsPage() {
  const [quizzes] = useState<SkillQuizDefinition[]>(SKILL_QUIZZES);
  const [completedResults, setCompletedResults] = useState<Record<string, QuizAttemptResult>>({});
  const [userProfileSkills, setUserProfileSkills] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const loadResults = () => {
    const data = getSavedQuizResults();
    setCompletedResults(data);
  };

  useEffect(() => {
    loadResults();

    const handleQuizCompleted = () => {
      loadResults();
    };

    window.addEventListener("quiz-completed", handleQuizCompleted);
    return () => {
      window.removeEventListener("quiz-completed", handleQuizCompleted);
    };
  }, []);

  // Fetch logged-in freelancer's onboarding skills from Supabase
  useEffect(() => {
    async function fetchUserSkills() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("freelancer_profiles")
          .select("skills")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.skills && Array.isArray(profile.skills)) {
          setUserProfileSkills(profile.skills);
        } else if (user.user_metadata?.skills) {
          setUserProfileSkills(user.user_metadata.skills);
        }
      } catch (e) {
        console.warn("Could not load user profile skills:", e);
      }
    }

    fetchUserSkills();
  }, []);

  // Compute live stats
  const stats = useMemo(() => {
    const completedList = Object.values(completedResults).filter((r) => r.passed);
    const totalXp = completedList.reduce((acc, curr) => acc + (curr.earnedXp || 0), 0);
    const totalBadges = completedList.length;
    const averageScore =
      completedList.length > 0
        ? Math.round(completedList.reduce((acc, curr) => acc + curr.score, 0) / completedList.length)
        : 0;

    return {
      totalXp,
      totalBadges,
      averageScore,
    };
  }, [completedResults]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Semua: quizzes.length };
    quizzes.forEach((q) => {
      counts[q.category] = (counts[q.category] || 0) + 1;
    });
    return counts;
  }, [quizzes]);

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchCat =
        selectedCategory === "Semua" || q.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchQuery =
        searchQuery.trim() === "" ||
        q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.badgeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [quizzes, selectedCategory, searchQuery]);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 space-y-8">
      {/* ========================================================================= */}
      {/* CLEAN SLEEK GRAINIENT HERO BANNER                                         */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10 text-white shadow-xl border border-white/10 min-h-[180px] flex items-center">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Grainient
            color1="#3B82F6"
            color2="#6366F1"
            color3="#0F172A"
            timeSpeed={0.2}
            colorBalance={0.0}
            warpStrength={1.0}
            warpFrequency={5.0}
            warpSpeed={2.0}
            warpAmplitude={50.0}
            blendAngle={0.0}
            blendSoftness={0.05}
            rotationAmount={500.0}
            noiseScale={2.0}
            grainAmount={0.1}
            grainScale={2.0}
            grainAnimated={false}
            contrast={1.4}
            gamma={1.0}
            saturation={1.05}
            centerX={0.0}
            centerY={0.0}
            zoom={0.9}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/40 backdrop-blur-[1px] pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div className="space-y-2.5 max-w-2xl">
            {/* Live Status Beacon Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 text-xs font-bold text-white shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <Award className="h-3.5 w-3.5 text-amber-300" />
              <span>Skill Verification & Talent Badges</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-heading leading-tight text-white drop-shadow-sm">
              Verifikasi Skill & Tes Kompetensi
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              Selesaikan kuis teknis interaktif untuk memperoleh lencana resmi terverifikasi platform dan menaikkan Match Score profil talent Anda di hadapan Klien.
            </p>
          </div>
        </div>
      </div>

      {/* Two-Column Split Layout: Left Sticky Sidebar + Right Scrollable Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: CLEAN DUOLINGO-STYLE STICKY SIDEBAR                          */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
          {/* 1. Top Status Pill Strip */}
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-2.5 px-4 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
              <span className="text-base leading-none">🏆</span>
              <span>Lv. 2</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
              <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>6 Hari</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-500">
              <Zap className="h-4 w-4 fill-blue-500 text-blue-500" />
              <span>+{stats.totalXp} XP</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>{stats.totalBadges}/{quizzes.length}</span>
            </div>
          </div>

          {/* 2. League / Rank Status Card */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Verified Pro League
              </span>
              <span className="text-[11px] font-extrabold text-primary uppercase">
                Top 5% Talent
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 text-white shadow-md shadow-violet-500/25 text-2xl">
                🛡️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">Peringkat #3 Mahir</p>
                <p className="text-[11px] text-muted-foreground truncate">Lulus kuis untuk naik ke Senior Tier!</p>
              </div>
            </div>

            {/* Gold Level Progress Bar */}
            <div className="space-y-1 pt-1">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/80">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-out shadow-xs"
                  style={{ width: `${Math.max(12, Math.min(100, Math.round((stats.totalXp / 1500) * 100)))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                <span>{stats.totalXp} XP</span>
                <span>1.500 XP</span>
              </div>
            </div>
          </div>

          {/* 3. Daily Quests / Target Sertifikasi (Duolingo Quest Style) */}
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Target Sertifikasi
              </span>
              <span className="text-[11px] font-extrabold text-primary">
                {stats.totalBadges}/{quizzes.length} SELESAI
              </span>
            </div>

            <div className="space-y-3.5">
              {quizzes.map((q) => {
                const attempt = completedResults[q.id];
                const isPassed = attempt?.passed;

                return (
                  <Link
                    key={q.id}
                    href={`/freelancer/skills/quiz/${q.id}`}
                    className="group block space-y-1.5 hover:opacity-90 transition-opacity"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            isPassed
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-muted/60 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <span className="font-bold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                          {q.name.split(" ")[0]} {q.name.split(" ")[1]}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          isPassed
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isPassed ? `${attempt.score}% Lulus` : `+${q.xpReward} XP`}
                      </span>
                    </div>

                    {/* Dynamic Gold Mini Bar */}
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isPassed ? "bg-amber-400" : "bg-transparent"
                        }`}
                        style={{ width: isPassed ? "100%" : "0%" }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 4. Quick Filter & Search Card */}
          <div className="rounded-3xl border border-border/70 bg-card p-4.5 shadow-sm space-y-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari tes kompetensi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8.5 w-full rounded-xl border border-border/80 bg-muted/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {CATEGORIES.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-border/40"
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className="text-[10px] opacity-75">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: SCROLLABLE QUIZ CATALOG                                     */}
        {/* ========================================================================= */}
        <main className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Catalog Filter State Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-card border border-border/70 p-4 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-foreground font-heading">
                Katalog Modul Ujian ({selectedCategory})
              </h2>
              <p className="text-xs text-muted-foreground">
                Pilih modul spesialisasi untuk menguji pemahaman arsitektur dan praktik terbaik industri.
              </p>
            </div>

            <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
              {filteredQuizzes.length} Tes Tersedia
            </span>
          </div>

          {/* Quizzes Cards Grid */}
          {filteredQuizzes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3 bg-card/50">
              <Search className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Modul Ditemukan</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Tidak ada kuis yang cocok dengan kata kunci &quot;{searchQuery}&quot; atau kategori {selectedCategory}.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("Semua");
                  setSearchQuery("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-2"
              >
                <span>Reset Pencarian</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-1 xl:grid-cols-2">
              {filteredQuizzes.map((quiz) => {
                const attempt = completedResults[quiz.id];
                const isPassed = attempt?.passed;

                return (
                  <div
                    key={quiz.id}
                    className={`group flex flex-col justify-between rounded-3xl border bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ${
                      isPassed
                        ? "border-emerald-500/30 hover:border-emerald-500/50"
                        : "border-border/70 hover:border-primary/50"
                    }`}
                  >
                    <div>
                      {/* Top Image Banner with Gradient & Badges */}
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900">
                        <img
                          src={quiz.coverImage}
                          alt={quiz.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                        {/* Overlaid Badges */}
                        <div className="absolute top-3.5 left-3.5 right-3.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="rounded-full bg-black/50 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white border border-white/20">
                              {quiz.categoryLabel}
                            </span>

                            {userProfileSkills.some(
                              (s) =>
                                quiz.name.toLowerCase().includes(s.toLowerCase()) ||
                                quiz.badgeName.toLowerCase().includes(s.toLowerCase()) ||
                                quiz.category.toLowerCase().includes(s.toLowerCase())
                            ) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm border border-blue-400/30">
                                <Sparkles className="h-3 w-3" />
                                Pilihan Onboarding
                              </span>
                            )}
                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white bg-amber-500/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm">
                            <Zap className="h-3 w-3" />
                            +{quiz.xpReward} XP
                          </span>
                        </div>

                        {/* Overlaid Title on Bottom of Image */}
                        <div className="absolute bottom-3.5 left-4 right-4">
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug drop-shadow-sm font-heading">
                            {quiz.name}
                          </h3>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {quiz.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="rounded-lg bg-muted/60 px-2.5 py-1 font-medium">
                            {quiz.questionsCount} Pertanyaan
                          </span>
                          <span>•</span>
                          <span className="rounded-lg bg-muted/60 px-2.5 py-1 font-medium">
                            {quiz.timeLimitDisplay}
                          </span>
                          <span>•</span>
                          <span className="rounded-lg bg-muted/60 px-2.5 py-1 font-medium">
                            Standar: {quiz.passingScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer: Status & Action Button */}
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-2 border-t border-border/40 flex items-center justify-between gap-3">
                      {isPassed ? (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">
                              {quiz.badgeName}
                            </span>
                            <p className="text-[11px] text-emerald-600 font-semibold truncate">
                              Lulus ({attempt.score}%) • Terverifikasi
                            </p>
                          </div>
                        </div>
                      ) : attempt && !isPassed ? (
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-amber-600 block truncate">Belum Lulus</span>
                          <p className="text-[11px] text-muted-foreground truncate">
                            Skor: {attempt.score}% (Min: {quiz.passingScore}%)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-muted-foreground/40 shrink-0" />
                          <span>Belum diambil</span>
                        </div>
                      )}

                      {isPassed ? (
                        <Link
                          href={`/freelancer/skills/quiz/${quiz.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted px-4 py-2 text-xs font-semibold text-foreground transition-all hover:scale-102 shrink-0"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Ulangi</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/freelancer/skills/quiz/${quiz.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary-600 hover:scale-102 transition-all shrink-0"
                        >
                          <span>Mulai Kuis</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
