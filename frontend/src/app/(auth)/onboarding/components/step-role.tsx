"use client";

import { RoleType } from "@/hooks/use-onboarding";
import { Code2, Briefcase, Zap, ShieldCheck, Trophy, Sparkles, ArrowRight } from "lucide-react";

interface StepRoleProps {
  selectedRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  onNext: () => void;
}

export function StepRole({ selectedRole, onSelectRole, onNext }: StepRoleProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          How do you plan to use <span className="text-primary">Doable!</span>?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose your primary goal. You can always collaborate on both sides later.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Freelancer Card */}
        <div
          onClick={() => onSelectRole("freelancer")}
          className={`group relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
            selectedRole === "freelancer"
              ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/30"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                selectedRole === "freelancer"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Code2 className="h-6 w-6" />
            </div>
            {selectedRole === "freelancer" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> Selected
              </span>
            )}
          </div>

          <h3 className="mt-4 text-lg font-bold">I want to Work & Learn</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Join as a Freelancer / Builder
          </p>

          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Earn XP & level up through skill quests</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Get your skills verified by real courses</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Match with high-paying client projects</span>
            </li>
          </ul>
        </div>

        {/* Client Card */}
        <div
          onClick={() => onSelectRole("customer")}
          className={`group relative cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${
            selectedRole === "customer"
              ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-2 ring-primary/30"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          <div className="flex items-start justify-between">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                selectedRole === "customer"
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Briefcase className="h-6 w-6" />
            </div>
            {selectedRole === "customer" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> Selected
              </span>
            )}
          </div>

          <h3 className="mt-4 text-lg font-bold">I want to Hire Talent</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Join as a Client / Project Owner
          </p>

          <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Hire talent with verified course badges</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span>Post projects & get AI-matched proposals</span>
            </li>
            <li className="flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-amber-500" />
              <span>Milestone tracking & secure escrow delivery</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
