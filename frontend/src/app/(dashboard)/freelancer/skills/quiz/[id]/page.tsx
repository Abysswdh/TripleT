"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  Zap,
  Clock,
  HelpCircle,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  getQuizById,
  saveQuizResult,
  getSavedQuizResults,
  type SkillQuizDefinition,
  type QuizAttemptResult,
} from "@/lib/services/quizzes";
import { getLearnedResources, markResourceStudied } from "@/lib/services/activity";

export default function SkillQuizRunnerPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = typeof params?.id === "string" ? params.id : "";

  const [quiz, setQuiz] = useState<SkillQuizDefinition | null>(null);
  const [phase, setPhase] = useState<"intro" | "taking" | "result">("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(300);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [learnedResources, setLearnedResources] = useState<string[]>([]);

  useEffect(() => {
    setLearnedResources(getLearnedResources());
  }, []);

  const handleResourceClick = async (url: string, title: string) => {
    if (!quiz) return;
    const res = await markResourceStudied(quiz.id, url, title);
    if (res.success) {
      setLearnedResources((prev) => [...prev, `${quiz.id}:${url}`]);
    }
  };

  // Load quiz by dynamic ID
  useEffect(() => {
    if (!quizId) return;
    const foundQuiz = getQuizById(quizId);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      setUserAnswers(new Array(foundQuiz.questions.length).fill(-1));
      setTimeLeft(foundQuiz.timeLimitSeconds);

      // Check if user previously took this quiz
      const savedResults = getSavedQuizResults();
      if (savedResults[quizId]) {
        // keep result available for reference
      }
    }
  }, [quizId]);

  // Handle quiz completion calculation
  const handleFinishQuiz = useCallback(() => {
    if (!quiz) return;

    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const earnedXp = passed ? quiz.xpReward : Math.round(quiz.xpReward * 0.25);

    const newResult: QuizAttemptResult = {
      quizId: quiz.id,
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      earnedXp,
      badgeName: passed ? quiz.badgeName : undefined,
      completedAt: new Date().toISOString(),
      userAnswers: [...userAnswers],
    };

    saveQuizResult(newResult);
    setResult(newResult);
    setPhase("result");
  }, [quiz, userAnswers]);

  // Countdown timer when taking test
  useEffect(() => {
    if (phase !== "taking") return;

    if (timeLeft <= 0) {
      handleFinishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft, handleFinishQuiz]);

  // Keyboard navigation shortcuts (1-4 or A-D to select options)
  useEffect(() => {
    if (phase !== "taking" || !quiz) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is in an input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toLowerCase();
      let selectedOptIndex = -1;

      if (key === "1" || key === "a") selectedOptIndex = 0;
      if (key === "2" || key === "b") selectedOptIndex = 1;
      if (key === "3" || key === "c") selectedOptIndex = 2;
      if (key === "4" || key === "d") selectedOptIndex = 3;

      if (selectedOptIndex !== -1 && quiz.questions[currentQuestionIndex]?.options[selectedOptIndex]) {
        setUserAnswers((prev) => {
          const next = [...prev];
          next[currentQuestionIndex] = selectedOptIndex;
          return next;
        });
      }

      if (e.key === "ArrowRight" && currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
      if (e.key === "ArrowLeft" && currentQuestionIndex > 0) {
        setCurrentQuestionIndex((prev) => prev - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, quiz, currentQuestionIndex]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    if (!quiz) return;
    setUserAnswers(new Array(quiz.questions.length).fill(-1));
    setTimeLeft(quiz.timeLimitSeconds);
    setCurrentQuestionIndex(0);
    setPhase("taking");
  };

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = optionIndex;
      return next;
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // If quiz not found
  if (!quiz) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-3xl bg-muted/60 text-muted-foreground flex items-center justify-center">
          <HelpCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Kuis Skill Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Modul ujian kuis yang Anda cari tidak tersedia atau ID tidak valid.
        </p>
        <Link
          href="/freelancer/skills"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Direktori Skill</span>
        </Link>
      </div>
    );
  }

  const currentQ = quiz.questions[currentQuestionIndex];
  const progressPercent = Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);
  const answeredCount = userAnswers.filter((a) => a !== -1).length;
  const isTimeCritical = timeLeft < 60;
  const isTimeWarning = timeLeft < 120 && !isTimeCritical;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/40 pb-20">
      {/* ========================================================================= */}
      {/* STICKY TOP APP BAR                                                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/80 backdrop-blur-md transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {phase === "taking" ? (
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:scale-102 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar Ujian</span>
              </button>
            ) : (
              <Link
                href="/freelancer/skills"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:scale-102 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Direktori Skill</span>
              </Link>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider truncate">
                  {quiz.categoryLabel}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                  <Zap className="h-3 w-3" />
                  +{quiz.xpReward} XP
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-foreground truncate font-heading mt-0.5">
                {quiz.name}
              </h1>
            </div>
          </div>

          {/* Right Header: Timer (when taking test) or Status */}
          {phase === "taking" && (
            <div
              className={`flex items-center gap-2 rounded-2xl px-3.5 py-1.5 text-xs font-mono font-bold shadow-xs border transition-all ${
                isTimeCritical
                  ? "bg-rose-500/15 border-rose-500/30 text-rose-600 animate-pulse"
                  : isTimeWarning
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-600"
                  : "bg-card border-border/80 text-foreground"
              }`}
            >
              <Clock className={`h-4 w-4 ${isTimeCritical ? "text-rose-600" : isTimeWarning ? "text-amber-500" : "text-primary"}`} />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          )}

          {phase === "result" && (
            <Link
              href="/freelancer/skills"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-600 transition-all hover:scale-102"
            >
              <span>Selesai</span>
              <CheckCircle2 className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 animate-in fade-in duration-300">
        {/* ========================================================================= */}
        {/* PHASE 1: INTRO / BRIEFING VIEW                                            */}
        {/* ========================================================================= */}
        {phase === "intro" && (
          <div className="space-y-6">
            {/* Hero Card with Top Image Banner */}
            <div className="rounded-3xl border border-border/80 bg-card shadow-xl overflow-hidden">
              {/* Panoramic Top Cover Image */}
              <div className="relative h-52 sm:h-64 md:h-72 w-full overflow-hidden bg-slate-900">
                <img
                  src={quiz.coverImage}
                  alt={quiz.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                {/* Overlaid Badges on Top */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  <span className="rounded-full bg-black/60 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/20">
                    {quiz.categoryLabel}
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white bg-amber-500/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md">
                    <Zap className="h-3.5 w-3.5" />
                    +{quiz.xpReward} XP Reward
                  </span>
                </div>

                {/* Overlaid Title on Bottom of Image */}
                <div className="absolute bottom-4 sm:bottom-6 left-5 sm:left-8 right-5 sm:right-8 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-200">
                    Ujian Sertifikasi Kompetensi
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-heading tracking-tight leading-tight drop-shadow-md">
                    {quiz.name}
                  </h2>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8 md:p-10 space-y-6">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {quiz.description}
                </p>

                {/* Key Exam Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 py-2">
                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center space-y-1">
                    <HelpCircle className="h-5 w-5 text-primary mx-auto" />
                    <span className="text-[11px] text-muted-foreground block font-medium">Jumlah Pertanyaan</span>
                    <p className="text-base font-extrabold text-foreground">{quiz.questionsCount} Soal</p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center space-y-1">
                    <Clock className="h-5 w-5 text-amber-500 mx-auto" />
                    <span className="text-[11px] text-muted-foreground block font-medium">Batas Waktu</span>
                    <p className="text-base font-extrabold text-foreground">{quiz.timeLimitDisplay}</p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center space-y-1">
                    <Trophy className="h-5 w-5 text-emerald-500 mx-auto" />
                    <span className="text-[11px] text-muted-foreground block font-medium">Standar Lulus</span>
                    <p className="text-base font-extrabold text-foreground">{quiz.passingScore}% Nilai</p>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 text-center space-y-1">
                    <Award className="h-5 w-5 text-violet-500 mx-auto" />
                    <span className="text-[11px] text-muted-foreground block font-medium">Hadiah Lencana</span>
                    <p className="text-xs font-bold text-violet-600 truncate mt-1">{quiz.badgeName}</p>
                  </div>
                </div>

                {/* Instructions Card */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <BookOpen className="h-4 w-4" />
                    <span>Petunjuk & Peraturan Ujian</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Ujian terdiri dari <strong>{quiz.questionsCount} soal pilihan ganda</strong> dengan durasi waktu total <strong>{quiz.timeLimitDisplay}</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Anda dapat berpindah antar nomor pertanyaan kapan saja sebelum menekan tombol kumpulkan.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Dapat menggunakan tombol keyboard <strong>1, 2, 3, 4</strong> atau <strong>A, B, C, D</strong> untuk memilih jawaban dengan cepat.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Jika berhasil meraih nilai minimal <strong>{quiz.passingScore}%</strong>, lencana <strong>{quiz.badgeName}</strong> akan otomatis disematkan pada profil publik Anda.</span>
                    </li>
                  </ul>
                </div>

                {/* Learning Resources Section */}
                {quiz.learningResources && quiz.learningResources.length > 0 && (
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-md bg-violet-500/15 flex items-center justify-center shrink-0">
                          <BookOpen className="h-3 w-3 text-violet-600" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Materi Belajar Sebelum Mulai</h3>
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          +25 XP per materi
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed -mt-1">
                      Soal-soal dalam ujian ini berbasis materi dari sumber-sumber berikut. Buka materi untuk belajar dan dapatkan tambahan XP persiapan.
                    </p>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {quiz.learningResources.map((res, i) => {
                        const typeConfig: Record<string, { color: string; label: string }> = {
                          docs:   { color: "bg-blue-500/10 text-blue-600 border-blue-500/20",   label: "Docs" },
                          course: { color: "bg-violet-500/10 text-violet-600 border-violet-500/20", label: "Course" },
                          video:  { color: "bg-rose-500/10 text-rose-600 border-rose-500/20",   label: "Video" },
                          guide:  { color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", label: "Guide" },
                        };
                        const tc = typeConfig[res.type] ?? typeConfig.docs;
                        const isLearned = learnedResources.includes(`${quiz.id}:${res.url}`);

                        return (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleResourceClick(res.url, res.title)}
                            className={`group flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                              isLearned
                                ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/60"
                                : "border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5"
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                                  {res.title}
                                </p>
                                {isLearned && (
                                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 shrink-0">
                                    <Check className="h-3 w-3" />
                                    +25 XP
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{res.source}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tc.color}`}>
                                {tc.label}
                              </span>
                              <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA Action */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60">
                  <Link
                    href="/freelancer/skills"
                    className="w-full sm:w-auto text-center rounded-xl border border-border bg-card px-5 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                  >
                    Kembali ke Direktori
                  </Link>
                  <button
                    type="button"
                    onClick={handleStartQuiz}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:scale-102 active:scale-98"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Mulai Ujian Sekarang</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 2: ACTIVE QUIZ RUNNER                                               */}
        {/* ========================================================================= */}
        {phase === "taking" && (
          <div className="space-y-6">
            {/* Top Stepper & Progress Tracker */}
            <div className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground">
                    Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {answeredCount} Terjawab
                  </span>
                </div>

                <span className="text-xs font-bold text-primary">{progressPercent}%</span>
              </div>

              {/* Smooth Progress Bar */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-600 transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Question Number Tabs Stepper */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {quiz.questions.map((_, qIdx) => {
                  const isAnswered = userAnswers[qIdx] !== -1;
                  const isCurrent = qIdx === currentQuestionIndex;

                  return (
                    <button
                      key={qIdx}
                      type="button"
                      onClick={() => setCurrentQuestionIndex(qIdx)}
                      className={`h-9 w-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-105"
                          : isAnswered
                          ? "bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25"
                          : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-md space-y-6">
              {/* Question Title */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Soal #{currentQuestionIndex + 1}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                  {currentQ.question}
                </h3>
              </div>

              {/* Code Snippet Box (if any) */}
              {currentQ.codeSnippet && (
                <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 sm:p-5 font-mono text-xs sm:text-sm text-slate-100 overflow-x-auto shadow-inner group">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider">Snippet Kode</span>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(currentQ.codeSnippet || "")}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-800/80 hover:bg-slate-700 px-2 py-1 text-[10px] text-slate-200 transition-colors"
                    >
                      {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedCode ? "Disalin!" : "Salin"}</span>
                    </button>
                  </div>
                  <pre className="leading-relaxed whitespace-pre-wrap">{currentQ.codeSnippet}</pre>
                </div>
              )}

              {/* Multiple Choice Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                  const letter = String.fromCharCode(65 + optIdx);

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full flex items-start gap-4 rounded-2xl p-4 sm:p-5 text-left text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        isSelected
                          ? "border-2 border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10 ring-2 ring-primary/20"
                          : "border border-border/80 bg-card hover:bg-muted/60 hover:border-border text-foreground/90"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 pt-0.5 leading-relaxed">{optionText}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Bar */}
              <div className="flex items-center justify-between gap-3 pt-6 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 sm:px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Sebelumnya</span>
                </button>

                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary-600 transition-all hover:scale-102"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishQuiz}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 sm:px-7 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all hover:scale-102 active:scale-98"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Selesaikan & Kumpulkan Tes</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PHASE 3: RESULTS & COMPREHENSIVE BREAKDOWN                                */}
        {/* ========================================================================= */}
        {phase === "result" && result && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            {/* Celebration / Score Hero */}
            <div
              className={`rounded-3xl border p-6 sm:p-10 shadow-xl text-center space-y-5 relative overflow-hidden ${
                result.passed
                  ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-card to-card"
                  : "border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-card to-card"
              }`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-card shadow-lg border border-border/80">
                {result.passed ? (
                  <Trophy className="h-10 w-10 text-emerald-500 animate-bounce" />
                ) : (
                  <Sparkles className="h-10 w-10 text-amber-500" />
                )}
              </div>

              <div className="space-y-1 max-w-md mx-auto">
                <span
                  className={`rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider ${
                    result.passed
                      ? "bg-emerald-500/20 text-emerald-600"
                      : "bg-amber-500/20 text-amber-600"
                  }`}
                >
                  {result.passed ? "LULUS UJIAN KOMPETENSI" : "BELUM LULUS STANDAR"}
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading pt-2">
                  {result.passed ? "Selamat! Anda Lulus!" : "Tetap Semangat, Anda Bisa Mengulang!"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {result.passed
                    ? `Anda telah membuktikan kemampuan penguasaan ${quiz.name}. Lencana resmi telah disematkan pada profil publik Anda.`
                    : `Skor minimum kelulusan adalah ${quiz.passingScore}%. Pelajari kembali pembahasan di bawah dan ulangi tes kapan saja.`}
                </p>
              </div>

              {/* Stat Highlights Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
                <div className="rounded-2xl border border-border/60 bg-card/80 p-3.5 text-center">
                  <span className="text-[11px] text-muted-foreground block">Skor Nilai</span>
                  <span className={`text-xl font-extrabold ${result.passed ? "text-emerald-600" : "text-amber-600"}`}>
                    {result.score}%
                  </span>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/80 p-3.5 text-center">
                  <span className="text-[11px] text-muted-foreground block">Jawaban Benar</span>
                  <span className="text-xl font-extrabold text-foreground">
                    {result.correctCount}/{result.totalQuestions}
                  </span>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/80 p-3.5 text-center">
                  <span className="text-[11px] text-muted-foreground block">Reward XP</span>
                  <span className="text-xl font-extrabold text-amber-500">
                    +{result.earnedXp} XP
                  </span>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/80 p-3.5 text-center">
                  <span className="text-[11px] text-muted-foreground block">Lencana</span>
                  <span className="text-xs font-bold text-violet-600 truncate block mt-1">
                    {quiz.badgeName}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleStartQuiz}
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Ulangi Tes Sekarang</span>
                </button>

                <Link
                  href="/freelancer/skills"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-600 transition-all hover:scale-102"
                >
                  <Award className="h-4 w-4" />
                  <span>Kembali ke Direktori Skill</span>
                </Link>
              </div>
            </div>

            {/* Detailed Question Review List */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-heading">
                  Pembahasan Detail & Kunci Jawaban
                </h3>
              </div>

              {quiz.questions.map((q, idx) => {
                const chosenIdx = result.userAnswers[idx];
                const isCorrect = chosenIdx === q.correctIndex;

                return (
                  <div
                    key={q.id}
                    className="rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-foreground text-sm">{q.question}</span>
                      </div>
                      {isCorrect ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-600 font-bold text-xs shrink-0">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Benar</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-rose-600 font-bold text-xs shrink-0">
                          <XCircle className="h-3.5 w-3.5" />
                          <span>Salah</span>
                        </span>
                      )}
                    </div>

                    {q.codeSnippet && (
                      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3.5 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner">
                        <pre className="whitespace-pre-wrap">{q.codeSnippet}</pre>
                      </div>
                    )}

                    <div className="rounded-2xl border border-border/60 bg-muted/30 p-4 space-y-2 text-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-muted-foreground">Jawaban Anda: </span>
                          <span className={`font-bold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
                            {chosenIdx !== -1 ? q.options[chosenIdx] : "(Tidak dijawab)"}
                          </span>
                        </div>
                        {!isCorrect && (
                          <div>
                            <span className="font-semibold text-muted-foreground">Kunci Jawaban: </span>
                            <span className="font-bold text-emerald-600">{q.options[q.correctIndex]}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/40 text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Penjelasan: </strong>
                        {q.explanation}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* EXIT CONFIRMATION MODAL                                                   */}
      {/* ========================================================================= */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Keluar dari Ujian?</h4>
                <p className="text-xs text-muted-foreground">Progres ujian saat ini tidak akan disimpan.</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Jika Anda keluar sekarang, sesi ujian ini akan dibatalkan. Anda dapat mengulanginya kapan saja dari direktori skill.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Lanjutkan Ujian
              </button>
              <button
                type="button"
                onClick={() => router.push("/freelancer/skills")}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
