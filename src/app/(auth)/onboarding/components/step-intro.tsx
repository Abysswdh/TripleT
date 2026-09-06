"use client";

import { useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";

interface StepIntroProps {
  onStart: () => void;
}

export function StepIntro({ onStart }: StepIntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Browser autoplay policy catch
    });
  }, []);

  return (
    <div className="w-full max-w-[960px] mx-auto flex flex-col items-center justify-center py-2 sm:py-6 px-2 sm:px-0 animate-in fade-in duration-300">
      {/* 16:9 Video Box with bottom-only dark fade */}
      <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-200/90 dark:border-border/60 select-none">
        {/* Clean 16:9 Loop Animation Video */}
        <video
          ref={videoRef}
          src="/videos/loop_anim.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />

        {/* Fade hitam HANYA di bagian bawah (area tengah & atas video bersih total) */}
        <div className="absolute inset-x-0 bottom-0 h-36 sm:h-44 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

        {/* Konten di dalam video bagian bawah: Selamat Datang di kiri & Tombol Lanjutkan di kanan */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-6">
          {/* Teks Selamat Datang (Rata Kiri) */}
          <div className="text-left space-y-1 sm:space-y-1.5 max-w-lg">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold font-heading text-white tracking-tight drop-shadow-md">
              Selamat Datang di <span className="text-blue-400">Doable!</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200/90 leading-relaxed font-light drop-shadow-sm line-clamp-2 sm:line-clamp-none">
              Satu ekosistem kerja lepas modern untuk talenta muda terverifikasi dan pelaku usaha bertumbuh bersama.
            </p>
          </div>

          {/* Tombol Lanjutkan di dalam video */}
          <button
            type="button"
            onClick={onStart}
            className="shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
