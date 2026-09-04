"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2, Sparkles } from "lucide-react";
import logoWithText from "@/assets/logo_with_text.svg";
import logoWithoutText from "@/assets/logo_wo_text.svg";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { StepIdentity } from "./components/step-identity";
import { StepBackground } from "./components/step-background";
import { StepSkills } from "./components/step-skills";
import { StepRatesBio } from "./components/step-rates-bio";
import { StepWelcome } from "./components/step-welcome";

// Dynamically import Silk with SSR disabled so WebGL canvas initializes cleanly on client
const Silk = dynamic(() => import("@/components/ui/silk"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-[#120B54] via-[#1E1794] to-[#2C1BDE] animate-pulse" />
  ),
});

const CLIENT_STEP_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Identitas Bisnis & Narahubung",
    desc: "Tuliskan nama penanggung jawab atau PIC dan tentukan domisili operasional bisnismu.",
  },
  2: {
    title: "Profil & Skala Usaha",
    desc: "Tentukan tipe usaha bisnismu (UMKM, Startup, Agensi) dan nama brand usahamu.",
  },
  3: {
    title: "Kebutuhan Proyek",
    desc: "Pilih kategori layanan yang paling sering dibutuhkan oleh usahamu di platform Doable!.",
  },
  4: {
    title: "Preferensi Anggaran & Bio",
    desc: "Tentukan estimasi anggaran per proyek dan deskripsikan profil singkat bisnismu.",
  },
  5: {
    title: "Selamat Datang, Klien!",
    desc: "Profil bisnismu telah siap! Mulai posting proyek dan rekrut talenta muda terbaik.",
  },
};

const FREELANCER_STEP_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Identitas & Spesialisasi",
    desc: "Tuliskan nama profil profesional, spesialisasi keahlian, dan domisili aktivitas freelancemu.",
  },
  2: {
    title: "Latar Belakang & Pengalaman",
    desc: "Tentukan status edukasi atau karirmu serta tingkat pengalaman komersial yang kamu miliki.",
  },
  3: {
    title: "Keahlian & Skill Utama",
    desc: "Pilih keahlian teknis dan keterampilan unggulan yang kamu kuasai untuk ditawarkan ke klien.",
  },
  4: {
    title: "Kapasitas Waktu & Bio",
    desc: "Tentukan jam kerja per minggu, ekspektasi rate, dan tuliskan bio singkat yang memikat calon klien.",
  },
  5: {
    title: "Selamat Datang, Talenta!",
    desc: "Profil freelancermu telah aktif! Siap mengerjakan quest proyek, kuis keahlian, dan raih cuan.",
  },
};

function OnboardingContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    step,
    setStep,
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
    isRoleSwitchMode,
    roleParam,
  } = useOnboarding();

  const isDev = process.env.NODE_ENV === "development";

  // If user is already authenticated and has already completed onboarding for the requested role, direct them straight to dashboard
  useEffect(() => {
    if (!user || step === 5) return;
    const targetRole = roleParam === "freelancer" ? "freelancer" : "customer";
    const storedFl = typeof window !== "undefined" && localStorage.getItem("triplet_freelancer_onboarded") === "true";
    const storedCl = typeof window !== "undefined" && localStorage.getItem("triplet_client_onboarded") === "true";

    const isFlOnboarded = Boolean(
      user.user_metadata?.freelancer_onboarded ||
      storedFl ||
      (user.user_metadata?.onboarding_completed && user.user_metadata?.role === "freelancer")
    );
    const isClOnboarded = Boolean(
      user.user_metadata?.client_onboarded ||
      storedCl ||
      (user.user_metadata?.onboarding_completed && (user.user_metadata?.role === "customer" || user.user_metadata?.role === "client"))
    );

    const isAlreadyOnboarded = targetRole === "freelancer" ? isFlOnboarded : isClOnboarded;
    if (isAlreadyOnboarded) {
      if (typeof window !== "undefined") {
        localStorage.setItem("triplet_active_dashboard_role", targetRole);
        document.cookie = `triplet_active_dashboard_role=${targetRole}; path=/; max-age=31536000; SameSite=Lax`;
      }
      router.replace(targetRole === "freelancer" ? "/freelancer/dashboard" : "/client/dashboard");
    }
  }, [user, roleParam, step, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If visitor is not authenticated yet, guide them to login/register (bypassed in dev mode for UI design)
  if (!user && step !== 6 && !isDev) {
    return (
      <div className="animate-fade-in text-center max-w-md mx-auto p-4">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center justify-center">
            <Image
              src={logoWithText}
              alt="Doable! Logo"
              height={54}
              width={Math.round(54 * (1650 / 580))}
              style={{ height: "54px", width: "auto" }}
              className="object-contain block select-none"
              priority
            />
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

  const isFreelancer = data.role === "freelancer";
  const currentInfo = isFreelancer
    ? FREELANCER_STEP_INFO[step] || FREELANCER_STEP_INFO[1]
    : CLIENT_STEP_INFO[step] || CLIENT_STEP_INFO[1];

  return (
    <div className="w-full max-w-[1040px] mx-auto h-full max-h-[100dvh] sm:max-h-[640px] flex flex-col justify-center overflow-hidden py-0 sm:py-2">
      {/* Dev Mode Fast Step-Switcher Toolbar (Only shown when not logged in with an actual user) */}
      {isDev && !user && (
        <div className="mb-2 mx-2 sm:mx-0 flex flex-wrap items-center justify-between gap-1.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in duration-200 shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px]">Dev Preview</span>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num)}
                className={`h-5 px-1.5 rounded-md text-[11px] font-bold transition-all ${
                  step === num
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white/80 dark:bg-card border border-border/80 text-foreground hover:bg-amber-500/20"
                }`}
              >
                Step {num}
              </button>
            ))}

            <button
              type="button"
              onClick={() =>
                updateData({
                  role: data.role === "freelancer" ? "customer" : "freelancer",
                })
              }
              className="ml-1 h-5 px-2 rounded-md bg-primary text-white text-[11px] font-bold hover:bg-primary-600 transition-all shadow-xs"
            >
              Role: {data.role === "freelancer" ? "Freelancer" : "Client"}
            </button>
          </div>
        </div>
      )}

      {/* Split-Card: Clean unscrollable container */}
      <div className="overflow-hidden h-full max-h-[100dvh] sm:max-h-[580px] sm:h-[580px] rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/90 bg-white shadow-2xl shadow-slate-300/40 flex flex-col lg:flex-row">
        {/* Left Side: React Bits Silk Canvas Banner */}
        <div className="relative w-full lg:w-[360px] lg:min-w-[360px] h-[130px] sm:h-[150px] lg:h-full overflow-hidden bg-[#0C0838] flex flex-col justify-between p-5 sm:p-6 lg:p-7 text-white select-none shrink-0">
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
          <div className="relative z-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <Image
                src={logoWithoutText}
                alt="Doable! Logo"
                height={26}
                width={26}
                className="h-6.5 w-6.5 object-contain brightness-0 invert"
              />
              <span className="text-lg font-heading font-extrabold tracking-tight text-white">
                Doable!
              </span>
            </Link>

            <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-white/90 border border-white/15 flex items-center gap-1.5 shadow-xs select-none">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>{isFreelancer ? "Onboarding Freelancer" : "Onboarding Klien"}</span>
            </span>
          </div>

          {/* Dynamic Step Title (Updates seamlessly with each step) */}
          <div className="relative z-20 my-auto py-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-extrabold tracking-tight text-white drop-shadow-md">
              {currentInfo.title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm text-white/80 leading-relaxed font-light hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>

          {/* Sole Bottom Step Progress Indicator */}
          <div className="relative z-20 flex items-center justify-between text-xs text-white/85 pt-2.5 border-t border-white/15">
            <span className="font-medium text-[11px]">
              {`Langkah ${step} dari 5`}
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                    i === step
                      ? "w-6 bg-white shadow-sm shadow-white/50"
                      : i < step
                        ? "w-2 bg-blue-300"
                        : "w-1.5 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Clean Unscrollable Interactive Step Wizard Content */}
        <div className="relative flex-1 bg-white p-5 sm:p-6 lg:p-8 h-full flex flex-col justify-between overflow-hidden">
          {/* Animated Step Container */}
          <div
            key={step}
            className="h-full flex flex-col justify-between animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out"
          >
            {step === 1 && (
              <StepIdentity
                data={data}
                onUpdate={updateData}
                onNext={nextStep}
                onPrev={isRoleSwitchMode ? () => router.push("/client/dashboard") : () => router.push("/login")}
              />
            )}

            {step === 2 && (
              <StepBackground
                data={data}
                onUpdate={updateData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {step === 3 && (
              <StepSkills
                data={data}
                onUpdate={updateData}
                onToggleSkill={toggleSkill}
                onToggleCategory={toggleCategory}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}

            {step === 4 && (
              <StepRatesBio
                data={data}
                onUpdate={updateData}
                onSubmit={submitOnboarding}
                onPrev={prevStep}
                loading={submitLoading}
                error={error}
              />
            )}

            {step === 5 && (
              <StepWelcome data={data} onFinish={finishAndGoToDashboard} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
