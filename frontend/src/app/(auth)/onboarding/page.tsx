"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { StepRole } from "./components/step-role";
import { StepDetails } from "./components/step-details";
import { StepProfile } from "./components/step-profile";
import { StepWelcome } from "./components/step-welcome";

// Dynamically import Silk with SSR disabled so WebGL canvas initializes cleanly on client
const Silk = dynamic(() => import("@/components/ui/silk"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-[#120B54] via-[#1E1794] to-[#2C1BDE] animate-pulse" />
  ),
});

const STEP_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Pilih Role",
    desc: "Tentukan peran utamamu untuk mempersonalisasi pengalaman di Doable!.",
  },
  2: {
    title: "Detail & Skill",
    desc: "Pilih keahlian atau jenis proyek yang ingin kamu kerjakan atau buat.",
  },
  3: {
    title: "Lengkapi Profil",
    desc: "Pilih avatar badge dan tulis bio singkat agar akunmu menonjol.",
  },
  4: {
    title: "Selamat Datang!",
    desc: "Profilmu telah siap! Mulai jelajahi quest dan proyek sekarang.",
  },
};

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

  // If visitor is not authenticated yet, guide them to login/register
  if (!user && step !== 4) {
    return (
      <div className="animate-fade-in text-center max-w-md mx-auto p-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl font-heading font-extrabold tracking-tight text-foreground">
              Doable<span className="text-primary">!</span>
            </span>
          </Link>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl shadow-slate-200/50">
          <h2 className="text-xl font-bold text-slate-900">Masuk Terlebih Dahulu</h2>
          <p className="mt-2 text-sm text-slate-500">
            Kamu perlu masuk atau membuat akun untuk menyimpan profil Doable!.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
            >
              Daftar Akun Baru
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentInfo = STEP_INFO[step] || STEP_INFO[1];

  return (
    <div className="w-full max-w-[1040px] mx-auto min-h-screen sm:min-h-0">
      {/* Split-Card: Fullscreen on mobile, centered fixed larger modal on desktop */}
      <div className="overflow-hidden min-h-screen sm:min-h-0 sm:rounded-3xl border-0 sm:border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40 flex flex-col lg:flex-row h-auto lg:h-[660px]">
        {/* Left Side: React Bits Silk Canvas Banner */}
        <div className="relative w-full lg:w-[390px] lg:min-w-[390px] h-[150px] sm:h-[190px] lg:h-full overflow-hidden bg-[#0C0838] flex flex-col justify-between p-6 sm:p-8 lg:p-9 text-white select-none shrink-0">
          {/* Animated WebGL Silk Background */}
          <div className="absolute inset-0 z-0">
            <Silk
              color="#2D1FE0"
              speed={4}
              scale={1.2}
              noiseIntensity={1.7}
              rotation={0.35}
              className="w-full h-full"
            />
          </div>

          {/* Vignette overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Top Clean Branding */}
          <div className="relative z-20 flex items-center">
            <Link href="/" className="text-xl font-heading font-extrabold tracking-tight text-white hover:opacity-90 transition-opacity">
              Doable<span className="text-blue-300">!</span>
            </Link>
          </div>

          {/* Dynamic Step Title (Updates seamlessly with each step) */}
          <div className="relative z-20 my-auto py-1">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
              {currentInfo.title}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed font-light hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>

          {/* Sole Bottom Step Progress Indicator */}
          <div className="relative z-20 flex items-center justify-between text-xs text-white/85 pt-3 border-t border-white/15">
            <span className="font-medium">Langkah {step} dari 4</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ease-out ${
                    i === step
                      ? "w-7 bg-white shadow-sm shadow-white/50"
                      : i < step
                      ? "w-2.5 bg-blue-300"
                      : "w-2 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Step Wizard Content */}
        <div className="relative flex-1 bg-white p-6 sm:p-8 lg:p-10 h-full flex flex-col justify-between overflow-y-auto">
          {/* Animated Step Container */}
          <div
            key={step}
            className="h-full flex flex-col justify-between animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out"
          >
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
      </div>
    </div>
  );
}
