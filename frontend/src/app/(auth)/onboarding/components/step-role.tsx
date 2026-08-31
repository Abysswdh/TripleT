"use client";

import { RoleType } from "@/hooks/use-onboarding";
import { Code2, Briefcase, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";

interface StepRoleProps {
  selectedRole: RoleType;
  onSelectRole: (role: RoleType) => void;
  onNext: () => void;
}

export function StepRole({ selectedRole, onSelectRole, onNext }: StepRoleProps) {
  return (
    <div className="flex h-full flex-col justify-between">
      {/* Scaled-Up Role Cards Grid (No redundant h2/p) */}
      <div className="my-auto grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* Freelancer Card */}
        <div
          onClick={() => onSelectRole("freelancer")}
          className={`group relative flex flex-col justify-between cursor-pointer rounded-3xl border p-6 sm:p-7 transition-all duration-300 hover:shadow-lg ${
            selectedRole === "freelancer"
              ? "border-primary bg-primary/[0.05] shadow-lg shadow-primary/15 ring-2 ring-primary"
              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          {selectedRole === "freelancer" && (
            <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
          )}

          <div>
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                selectedRole === "freelancer"
                  ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Code2 className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg sm:text-xl font-bold text-foreground">
              Freelancer / Talent
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Kerjakan proyek, verifikasi skill lewat quiz & courses, dan bangun reputasi terpercaya.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Work, Learn & Level Up</span>
          </div>
        </div>

        {/* Client / Customer Card */}
        <div
          onClick={() => onSelectRole("customer")}
          className={`group relative flex flex-col justify-between cursor-pointer rounded-3xl border p-6 sm:p-7 transition-all duration-300 hover:shadow-lg ${
            selectedRole === "customer"
              ? "border-primary bg-primary/[0.05] shadow-lg shadow-primary/15 ring-2 ring-primary"
              : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          {selectedRole === "customer" && (
            <div className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm">
              <CheckCircle2 className="h-4.5 w-4.5 stroke-[2.5]" />
            </div>
          )}

          <div>
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
                selectedRole === "customer"
                  ? "bg-primary text-white shadow-xl shadow-primary/30 scale-105"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Briefcase className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg sm:text-xl font-bold text-foreground">
              Client / Project Owner
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pasang kebutuhan proyek, rekrut freelancer terverifikasi, dan pantau hasil secara aman.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-border/40 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-4 w-4" />
            <span>Hire Verified Talent</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-end pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
