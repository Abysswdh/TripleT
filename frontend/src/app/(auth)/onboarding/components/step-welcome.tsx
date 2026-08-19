"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import { Sparkles, Trophy, Rocket, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StepWelcomeProps {
  data: OnboardingData;
  onFinish: () => void;
}

export function StepWelcome({ data, onFinish }: StepWelcomeProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isFreelancer = data.role === "freelancer";

  return (
    <div className="text-center space-y-6 animate-fade-in py-2">
      {/* Celebration Icon */}
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full bg-primary/20 transition-transform duration-700 ${
            animate ? "scale-125 opacity-100 animate-pulse" : "scale-50 opacity-0"
          }`}
        />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 shadow-xl shadow-primary/30">
          <Trophy className="h-10 w-10 text-white" />
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 mb-3">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Profile Completed</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Welcome to <span className="text-primary">Doable!</span>
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {isFreelancer
            ? "Your journey to learn, verify skills, and earn starts now."
            : "Your client dashboard is ready to post projects and hire talent."}
        </p>
      </div>

      {/* Gamified Reward Card */}
      <div className="mx-auto max-w-sm rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 via-primary/5 to-card p-5 shadow-lg shadow-primary/5">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quest Reward Unlocked
            </span>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600">
            Level 1
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm font-bold">Starter Bonus XP</p>
            <p className="text-xs text-muted-foreground">Onboarding Quest</p>
          </div>
          <div className="flex items-center gap-1 text-lg font-extrabold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>+50 XP</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onFinish}
          className="inline-flex h-12 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Rocket className="h-4 w-4" />
          <span>Enter My Dashboard</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
