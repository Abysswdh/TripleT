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
    <div className="flex h-full flex-col justify-between space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Pilih role yang kamu inginkan!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih tujuan utamamu di Doable!. Kamu tetap bisa berganti atau menggabungkan peran nanti.
        </p>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Freelancer Card */}
        <div
          onClick={() => onSelectRole("freelancer")}
          className={`group relative flex flex-col justify-between cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:shadow-md ${
            selectedRole === "freelancer"
              ? "border-primary bg-primary/[0.04] shadow-md shadow-primary/10 ring-2 ring-primary"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          {selectedRole === "freelancer" && (
            <div className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}

          <div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                selectedRole === "freelancer"
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Code2 className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-foreground">
              Freelancer / Talent
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Kerjakan proyek, verifikasi skill lewat quiz & courses, dan bangun reputasi terpercaya.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Work, Learn & Level Up</span>
          </div>
        </div>

        {/* Client / Customer Card */}
        <div
          onClick={() => onSelectRole("customer")}
          className={`group relative flex flex-col justify-between cursor-pointer rounded-2xl border p-5 transition-all duration-300 hover:shadow-md ${
            selectedRole === "customer"
              ? "border-primary bg-primary/[0.04] shadow-md shadow-primary/10 ring-2 ring-primary"
              : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
          }`}
        >
          {selectedRole === "customer" && (
            <div className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          )}

          <div>
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                selectedRole === "customer"
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20"
              }`}
            >
              <Briefcase className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-foreground">
              Client / Project Owner
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              Pasang kebutuhan proyek, rekrut freelancer terverifikasi, dan pantau hasil secara aman.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Hire Verified Talent</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
