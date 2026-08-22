import { Award, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface SkillQuiz {
  id: string;
  name: string;
  category: string;
  questionsCount: number;
  timeLimit: string;
  xpReward: number;
  status: "Completed" | "Available" | "Locked";
  score?: number;
  badgeName?: string;
}

const QUIZZES: SkillQuiz[] = [
  {
    id: "q-nextjs",
    name: "Next.js 14 App Router & Server Actions",
    category: "Frontend",
    questionsCount: 15,
    timeLimit: "20 Menit",
    xpReward: 350,
    status: "Completed",
    score: 95,
    badgeName: "Next.js Verified Pro",
  },
  {
    id: "q-fastapi",
    name: "Python FastAPI & Async Architecture",
    category: "Backend",
    questionsCount: 20,
    timeLimit: "25 Menit",
    xpReward: 400,
    status: "Completed",
    score: 90,
    badgeName: "FastAPI Certified",
  },
  {
    id: "q-figma",
    name: "Figma Advanced Auto-layout & Design Tokens",
    category: "UI/UX",
    questionsCount: 12,
    timeLimit: "15 Menit",
    xpReward: 300,
    status: "Available",
  },
  {
    id: "q-threejs",
    name: "Three.js & WebGL Interactive Shaders",
    category: "Frontend 3D",
    questionsCount: 15,
    timeLimit: "20 Menit",
    xpReward: 500,
    status: "Available",
  },
];

export default function FreelancerSkillsPage() {
  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>Skill Verification</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Skill Quizzes & Badges
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Selesaikan kuis teknis untuk mendapatkan badge verifikasi dan meningkatkan Match Score di profilmu.
          </p>
        </div>

        <Link
          href="/freelancer/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          <span>← Kembali ke Overview</span>
        </Link>
      </div>

      {/* Quizzes Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {QUIZZES.map((quiz) => (
          <div
            key={quiz.id}
            className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:border-primary/40 transition-all space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {quiz.category}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Zap className="h-3.5 w-3.5" />
                  +{quiz.xpReward} XP
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{quiz.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {quiz.questionsCount} Pertanyaan • Batas Waktu: {quiz.timeLimit}
              </p>
            </div>

            <div className="pt-3 border-t border-border/40 flex items-center justify-between">
              {quiz.status === "Completed" ? (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-foreground">{quiz.badgeName}</span>
                    <p className="text-[11px] text-emerald-600 font-medium">Skor: {quiz.score}% (Lulus)</p>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Belum diambil</span>
              )}

              {quiz.status === "Completed" ? (
                <button className="rounded-xl border border-border bg-muted/40 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted">
                  Ulangi Kuis
                </button>
              ) : (
                <button className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors">
                  <span>Mulai Kuis</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
