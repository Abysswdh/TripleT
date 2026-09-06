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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // Browser autoplay policy catch
    });
  }, []);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-4 sm:py-8 px-3 sm:px-0 animate-in fade-in duration-300">
      {/* Brand Logo Header */}
      <div className="mb-5 text-center">
        <BrandLogo variant="both" height={48} />
      </div>

      {/* 16:9 Video Player Box */}
      <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl border border-slate-200/90 dark:border-border/60">
        <video
          ref={videoRef}
          src="/videos/loop_anim.mp4"
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-contain bg-black"
        />

        {/* Audio Toggle Button */}
        <button
          type="button"
          onClick={toggleSound}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 h-9 w-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all active:scale-95 cursor-pointer z-10"
          title={isMuted ? "Aktifkan Suara" : "Bisukan"}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Action: Button Lanjutkan */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm sm:text-base font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
