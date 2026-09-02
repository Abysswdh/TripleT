"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Award,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Trophy,
  Search
} from "lucide-react";
import Link from "next/link";
import {
  SKILL_QUIZZES,
  type SkillQuizDefinition,
  type QuizAttemptResult,
  getSavedQuizResults,
} from "@/lib/services/quizzes";
import { QuizModal } from "@/components/skills/quiz-modal";

const CATEGORIES = ["Semua", "Frontend", "Backend", "UI/UX", "Frontend 3D", "Database"];

export default function FreelancerSkillsPage() {
  const [quizzes] = useState<SkillQuizDefinition[]>(SKILL_QUIZZES);
  const [completedResults, setCompletedResults] = useState<Record<string, QuizAttemptResult>>({});
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuizForModal, setActiveQuizForModal] = useState<SkillQuizDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleOpenQuiz = (quiz: SkillQuizDefinition) => {
    setActiveQuizForModal(quiz);
    setIsModalOpen(true);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      {/* Header & Overview */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Skill Verification & Badges</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Verifikasi Skill & Tes Kompetensi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan kuis teknis interaktif untuk memperoleh badge resmi terverifikasi dan menaikkan Match Score profilmu.
          </p>
        </div>

        <Link
          href="/freelancer/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          <span>← Kembali ke Overview</span>
        </Link>
      </div>

      {/* Stats Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">Badge Terverifikasi</span>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-3xl font-extrabold text-foreground">{stats.totalBadges} / {quizzes.length}</h3>
          <p className="text-xs text-muted-foreground">Badge langsung disematkan pada kartu talent profil Anda.</p>
        </div>

        <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Total XP Keahlian</span>
            <Zap className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-extrabold text-foreground">+{stats.totalXp} XP</h3>
          <p className="text-xs text-muted-foreground">Tingkatkan level freelancer Anda untuk unlock badge Level 2 Pro.</p>
        </div>

        <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Rata-rata Skor Kelulusan</span>
            <Trophy className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-3xl font-extrabold text-foreground">{stats.averageScore}%</h3>
          <p className="text-xs text-muted-foreground">Passing grade minimum 80% per modul keahlian.</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari tes kompetensi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-border/80 bg-muted/40 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {filteredQuizzes.map((quiz) => {
          const attempt = completedResults[quiz.id];
          const isPassed = attempt?.passed;

          return (
            <div
              key={quiz.id}
              className={`group flex flex-col justify-between rounded-3xl border bg-card p-6 shadow-sm hover:shadow-md transition-all space-y-5 ${
                isPassed
                  ? "border-emerald-500/30 hover:border-emerald-500/50"
                  : "border-border/70 hover:border-primary/40"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {quiz.categoryLabel}
                    </span>
                    <span className="text-lg">{quiz.badgeIcon}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                    <Zap className="h-3.5 w-3.5" />
                    +{quiz.xpReward} XP
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                    {quiz.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    {quiz.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span>{quiz.questionsCount} Pertanyaan</span>
                  <span>•</span>
                  <span>Waktu: {quiz.timeLimitDisplay}</span>
                  <span>•</span>
                  <span>Pass: {quiz.passingScore}%</span>
                </div>
              </div>

              {/* Card Footer: Status & Action Button */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                {isPassed ? (
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">{quiz.badgeName}</span>
                      <p className="text-[11px] text-emerald-600 font-semibold">
                        Lulus ({attempt.score}%) • Terverifikasi
                      </p>
                    </div>
                  </div>
                ) : attempt && !isPassed ? (
                  <div>
                    <span className="text-xs font-bold text-amber-600 block">Belum Lulus</span>
                    <p className="text-[11px] text-muted-foreground">Skor: {attempt.score}% (Min: {quiz.passingScore}%)</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                    <span>Belum diambil</span>
                  </div>
                )}

                {isPassed ? (
                  <button
                    onClick={() => handleOpenQuiz(quiz)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 hover:bg-muted px-3.5 py-2 text-xs font-semibold text-foreground transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Ulangi Kuis</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenQuiz(quiz)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 hover:scale-102 transition-all"
                  >
                    <span>Mulai Kuis</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Quiz Runner Modal */}
      <QuizModal
        quiz={activeQuizForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCompleted={() => loadResults()}
      />
    </div>
  );
}
