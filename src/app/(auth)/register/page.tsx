"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign in failed");
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.toLowerCase().includes("failed to fetch")) {
          setError("Gagal terhubung ke Supabase (Failed to fetch). Pastikan Environment Variables sudah ditambahkan di Vercel Dashboard dan proyek sudah di-redeploy.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Pendaftaran gagal.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animate-fade-in mx-auto w-full max-w-md py-6 px-3 sm:px-0 text-center">
        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold font-heading">Periksa Email Kamu</h2>
          <p className="mb-6 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Tautan konfirmasi pendaftaran telah dikirimkan ke <strong>{email}</strong>.
            <br />
            Klik tautan tersebut untuk mengaktifkan akunmu dan menyelesaikan profil.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl bg-primary px-6 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all cursor-pointer"
          >
            Lanjut ke Halaman Masuk
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto w-full max-w-md py-6 px-3 sm:px-0">
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center justify-center">
          <BrandLogo variant="both" height={46} />
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-xl shadow-black/5">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Buat Akun Baru</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mulai posting proyek atau tawarkan keahlianmu
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs sm:text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="mb-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-background text-sm font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>Daftar dengan Google</span>
        </button>

        <div className="relative mb-4 flex items-center justify-center">
          <div className="w-full border-t border-border/60" />
          <span className="absolute bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
            atau daftar dengan email
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-xs sm:text-sm font-medium">
              Nama Lengkap
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="cth. Arya Pratama"
              required
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-xs sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs sm:text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="h-11 w-full rounded-xl border border-input bg-background px-4 text-xs sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs sm:text-sm font-medium">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 karakter"
                required
                minLength={6}
                className="h-11 w-full rounded-xl border border-input bg-background px-4 pr-10 text-xs sm:text-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${password.length >= i * 3
                        ? password.length >= 12
                          ? "bg-emerald-500"
                          : password.length >= 8
                            ? "bg-amber-500"
                            : "bg-red-500"
                        : "bg-muted"
                      }`}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-xs sm:text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary-600 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Daftar Akun Baru"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
          Dengan mendaftar, kamu menyetujui{" "}
          <Link href="/terms" className="text-primary hover:underline">Ketentuan Layanan</Link> dan{" "}
          <Link href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link> Doable!.
        </p>

        <div className="mt-6 text-center text-xs sm:text-sm text-muted-foreground">
          Sudah memiliki akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:text-primary-600"
          >
            Masuk di sini
          </Link>
        </div>
      </div>
    </div>
  );
}
