"use client";

import React from "react";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#1e293b_40%,#4f46e5_50%,#1e293b_60%)] dark:bg-[linear-gradient(110deg,#94a3b8_40%,#ffffff_50%,#94a3b8_60%)] bg-[length:200%_100%] ${
        disabled ? "" : "animate-shiny-text"
      } ${className}`}
      style={{
        animationDuration,
      }}
    >
      {text}
    </span>
  );
}
