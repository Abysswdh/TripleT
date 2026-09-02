"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Award,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Trophy,
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import {
  type SkillQuizDefinition,
  type QuizAttemptResult,
  saveQuizResult,
} from "@/lib/services/quizzes";

interface QuizModalProps {
  quiz: SkillQuizDefinition | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (result: QuizAttemptResult) => void;
}

type QuizPhase = "intro" | "taking" | "results";

export function QuizModal({ quiz, isOpen, onClose, onCompleted }: QuizModalProps) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<QuizPhase>("intro");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset state whenever quiz opens or changes
  useEffect(() => {
    if (isOpen && quiz) {
      setPhase("intro");
      setCurrentQuestionIndex(0);
      setUserAnswers(new Array(quiz.questions.length).fill(-1));
      setTimeRemaining(quiz.timeLimitSeconds);
      setResult(null);
      setIsSubmitting(false);
    }
  }, [isOpen, quiz]);

  // Countdown timer when taking quiz
  useEffect(() => {
    if (phase === "taking" && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (phase === "taking" && timeRemaining === 0) {
      // Time is up! Auto submit quiz
      handleAutoSubmitOnTimeout();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, timeRemaining]);

  if (!mounted || !isOpen || !quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = userAnswers.filter((a) => a !== -1).length;
  const progressPercent = Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartQuiz = () => {
    setPhase("taking");
    setTimeRemaining(quiz.timeLimitSeconds);
  };

  const handleSelectOption = (optionIndex: number) => {
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = optionIndex;
    setUserAnswers(updated);
  };

  const handleAutoSubmitOnTimeout = () => {
    calculateAndFinishQuiz(userAnswers);
  };

  const calculateAndFinishQuiz = (answers: number[]) => {
    setIsSubmitting(true);
    let correctCount = 0;

    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    const quizResult: QuizAttemptResult = {
      quizId: quiz.id,
      score: scorePercentage,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      earnedXp: passed ? quiz.xpReward : Math.round(quiz.xpReward * 0.25),
      badgeName: passed ? quiz.badgeName : undefined,
      completedAt: new Date().toISOString(),
      userAnswers: answers,
    };

    saveQuizResult(quizResult);
    setResult(quizResult);
    setPhase("results");
    setIsSubmitting(false);

    if (onCompleted) {
      onCompleted(quizResult);
    }
  };

  const handleSubmitQuiz = () => {
    calculateAndFinishQuiz(userAnswers);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(quiz.questions.length).fill(-1));
    setTimeRemaining(quiz.timeLimitSeconds);
    setResult(null);
    setPhase("taking");
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl transition-all duration-300 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        <ModalCloseButton
          onClick={onClose}
          aria-label="Tutup Kuis"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6 pr-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
              {quiz.badgeIcon || <Award className="h-5 w-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wide">
                  {quiz.categoryLabel}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                  <Zap className="h-3 w-3" />
                  +{quiz.xpReward} XP
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground mt-0.5">{quiz.name}</h2>
            </div>
          </div>
        </div>

        {/* Phase 1: Intro / Overview */}
        {phase === "intro" && (
          <div className="space-y-6 overflow-y-auto flex-1 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <BookOpen className="h-4 w-4" />
                <span>Petunjuk & Standar Penilaian</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{quiz.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-center space-y-1">
                <HelpCircle className="h-4 w-4 text-primary mx-auto" />
                <span className="text-[11px] text-muted-foreground block">Jumlah Soal</span>
                <p className="text-sm font-extrabold text-foreground">{quiz.questionsCount} Pertanyaan</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-center space-y-1">
                <Clock className="h-4 w-4 text-amber-500 mx-auto" />
                <span className="text-[11px] text-muted-foreground block">Batas Waktu</span>
                <p className="text-sm font-extrabold text-foreground">{quiz.timeLimitDisplay}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-center space-y-1">
                <Trophy className="h-4 w-4 text-emerald-500 mx-auto" />
                <span className="text-[11px] text-muted-foreground block">Passing Grade</span>
                <p className="text-sm font-extrabold text-foreground">{quiz.passingScore}% (Lulus)</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5 text-center space-y-1">
                <ShieldCheck className="h-4 w-4 text-violet-500 mx-auto" />
                <span className="text-[11px] text-muted-foreground block">Badge Verifikasi</span>
                <p className="text-xs font-bold text-violet-600 truncate">{quiz.badgeName}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Benefit Menyelesaikan Kuis:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>Badge verifikasi resmi disematkan langsung di kartu talent profilmu.</li>
                <li>Meningkatkan Match Score hingga +25% pada pencarian talent oleh Klien.</li>
                <li>Membuka peluang prioritas untuk diundang ke proyek berskala Standard & Enterprise.</li>
              </ul>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-border/60">
              <button
                onClick={onClose}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Nanti Saja
              </button>
              <button
                onClick={handleStartQuiz}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 hover:scale-102 transition-all"
              >
                <span>Mulai Kuis Sekarang</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Live Question Runner */}
        {phase === "taking" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Progress & Timer Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">
                  Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
                </span>
                <div
                  className={`inline-flex items-center gap-1.5 font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    timeRemaining <= 60
                      ? "bg-rose-500/10 text-rose-600 border-rose-500/30 animate-pulse"
                      : "bg-muted text-foreground border-border/60"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTimer(timeRemaining)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Question Selector Pills */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                {quiz.questions.map((_, idx) => {
                  const isAnswered = userAnswers[idx] !== -1;
                  const isCurrent = currentQuestionIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold shrink-0 transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                          : isAnswered
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Question Card */}
            <div className="rounded-3xl border border-border/80 bg-muted/20 p-5 sm:p-6 space-y-4">
              <h3 className="text-sm sm:text-base font-bold text-foreground leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Optional Code Snippet */}
              {currentQuestion.codeSnippet && (
                <div className="rounded-2xl border border-border/60 bg-slate-950 p-4 font-mono text-xs text-slate-100 overflow-x-auto shadow-inner">
                  <pre>{currentQuestion.codeSnippet}</pre>
                </div>
              )}

              {/* Multiple Choice Options */}
              <div className="space-y-2.5 pt-2">
                {currentQuestion.options.map((opt, optIdx) => {
                  const isSelected = userAnswers[currentQuestionIndex] === optIdx;
                  const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full flex items-start gap-3.5 rounded-2xl p-4 text-left text-xs sm:text-sm font-medium transition-all ${
                        isSelected
                          ? "border-2 border-primary bg-primary/10 text-foreground shadow-sm shadow-primary/10"
                          : "border border-border/70 bg-card hover:bg-muted/60 text-foreground hover:border-border"
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {optionLetter}
                      </div>
                      <span className="leading-relaxed pt-0.5">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation & Submit Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/60">
              <button
                disabled={currentQuestionIndex === 0}
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                {currentQuestionIndex < quiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
                  >
                    <span>Selanjutnya</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    disabled={isSubmitting || answeredCount === 0}
                    onClick={handleSubmitQuiz}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:brightness-105 transition-all disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{isSubmitting ? "Menilai..." : "Selesaikan & Kumpulkan"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Results & Comprehensive Review */}
        {phase === "results" && result && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Score Banner */}
            <div
              className={`rounded-3xl border p-6 text-center space-y-3 ${
                result.passed
                  ? "border-emerald-500/30 bg-emerald-500/10 text-foreground"
                  : "border-amber-500/30 bg-amber-500/10 text-foreground"
              }`}
            >
              <div
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
                  result.passed ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" : "bg-amber-500 text-white"
                }`}
              >
                {result.passed ? <Trophy className="h-7 w-7" /> : <RotateCcw className="h-7 w-7" />}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-extrabold">
                  {result.passed ? "Selamat, Anda Lulus & Terverifikasi!" : "Hampir Berhasil! Coba Lagi"}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                  {result.passed
                    ? `Anda menjawab ${result.correctCount} dari ${result.totalQuestions} soal dengan benar dan memperoleh badge "${result.badgeName}".`
                    : `Skor Anda ${result.score}% (Passing grade: ${quiz.passingScore}%). Anda dapat mengulang kuis kapan saja.`}
                </p>
              </div>

              <div className="inline-flex items-center gap-4 rounded-2xl bg-card border border-border/80 px-5 py-2.5 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Skor Akhir</span>
                  <span className={`text-base font-extrabold ${result.passed ? "text-emerald-600" : "text-amber-600"}`}>
                    {result.score}%
                  </span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">XP Diperoleh</span>
                  <span className="text-base font-extrabold text-amber-500">+{result.earnedXp} XP</span>
                </div>
                <div className="h-6 w-px bg-border" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">Status Badge</span>
                  <span className="text-xs font-bold text-foreground">
                    {result.passed ? "Unlocked 🎉" : "Locked 🔒"}
                  </span>
                </div>
              </div>
            </div>

            {/* Answer Breakdown & Explanations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Pembahasan & Kunci Jawaban
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {quiz.questions.map((q, idx) => {
                  const chosen = result.userAnswers[idx];
                  const isCorrect = chosen === q.correctIndex;

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-4 text-xs space-y-2 ${
                        isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-foreground">
                          {idx + 1}. {q.question}
                        </span>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px] shrink-0">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Benar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px] shrink-0">
                            <XCircle className="h-3.5 w-3.5" /> Salah
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <p>
                          <span className="font-semibold text-foreground">Jawaban Anda:</span>{" "}
                          {chosen !== -1 ? q.options[chosen] : "(Tidak dijawab)"}
                        </p>
                        {!isCorrect && (
                          <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                            <span>Jawaban Benar:</span> {q.options[q.correctIndex]}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/40 text-[11px] text-muted-foreground leading-relaxed bg-card/60 p-2 rounded-xl">
                        <span className="font-bold text-foreground">Penjelasan:</span> {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-between border-t border-border/60">
              <button
                onClick={handleRetakeQuiz}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Ulangi Kuis</span>
              </button>

              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                <span>Selesai & Tutup</span>
                <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
