import React from "react";

interface DoableAntProps {
  className?: string;
  size?: number;
  mood?: "active" | "streak" | "idle";
}

/**
 * Doable Ant (Semut Doable) Vector Mascot / Icon
 * Symbol of diligent work, collaboration, and continuous consistency for freelancers.
 */
export const DoableAnt: React.FC<DoableAntProps> = ({
  className = "",
  size = 28,
  mood = "streak",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Glow / Aura for streak mood */}
      {mood === "streak" && (
        <circle cx="24" cy="24" r="20" fill="currentColor" fillOpacity="0.12" />
      )}

      {/* Ant Antennae */}
      <path
        d="M21 15C19.5 11 16 9 13 10M27 15C28.5 11 32 9 35 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="12.5" cy="10" r="2" fill="currentColor" />
      <circle cx="35.5" cy="10" r="2" fill="currentColor" />

      {/* Ant Legs (6 legs for worker ant) */}
      {/* Top Legs */}
      <path
        d="M16 23C12 21 8 22 6 25M32 23C36 21 40 22 42 25"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Middle Legs */}
      <path
        d="M15 28C10 28 7 32 6 36M33 28C38 28 41 32 42 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Bottom / Back Legs */}
      <path
        d="M17 35C13 38 10 42 9 44M31 35C35 38 38 42 39 44"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Ant Body Parts: 3 segments */}
      {/* 1. Abdomen (Bottom body) */}
      <ellipse cx="24" cy="36" rx="7.5" ry="8.5" fill="currentColor" />
      {/* Abdomen stripe details */}
      <path
        d="M18.5 35C21.5 37 26.5 37 29.5 35M19.5 39C22 41 26 41 28.5 39"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.4"
      />

      {/* 2. Thorax (Middle body) */}
      <ellipse cx="24" cy="26" rx="5.5" ry="5" fill="currentColor" />

      {/* 3. Head (Top) */}
      <circle cx="24" cy="17" r="6" fill="currentColor" />

      {/* Cute Ant Eyes */}
      <circle cx="21.5" cy="16.5" r="1.5" fill="#ffffff" />
      <circle cx="26.5" cy="16.5" r="1.5" fill="#ffffff" />
      <circle cx="22" cy="16.5" r="0.75" fill="#0f172a" />
      <circle cx="27" cy="16.5" r="0.75" fill="#0f172a" />

      {/* Smiling Mouth */}
      <path
        d="M22.5 19.5C23.2 20.2 24.8 20.2 25.5 19.5"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Tiny Hardhat / Builder Cap (Doable Worker Talent Badge) */}
      {mood === "streak" && (
        <path
          d="M18 14.5C18 11.5 20.5 10 24 10C27.5 10 30 11.5 30 14.5H18Z"
          fill="#f59e0b"
        />
      )}
    </svg>
  );
};
