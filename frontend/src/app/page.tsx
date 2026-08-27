"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import logoWithText from "@/assets/logo_with_text.svg";
import {
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
  Network,
  Rocket,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  BarChart2,
  PieChart,
} from "lucide-react";

// Dynamically import GradientWaves with SSR disabled for optimal WebGL performance
const GradientWaves = dynamic(() => import("@/components/ui/GradientWaves"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-[#EEF3FE] via-[#F6F9FF] to-white" />
  ),
});

export default function LandingPage() {
  // Interactive Chart States
  const [selectedYear, setSelectedYear] = useState<"2022" | "2023" | "2024">("2024");
  const [selectedDemographic, setSelectedDemographic] = useState<"15-24" | "25-34" | "35+">("15-24");
  const [chartMetric, setChartMetric] = useState<"nasional" | "pemuda">("pemuda");

  // Trend Data for Unemployment
  const trendData = {
    pemuda: {
      "2022": { rate: "13.9%", label: "Tingkat Pengangguran Terbuka Pemuda (2022)", change: "-0.5% vs 2021", total: "~3.8 Juta Jiwa", barHeight: "78%" },
      "2023": { rate: "13.4%", label: "Tingkat Pengangguran Terbuka Pemuda (2023)", change: "-0.5% vs 2022", total: "~3.5 Juta Jiwa", barHeight: "72%" },
      "2024": { rate: "12.8%", label: "Tingkat Pengangguran Terbuka Pemuda (2024)", change: "-0.6% vs 2023", total: "~3.2 Juta Jiwa", barHeight: "65%" },
    },
    nasional: {
      "2022": { rate: "5.86%", label: "Tingkat Pengangguran Nasional (2022)", change: "-0.63% YoY", total: "~8.4 Juta Jiwa", barHeight: "70%" },
      "2023": { rate: "5.32%", label: "Tingkat Pengangguran Nasional (2023)", change: "-0.54% YoY", total: "~7.8 Juta Jiwa", barHeight: "60%" },
      "2024": { rate: "4.82%", label: "Tingkat Pengangguran Nasional (2024)", change: "-0.50% YoY", total: "~7.2 Juta Jiwa", barHeight: "50%" },
    },
  };

  // Demographic breakdown data
  const demographicData = {
    "15-24": {
      title: "15-24 Tahun",
      percentage: "55.8%",
      desc: "Konsentrasi pengangguran tertinggi di masa transisi sekolah ke dunia kerja.",
      color: "#2563EB",
    },
    "25-34": {
      title: "25-34 Tahun",
      percentage: "29.4%",
      desc: "Pencari karir transisi yang membutuhkan upskilling AI & digital.",
      color: "#4F46E5",
    },
    "35+": {
      title: "35+ Tahun",
      percentage: "14.8%",
      desc: "Tenaga kerja berpengalaman yang beradaptasi dengan otomasi modern.",
      color: "#93C5FD",
    },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500 selection:text-white font-sans">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <Image
              src={logoWithText}
              alt="Doable! Logo"
              height={48}
              width={Math.round(48 * (1650 / 580))}
              style={{ height: "48px", width: "auto" }}
              className="object-contain block select-none group-hover:opacity-95 transition-opacity"
              priority
            />
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a
              href="#our-story"
              className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5 transition-colors"
            >
              Our Story
            </a>
            <a
              href="#realitas"
              className="hover:text-blue-600 transition-colors"
            >
              Impact
            </a>
            <a
              href="#transformasi-ai"
              className="hover:text-blue-600 transition-colors"
            >
              Methodology
            </a>
            <a
              href="#filosofi"
              className="hover:text-blue-600 transition-colors"
            >
              Careers
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 px-3 py-2 transition-all hover:scale-105 inline-block"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#254BE3] px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-800 hover:scale-105 hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION WITH GRADIENT WAVES BACKGROUND */}
      {/* ========================================================================= */}
      <section
        id="our-story"
        className="relative overflow-hidden min-h-[calc(100vh-5rem)] flex items-center justify-center pt-16 pb-20 text-center px-6"
      >
        {/* Animated WebGL GradientWaves Background Canvas - Bolder & High Contrast */}
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <GradientWaves
            horizonColor="#0C0A4A"
            waveColor="#2563EB"
            crestColor="#38BDF8"
            speed={0.45}
            amplitude={3.2}
            waveScale={0.65}
            waveRatio={0.92}
            swell={42}
            turbulence={26}
            tilt={1.12}
            zoom={1.0}
            height={5.2}
            fogDepth={18}
            detail="high"
            brightness={1.25}
            opacity={1.0}
            mouseInteraction={true}
            parallaxStrength={0.6}
            grain={true}
            grainIntensity={0.04}
            className="w-full h-full"
          />
        </div>

        {/* Crisp Gradient Vignette to keep text ultra-readable while waves remain bold */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-white/20 via-white/10 to-white pointer-events-none" />

        {/* Hero Content (z-20) */}
        <div className="relative z-20 mx-auto max-w-5xl">
          {/* Badge: TENTANG KAMI (Clean Pastel Pill) */}
          <div className="inline-flex items-center justify-center rounded-full bg-[#E0EAFF] px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-[#254BE3] shadow-sm mb-6">
            TENTANG KAMI
          </div>

          {/* H1 Heading - Wider Container */}
          <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-extrabold leading-tight sm:leading-[1.35] lg:leading-[1.45] tracking-tight text-[#111827] max-w-4xl lg:max-w-5xl mx-auto">
            Misi Kami: Menjembatani Kesenjangan Antara Keterampilan &amp; Kesempatan.
          </h1>

          {/* Subtitle Description - Wider Container */}
          <p className="mt-6 text-base sm:text-lg lg:text-[19px] text-slate-600 leading-relaxed max-w-3xl lg:max-w-4xl mx-auto font-normal">
            Di tengah tantangan ekonomi dan angka pengangguran yang tinggi, kami percaya bahwa potensi kreatif Indonesia tidak boleh terbuang sia-sia. Doable! didirikan untuk mengubah lanskap profesional melalui pemberdayaan dan teknologi.
          </p>

          {/* Hero CTA Button (Exact Reference Match) */}
          <div className="mt-10 flex justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#254BE3] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-800 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/35 active:scale-95 transition-all group"
            >
              <span>GET STARTED</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. REALITAS SAAT INI (DATA & INTERACTIVE CHARTS) */}
      {/* ========================================================================= */}
      <section id="realitas" className="min-h-screen flex items-center justify-center py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Narrative & 2025 Projection Card */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Realitas Saat Ini
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
                Indonesia menghadapi tantangan ketenagakerjaan yang signifikan. Jutaan talenta potensial berada di luar angkatan kerja formal, membutuhkan solusi inovatif yang menghubungkan mereka dengan ekonomi digital modern.
              </p>
            </div>

            {/* Tag / Data-driven label */}
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-blue-600 uppercase">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span>DATA DRIVEN IMPACT</span>
            </div>

            {/* Proyeksi 2025 Box Card */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-base font-bold text-slate-900">
                Proyeksi 2025
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ekonomi freelance diproyeksikan akan terus tumbuh, dengan lebih dari 40% generasi muda yang mencari peluang kerja mandiri di sektor kreatif dan teknologi. Kami mempersiapkan mereka.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Charts Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- Chart 1: TREN PENGANGGURAN --- */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase">
                      TREN PENGANGGURAN
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      BPS Data
                    </span>
                  </div>

                  {/* Metric Switcher Button */}
                  <div className="mt-3 flex rounded-lg bg-slate-100 p-0.5 text-[10px] font-semibold">
                    <button
                      onClick={() => setChartMetric("pemuda")}
                      className={`flex-1 py-1 rounded-md transition-all hover:scale-[1.04] ${chartMetric === "pemuda"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                      Pemuda (15-24)
                    </button>
                    <button
                      onClick={() => setChartMetric("nasional")}
                      className={`flex-1 py-1 rounded-md transition-all hover:scale-[1.04] ${chartMetric === "nasional"
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-900 hover:bg-white/60"
                        }`}
                    >
                      Nasional
                    </button>
                  </div>

                  {/* Active Data Spotlight */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-slate-900">
                        {trendData[chartMetric][selectedYear].rate}
                      </span>
                      <span className="ml-2 text-xs font-semibold text-emerald-600">
                        {trendData[chartMetric][selectedYear].change}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Est. {trendData[chartMetric][selectedYear].total}
                    </span>
                  </div>
                </div>

                {/* Dynamic Interactive Bar Graph Visual */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <div className="flex items-end justify-between h-32 px-4 gap-4">
                    {(["2022", "2023", "2024"] as const).map((year) => {
                      const isSelected = selectedYear === year;
                      const item = trendData[chartMetric][year];
                      return (
                        <div
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className="flex-1 flex flex-col items-center cursor-pointer group hover:scale-[1.05] transition-transform"
                        >
                          {/* Floating Rate Tooltip on Active/Hover */}
                          <div
                            className={`mb-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all ${isSelected
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-400 group-hover:text-slate-700"
                              }`}
                          >
                            {item.rate}
                          </div>

                          {/* Bar Container */}
                          <div className="w-full h-24 bg-slate-100 rounded-t-lg relative flex items-end overflow-hidden">
                            <div
                              style={{ height: item.barHeight }}
                              className={`w-full rounded-t-lg transition-all duration-500 ${isSelected
                                  ? "bg-gradient-to-t from-blue-600 to-blue-400 shadow-lg shadow-blue-500/20"
                                  : "bg-slate-300 group-hover:bg-blue-300"
                                }`}
                            />
                          </div>

                          {/* Year Label */}
                          <span
                            className={`mt-2 text-xs font-semibold transition-colors ${isSelected ? "text-blue-600 font-bold" : "text-slate-500"
                              }`}
                          >
                            {year}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* --- Chart 2: FOKUS DEMOGRAFI (DYNAMIC DONUT) --- */}
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-[11px] font-extrabold tracking-wider text-slate-500 uppercase">
                      FOKUS DEMOGRAFI
                    </span>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Distribusi Usia
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Klik segmen untuk melihat proporsi tantangan angkatan kerja:
                  </p>
                </div>

                {/* Interactive SVG Donut Chart */}
                <div className="my-4 flex items-center justify-center relative">
                  <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#F1F5F9"
                      strokeWidth="11"
                      fill="transparent"
                    />
                    {/* Segment 1: 15-24 (55%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#254BE3"
                      strokeWidth={selectedDemographic === "15-24" ? "14" : "11"}
                      strokeDasharray="132 238"
                      strokeDashoffset="0"
                      strokeLinecap="round"
                      fill="transparent"
                      className="cursor-pointer transition-all duration-300 hover:stroke-[#1E40AF]"
                      onClick={() => setSelectedDemographic("15-24")}
                    />
                    {/* Segment 2: 25-34 (30%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#60A5FA"
                      strokeWidth={selectedDemographic === "25-34" ? "14" : "11"}
                      strokeDasharray="72 238"
                      strokeDashoffset="-136"
                      strokeLinecap="round"
                      fill="transparent"
                      className="cursor-pointer transition-all duration-300 hover:stroke-[#3B82F6]"
                      onClick={() => setSelectedDemographic("25-34")}
                    />
                    {/* Segment 3: 35+ (15%) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="#CBD5E1"
                      strokeWidth={selectedDemographic === "35+" ? "14" : "11"}
                      strokeDasharray="34 238"
                      strokeDashoffset="-212"
                      strokeLinecap="round"
                      fill="transparent"
                      className="cursor-pointer transition-all duration-300 hover:stroke-[#94A3B8]"
                      onClick={() => setSelectedDemographic("35+")}
                    />
                  </svg>

                  {/* Donut Center Spotlight Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                    <span className="text-sm font-extrabold text-[#254BE3]">
                      {demographicData[selectedDemographic].title}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700">
                      {demographicData[selectedDemographic].percentage}
                    </span>
                  </div>
                </div>

                {/* Segment Selector Tags */}
                <div className="flex justify-between items-center gap-1 text-[10px] font-semibold pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedDemographic("15-24")}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-[1.08] ${selectedDemographic === "15-24"
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-[#254BE3]" />
                    15-24 Thn
                  </button>
                  <button
                    onClick={() => setSelectedDemographic("25-34")}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-[1.08] ${selectedDemographic === "25-34"
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-[#60A5FA]" />
                    25-34 Thn
                  </button>
                  <button
                    onClick={() => setSelectedDemographic("35+")}
                    className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-[1.08] ${selectedDemographic === "35+"
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-[#CBD5E1]" />
                    35+ Thn
                  </button>
                </div>
              </div>
            </div>

            {/* Full-Width Blue Card: FOKUS PEMUDA */}
            <div className="rounded-2xl bg-[#254BE3] p-6 sm:p-7 text-white shadow-lg shadow-blue-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="max-w-md">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Fokus Pemuda
                </h3>
                <p className="mt-1.5 text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
                  Tingkat pengangguran tertinggi berada pada kelompok usia produktif awal. Misi kami adalah memberdayakan generasi ini dengan keterampilan relevan.
                </p>
              </div>

              {/* Users Outline Badge Icon */}
              <div className="h-14 w-14 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. TRANSFORMASI DIGITAL & ERA KREATIVITAS AI */}
      {/* ========================================================================= */}
      <section id="transformasi-ai" className="min-h-screen flex items-center justify-center py-20 bg-[#F9FBFF] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Interactive AI Studio Screen Mockup */}
            <div className="lg:col-span-6 relative">
              {/* Outer Monitor Frame */}
              <div className="rounded-3xl border border-slate-200/80 bg-slate-900 p-2 sm:p-3 shadow-2xl shadow-slate-300/60 overflow-hidden">
                {/* Top Window Bar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 rounded-t-2xl">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    doable-ai-studio // canvas_v2.4
                  </span>
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                </div>

                {/* Inner Screen Mockup Content */}
                <div className="bg-[#0F172A] rounded-b-2xl p-4 text-white overflow-hidden">
                  {/* Studio Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">
                        Doable! Studio — AI Assisted Design
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                      ● Active Project #482
                    </span>
                  </div>

                  {/* Studio Canvas Area with Creative Cards */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* Left Canvas Preview */}
                    <div className="rounded-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 p-3 border border-slate-700/60 flex flex-col justify-between h-44">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-indigo-300">
                          GEN_AI_MODEL // FLUX.1
                        </span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                          98% Fit
                        </span>
                      </div>
                      <div className="text-center my-auto">
                        <div className="inline-block p-2 rounded-xl bg-indigo-600/30 border border-indigo-400/30 shadow-lg">
                          <Layers className="h-6 w-6 text-indigo-300 animate-bounce" />
                        </div>
                        <p className="mt-2 text-[11px] font-bold text-white">
                          Generative Brand Identity
                        </p>
                      </div>
                      <div className="text-[9px] text-slate-400">
                        Output: 4K Vector &amp; Marketing Kit
                      </div>
                    </div>

                    {/* Right AI Prompt & Skill Match List */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/50">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">
                          AI Prompt Generator
                        </span>
                        <p className="text-[10px] text-slate-300 mt-1 font-mono italic">
                          &quot;Modern visual branding for fintech startup in Jakarta...&quot;
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-800/80 p-2.5 border border-slate-700/50">
                        <span className="text-[9px] font-bold text-slate-400 block uppercase">
                          Skill Verification
                        </span>
                        <div className="mt-1 flex items-center justify-between text-[10px] font-semibold text-emerald-400">
                          <span>Prompt Engineering</span>
                          <span>Passed (Level 3)</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-blue-600/20 border border-blue-500/30 p-2 text-center">
                        <span className="text-[10px] font-bold text-blue-300">
                          ✓ Client Match: Rp 8.500.000 (Escrowed)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monitor Stand Base */}
              <div className="mx-auto h-5 w-24 bg-gradient-to-b from-slate-400 to-slate-500 rounded-b-md shadow-md" />
              <div className="mx-auto h-2 w-44 bg-slate-300 rounded-full shadow-sm -mt-0.5" />
            </div>

            {/* Right Column: Copywriting & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#254BE3]">
                TRANSFORMASI DIGITAL
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Era Kreativitas AI
              </h2>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Dunia sedang bergeser. Kemampuan menciptakan konten kini didemokratisasi oleh Kecerdasan Buatan. Dari &quot;Poster AI&quot; sederhana hingga kampanye visual yang kompleks, batas antara amatir dan profesional semakin kabur.
              </p>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Kami melihat tren ini bukan sebagai ancaman, melainkan sebagai batu loncatan. Doable! memandu individu untuk memanfaatkan alat bantu AI, mengubah hobi atau rasa ingin tahu menjadi keterampilan yang dapat dipasarkan di dunia kerja profesional.
              </p>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#254BE3] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-800 hover:scale-105 hover:shadow-xl hover:shadow-blue-600/35 active:scale-95 transition-all group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FILOSOFI KAMI (CORE PILLARS 3-CARD GRID) */}
      {/* ========================================================================= */}
      <section id="filosofi" className="min-h-screen flex flex-col items-center justify-center py-24 px-6 lg:px-12 max-w-7xl mx-auto text-center w-full">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-14">
          Filosofi Kami
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* Card 1: Learn while Working */}
          <div className="animate-breathe rounded-3xl border border-slate-100 bg-[#FBFDFF] p-8 sm:p-10 hover:shadow-xl flex flex-col items-center">
            <div className="animate-breathe-icon h-16 w-16 rounded-full bg-[#EBF1FF] flex items-center justify-center mb-6 shadow-inner text-[#254BE3]">
              <GraduationCap className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              Learn while Working
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Pendekatan praktis dimana pembelajaran terjadi secara organik saat menyelesaikan proyek dunia nyata.
            </p>
          </div>

          {/* Card 2: Koneksi Ekosistem */}
          <div className="animate-breathe-2 rounded-3xl border border-slate-100 bg-[#FBFDFF] p-8 sm:p-10 hover:shadow-xl flex flex-col items-center">
            <div className="animate-breathe-icon-2 h-16 w-16 rounded-full bg-[#EBF1FF] flex items-center justify-center mb-6 shadow-inner text-[#254BE3]">
              <Network className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              Koneksi Ekosistem
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Menjembatani talenta langsung dengan kebutuhan industri yang mencari efisiensi berbasis AI.
            </p>
          </div>

          {/* Card 3: Akselerasi Karir */}
          <div className="animate-breathe-3 rounded-3xl border border-slate-100 bg-[#FBFDFF] p-8 sm:p-10 hover:shadow-xl flex flex-col items-center">
            <div className="animate-breathe-icon-3 h-16 w-16 rounded-full bg-[#EBF1FF] flex items-center justify-center mb-6 shadow-inner text-[#254BE3]">
              <Rocket className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              Akselerasi Karir
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Mengubah status pengangguran menjadi profesional mandiri dengan portofolio yang tervalidasi.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-blue-100 bg-[#EAF1FF] py-12 px-6 lg:px-12 text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left Brand & Mission Copy */}
          <div className="max-w-md space-y-3">
            <Image
              src={logoWithText}
              alt="Doable! Logo"
              height={42}
              width={Math.round(42 * (1650 / 580))}
              style={{ height: "42px", width: "auto" }}
              className="object-contain block select-none"
            />
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              &copy; {new Date().getFullYear()} Doable! Indonesia. Empowering the creative workforce through AI synergy.
            </p>
          </div>

          {/* Right Navigation & Legal Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
            <a href="#our-story" className="hover:text-blue-600 transition-colors">
              Mission
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms of Service
            </a>
            <a href="#realitas" className="hover:text-blue-600 transition-colors">
              Unemployment Data 2024
            </a>
            <a href="#transformasi-ai" className="hover:text-blue-600 transition-colors">
              AI Ethics
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
