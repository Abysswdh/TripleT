"use client";

import React from "react";
import { X } from "lucide-react";

export interface ModalCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "corner" | "pill" | "inline";
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable Window / Modal Close Button
 * Default variant is 'corner' (Windows-style flush top-right corner tab with crisp hover effect).
 */
export function ModalCloseButton({
  onClick,
  className = "",
  variant = "corner",
  size = "md",
  "aria-label": ariaLabel = "Tutup",
  ...props
}: ModalCloseButtonProps) {
  const sizeMap = {
    sm: {
      corner: "h-7 w-10 text-xs",
      pill: "h-7 w-7",
      inline: "h-7 w-7",
      icon: "h-3.5 w-3.5",
    },
    md: {
      corner: "h-8 w-12 text-sm",
      pill: "h-8 w-8",
      inline: "h-8 w-8",
      icon: "h-4 w-4",
    },
    lg: {
      corner: "h-9 w-14 text-base",
      pill: "h-9 w-9",
      inline: "h-9 w-9",
      icon: "h-5 w-5",
    },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  const variantStyles = {
    // Windows OS style tab: flush against top-right corner (inherits parent border radius with no gap)
    corner: `absolute right-0 top-0 z-30 flex ${currentSize.corner} items-center justify-center rounded-tr-[inherit] rounded-bl-2xl text-muted-foreground/75 hover:bg-[#E81123] hover:text-white transition-colors cursor-pointer select-none`,
    pill: `flex ${currentSize.pill} items-center justify-center rounded-full bg-muted/80 text-muted-foreground hover:bg-[#E81123] hover:text-white transition-colors cursor-pointer select-none`,
    inline: `flex ${currentSize.inline} items-center justify-center rounded-md text-muted-foreground hover:bg-[#E81123] hover:text-white transition-colors cursor-pointer select-none`,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`${variantStyles[variant] || variantStyles.corner} ${className}`.trim()}
      {...props}
    >
      <X className={`${currentSize.icon} stroke-[2.2]`} />
    </button>
  );
}

export default ModalCloseButton;
