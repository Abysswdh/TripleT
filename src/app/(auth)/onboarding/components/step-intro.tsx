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
    <div className="overflow-hidden min-h-[100dvh] sm:min-h-0 sm:h-[600px] sm:max-h-[90vh] rounded-none sm:rounded-3xl border-0 sm:border border-slate-200/90 bg-black shadow-2xl shadow-slate-300/40 relative flex flex-col justify-end flex-1 sm:flex-initial select-none animate-in fade-in duration-300">
      {/* 16:9 Video Canvas: object-contain on mobile (no cropping), object-cover on desktop (seamless edge-to-edge card fill) */}
      <div className="absolute inset-0 flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src="/videos/loop_anim.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain sm:object-cover object-center"
        />
      </div>

      {/* Subtle Black Fade HANYA di bagian bawah (area atas & tengah video jernih total) */}
      <div className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />

      {/* Bottom Bar: Halo! di kiri & Lanjutkan di kanan */}
      <div className="relative z-20 p-5 sm:p-7 lg:p-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-6">
        {/* Teks Sapaan Rata Kiri */}
        <div className="text-left space-y-0.5 max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight drop-shadow-md">
            Halo!
          </h2>
          <p className="text-xs sm:text-sm text-slate-200/90 font-light drop-shadow-sm">
            Selamat datang di Doable! Mari perkenalkan diri.
          </p>
        </div>

        {/* Tombol Lanjutkan di bawah dalam video */}
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
