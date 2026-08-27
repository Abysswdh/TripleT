"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
  Network,
  Rocket,
  Sparkles,
  Layers,
} from "lucide-react";

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
    <div className="w-full flex flex-col items-center justify-start pb-16">
      {/* ========================================================================= */}
      {/* HERO SECTION WITH LIGHTER CSS ANIMATIONS */}
      {/* ========================================================================= */}
      <section
        id="our-story"
        className="relative w-full overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center pt-16 pb-20 text-center px-4"
      >
        {/* Animated CSS Gradient Background (Replaces WebGL GradientWaves for performance) */}
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 animate-in fade-in duration-1000">
           {/* Subtle decorative circles */}
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60 animate-breathe" />
           <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl opacity-60 animate-breathe-2" />
        </div>

        {/* Hero Content (z-20) */}
        <Container className="relative z-20 flex flex-col items-center">
          {/* Badge: TENTANG KAMI (Clean Pastel Pill) */}
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary shadow-sm mb-8 animate-in slide-in-from-bottom-4 duration-700">
            TENTANG KAMI
          </div>

          {/* H1 Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.1] sm:leading-[1.15] tracking-tight text-foreground max-w-4xl lg:max-w-5xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
            Misi Kami: Menjembatani Kesenjangan Antara Keterampilan &amp; Kesempatan.
          </h1>

          {/* Subtitle Description */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl lg:max-w-4xl mx-auto font-normal animate-in fade-in duration-1000 delay-300 fill-mode-both">
            Di tengah tantangan ekonomi dan angka pengangguran yang tinggi, kami percaya bahwa potensi kreatif Indonesia tidak boleh terbuang sia-sia. Doable! didirikan untuk mengubah lanskap profesional melalui pemberdayaan dan teknologi.
          </p>

          {/* Hero CTA Button */}
          <div className="mt-10 flex justify-center animate-in fade-in zoom-in-95 duration-700 delay-500 fill-mode-both">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-sm sm:text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all group"
            >
              <span>GET STARTED</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* REALITAS SAAT INI (DATA & INTERACTIVE CHARTS) */}
      {/* ========================================================================= */}
      <section id="realitas" className="w-full flex items-center justify-center py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Narrative & 2025 Projection Card */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                  Realitas Saat Ini
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
                  Indonesia menghadapi tantangan ketenagakerjaan yang signifikan. Jutaan talenta potensial berada di luar angkatan kerja formal, membutuhkan solusi inovatif yang menghubungkan mereka dengan ekonomi digital modern.
                </p>
              </div>

              {/* Tag / Data-driven label */}
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-primary uppercase">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>DATA DRIVEN IMPACT</span>
              </div>

              {/* Proyeksi 2025 Box Card */}
              <div className="rounded-2xl border border-border bg-muted/20 p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-base font-bold text-foreground">
                  Proyeksi 2025
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Ekonomi freelance diproyeksikan akan terus tumbuh, dengan lebih dari 40% generasi muda yang mencari peluang kerja mandiri di sektor kreatif dan teknologi. Kami mempersiapkan mereka.
                </p>
              </div>
            </div>

            {/* Right Column: Interactive Charts Grid */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* --- Chart 1: TREN PENGANGGURAN --- */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <span className="text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">
                        TREN PENGANGGURAN
                      </span>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        BPS Data
                      </span>
                    </div>

                    {/* Metric Switcher Button */}
                    <div className="mt-3 flex rounded-lg bg-muted/50 p-0.5 text-[10px] font-semibold">
                      <button
                        onClick={() => setChartMetric("pemuda")}
                        className={`flex-1 py-1.5 rounded-md transition-all hover:scale-[1.02] ${chartMetric === "pemuda"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                          }`}
                      >
                        Pemuda (15-24)
                      </button>
                      <button
                        onClick={() => setChartMetric("nasional")}
                        className={`flex-1 py-1.5 rounded-md transition-all hover:scale-[1.02] ${chartMetric === "nasional"
                            ? "bg-background text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                          }`}
                      >
                        Nasional
                      </button>
                    </div>

                    {/* Active Data Spotlight */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-black text-foreground">
                          {trendData[chartMetric][selectedYear].rate}
                        </span>
                        <span className="ml-2 text-xs font-semibold text-emerald-600">
                          {trendData[chartMetric][selectedYear].change}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        Est. {trendData[chartMetric][selectedYear].total}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Interactive Bar Graph Visual */}
                  <div className="mt-6 pt-4 border-t border-border/40">
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
                            <div
                              className={`mb-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all ${isSelected
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "text-muted-foreground group-hover:text-foreground"
                                }`}
                            >
                              {item.rate}
                            </div>
                            <div className="w-full h-24 bg-muted/30 rounded-t-lg relative flex items-end overflow-hidden">
                              <div
                                style={{ height: item.barHeight }}
                                className={`w-full rounded-t-lg transition-all duration-500 ${isSelected
                                    ? "bg-gradient-to-t from-primary to-primary/70 shadow-lg shadow-primary/20"
                                    : "bg-muted-foreground/30 group-hover:bg-primary/40"
                                  }`}
                              />
                            </div>
                            <span
                              className={`mt-2 text-xs font-semibold transition-colors ${isSelected ? "text-primary font-bold" : "text-muted-foreground"
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
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <span className="text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">
                        FOKUS DEMOGRAFI
                      </span>
                      <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Distribusi Usia
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Klik segmen untuk melihat proporsi tantangan angkatan kerja:
                    </p>
                  </div>

                  <div className="my-4 flex items-center justify-center relative">
                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="38" stroke="hsl(var(--muted))" strokeWidth="11" fill="transparent" />
                      {/* Segment 1: 15-24 */}
                      <circle
                        cx="50" cy="50" r="38" stroke="hsl(var(--primary))"
                        strokeWidth={selectedDemographic === "15-24" ? "14" : "11"}
                        strokeDasharray="132 238" strokeDashoffset="0" strokeLinecap="round" fill="transparent"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedDemographic("15-24")}
                      />
                      {/* Segment 2: 25-34 */}
                      <circle
                        cx="50" cy="50" r="38" stroke="#60A5FA"
                        strokeWidth={selectedDemographic === "25-34" ? "14" : "11"}
                        strokeDasharray="72 238" strokeDashoffset="-136" strokeLinecap="round" fill="transparent"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedDemographic("25-34")}
                      />
                      {/* Segment 3: 35+ */}
                      <circle
                        cx="50" cy="50" r="38" stroke="hsl(var(--muted-foreground)/0.4)"
                        strokeWidth={selectedDemographic === "35+" ? "14" : "11"}
                        strokeDasharray="34 238" strokeDashoffset="-212" strokeLinecap="round" fill="transparent"
                        className="cursor-pointer transition-all duration-300"
                        onClick={() => setSelectedDemographic("35+")}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                      <span className="text-sm font-extrabold text-primary">
                        {demographicData[selectedDemographic].title}
                      </span>
                      <span className="text-[11px] font-bold text-foreground">
                        {demographicData[selectedDemographic].percentage}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center gap-1 text-[10px] font-semibold pt-2 border-t border-border/40">
                    <button
                      onClick={() => setSelectedDemographic("15-24")}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-[1.05] ${selectedDemographic === "15-24"
                          ? "text-primary bg-primary/10 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      15-24
                    </button>
                    <button
                      onClick={() => setSelectedDemographic("25-34")}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-[1.05] ${selectedDemographic === "25-34"
                          ? "text-blue-500 bg-blue-50 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                      25-34
                    </button>
                    <button
                      onClick={() => setSelectedDemographic("35+")}
                      className={`flex items-center gap-1 px-2 py-1 rounded transition-all hover:scale-[1.05] ${selectedDemographic === "35+"
                          ? "text-slate-600 bg-slate-100 font-bold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                      <span className="h-2 w-2 rounded-full bg-slate-400" />
                      35+
                    </button>
                  </div>
                </div>
              </div>

              {/* Full-Width Blue Card: FOKUS PEMUDA */}
              <div className="rounded-2xl bg-primary p-6 sm:p-7 text-primary-foreground shadow-lg shadow-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="max-w-md">
                  <h3 className="text-xl font-bold tracking-tight">
                    Fokus Pemuda
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-primary-foreground/80 leading-relaxed font-normal">
                    Tingkat pengangguran tertinggi berada pada kelompok usia produktif awal. Misi kami adalah memberdayakan generasi ini dengan keterampilan relevan.
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                  <Users className="h-7 w-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* TRANSFORMASI DIGITAL & ERA KREATIVITAS AI */}
      {/* ========================================================================= */}
      <section id="transformasi-ai" className="w-full flex items-center justify-center py-24 bg-muted/20 border-y border-border/40">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Interactive AI Studio Screen Mockup */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl border border-border/80 bg-slate-900 p-2 sm:p-3 shadow-2xl shadow-primary/10 overflow-hidden">
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
                <div className="bg-[#0F172A] rounded-b-2xl p-4 text-white overflow-hidden">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span className="text-xs font-bold text-slate-200">
                        Doable! Studio — AI Assisted Design
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                      ● Active Project #482
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-900 p-3 border border-slate-700/60 flex flex-col justify-between h-44">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-mono text-indigo-300">
                          GEN_AI_MODEL // FLUX.1
                        </span>
                        <span className="text-[9px] bg-primary/20 text-primary-foreground px-1.5 py-0.5 rounded">
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
                      <div className="rounded-lg bg-primary/20 border border-primary/30 p-2 text-center">
                        <span className="text-[10px] font-bold text-primary-foreground">
                          ✓ Client Match: Rp 8.500.000 (Escrow)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Copywriting & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-primary">
                TRANSFORMASI DIGITAL
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
                Era Kreativitas AI
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Dunia sedang bergeser. Kemampuan menciptakan konten kini didemokratisasi oleh Kecerdasan Buatan. Dari &quot;Poster AI&quot; sederhana hingga kampanye visual yang kompleks, batas antara amatir dan profesional semakin kabur.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Kami melihat tren ini bukan sebagai ancaman, melainkan sebagai batu loncatan. Doable! memandu individu untuk memanfaatkan alat bantu AI, mengubah hobi atau rasa ingin tahu menjadi keterampilan yang dapat dipasarkan di dunia kerja profesional.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all group"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================================================= */}
      {/* FILOSOFI KAMI (CORE PILLARS 3-CARD GRID) */}
      {/* ========================================================================= */}
      <section id="filosofi" className="w-full flex flex-col items-center justify-center py-24 bg-background">
        <Container className="text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-14">
            Filosofi Kami
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {/* Card 1: Learn while Working */}
            <div className="animate-breathe rounded-3xl border border-border/60 bg-card p-8 sm:p-10 hover:shadow-xl transition-shadow flex flex-col items-center">
              <div className="animate-breathe-icon h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner text-primary">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-3">
                Learn while Working
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Pendekatan praktis dimana pembelajaran terjadi secara organik saat menyelesaikan proyek dunia nyata.
              </p>
            </div>

            {/* Card 2: Koneksi Ekosistem */}
            <div className="animate-breathe-2 rounded-3xl border border-border/60 bg-card p-8 sm:p-10 hover:shadow-xl transition-shadow flex flex-col items-center">
              <div className="animate-breathe-icon-2 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner text-primary">
                <Network className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-3">
                Koneksi Ekosistem
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Menjembatani talenta langsung dengan kebutuhan industri yang mencari efisiensi berbasis AI.
              </p>
            </div>

            {/* Card 3: Akselerasi Karir */}
            <div className="animate-breathe-3 rounded-3xl border border-border/60 bg-card p-8 sm:p-10 hover:shadow-xl transition-shadow flex flex-col items-center">
              <div className="animate-breathe-icon-3 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 shadow-inner text-primary">
                <Rocket className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground tracking-tight mb-3">
                Akselerasi Karir
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Mengubah status pengangguran menjadi profesional mandiri dengan portofolio yang tervalidasi.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
