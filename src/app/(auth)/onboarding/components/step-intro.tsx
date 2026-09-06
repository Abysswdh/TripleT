"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Volume2, VolumeX } from "lucide-react";
import { BrandLogo } from "@/components/branding/BrandLogo";

interface StepIntroProps {
  onStart: () => void;
}

export function StepIntro({ onStart }: StepIntroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Autoplay with muted is usually allowed, catch any strict browser rejection
    });

    const handleTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      onStart();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onStart]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px] sm:min-h-[580px] flex flex-col items-center justify-between rounded-none sm:rounded-3xl overflow-hidden bg-black text-white p-6 sm:p-10 select-none animate-in fade-in duration-300">
      {/* Background Video */}
      <video
        ref={videoRef}
        src="/videos/loop_anim.mp4"
        autoPlay
        muted={isMuted}
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Cinematic Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/60 pointer-events-none" />

      {/* Top Header: Brand Logo & Sound Toggle & Skip Button */}
      <div className="relative z-10 w-full flex items-center justify-between">
        <div className="bg-white/95 backdrop-blur-md rounded-xl px-3 py-1.5 inline-flex items-center shadow-md">
          <BrandLogo variant="both" height={28} />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer"
            title={isMuted ? "Aktifkan Suara" : "Bisukan"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onStart}
            className="px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer active:scale-95"
          >
            Lewati
          </button>
        </div>
      </div>

      {/* Center Hero Copy */}
      <div className="relative z-10 w-full max-w-xl text-center space-y-4 my-auto pt-24 sm:pt-32">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-heading text-white drop-shadow-md">
            Selamat Datang di <span className="bg-gradient-to-r from-blue-300 via-white to-indigo-200 bg-clip-text text-transparent">Doable!</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-light max-w-md mx-auto drop-shadow-xs">
            Satu ekosistem kerja lepas modern untuk talenta muda terverifikasi dan pelaku usaha bertumbuh bersama.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStart}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-primary to-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl shadow-primary/30 border border-white/20 hover:brightness-110 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>Mulai Siapkan Profil</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="relative z-10 w-full max-w-md space-y-1.5 pt-4">
        <div className="h-1 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-[10px] text-white/70 text-center">
          Otomatis beralih ke langkah berikutnya saat animasi selesai
        </p>
      </div>
    </div>
  );
}
