"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import logoWithText from "@/assets/logo_with_text.svg";
import {
  ArrowRight,
  TrendingUp,
  Users,
  GraduationCap,
  Sparkles,
  Layers,
  Info,
  CheckCircle2,
  BarChart2,
  ShieldCheck,
  Briefcase,
  Globe,
  MessageSquare,
  Flame,
  Zap,
  PieChart,
  HelpCircle,
} from "lucide-react";
import CountUp from "@/components/ui/CountUp";

// Dynamically import GradientWaves with SSR disabled for optimal WebGL performance
const GradientWaves = dynamic(() => import("@/components/ui/GradientWaves"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gradient-to-b from-[#EEF3FE] via-[#F6F9FF] to-white" />
  ),
});

// Framer Motion Animation Variants for Scroll Fade-Up
const fadeUpVariants = {
  hidden: { opacity: 0, y: 35 },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      delay: customDelay,
    },
  }),
};

export default function LandingPage() {
  // Section 1: ASEAN Chart & Demographic States
  const [selectedAseanCountry, setSelectedAseanCountry] = useState<string>("id");
  const [activeChartTab, setActiveChartTab] = useState<"asean" | "demographics" | "informal">("asean");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<"15-24" | "25-34" | "35+">("15-24");

  // Section 3: Client vs Freelancer Solusi Switcher
  const [userRoleTab, setUserRoleTab] = useState<"klien" | "freelancer">("klien");

  // Section 4: Auto-Gantt Simulator Category
  const [ganttCategory, setGanttCategory] = useState<"logo" | "web" | "content">("logo");
  const [activeGanttStep, setActiveGanttStep] = useState<number>(2);

  // Section 4: GitHub Streak Hovered Day Tooltip State
  const [hoveredStreakDay, setHoveredStreakDay] = useState<{ day: number; count: number; date: string } | null>(null);

  // Section 5: Dummy Project Simulator
  const [selectedDummyBrief, setSelectedDummyBrief] = useState<number>(0);

  // Data for ASEAN Comparison (IMF 2026 Projection)
  const aseanData = [
    { id: "id", country: "Indonesia", rate: 4.68, label: "4.68%", detail: "7.24 Juta Orang (BPS Feb 2026)", highlight: true, barHeight: 92 },
    { id: "my", country: "Malaysia", rate: 3.00, label: "3.00%", detail: "Proyeksi IMF 2026", highlight: false, barHeight: 62 },
    { id: "vn", country: "Vietnam", rate: 2.10, label: "2.10%", detail: "Proyeksi IMF 2026", highlight: false, barHeight: 44 },
    { id: "sg", country: "Singapura", rate: 2.00, label: "2.00%", detail: "Proyeksi IMF 2026", highlight: false, barHeight: 40 },
    { id: "th", country: "Thailand", rate: 1.00, label: "1.00%", detail: "Proyeksi IMF 2026", highlight: false, barHeight: 24 },
  ];

  // Age Group Breakdown Data
  const ageGroupData = {
    "15-24": {
      title: "Usia 15-24 Tahun (Pemuda)",
      rate: "16.36%",
      desc: "Konsentrasi pengangguran tertinggi (1 dari 6 pemuda belum dapat kerja). Transisi pendidikan ke karir praktis.",
      color: "#254BE3",
      dashArray: "140 238",
      dashOffset: "0",
    },
    "25-34": {
      title: "Usia 25-34 Tahun",
      rate: "29.4%",
      desc: "Pencari karir transisi yang memerlukan portofolio relevan dan akselerasi proyek digital.",
      color: "#60A5FA",
      dashArray: "72 238",
      dashOffset: "-142",
    },
    "35+": {
      title: "Usia 35+ Tahun",
      rate: "14.8%",
      desc: "Tenaga kerja berpengalaman yang beradaptasi dengan alat bantu modern.",
      color: "#94A3B8",
      dashArray: "34 238",
      dashOffset: "-216",
    },
  };

  // Gantt Chart Data per Category
  const ganttWorkflows = {
    logo: [
      { step: 1, title: "1. Riset Brief & Industry Moodboard", duration: "Hari 1", status: "Selesai", progress: 100 },
      { step: 2, title: "2. Sketsa Konsep & Eksplorasi Typo", duration: "Hari 2-3", status: "Sedang Berjalan", progress: 65 },
      { step: 3, title: "3. Digitalisasi Vector & Palet Warna", duration: "Hari 4", status: "Mendatang", progress: 0 },
      { step: 4, title: "4. Revisi Feedback Klien & Handover", duration: "Hari 5-6", status: "Mendatang", progress: 0 },
    ],
    web: [
      { step: 1, title: "1. Wireframing & User Journey", duration: "Hari 1-2", status: "Selesai", progress: 100 },
      { step: 2, title: "2. Visual Design & Component Library", duration: "Hari 3-5", status: "Sedang Berjalan", progress: 50 },
      { step: 3, title: "3. Frontend Slicing & Next.js", duration: "Hari 6-8", status: "Mendatang", progress: 0 },
      { step: 4, title: "4. QA Testing & Live Deployment", duration: "Hari 9-10", status: "Mendatang", progress: 0 },
    ],
    content: [
      { step: 1, title: "1. Keyword Research & Audience Persona", duration: "Hari 1", status: "Selesai", progress: 100 },
      { step: 2, title: "2. Copywriting & Script Hook", duration: "Hari 2", status: "Sedang Berjalan", progress: 80 },
      { step: 3, title: "3. Visual Asset Design & Carousel", duration: "Hari 3-4", status: "Mendatang", progress: 0 },
      { step: 4, title: "4. Final Asset Package Export", duration: "Hari 5", status: "Mendatang", progress: 0 },
    ],
  };

  // Dummy Projects Data
  const dummyBriefs = [
    {
      title: "Desain Brand Identity Kopi Artisan 'KopiSenja'",
      category: "Branding & Logo",
      level: "Beginner Friendly",
      xp: "+150 XP Portofolio",
      description: "Brief simulasi untuk kedai kopi lokal. Buat logo minimalis, skema warna earthy, dan mockup kemasan cup.",
      skills: ["Adobe Illustrator", "Logo Design", "Mockup Presentation"],
      status: "Tersedia untuk Dikerjakan",
    },
    {
      title: "UI/UX Mobile App Marketplace Sayur Organik",
      category: "UI/UX Design",
      level: "Intermediate Brief",
      xp: "+250 XP Portofolio",
      description: "Desain 5 layar utama aplikasi belanja sayur lokal: Beranda, Detail Produk, Keranjang, Checkout, dan Tracking.",
      skills: ["Figma", "Mobile UI", "Prototyping"],
      status: "Tersedia untuk Dikerjakan",
    },
    {
      title: "Video Reel Promosi Instagram Produk Skincare",
      category: "Content & Video",
      level: "Beginner Friendly",
      xp: "+180 XP Portofolio",
      description: "Sunting video 30 detik untuk kampanye media sosial menggunakan aset stok & musik bebas hak cipta.",
      skills: ["CapCut / Premiere", "Short-Form Video", "Storyboarding"],
      status: "Tersedia untuk Dikerjakan",
    },
  ];

  // GitHub Streak Grid Data Generation (28 days)
  const streakDays = Array.from({ length: 28 }).map((_, i) => {
    const intensity = [0, 1, 2, 3, 4][(i * 7 + 3) % 5];
    const dates = ["2026-08-01", "2026-08-05", "2026-08-10", "2026-08-15", "2026-08-20", "2026-08-25", "2026-08-29"];
    return {
      day: i + 1,
      intensity,
      count: intensity * 2,
      date: dates[i % dates.length],
    };
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-500 selection:text-white font-sans overflow-x-hidden">
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
          <nav className="hidden lg:flex items-center gap-7 text-xs sm:text-sm font-semibold text-slate-600">
            <a
              href="#our-story"
              className="text-blue-600 font-bold border-b-2 border-blue-600 pb-0.5 transition-colors"
            >
              Our Story
            </a>
            <a
              href="#realitas-data"
              className="hover:text-blue-600 transition-colors"
            >
              Data &amp; Impact
            </a>
            <a
              href="#kesenjangan"
              className="hover:text-blue-600 transition-colors"
            >
              Kesenjangan
            </a>
            <a
              href="#solusi-doable"
              className="hover:text-blue-600 transition-colors"
            >
              Solusi &amp; Workspace
            </a>
            <a
              href="#dummy-projects"
              className="hover:text-blue-600 transition-colors"
            >
              Dummy Projects
            </a>
            <a
              href="#sdg-impact"
              className="hover:text-blue-600 transition-colors"
            >
              SDG Impact
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
      {/* 2. HERO SECTION WITH GRADIENT WAVES BACKGROUND (PRESERVED) */}
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
      {/* 3. REALITAS KETENAGAKERJAAN 2026 & GRAFIK INTERAKTIF (#realitas-data) */}
      {/* ========================================================================= */}
      <section
        id="realitas-data"
        className="py-24 px-6 lg:px-12 max-w-7xl mx-auto border-t border-slate-100 scroll-mt-20"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUpVariants}
          customDelay={0}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 mb-3 border border-blue-100">
            <TrendingUp className="h-3.5 w-3.5" />
            DATA BPS &amp; IMF PROJECTION 2026
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Realitas Ketenagakerjaan Indonesia 2026
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
            Menurut BPS Feb 2026, TPT Indonesia mencapai 4,68% (7,24 juta orang pengangguran). Mari eksplorasi komparasi interaktif dengan negara ASEAN lainnya dan rincian demografi.
          </p>
        </motion.div>

        {/* Top 3 Metric Spotlight Cards with Fade-Up Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: BPS Feb 2026 TPT */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0.1}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                BPS FEB 2026
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              <CountUp to={4.68} duration={2} />%
            </div>
            <div className="mt-1 text-sm font-bold text-blue-600">
              <CountUp to={7.24} duration={2} separator="." /> Juta Orang Menganggur
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Tingkat Pengangguran Terbuka (TPT) Indonesia nasional menurut rilis resmi Badan Pusat Statistik.
            </p>
          </motion.div>

          {/* Card 2: Youth Unemployment 15-24 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0.2}
            className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/70 to-white p-7 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                KELOMPOK USIA 15-24
              </span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-4xl font-black text-blue-600 tracking-tight">
              <CountUp to={16.36} duration={2} />%
            </div>
            <div className="mt-1 text-sm font-bold text-slate-800">
              ~1 dari 6 Anak Muda
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Tingkat pengangguran tertinggi berada pada kelompok usia produktif awal di angkatan kerja.
            </p>
          </motion.div>

          {/* Card 3: Informal Sector 2025 */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0.3}
            className="rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all group hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                SEKTOR INFORMAL (2025)
              </span>
              <HelpCircle className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-4xl font-black text-slate-900 tracking-tight">
              <CountUp to={57.8} duration={2} />%
            </div>
            <div className="mt-1 text-sm font-bold text-amber-600">
              Bekerja Tanpa Jaminan Karir
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Mayoritas pekerja Indonesia bekerja di sektor informal tanpa kepastian karir, perlindungan, dan stabilitas.
            </p>
          </motion.div>
        </div>

        {/* Interactive Main Chart Container with Tabs */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUpVariants}
          customDelay={0.2}
          className="rounded-3xl border border-slate-800 bg-slate-900 text-white p-6 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          {/* Header & Mode Switcher Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div>
              <h3 className="text-2xl font-extrabold text-white">
                Visualisasi Data Pengangguran &amp; Demografi
              </h3>
            </div>

            {/* Interactive View Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl self-start md:self-auto border border-slate-700">
              <button
                onClick={() => setActiveChartTab("asean")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeChartTab === "asean"
                    ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                ASEAN Comparison
              </button>
              <button
                onClick={() => setActiveChartTab("demographics")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeChartTab === "demographics"
                    ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <PieChart className="h-3.5 w-3.5" />
                Distribusi Usia
              </button>
              <button
                onClick={() => setActiveChartTab("informal")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  activeChartTab === "informal"
                    ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                Informal vs Formal
              </button>
            </div>
          </div>

          {/* TAB 1: ASEAN BAR CHART */}
          {activeChartTab === "asean" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Klik batang untuk melihat perbandingan rasio &amp; detail negara:</span>
                <span className="text-blue-400 font-semibold">Proyeksi IMF 2026</span>
              </div>

              {/* Animated Interactive Bar Chart */}
              <div className="grid grid-cols-5 gap-2 sm:gap-6 items-end h-64 pt-8 px-2">
                {aseanData.map((item) => {
                  const isSelected = selectedAseanCountry === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedAseanCountry(item.id)}
                      className="flex flex-col items-center h-full justify-end cursor-pointer group"
                    >
                      {/* Floating Tooltip Pill */}
                      <motion.div
                        initial={false}
                        animate={{ scale: isSelected ? 1.08 : 1 }}
                        className={`mb-2 px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all ${
                          item.highlight
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40"
                            : isSelected
                            ? "bg-slate-700 text-white border border-slate-500"
                            : "bg-slate-800 text-slate-400 group-hover:text-white"
                        }`}
                      >
                        {item.label}
                      </motion.div>

                      {/* Bar Column with Motion Height Animation */}
                      <div className="w-full max-w-[56px] h-full bg-slate-800/80 rounded-t-xl relative flex items-end overflow-hidden p-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${item.barHeight}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`w-full rounded-t-lg transition-colors ${
                            item.highlight
                              ? "bg-gradient-to-t from-blue-600 via-blue-500 to-sky-400 shadow-lg shadow-blue-500/30"
                              : isSelected
                              ? "bg-gradient-to-t from-indigo-500 to-slate-400"
                              : "bg-slate-700 group-hover:bg-slate-600"
                          }`}
                        />
                      </div>

                      {/* Country Name Tag */}
                      <div className="mt-3 text-center">
                        <span
                          className={`text-xs sm:text-sm font-bold block transition-colors ${
                            item.highlight
                              ? "text-blue-400 font-extrabold"
                              : isSelected
                              ? "text-white"
                              : "text-slate-400 group-hover:text-slate-200"
                          }`}
                        >
                          {item.country}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Country Detail Box */}
              <div className="mt-8 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 flex items-center justify-between shadow-inner">
                <div className="flex items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-extrabold text-sm">
                    {selectedAseanCountry.toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {aseanData.find((d) => d.id === selectedAseanCountry)?.country}:{" "}
                      <span className="text-blue-400 font-extrabold">
                        {aseanData.find((d) => d.id === selectedAseanCountry)?.rate}% TPT
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {aseanData.find((d) => d.id === selectedAseanCountry)?.detail}
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-400 block">Selisih vs Thailand (1%):</span>
                  <span className="text-xs font-bold text-amber-400">
                    +{( (aseanData.find((d) => d.id === selectedAseanCountry)?.rate || 0) - 1.0 ).toFixed(2)}% lebih tinggi
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: DEMOGRAPHICS DONUT CHART */}
          {activeChartTab === "demographics" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
            >
              {/* Left Donut SVG */}
              <div className="md:col-span-6 flex flex-col items-center justify-center relative my-4">
                <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" stroke="#1E293B" strokeWidth="12" fill="transparent" />
                  {/* Segment 15-24 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#254BE3"
                    strokeWidth={selectedAgeGroup === "15-24" ? "15" : "12"}
                    strokeDasharray="140 238"
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    fill="transparent"
                    className="cursor-pointer transition-all duration-300 hover:stroke-blue-400"
                    onClick={() => setSelectedAgeGroup("15-24")}
                  />
                  {/* Segment 25-34 */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#60A5FA"
                    strokeWidth={selectedAgeGroup === "25-34" ? "15" : "12"}
                    strokeDasharray="72 238"
                    strokeDashoffset="-142"
                    strokeLinecap="round"
                    fill="transparent"
                    className="cursor-pointer transition-all duration-300 hover:stroke-sky-300"
                    onClick={() => setSelectedAgeGroup("25-34")}
                  />
                  {/* Segment 35+ */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    stroke="#94A3B8"
                    strokeWidth={selectedAgeGroup === "35+" ? "15" : "12"}
                    strokeDasharray="34 238"
                    strokeDashoffset="-216"
                    strokeLinecap="round"
                    fill="transparent"
                    className="cursor-pointer transition-all duration-300 hover:stroke-slate-300"
                    onClick={() => setSelectedAgeGroup("35+")}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
                  <span className="text-xs text-slate-400 uppercase font-bold">Fokus Usia</span>
                  <span className="text-xl font-black text-blue-400">
                    {ageGroupData[selectedAgeGroup].rate}
                  </span>
                </div>
              </div>

              {/* Right Interactive Selection Details */}
              <div className="md:col-span-6 space-y-3">
                {(["15-24", "25-34", "35+"] as const).map((key) => {
                  const item = ageGroupData[key];
                  const isSelected = selectedAgeGroup === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedAgeGroup(key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-800 border-blue-500 shadow-md"
                          : "bg-slate-800/40 border-slate-700 hover:bg-slate-800/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-bold text-white">{item.title}</span>
                        </div>
                        <span className="text-xs font-bold text-blue-400">{item.rate}</span>
                      </div>
                      {isSelected && (
                        <p className="mt-2 text-xs text-slate-300 leading-relaxed pl-5 border-l-2 border-blue-500">
                          {item.desc}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: INFORMAL VS FORMAL SECTOR */}
          {activeChartTab === "informal" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-8 space-y-6"
            >
              <div className="bg-slate-800/90 p-6 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-slate-300">Proporsi Penduduk Bekerja (2025)</span>
                  <span className="text-amber-400">57.80% Informal vs 42.20% Formal</span>
                </div>

                {/* Dual Progress Stacked Bar */}
                <div className="w-full h-8 bg-slate-900 rounded-xl overflow-hidden flex p-1 border border-slate-700">
                  <div
                    style={{ width: "57.8%" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-l-lg flex items-center justify-center text-[10px] font-bold text-slate-950"
                  >
                    Informal 57.8%
                  </div>
                  <div
                    style={{ width: "42.2%" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-r-lg flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    Formal 42.2%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs text-slate-300">
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="font-bold text-amber-400 block mb-1">⚠️ Sektor Informal (57.80%)</span>
                    Pekerjaan lepas, harian, atau tanpa kontrak resmi. Minim perlindungan sosial, tidak memiliki jalur pengembangan karir terstruktur.
                  </div>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                    <span className="font-bold text-blue-400 block mb-1">💼 Solusi Doable!</span>
                    Mendorong pekerja informal menjadi freelancer profesional terverifikasi dengan portofolio tervalidasi dan workspace terstruktur.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 4. AKAR MASALAH: KESENJANGAN KUALIFIKASI (#kesenjangan) */}
      {/* ========================================================================= */}
      <section id="kesenjangan" className="py-24 bg-[#F8FAFC] border-y border-slate-200/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Stat Gauge Visuals with Fade-Up */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0}
              className="lg:col-span-6 space-y-6"
            >
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#254BE3]">
                <Info className="h-4 w-4" />
                RISET POPULIX &amp; KITALULUS (ANTARA)
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                Akar Masalah: Jurang Antara Kandidat &amp; Perusahaan
              </h2>

              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                Tinggi angka pengangguran bukan sekadar keterbatasan lowongan, melainkan adanya jarak kualifikasi. Tanpa pengalaman praktis dan portofolio nyata, pencari kerja kesulitan membuktikan kemampuan mereka.
              </p>

              {/* Dual Visual Ring Gauge Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* 63% Card with Animated Ring Meter */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl sm:text-4xl font-black text-blue-600"><CountUp to={63} duration={2} />%</span>
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="18" stroke="#E2E8F0" strokeWidth="4" fill="transparent" />
                        <circle
                          cx="24"
                          cy="24"
                          r="18"
                          stroke="#254BE3"
                          strokeWidth="4"
                          strokeDasharray="113"
                          strokeDashoffset="42"
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-slate-900">Pencari Kerja Terkendala</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Kesulitan memenuhi Syarat Pengalaman Kerja saat melamar pekerjaan pertama.
                    </p>
                  </div>
                </div>

                {/* 46% Card with Animated Ring Meter */}
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl sm:text-4xl font-black text-indigo-600"><CountUp to={46} duration={2} />%</span>
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="18" stroke="#E2E8F0" strokeWidth="4" fill="transparent" />
                        <circle
                          cx="24"
                          cy="24"
                          r="18"
                          stroke="#4F46E5"
                          strokeWidth="4"
                          strokeDasharray="113"
                          strokeDashoffset="61"
                          strokeLinecap="round"
                          fill="transparent"
                        />
                      </svg>
                    </div>
                    <h4 className="mt-2 text-sm font-bold text-slate-900">Perusahaan Kesulitan</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      Menemukan kandidat dengan Bukti Keterampilan &amp; Portofolio yang sesuai.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive Bridge Flow Simulator with Fade-Up */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0.2}
              className="lg:col-span-6"
            >
              <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xl relative">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
                  <span>Dampak Lingkaran Setan vs Solusi Doable!</span>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Interactive Comparison
                  </span>
                </h3>

                <div className="space-y-4">
                  {/* Step 1: Without Experience */}
                  <div className="p-4 rounded-2xl bg-red-50/70 border border-red-100 flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold text-xs">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-900 uppercase">
                        Tanpa Doable! (Jalur Lama)
                      </h4>
                      <p className="text-xs text-red-700 mt-1">
                        Melamar kerja <span className="font-bold text-red-500 mx-1">→</span> Ditolak karena &quot;Butuh Minimal 2 Thn Pengalaman&quot; <span className="font-bold text-red-500 mx-1">→</span> Terjebak di sektor informal low-level tanpa jalur karir.
                      </p>
                    </div>
                  </div>

                  {/* Flow Arrow */}
                  <div className="flex justify-center text-blue-600 my-1">
                    <Zap className="h-5 w-5 animate-bounce" />
                  </div>

                  {/* Step 2: With Doable! */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-3 shadow-sm">
                    <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-blue-900 uppercase">
                        Bersama Doable! (Solusi Integrasi)
                      </h4>
                      <p className="text-xs text-blue-800 mt-1">
                        Ambil Proyek Simulasi / Freelance <span className="font-bold text-blue-600 mx-1">→</span> Otomatis Terstruktur di Workspace <span className="font-bold text-blue-600 mx-1">→</span> Punya Portofolio Tervalidasi &amp; Siap Kerja.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Menjembatani Kualifikasi secara Praktis
                  </span>
                  <a href="#solusi-doable" className="font-bold text-blue-600 hover:underline">
                    Pelajari Fitur →
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SOLUSI DOABLE!: FUSI FIVERR X NOTION (#solusi-doable) */}
      {/* ========================================================================= */}
      <section id="solusi-doable" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUpVariants}
          customDelay={0}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-600 mb-3 border border-indigo-100">
            <Sparkles className="h-3.5 w-3.5" />
            FUSI MARKETPLACE &amp; WORKSPACE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Doable!: Gabungan Fiverr &amp; Notion dalam Satu Digital Space
          </h2>
          <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
            Klien dan freelancer tidak sekadar bertransaksi lalu berpisah, melainkan bekerja bersama dalam satu ruang kerja digital yang terintegrasi dari hari pertama.
          </p>
        </motion.div>

        {/* Interactive Role Switcher Tabs */}
        <div className="flex justify-center mb-10">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-2 border border-slate-200">
            <button
              onClick={() => setUserRoleTab("klien")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                userRoleTab === "klien"
                  ? "bg-white text-blue-600 shadow-md scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Untuk Klien (Posting Mudah)
            </button>
            <button
              onClick={() => setUserRoleTab("freelancer")}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                userRoleTab === "freelancer"
                  ? "bg-white text-blue-600 shadow-md scale-[1.02]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              Untuk Freelancer (Bangun Portofolio)
            </button>
          </div>
        </div>

        {/* Dynamic Card Content with Fade-Up */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={fadeUpVariants}
          customDelay={0.2}
          className="rounded-3xl border border-slate-200 bg-white p-8 lg:p-12 shadow-xl"
        >
          <AnimatePresence mode="wait">
            {userRoleTab === "klien" ? (
              <motion.div
                key="klien"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                    ALUR KLIEN INSTAN
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Post Proyek Cepat Tanpa Pusing Susun Struktur dari Nol
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Cukup isi 4 informasi sederhana: Judul, Deskripsi Singkat, Kategori, dan Deadline. Sistem Doable! langsung menggenerate struktur proyek komprehensif secara otomatis.
                  </p>

                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      Auto-generated timeline &amp; Gantt chart sesuai kategori
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      Manajemen task breakdown otomatis tanpa aplikasi pihak ketiga
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                      Akses talenta berkualitas dengan biaya efisien
                    </li>
                  </ul>
                </div>

                {/* Interactive Form Simulator Mockup */}
                <div className="lg:col-span-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-700">Form Posting Proyek Baru</span>
                    <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                      Auto-Structured
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                        Judul Proyek
                      </label>
                      <div className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800">
                        Desain Maskot &amp; Brand Guidelines Kopi
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Kategori
                        </label>
                        <div className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800">
                          Desain Grafis &amp; Branding
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                          Deadline
                        </label>
                        <div className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800">
                          7 Hari Kerja
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-[#254BE3] text-white font-bold py-2.5 rounded-xl text-xs text-center shadow-md cursor-pointer hover:bg-blue-800 transition-colors">
                        ✓ Post Proyek &amp; Generate Workspace
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="freelancer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-4">
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                    ALUR FREELANCER &amp; PEMULA
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    Temukan Proyek, Kerjakan di Workspace, Bangun Portofolio
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Dari pemula hingga expert, temukan proyek yang pas dengan keterampilan Anda. Setiap pekerjaan yang diselesaikan otomatis menjadi bukti portofolio nyata di profil Anda.
                  </p>

                  <ul className="space-y-2.5 pt-2 text-xs sm:text-sm text-slate-700">
                    <li className="flex items-center gap-2.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Langkah kerja pertama sudah jelas dari task breakdown otomatis
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Bisa mengerjakan Dummy Projects untuk portofolio awal 0-to-1
                    </li>
                    <li className="flex items-center gap-2.5 font-semibold">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Visualisasi konsistensi kerja via GitHub-style Green Box Streak
                    </li>
                  </ul>
                </div>

                {/* Interactive Freelancer Portfolio Preview */}
                <div className="lg:col-span-6 bg-slate-900 rounded-2xl p-6 text-white shadow-inner">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold">
                        FP
                      </div>
                      <span className="text-xs font-bold">Profil Freelancer Verified</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                      ● KTP Verified
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-white block">Portofolio Selesai</span>
                        <span className="text-[10px] text-slate-400">
                          <CountUp to={12} duration={1.5} /> Proyek Real + <CountUp to={3} duration={1.5} /> Dummy Projects
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">
                        <CountUp to={100} duration={1.5} />% On-Time
                      </span>
                    </div>

                    <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold mb-1.5">
                        Work Streak Konsistensi
                      </span>
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                        {Array.from({ length: 14 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-4 w-4 rounded-xs shrink-0 ${
                              i % 3 === 0
                                ? "bg-emerald-500"
                                : i % 2 === 0
                                ? "bg-emerald-400"
                                : "bg-slate-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WORKSPACE OTOMATIS & GAMIFIKASI STREAK (#workspace-fitur) */}
      {/* ========================================================================= */}
      <section id="workspace-fitur" className="py-24 bg-[#F8FAFC] border-y border-slate-200/60 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-600 mb-3 border border-blue-100">
              <Layers className="h-3.5 w-3.5" />
              INTEGRATED WORKSPACE FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Workspace Otomatis &amp; Gamifikasi Streak
            </h2>
            <p className="mt-4 text-slate-600 leading-relaxed text-sm sm:text-base">
              Tanpa komunikasi yang tercecer di WhatsApp atau file hilang di jalan. Semua task, timeline, dan percakapan dalam satu tempat yang aman.
            </p>
          </motion.div>

          {/* Interactive Gantt Chart Simulator with Fade-Up */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0.1}
            className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl mb-12"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest block">
                  DEMO TIMELINE WORKFLOW OTOMATIS
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                  Auto-Generated Gantt &amp; Task Breakdown
                </h3>
              </div>

              {/* Category Selector Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setGanttCategory("logo")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    ganttCategory === "logo"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Desain Logo
                </button>
                <button
                  onClick={() => setGanttCategory("web")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    ganttCategory === "web"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Web App
                </button>
                <button
                  onClick={() => setGanttCategory("content")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    ganttCategory === "content"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Content Kit
                </button>
              </div>
            </div>

            {/* Gantt Phase List */}
            <div className="mt-6 space-y-3">
              {ganttWorkflows[ganttCategory].map((item) => {
                const isActive = activeGanttStep === item.step;
                return (
                  <div
                    key={item.step}
                    onClick={() => setActiveGanttStep(item.step)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isActive
                        ? "border-blue-500 bg-blue-50/40 shadow-sm"
                        : "border-slate-100 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          item.progress === 100
                            ? "bg-emerald-100 text-emerald-700"
                            : isActive
                            ? "bg-blue-600 text-white animate-pulse"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {item.progress === 100 ? "✓" : item.step}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800">
                        {item.title}
                      </span>
                    </div>

                    {/* Progress Bar & Status Pill */}
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="flex-1 md:w-48 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.progress}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-full ${
                            item.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                        {item.duration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* 3 Grid Feature Highlights: Work Hub, Streak, KTP Verification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Centralized Hub */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0.1}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Centralized Work Hub</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Semua Task, Live Chat, dan File Delivery tersimpan aman di satu tempat. Tidak ada instruksi nyasar atau file kadaluarsa.
              </p>
            </motion.div>

            {/* Feature 2: Interactive GitHub Streak Calendar */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0.2}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Flame className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    🔥 <CountUp to={18} duration={1.5} /> Day Streak
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">Gamifikasi Streak ala GitHub</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Hover pada kotak hijau untuk melihat histori tugas yang diselesaikan:
                </p>
              </div>

              {/* Interactive Calendar Grid */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-7 gap-1.5">
                  {streakDays.map((item) => (
                    <div
                      key={item.day}
                      onMouseEnter={() => setHoveredStreakDay(item)}
                      onMouseLeave={() => setHoveredStreakDay(null)}
                      className={`h-5 w-5 rounded-xs transition-transform hover:scale-125 cursor-pointer ${
                        item.intensity === 0
                          ? "bg-slate-100 hover:bg-slate-300"
                          : item.intensity === 1
                          ? "bg-emerald-200"
                          : item.intensity === 2
                          ? "bg-emerald-400"
                          : item.intensity === 3
                          ? "bg-emerald-600"
                          : "bg-emerald-700 shadow-sm"
                      }`}
                    />
                  ))}
                </div>

                {/* Tooltip detail box */}
                <div className="h-6 mt-2 text-[10px] font-semibold text-slate-500">
                  {hoveredStreakDay ? (
                    <span className="text-emerald-700">
                      📅 {hoveredStreakDay.date}: {hoveredStreakDay.count} Tugas Selesai
                    </span>
                  ) : (
                    <span>Hover kotak untuk detail histori</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Feature 3: KTP / Passport Verification */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0.3}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm hover:shadow-xl transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verifikasi KTP/Paspor</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Setiap pengguna terverifikasi melalui data identitas resmi untuk menjamin ekosistem transaksi yang aman dan profesional.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. DUMMY PROJECTS & AKSES UMKM (#dummy-projects) */}
      {/* ========================================================================= */}
      <section id="dummy-projects" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Explanatory Copy with Fade-Up */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0}
            className="lg:col-span-5 space-y-6"
          >
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#254BE3]">
              <GraduationCap className="h-4 w-4" />
              SOLUSI 0-TO-1 PORTOFOLIO
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Dummy Projects untuk Pemula &amp; Talenta Real untuk UMKM
            </h2>

            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Bagi freelancer pemula, Doable! menyediakan proyek simulasi dengan brief realistis. Kerjakan dari nol, pajang hasilnya di profil, dan tunjukkan bukti kemampuan nyata kepada klien sungguhan.
            </p>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <h4 className="text-xs font-bold text-blue-900 uppercase">
                Keuntungan Bagi UMKM &amp; Klien
              </h4>
              <p className="mt-1 text-xs text-blue-800 leading-relaxed">
                Daripada menggunakan hasil desain AI yang generik, UMKM bisa mendapatkan sentuhan desainer berbakat dengan harga bersahabat karena freelancer pemula memprioritaskan pembentukan portofolio.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Interactive Dummy Brief Simulator Card with Fade-Up */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0.2}
            className="lg:col-span-7"
          >
            <div className="rounded-3xl border border-slate-200 bg-white p-7 sm:p-8 shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
                  SIMULATOR BRIEF DUMMY PROJECT
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  100% Free Portfolio Builder
                </span>
              </div>

              {/* Brief Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
                {dummyBriefs.map((brief, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDummyBrief(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      selectedDummyBrief === idx
                        ? "bg-[#254BE3] text-white shadow-md scale-[1.02]"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Brief #{idx + 1}: {brief.category}
                  </button>
                ))}
              </div>

              {/* Selected Brief Active Card */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase">
                      {dummyBriefs[selectedDummyBrief].level}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 mt-1.5">
                      {dummyBriefs[selectedDummyBrief].title}
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                    {dummyBriefs[selectedDummyBrief].xp}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {dummyBriefs[selectedDummyBrief].description}
                </p>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1.5">
                    Keterampilan yang Dilatih
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {dummyBriefs[selectedDummyBrief].skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    Status: <strong className="text-slate-800">{dummyBriefs[selectedDummyBrief].status}</strong>
                  </span>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Mulai Kerjakan Brief ini →
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. DUKUNGAN TERHADAP SDG 8 & SDG 9 (#sdg-impact) */}
      {/* ========================================================================= */}
      <section id="sdg-impact" className="py-24 bg-[#0F172A] text-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3.5 py-1 text-xs font-bold text-blue-400 mb-3 border border-blue-500/30">
              <Globe className="h-3.5 w-3.5" />
              SUSTAINABLE DEVELOPMENT GOALS
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Mendukung SDG 8 &amp; SDG 9 untuk Indonesia
            </h2>
            <p className="mt-4 text-slate-400 leading-relaxed text-sm sm:text-base">
              Doable! berkomitmen mendorong pertumbuhan ekonomi inklusif dan pengembangan infrastruktur talenta digital modern.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
            {/* SDG 8 Card with Fade-Up */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0.1}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl hover:border-rose-500/50 transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                    SDG <CountUp from={1} to={8} duration={1} />
                  </div>
                  <span className="text-[11px] font-bold text-rose-400/90 uppercase tracking-wider bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 text-right">
                    DECENT WORK &amp; ECONOMIC GROWTH
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2.5 tracking-tight group-hover:text-rose-300 transition-colors">
                  Pekerjaan Layak &amp; Pertumbuhan Ekonomi
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Menciptakan peluang kerja berbasis teknologi yang inklusif, memberi jalur karir nyata dan terstruktur bagi generasi muda agar keluar dari keterjebakan pekerjaan informal tanpa jaminan.
                </p>
              </div>
            </motion.div>

            {/* SDG 9 Card with Fade-Up */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={fadeUpVariants}
              customDelay={0.2}
              className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-xl hover:border-amber-500/50 transition-all hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="h-11 w-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 shadow-inner">
                    SDG <CountUp from={1} to={9} duration={1} />
                  </div>
                  <span className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-right">
                    INDUSTRY, INNOVATION &amp; INFRASTRUCTURE
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2.5 tracking-tight group-hover:text-amber-300 transition-colors">
                  Industri, Inovasi &amp; Infrastruktur Digital
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  Mengembangkan sistem digital modern yang menghubungkan klien dan freelancer, serta membangun infrastruktur talenta digital yang kompetitif dan siap kerja di tingkat global.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Final Call to Action Box with Fade-Up */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={fadeUpVariants}
            customDelay={0.3}
            className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden"
          >
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
              Siap Memulai Langkah Pertama Anda Bersama Doable!?
            </h3>
            <p className="mt-4 text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
              Bergabunglah sekarang sebagai klien atau freelancer untuk merasakan pengalaman bekerja di workspace terintegrasi.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-8 py-3.5 text-sm sm:text-base font-bold text-blue-700 shadow-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
              >
                <span>GET STARTED NOW</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 bg-slate-50 py-12 px-6 lg:px-12 text-slate-700">
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
              &copy; {new Date().getFullYear()} Doable! Indonesia. Bridging skills &amp; opportunities through integrated digital workspace.
            </p>
          </div>

          {/* Right Navigation & Legal Links */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-slate-600">
            <a href="#our-story" className="hover:text-blue-600 transition-colors">
              Our Story
            </a>
            <a href="#realitas-data" className="hover:text-blue-600 transition-colors">
              BPS Data 2026
            </a>
            <a href="#kesenjangan" className="hover:text-blue-600 transition-colors">
              Kesenjangan
            </a>
            <a href="#solusi-doable" className="hover:text-blue-600 transition-colors">
              Workspace
            </a>
            <a href="#dummy-projects" className="hover:text-blue-600 transition-colors">
              Dummy Projects
            </a>
            <a href="#sdg-impact" className="hover:text-blue-600 transition-colors">
              SDG 8 &amp; 9
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


