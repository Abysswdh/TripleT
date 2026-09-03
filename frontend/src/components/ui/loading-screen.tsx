"use client";

import React from "react";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  text?: string;
  className?: string;
  fullscreen?: boolean;
}

export function LoadingScreen({
  text = "Memuat...",
  className,
  fullscreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 select-none",
        fullscreen ? "fixed inset-0 z-[150] min-h-screen w-screen bg-background/90 backdrop-blur-sm" : "w-full py-16",
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Soft Ambient Glow Behind Logo */}
        <div className="absolute h-24 w-24 rounded-full bg-primary/20 blur-2xl animate-pulse -z-10" />

        {/* SVG Logo with Hardware-Accelerated Color Cycling */}
        <div className="relative p-3">
          <BrandLogo
            variant="mark"
            height={56}
            className="animate-color-cycle drop-shadow-sm transition-all"
          />
        </div>

        {/* Subtle Indeterminate Progress Track */}
        <div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 rounded-full bg-primary animate-indeterminate" />
        </div>

        {/* Status Text */}
        {text && (
          <p className="mt-3 text-xs font-semibold tracking-wide text-muted-foreground animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
