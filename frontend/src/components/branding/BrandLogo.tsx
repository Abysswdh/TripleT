import Image from "next/image";
import logoWithText from "@/assets/logo_with_text.svg";
import logoWithoutText from "@/assets/logo_wo_text.svg";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "full" | "mark";
  className?: string;
  height?: number;
}

export function BrandLogo({ variant = "full", className, height = 48 }: BrandLogoProps) {
  const isFull = variant === "full";
  const src = isFull ? logoWithText : logoWithoutText;
  
  // Aspect ratios based on existing codebase (approximate)
  const fullRatio = 1650 / 580;
  const markRatio = 1; // Assuming square for mark
  const width = Math.round(height * (isFull ? fullRatio : markRatio));

  return (
    <Image
      src={src}
      alt="Doable! Logo"
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
