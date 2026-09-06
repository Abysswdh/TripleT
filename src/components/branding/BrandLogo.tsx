import Image from "next/image";
import logoWithText from "@/assets/logo_with_text.svg";
import logoWithoutText from "@/assets/logo_wo_text.svg";
import logoWithBothText from "@/assets/logo_with_both_text.svg";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "full" | "mark" | "tagline" | "both";
  className?: string;
  height?: number;
}

export function BrandLogo({ variant = "full", className, height = 48 }: BrandLogoProps) {
  const isBoth = variant === "both" || variant === "tagline";
  const isFull = variant === "full";
  const src = isBoth ? logoWithBothText : isFull ? logoWithText : logoWithoutText;
  
  // Aspect ratios based on SVG viewBoxes
  const fullRatio = 1650 / 580;
  const bothRatio = 1557 / 557;
  const markRatio = 1; // Square for mark
  const ratio = isBoth ? bothRatio : isFull ? fullRatio : markRatio;
  const width = Math.round(height * ratio);

  return (
    <Image
      src={src}
      alt="Doable! - All About Freelancing"
      height={height}
      width={width}
      style={{
        height: `${height}px`,
        width: "auto",
        maxHeight: `${height}px`,
      }}
      className={cn("object-contain block select-none", className)}
      priority
    />
  );
}
