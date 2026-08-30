"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardRole } from "@/context/role-context";
import { Loader2, Briefcase, Building2, ArrowRight, ShieldCheck, Zap, Star } from "lucide-react";

const STORAGE_KEY = "triplet_active_dashboard_role";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { isClient, setRole } = useDashboardRole();
  const [showRoleSelect, setShowRoleSelect] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined"
      ? localStorage.getItem(STORAGE_KEY)
      : null;

    if (saved === "customer" || saved === "freelancer") {
      // Already has a role — redirect
      router.replace(saved === "customer" ? "/client/dashboard" : "/freelancer/dashboard");
    } else {
      // First time — show role selection screen
      setShowRoleSelect(true);
    }
  }, [router, isClient]);

  const handleSelectClient = () => {
    setRole("customer");
    router.push("/client/dashboard");
  };

  const handleSelectFreelancer = () => {
    setRole("freelancer");
    router.push("/freelancer/dashboard");
  };

  if (!showRoleSelect) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">Mengarahkan ke dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Selamat Datang di Doable!</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Kamu ingin mulai sebagai apa?
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Pilih mode yang sesuai kebutuhanmu sekarang. Kamu bisa beralih kapan saja lewat pengaturan profil.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Freelancer Card */}
          <button
            onClick={handleSelectFreelancer}
            className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card p-6 sm:p-8 text-left hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200 shadow-sm hover:shadow-lg"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-violet-500/10 text-violet-600 flex items-center justify-center">
                <Briefcase className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-foreground">Saya Freelancer</h2>
                  <span className="rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-bold px-2 py-0.5">
                    Pelajar & Talenta
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Temukan proyek, kembangkan skill, bangun portofolio terverifikasi, dan dapatkan penghasilan nyata.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  { icon: <Zap className="h-3.5 w-3.5 text-amber-500" />, text: "Earn XP & unlock skill badges" },
                  { icon: <Star className="h-3.5 w-3.5 text-violet-500" />, text: "Portfolio quest terverifikasi" },
                  { icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />, text: "Pembayaran escrow terjamin" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    {icon}<span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-xs font-bold text-violet-600 group-hover:gap-3 transition-all">
                <span>Mulai sebagai Freelancer</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </button>

          {/* Client Card */}
          <button
            onClick={handleSelectClient}
            className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card p-6 sm:p-8 text-left hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 shadow-sm hover:shadow-lg"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-6 w-6" />
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-foreground">Saya Klien</h2>
                  <span className="rounded-full bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5">
                    UMKM & Perusahaan
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Posting proyek, temukan talenta digital terverifikasi, dan kelola pengerjaan dengan aman lewat escrow.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-muted-foreground">
                {[
                  { icon: <Star className="h-3.5 w-3.5 text-primary" />, text: "Talenta terverifikasi & berpengalaman" },
                  { icon: <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />, text: "Dana aman di escrow hingga selesai" },
                  { icon: <Zap className="h-3.5 w-3.5 text-amber-500" />, text: "Blueprint AI & template instan" },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    {icon}<span>{text}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all">
                <span>Mulai sebagai Klien</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Satu akun bisa beralih antara mode Freelancer dan Klien kapan saja.
        </p>
      </div>
    </div>
  );
}
