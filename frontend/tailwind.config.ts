import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Doable! Brand Colors
        primary: {
          DEFAULT: "#4A6CF7",
          50: "#EEF1FE",
          100: "#D5DCFD",
          200: "#ABB9FB",
          300: "#8196F9",
          400: "#5E7CF8",
          500: "#4A6CF7",
          600: "#1A3FE6",
          700: "#1432B4",
          800: "#0E2482",
          900: "#091750",
        },
        secondary: {
          DEFAULT: "#1E3A8A",
          50: "#E8EDF8",
          100: "#C5D0EE",
          200: "#8BA1DD",
          300: "#5172CC",
          400: "#2D4FA5",
          500: "#1E3A8A",
          600: "#182F6E",
          700: "#122353",
          800: "#0C1837",
          900: "#060C1C",
        },
        tertiary: {
          DEFAULT: "#6366F1",
          50: "#EEEFFE",
          100: "#D5D6FC",
          200: "#ABADFA",
          300: "#8184F7",
          400: "#6366F1",
          500: "#3538E9",
          600: "#1619C7",
          700: "#111396",
          800: "#0B0D64",
          900: "#060632",
        },
        neutral: {
          DEFAULT: "#64748B",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        // shadcn/ui CSS variable tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "sans-serif"],
        heading: ["var(--font-krona)", "sans-serif"],
        krona: ["var(--font-krona)", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-in-left": "slide-in-left 0.5s ease-out forwards",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
