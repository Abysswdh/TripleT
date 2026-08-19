"use client";

import Link from "next/link";
import { Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { StepIndicator } from "./components/step-indicator";
import { StepRole } from "./components/step-role";
import { StepDetails } from "./components/step-details";
import { StepProfile } from "./components/step-profile";
import { StepWelcome } from "./components/step-welcome";

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    step,
    nextStep,
    prevStep,
    data,
    updateData,
    toggleSkill,
    toggleCategory,
    submitOnboarding,
    finishAndGoToDashboard,
    loading: submitLoading,
    error,
  } = useOnboarding();

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If visitor is not authenticated yet, let them know or redirect to register
  if (!user && step !== 4) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Doable<span className="text-primary">!</span>
            </span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-xl shadow-black/5 max-w-md mx-auto">
          <h2 className="text-xl font-bold">Please Sign In First</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You need an account to personalize and save your Doable! profile.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
            >
              Create Account
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted/40 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in w-full max-w-3xl mx-auto py-8">
      {/* Top Logo */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Doable<span className="text-primary">!</span>
          </span>
        </Link>
      </div>

      {/* Progress Indicator */}
      <StepIndicator currentStep={step} />

      {/* Wizard Card Container */}
      <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
        {step === 1 && (
          <StepRole
            selectedRole={data.role}
            onSelectRole={(role) => updateData({ role })}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <StepDetails
            data={data}
            onUpdate={updateData}
            onToggleSkill={toggleSkill}
            onToggleCategory={toggleCategory}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {step === 3 && (
          <StepProfile
            data={data}
            onUpdate={updateData}
            onSubmit={submitOnboarding}
            onPrev={prevStep}
            loading={submitLoading}
            error={error}
          />
        )}

        {step === 4 && (
          <StepWelcome data={data} onFinish={finishAndGoToDashboard} />
        )}
      </div>
    </div>
  );
}
