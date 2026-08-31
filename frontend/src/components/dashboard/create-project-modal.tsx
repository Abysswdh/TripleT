"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ShieldCheck,
  Send,
  Palette,
  Globe,
  Camera,
  MapPin,
  FileText,
  TrendingUp,
  Calendar,
  Clock,
  Check,
  Plus,
  Trash2,
  FileCode,
  Link as LinkIcon,
  CreditCard,
  Building2,
  QrCode,
  Users,
  Lock,
  Star,
  CheckSquare,
  Search,
  ChevronDown,
  Bot,
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { analyzeProjectBrief } from "@/lib/services/ai-project-analyzer";
import { createClient } from "@/lib/supabase/client";
import logoWithoutText from "@/assets/logo_wo_text.svg";

// Dynamically import Silk with SSR disabled so WebGL canvas initializes cleanly on client
const Silk = dynamic(() => import("@/components/ui/silk"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-br from-[#120B54] via-[#1E1794] to-[#2C1BDE] animate-pulse" />
  ),
});

const TOTAL_STEPS = 6;

const STEP_INFO: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Info & Klasifikasi Pekerjaan",
    desc: "Tentukan judul, domain keahlian, skala pengerjaan, dan visibilitas rekrutmen.",
  },
  2: {
    title: "Scope & Detail Kebutuhan",
    desc: "Jelaskan kebutuhan kerja, target hasil utama, dan sasaran pengguna.",
  },
  3: {
    title: "Keahlian & Kriteria Talenta",
    desc: "Pilih keahlian yang dibutuhkan, level pengalaman, dan pertanyaan skrining.",
  },
  4: {
    title: "Referensi & Format Serah Terima",
    desc: "Lampirkan link acuan/bahan serta tentukan format output deliverable dan revisi.",
  },
  5: {
    title: "Timeline & Jadwal Pengerjaan",
    desc: "Tentukan durasi pengerjaan dan tinjau pembagian tahapan tugas otomatis.",
  },
  6: {
    title: "Alokasi Budget & Garansi Dana Aman",
    desc: "Atur anggaran, simulasi pencairan bertahap, dan preferensi metode pembayaran aman.",
  },
  7: {
    title: "Proyek Siap Dipublikasikan!",
    desc: "Proyekmu kini aktif dalam status hiring dan siap menerima proposal talenta.",
  },
};

// 6 Universal Top Categories for Doable!
const TOP_CATEGORIES = [
  { id: "Desain Grafis & Branding", label: "Desain & Branding", icon: Palette, desc: "Poster UMKM, Logo, Feed IG, Kemasan, UI/UX" },
  { id: "Foto, Video & Kreatif", label: "Foto & Video Kreatif", icon: Camera, desc: "Foto Produk, Reels/TikTok, Video Editing" },
  { id: "Tugas Lapangan & On-Site", label: "Tugas Lokal / On-Site", icon: MapPin, desc: "Foto Tempat/Bali, Cek Lokasi, Survei, Event" },
  { id: "Web & Digital Engineering", label: "Web & IT Engineering", icon: Globe, desc: "Website Bisnis, Landing Page, App, Coding" },
  { id: "Penulisan & Virtual Admin", label: "Penulisan & Admin", icon: FileText, desc: "Copywriting Iklan, Artikel, Data Entry" },
  { id: "Pemasaran & Bisnis UMKM", label: "Marketing & Promosi", icon: TrendingUp, desc: "Kelola Sosmed, Setup Ads, Riset Pasar" },
];

// All Subcategories for "Pilih Kategori Lainnya" Directory
const ALL_CATEGORIES_DIRECTORY: Record<string, string[]> = {
  "Desain & Kreatif": [
    "Desain Poster & Brosur UMKM",
    "Desain Logo & Identitas Brand",
    "Desain Kemasan Produk (Packaging)",
    "Desain Feed & Story Media Sosial",
    "UI/UX Design Web & Mobile",
    "Ilustrasi & Desain Vektor",
  ],
  "Foto, Video & Audio": [
    "Fotografi Produk & Katalog Olshop",
    "Video Reels, TikTok & Shorts",
    "Editing Video YouTube & Promosi",
    "Voice Over & Audio Podcast",
    "Fotografi Model & Event",
  ],
  "Tugas Lapangan & On-Site (Real-World Gigs)": [
    "Foto & Verifikasi Lokasi Khusus (Bali, Jogja, dll.)",
    "Survei Lapangan & Mystery Shopper",
    "Pengecekan Fisik Tempat / Properti",
    "Bantuan Logistik & Pendampingan Event",
  ],
  "Web, Aplikasi & Software": [
    "Website Profil Bisnis & UMKM",
    "Landing Page Penjualan Responsif",
    "Aplikasi Mobile (Flutter / React Native)",
    "Otomasi Bot & Integrasi AI",
    "Perbaikan Bug & Maintenance Web",
  ],
  "Penulisan & Bantuan Operasional": [
    "Copywriting Iklan & Caption Jualan",
    "Penulisan Artikel Blog & SEO",
    "Admin Toko Online & Data Entry",
    "Penerjemahan Dokumen & Transkripsi",
  ],
  "Pemasaran Digital & Social Media": [
    "Manajemen Akun Media Sosial UMKM",
    "Setup Iklan Meta Ads (Instagram/FB)",
    "Setup Google Ads & Local Business",
    "Riset Kompetitor & Tren Pasar",
  ],
};

const POPULAR_SKILLS: Record<string, string[]> = {
  "Desain Grafis & Branding": ["Canva", "Photoshop", "Illustrator", "Figma", "CorelDraw", "Poster Design", "Logo Design", "Branding"],
  "Foto, Video & Kreatif": ["CapCut", "Premiere Pro", "Lightroom", "Video Editing", "Color Grading", "Product Photo", "Storyboarding"],
  "Tugas Lapangan & On-Site": ["Fotografi Smartphone", "Survei Lapangan", "Komunikasi Lokal", "Verifikasi Alamat", "Mobilitas Tinggi"],
  "Web & Digital Engineering": ["Next.js", "WordPress", "React", "Tailwind CSS", "HTML/CSS", "PHP/Laravel", "TypeScript", "Python"],
  "Penulisan & Virtual Admin": ["Copywriting", "SEO Content", "Microsoft Excel", "Google Sheets", "Penerjemahan", "Data Entry"],
  "Pemasaran & Bisnis UMKM": ["Meta Ads", "Instagram Marketing", "TikTok Ads", "Google Ads", "Canva", "Analisis Pasar"],
};

export interface GanttTaskDraft {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  milestonePhase: "Milestone 1" | "Milestone 2";
}

export interface CreatedProject {
  id: string;
  title: string;
  category: string;
  budget: string;
  budgetNumeric: number;
  status: "Hiring" | "In Progress" | "Completed";
  proposalsCount: number;
  dueDate: string;
  postedDate: string;
  description: string;
  skills: string[];
  difficulty: "Starter" | "Standard" | "Enterprise";
  milestones?: Array<{
    id: string;
    title: string;
    amount: string;
    status: string;
    dueDate: string;
  }>;
  applicants?: unknown[];
}

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newProject: CreatedProject) => void;
  initialData?: {
    title?: string;
    category?: string;
    description?: string;
    skills?: string[];
    budget?: string;
    durationDays?: string;
    difficulty?: "Starter" | "Standard" | "Enterprise";
  };
}

// Universal Roadmap Generator based on category and duration
function computeSprintTasks(category: string, durationDays: number): GanttTaskDraft[] {
  const parsedDays = Math.max(2, durationDays || 3);
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const p1Days = Math.max(1, Math.floor(parsedDays * 0.4));
  const p2Days = Math.max(1, parsedDays - p1Days);

  const d1Start = new Date(now);
  const d1End = new Date(d1Start.getTime() + (p1Days - 1) * dayMs);

  const d2Start = new Date(d1End.getTime() + dayMs);
  const d2End = new Date(d1Start.getTime() + (parsedDays - 1) * dayMs);

  // Divide milestone 2 into 2 sequential sub-tasks safely without exceeding d2End
  const p2HalfDays = Math.max(0, Math.floor((p2Days - 1) / 2));
  const d2MidEnd = new Date(Math.min(d2Start.getTime() + p2HalfDays * dayMs, d2End.getTime()));
  const d3Start = new Date(Math.min(d2MidEnd.getTime() + dayMs, d2End.getTime()));

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  if (category.includes("Desain") || category.includes("Foto") || category.includes("Video")) {
    return [
      {
        id: "task-1",
        name: "Pengumpulan Materi, Moodboard & Konsep Draft",
        startDate: fmt(d1Start),
        endDate: fmt(d1End),
        milestonePhase: "Milestone 1",
      },
      {
        id: "task-2",
        name: "Produksi Visual Utama & Penyesuaian Detail",
        startDate: fmt(d2Start),
        endDate: fmt(d2MidEnd),
        milestonePhase: "Milestone 2",
      },
      {
        id: "task-3",
        name: "Ekspor File High-Res & Serah Terima File Master",
        startDate: fmt(d3Start),
        endDate: fmt(d2End),
        milestonePhase: "Milestone 2",
      },
    ];
  }

  if (category.includes("Lapangan") || category.includes("Tugas") || category.includes("On-Site")) {
    return [
      {
        id: "task-1",
        name: "Briefing Rinci Titik Lokasi & Jadwal Eksekusi",
        startDate: fmt(d1Start),
        endDate: fmt(d1End),
        milestonePhase: "Milestone 1",
      },
      {
        id: "task-2",
        name: "Eksekusi Lapangan & Pengambilan Foto/Data",
        startDate: fmt(d2Start),
        endDate: fmt(d2MidEnd),
        milestonePhase: "Milestone 2",
      },
      {
        id: "task-3",
        name: "Kurasi Hasil & Upload ke Cloud Storage Klien",
        startDate: fmt(d3Start),
        endDate: fmt(d2End),
        milestonePhase: "Milestone 2",
      },
    ];
  }

  // Default Universal Project
  return [
    {
      id: "task-1",
      name: "Perencanaan Awal, Analisis Kebutuhan & Draft",
      startDate: fmt(d1Start),
      endDate: fmt(d1End),
      milestonePhase: "Milestone 1",
    },
    {
      id: "task-2",
      name: "Pengerjaan Deliverables Utama Sesuai Target",
      startDate: fmt(d2Start),
      endDate: fmt(d2MidEnd),
      milestonePhase: "Milestone 2",
    },
    {
      id: "task-3",
      name: "Review Bersama, Penyesuaian & Serah Terima Final",
      startDate: fmt(d3Start),
      endDate: fmt(d2End),
      milestonePhase: "Milestone 2",
    },
  ];
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: CreateProjectModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State - Step 1: Info & Classification
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Desain Grafis & Branding");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState("");
  const [difficulty, setDifficulty] = useState<"Starter" | "Standard" | "Enterprise">("Starter");
  const [hiringMode, setHiringMode] = useState<"public" | "private">("public");

  // AI Typing Debounce & State Tracking
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTitleRef = useRef("");

  // Form State - Step 2: Scope & Deliverables
  const [description, setDescription] = useState("");
  const [objectives, setObjectives] = useState<string[]>([
    "Pahami konsep dan referensi acuan dari klien",
    "Selesaikan pengerjaan deliverable sesuai batas waktu",
  ]);
  const [newObjectiveInput, setNewObjectiveInput] = useState("");
  const [targetAudience, setTargetAudience] = useState("B2C / Konsumen & Publik");

  // Form State - Step 3: Tech Stack & Talent Tier
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Canva", "Photoshop"]);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"Junior" | "Intermediate" | "Senior">("Junior");
  const [screeningQuestion, setScreeningQuestion] = useState("Sertakan link contoh hasil karya serupa yang pernah Anda buat.");

  // Form State - Step 4: Universal References & Handover Terms
  const [referenceUrl, setReferenceUrl] = useState("");
  const [assetsUrl, setAssetsUrl] = useState("");
  const [freeRevisions, setFreeRevisions] = useState<"1x" | "2x" | "3x">("2x");
  const [requiredDeliverables, setRequiredDeliverables] = useState<string[]>([
    "File Final Siap Pakai / High-Res (PNG, JPG, PDF, MP4, dsb.)",
    "File Mentahan Asli / Editable (AI, PSD, RAW, Word, Code)",
    "Link Penyimpanan Cloud (Google Drive / Dropbox)",
  ]);
  const [customDeliverableInput, setCustomDeliverableInput] = useState("");

  // Form State - Step 5: Timeline & Gantt Tasks
  const [durationDays, setDurationDays] = useState("3");
  const [ganttTasks, setGanttTasks] = useState<GanttTaskDraft[]>([]);
  const [newTaskName, setNewTaskName] = useState("");

  // Form State - Step 6: Budget & Escrow Preference
  const [budget, setBudget] = useState("150000");
  const [paymentMethodPreference, setPaymentMethodPreference] = useState<"va" | "qris" | "cc">("qris");

  // Fast-Match Talent State (Step 7)
  const [invitedTalents, setInvitedTalents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // AI Semantic Auto-Tuner with 500ms (1/2 second) Debounce
  const executeAiAutoTuning = async (rawTitle: string) => {
    if (!rawTitle.trim() || rawTitle.trim().length < 3) return;

    setIsAnalyzingAI(true);
    try {
      const analysis = await analyzeProjectBrief(rawTitle, description);

      // Guard: Ignore stale async responses if user has typed a newer title
      if (rawTitle !== latestTitleRef.current) return;

      if (analysis) {
        // Step 1 Updates
        setCategory(analysis.category);
        setDifficulty(analysis.difficulty);

        // Step 2 Objectives Update if standard
        if (analysis.suggestedObjectives && analysis.suggestedObjectives.length > 0) {
          setObjectives(analysis.suggestedObjectives);
        }

        // Step 3 Skills & Experience Updates
        setExperienceLevel(analysis.experienceLevel);
        if (analysis.suggestedSkills && analysis.suggestedSkills.length > 0) {
          setSelectedSkills(analysis.suggestedSkills);
        }

        // Step 4 Deliverables Updates
        if (analysis.suggestedDeliverables && analysis.suggestedDeliverables.length > 0) {
          setRequiredDeliverables(analysis.suggestedDeliverables);
        }

        // Step 5 Timeline Updates
        if (analysis.suggestedDurationDays) {
          setDurationDays(analysis.suggestedDurationDays.toString());
          setGanttTasks(computeSprintTasks(analysis.category, analysis.suggestedDurationDays));
        }

        // Step 6 Budget Updates
        if (analysis.suggestedBudget) {
          setBudget(analysis.suggestedBudget.toString());
        }
      }
    } catch (err) {
      console.warn("AI parse error:", err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    latestTitleRef.current = val;

    // Clear previous timer if user continues typing
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Trigger analysis exactly 500ms (1/2 detik) after user stops typing
    debounceTimerRef.current = setTimeout(() => {
      executeAiAutoTuning(val);
    }, 500);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // Update initial data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSubmitting(false);
      setShowCategoryPicker(false);
      if (initialData) {
        if (initialData.title !== undefined) {
          setTitle(initialData.title);
          executeAiAutoTuning(initialData.title);
        }
        if (initialData.category !== undefined) setCategory(initialData.category);
        if (initialData.description !== undefined) setDescription(initialData.description);
        if (initialData.skills !== undefined && initialData.skills.length > 0) setSelectedSkills(initialData.skills);
        if (initialData.budget !== undefined) setBudget(initialData.budget);
        if (initialData.durationDays !== undefined) setDurationDays(initialData.durationDays);
        if (initialData.difficulty !== undefined) setDifficulty(initialData.difficulty);
      }
      // Initialize Gantt tasks
      const days = parseInt(initialData?.durationDays || durationDays || "3", 10);
      setGanttTasks(computeSprintTasks(initialData?.category || category, days));
    }
  }, [isOpen, initialData]);

  // Update default skill suggestions when category changes
  const suggestedSkills = useMemo(() => {
    const matched = Object.keys(POPULAR_SKILLS).find((key) => category.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(category.toLowerCase()));
    return matched ? POPULAR_SKILLS[matched] : ["Canva", "Photoshop", "Komunikasi Cepat", "Tepat Waktu", "Kreatif"];
  }, [category]);

  // Matched talents demo list based on selected category & skills
  const matchedTalents = useMemo(
    () => [
      {
        id: "t-1",
        name: "Rangga Pratama",
        role: `${category} Specialist`,
        skills: selectedSkills.slice(0, 3),
        rating: 4.9,
        reviewsCount: 28,
        matchScore: 98,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "t-2",
        name: "Siti Nurhaliza",
        role: "Verified Doable! Freelancer",
        skills: selectedSkills.slice(1, 4),
        rating: 5.0,
        reviewsCount: 34,
        matchScore: 95,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      },
      {
        id: "t-3",
        name: "Wayan Danu",
        role: "Local Gig & Creative Expert",
        skills: [selectedSkills[0] || "Creative", "Fast Response"],
        rating: 4.8,
        reviewsCount: 19,
        matchScore: 91,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      },
    ],
    [category, selectedSkills]
  );

  // Filtered categories for the category directory modal/dropdown
  const filteredCategoryDirectory = useMemo(() => {
    if (!categorySearchQuery.trim()) return ALL_CATEGORIES_DIRECTORY;
    const query = categorySearchQuery.toLowerCase();
    const result: Record<string, string[]> = {};

    Object.entries(ALL_CATEGORIES_DIRECTORY).forEach(([group, items]) => {
      const matchedItems = items.filter((item) => item.toLowerCase().includes(query) || group.toLowerCase().includes(query));
      if (matchedItems.length > 0) {
        result[group] = matchedItems;
      }
    });

    return result;
  }, [categorySearchQuery]);

  // Re-compute default Gantt tasks when category or duration changes
  const handleDurationChange = (val: string) => {
    setDurationDays(val);
    const parsed = parseInt(val || "3", 10);
    if (!isNaN(parsed) && parsed > 0) {
      setGanttTasks(computeSprintTasks(category, parsed));
    }
  };

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setShowCategoryPicker(false);
    setCategorySearchQuery("");
    const parsed = parseInt(durationDays || "3", 10);
    setGanttTasks(computeSprintTasks(catName, parsed));

    // Auto-suggest relevant skills if category changed manually
    const matchedKey = Object.keys(POPULAR_SKILLS).find((k) => catName.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(catName.toLowerCase()));
    if (matchedKey && POPULAR_SKILLS[matchedKey]) {
      setSelectedSkills(POPULAR_SKILLS[matchedKey].slice(0, 3));
    }
  };

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        if (showCategoryPicker) {
          setShowCategoryPicker(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, showCategoryPicker, onClose]);

  if (!mounted || !isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && customSkillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(customSkillInput.trim())) {
        setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      }
      setCustomSkillInput("");
    }
  };

  const handleAddObjective = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || !("key" in e)) {
      if ("preventDefault" in e) e.preventDefault();
      if (newObjectiveInput.trim()) {
        setObjectives([...objectives, newObjectiveInput.trim()]);
        setNewObjectiveInput("");
      }
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const toggleDeliverableCheck = (item: string) => {
    if (requiredDeliverables.includes(item)) {
      setRequiredDeliverables(requiredDeliverables.filter((d) => d !== item));
    } else {
      setRequiredDeliverables([...requiredDeliverables, item]);
    }
  };

  const handleAddCustomDeliverable = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (("key" in e && e.key === "Enter") || !("key" in e)) {
      if ("preventDefault" in e) e.preventDefault();
      if (customDeliverableInput.trim()) {
        if (!requiredDeliverables.includes(customDeliverableInput.trim())) {
          setRequiredDeliverables([...requiredDeliverables, customDeliverableInput.trim()]);
        }
        setCustomDeliverableInput("");
      }
    }
  };

  const handleAddGanttTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const now = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const newTask: GanttTaskDraft = {
      id: `task-${Date.now()}`,
      name: newTaskName.trim(),
      startDate: fmt(now),
      endDate: fmt(new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)),
      milestonePhase: "Milestone 2",
    };
    setGanttTasks([...ganttTasks, newTask]);
    setNewTaskName("");
  };

  const handleRemoveGanttTask = (taskId: string) => {
    setGanttTasks(ganttTasks.filter((t) => t.id !== taskId));
  };

  const handleInviteTalent = (talentId: string) => {
    setInvitedTalents((prev) => ({ ...prev, [talentId]: true }));
  };

  const parsedBudget = parseInt(budget.replace(/\D/g, "") || "150000", 10);
  const formattedBudget = `Rp ${parsedBudget.toLocaleString("id-ID")}`;
  const parsedDuration = parseInt(durationDays || "3", 10);
  const m1Amount = Math.round(parsedBudget * 0.4);
  const m2Amount = parsedBudget - m1Amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let createdProjectId = `proj-${Date.now()}`;

      if (!user) {
        console.warn("User is not authenticated. Project created as local preview.");
        alert("Perhatian: Anda belum login. Proyek disimpan secara lokal untuk sesi ini.");
      } else {
        // 1. Ensure user exists in public.users
        await supabase.from("users").upsert(
          {
            id: user.id,
            email: user.email || `${user.id}@user.local`,
            full_name: user.user_metadata?.full_name || "Klien Doable!",
            role: "customer",
            is_active: true,
            is_verified: true,
            onboarding_completed: true,
          },
          { onConflict: "id" }
        );

        // 2. Insert into Supabase projects table
        const { data: projectData, error: projectError } = await supabase
          .from("projects")
          .insert({
            owner_id: user.id,
            title: title || "Proyek Baru Doable!",
            description: description || "Deskripsi kebutuhan proyek / pekerjaan.",
            category: category,
            required_skills: selectedSkills.length > 0 ? selectedSkills : ["Canva", "Kreatif"],
            difficulty: difficulty,
            experience_level: experienceLevel,
            budget_type: "fixed",
            budget_min: parsedBudget,
            budget_max: parsedBudget,
            budget_display: formattedBudget,
            timeline_days: parsedDuration,
            status: "hiring",
            objectives: objectives,
            posted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (projectError) {
          console.error("Error inserting project into Supabase:", projectError);
          alert(`Gagal menyimpan ke Supabase: ${projectError.message}`);
        } else if (projectData) {
          createdProjectId = projectData.id;

          // 3. Insert milestones into Supabase milestones table
          const { data: createdMilestones, error: msError } = await supabase
            .from("milestones")
            .insert([
              {
                project_id: projectData.id,
                phase: "Milestone 1",
                title: "Milestone 1: Konsep, Draft Awal & Materi",
                percentage: 40,
                amount: m1Amount,
                amount_display: `Rp ${m1Amount.toLocaleString("id-ID")}`,
                deliverables: requiredDeliverables.slice(0, 2),
                sort_order: 1,
              },
              {
                project_id: projectData.id,
                phase: "Milestone 2",
                title: "Milestone 2: Finalisasi Output & Serah Terima",
                percentage: 60,
                amount: m2Amount,
                amount_display: `Rp ${m2Amount.toLocaleString("id-ID")}`,
                deliverables: requiredDeliverables,
                sort_order: 2,
              },
            ])
            .select();

          if (msError) {
            console.error("Error inserting milestones:", msError);
          }

          // 4. Insert Gantt Tasks into Supabase project_tasks table
          const m1Id = createdMilestones?.[0]?.id || null;
          const m2Id = createdMilestones?.[1]?.id || null;

          const tasksToInsert = ganttTasks.map((t, idx) => ({
            project_id: projectData.id,
            milestone_id: t.milestonePhase === "Milestone 1" ? m1Id : m2Id,
            name: t.name,
            status: idx === 0 ? "in_progress" : "planned",
            start_date: t.startDate,
            end_date: t.endDate,
            sort_order: idx + 1,
            is_auto_generated: true,
          }));

          if (tasksToInsert.length > 0) {
            const { error: taskError } = await supabase
              .from("project_tasks")
              .insert(tasksToInsert);
            if (taskError) {
              console.error("Error inserting project_tasks:", taskError);
            }
          }
        }
      }

      const newProj: CreatedProject = {
        id: createdProjectId,
        title: title || "Proyek Baru Doable!",
        category,
        budget: formattedBudget,
        budgetNumeric: parsedBudget,
        status: "Hiring",
        proposalsCount: 0,
        dueDate: `${parsedDuration} hari`,
        postedDate: "Baru saja",
        description: description || "Deskripsi kebutuhan proyek / pekerjaan.",
        skills: selectedSkills.length > 0 ? selectedSkills : ["Canva", "Kreatif"],
        difficulty,
        milestones: [
          {
            id: `m-${Date.now()}-1`,
            title: "Milestone 1: Konsep, Draft Awal & Materi",
            amount: `Rp ${m1Amount.toLocaleString("id-ID")}`,
            status: "pending",
            dueDate: `${Math.round(parsedDuration * 0.4)} hari`,
          },
          {
            id: `m-${Date.now()}-2`,
            title: "Milestone 2: Finalisasi Output & Serah Terima",
            amount: `Rp ${m2Amount.toLocaleString("id-ID")}`,
            status: "pending",
            dueDate: `${parsedDuration} hari`,
          },
        ],
        applicants: [],
      };

      // Seamless persistence: cache to localStorage so project detail opens perfectly even in guest/demo mode
      if (typeof window !== "undefined") {
        try {
          const fullCached = {
            ...newProj,
            deliverables: requiredDeliverables,
            tasks: ganttTasks,
            objectives: objectives,
          };
          localStorage.setItem(`doable_project_${createdProjectId}`, JSON.stringify(fullCached));
          const rawExisting = localStorage.getItem("doable_custom_projects");
          const existingList: Array<{ id: string }> = rawExisting ? JSON.parse(rawExisting) : [];
          localStorage.setItem("doable_custom_projects", JSON.stringify([fullCached, ...existingList.filter((x) => x.id !== createdProjectId)]));
        } catch (storageErr) {
          console.warn("Storage caching error:", storageErr);
        }
      }

      setStep(7);
      if (onSuccess) {
        onSuccess(newProj);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      setStep(7);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentInfo = STEP_INFO[step] || STEP_INFO[1];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose();
        }}
      />

      {/* Split-Card Modal Box — Enlarged, Comfortable & Balanced */}
      <div className="relative z-10 w-full max-w-[1140px] h-[640px] max-h-[95vh] overflow-hidden rounded-3xl border border-white/15 sm:border-slate-200/90 bg-card shadow-2xl shadow-black/50 flex flex-col lg:flex-row my-auto">
        {/* Reusable Windows-Style Corner Close Button */}
        <ModalCloseButton onClick={onClose} />

        {/* Left Side: WebGL Silk Banner */}
        <div className="relative w-full lg:w-[370px] lg:min-w-[370px] h-[150px] sm:h-[170px] lg:h-auto overflow-hidden bg-[#0C0838] flex flex-col justify-between p-6 sm:p-7 text-white select-none shrink-0">
          {/* Animated WebGL Silk Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Silk
              color="#2D1FE0"
              speed={3.8}
              scale={1.25}
              noiseIntensity={1.6}
              rotation={0.35}
              className="w-full h-full"
            />
          </div>

          {/* Vignette overlay */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

          {/* Top Branding & Builder Badge */}
          <div className="relative z-20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Image
                src={logoWithoutText}
                alt="Doable! Logo"
                height={28}
                width={28}
                className="h-7 w-7 object-contain brightness-0 invert"
              />
              <span className="text-xl font-heading font-extrabold tracking-tight text-white">
                Doable!
              </span>
            </div>

            <span className="rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-bold text-white/90 border border-white/15 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              <span>Project Builder</span>
            </span>
          </div>

          {/* Step Main Title & Description on Left Sidebar */}
          <div className="relative z-20 my-auto py-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
              {currentInfo.title}
            </h2>
            <p className="mt-2 text-sm text-white/85 leading-relaxed font-light hidden sm:block">
              {currentInfo.desc}
            </p>
          </div>

          {/* Bottom Progress Bar & Step Counter */}
          <div className="relative z-20 flex items-center justify-between text-sm text-white/90 pt-4 border-t border-white/15">
            <span className="font-semibold text-xs sm:text-sm">
              {step === 7 ? "Selesai & Fast-Match" : `Langkah ${step} dari ${TOTAL_STEPS}`}
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className={`h-2.5 rounded-full transition-all duration-400 ease-out ${
                    i === step
                      ? "w-8 bg-white shadow-sm shadow-white/60"
                      : i < step
                      ? "w-3 bg-blue-300"
                      : "w-2 bg-white/25"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Step Wizard Form Content (Universal & Spacious) */}
        <div className="relative flex-1 bg-card p-6 sm:p-8 lg:p-9 flex flex-col justify-between overflow-hidden">
          {/* STEP 1: Info, Universal Category, Auto-Tuned Difficulty & Recruitment Mode */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out my-auto">
              {/* Title Input with Realtime AI Analysis */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center justify-between pr-8">
                  <div className="flex items-center gap-2">
                    <span>Judul Proyek / Pekerjaan <span className="text-rose-500">*</span></span>
                    {isAnalyzingAI && (
                      <span className="text-[11px] font-semibold text-primary animate-pulse flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        <span>Menganalisis kebutuhan...</span>
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-normal text-muted-foreground">Ketik kata kunci kebutuhan</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Contoh: Poster Menu Nasi Goreng Pak Rahmat / Foto Spot Bali / Landing Page"
                    className="h-11 w-full rounded-2xl border border-input bg-background pl-4 pr-10 text-sm sm:text-base font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
                    required
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none">
                    <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>

              {/* Universal Category Grid with 'Kategori Lainnya' */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Kategori Pekerjaan</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryPicker(true)}
                    className="text-xs font-bold text-primary hover:text-primary-600 flex items-center gap-1 hover:underline"
                  >
                    <span>Jelajahi 30+ Kategori Lainnya</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {TOP_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = category === cat.id || category.includes(cat.label);

                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                            : "border-border/70 bg-card hover:bg-muted/50"
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-xl shrink-0 ${
                            isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-foreground truncate">{cat.label}</h4>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* If selected category is outside top 6, show a badge */}
                {!TOP_CATEGORIES.some((c) => c.id === category) && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-xs">
                    <span className="text-muted-foreground">Kategori Kustom Terpilih:</span>
                    <span className="font-bold text-primary">{category}</span>
                  </div>
                )}
              </div>

              {/* Enlarged Scale & Recruitment Mode Grid */}
              <div className="grid grid-cols-2 gap-3.5 pt-0.5">
                {/* Skala Pengerjaan - Clean, Prominent & Scaled */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">
                    Skala Pengerjaan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Starter" as const, label: "Mikro / Cepat" },
                      { id: "Standard" as const, label: "Standar" },
                      { id: "Enterprise" as const, label: "Kompleks" },
                    ].map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setDifficulty(tier.id)}
                        className={`h-11 px-1.5 text-center rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                          difficulty === tier.id
                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20 shadow-xs"
                            : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50"
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hiring Mode */}
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground">
                    Visibilitas Pelamar
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHiringMode("public")}
                      className={`h-11 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                        hiringMode === "public"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground font-bold"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Users className="h-4 w-4 text-primary shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">Publik</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHiringMode("private")}
                      className={`h-11 px-3 rounded-xl border flex items-center gap-2 transition-all ${
                        hiringMode === "private"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 text-foreground font-bold"
                          : "border-border/70 bg-card text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <Lock className="h-4 w-4 text-primary shrink-0" />
                      <div className="text-left min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">Privat</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1 Actions */}
              <div className="pt-2.5 flex items-center justify-end border-t border-border/40">
                <button
                  type="button"
                  disabled={!title.trim()}
                  onClick={() => setStep(2)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Lanjut: Scope & Detail</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Scope & Deliverables */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out my-auto">
              {/* Description Brief */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Deskripsi Kebutuhan & Instruksi Kerja <span className="text-rose-500">*</span></span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Jelaskan gambaran umum pekerjaan, spesifikasi yang diinginkan, dan hasil akhir yang diharapkan..."
                  className="w-full rounded-2xl border border-input bg-background p-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed placeholder:text-muted-foreground/60"
                  required
                />
              </div>

              {/* Objectives Checklist */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  Poin Kunci Hasil / Target Kerja
                </label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {objectives.map((obj, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/70 text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate text-foreground font-medium">{obj}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveObjective(idx)}
                        className="text-muted-foreground hover:text-rose-500 transition-colors p-1"
                        aria-label="Hapus item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Objective Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newObjectiveInput}
                    onChange={(e) => setNewObjectiveInput(e.target.value)}
                    onKeyDown={handleAddObjective}
                    placeholder="+ Tambah poin hasil kerja (Tekan Enter)"
                    className="h-10 flex-1 rounded-xl border border-dashed border-border bg-background px-3.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddObjective}
                    className="h-10 px-4 rounded-xl bg-muted hover:bg-muted/80 text-sm font-bold text-foreground flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Target Pengguna / Audiens
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-medium focus:border-primary focus:outline-none"
                >
                  <option value="B2C / Konsumen & Publik">B2C / Konsumen, Pelanggan Toko & Publik</option>
                  <option value="B2B / Bisnis & Klien Perusahaan">B2B / Klien Bisnis & Korporat</option>
                  <option value="Internal / Kebutuhan Pribadi">Internal / Kebutuhan Pribadi & Komunitas</option>
                </select>
              </div>

              {/* Step 2 Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  disabled={!description.trim()}
                  onClick={() => setStep(3)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                >
                  <span>Lanjut: Keahlian & Kriteria</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tech Stack & Auto-Tuned Talent Criteria */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out my-auto">
              {/* Skill / Software Chips */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  Skill / Alat yang Direkomendasikan
                </label>
                <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-0.5">
                  {suggestedSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                          isSelected
                            ? "bg-primary text-white shadow-xs"
                            : "bg-muted/70 text-foreground hover:bg-muted"
                        }`}
                      >
                        {isSelected ? `✓ ${skill}` : skill}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Skill Input */}
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  placeholder="+ Ketik keahlian/software kustom lainnya dan tekan Enter"
                  className="h-10 w-full sm:w-88 rounded-xl border border-dashed border-border bg-background px-3.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Experience Level (Clean, Scaled & Prominent) */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Kualifikasi Talenta yang Dicari
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "Junior" as const, label: "Pemula / Starter", desc: "Ramah budget & tugas cepat" },
                    { id: "Intermediate" as const, label: "Menengah", desc: "Portofolio teruji & mandiri" },
                    { id: "Senior" as const, label: "Senior / Ahli", desc: "Standar profesional tinggi" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setExperienceLevel(lvl.id)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        experienceLevel === lvl.id
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                          : "border-border/70 bg-card hover:bg-muted/50"
                      }`}
                    >
                      <span className="text-sm font-bold text-foreground block">{lvl.label}</span>
                      <span className="text-xs text-muted-foreground block truncate mt-0.5">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Screening Question Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Pertanyaan Skrining Pelamar (Opsional)
                </label>
                <input
                  type="text"
                  value={screeningQuestion}
                  onChange={(e) => setScreeningQuestion(e.target.value)}
                  placeholder="Contoh: Sertakan link contoh hasil karya serupa yang pernah Anda buat."
                  className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Step 3 Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <span>Lanjut: Output & Serah Terima</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Universal References & Handover Terms */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out my-auto">
              {/* Universal Reference Links */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <LinkIcon className="h-4 w-4 text-primary" />
                    <span>Link Acuan / Moodboard (Opsional)</span>
                  </label>
                  <input
                    type="url"
                    value={referenceUrl}
                    onChange={(e) => setReferenceUrl(e.target.value)}
                    placeholder="Link Google Drive, Pinterest, Figma, YouTube, dsb."
                    className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none placeholder:text-muted-foreground/60"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <FileCode className="h-4 w-4 text-primary" />
                    <span>Link Bahan Kerja / Aset Awal (Opsional)</span>
                  </label>
                  <input
                    type="url"
                    value={assetsUrl}
                    onChange={(e) => setAssetsUrl(e.target.value)}
                    placeholder="Link Drive logo/foto bahan, Dropbox, repo, dsb."
                    className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>

              {/* Universal Deliverables Checklist with Add Custom Item */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
                  Format Hasil / Serah Terima Wajib
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    "File Final Siap Pakai / High-Res (PNG, JPG, PDF, MP4, dsb.)",
                    "File Mentahan Asli / Editable (AI, PSD, RAW, Word, Code)",
                    "Link Penyimpanan Cloud (Google Drive / Dropbox)",
                    "Dokumentasi & Laporan Hasil Singkat",
                  ].map((item) => {
                    const isChecked = requiredDeliverables.includes(item);
                    return (
                      <div
                        key={item}
                        onClick={() => toggleDeliverableCheck(item)}
                        className={`p-2.5 rounded-2xl border cursor-pointer flex items-center gap-2.5 text-sm transition-all ${
                          isChecked
                            ? "border-primary bg-primary/10 text-foreground font-semibold"
                            : "border-border/60 bg-card text-muted-foreground hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`h-4.5 w-4.5 rounded-lg flex items-center justify-center border ${
                            isChecked ? "bg-primary border-primary text-white" : "border-border"
                          }`}
                        >
                          {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{item}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Add Custom Deliverable Input */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="text"
                    value={customDeliverableInput}
                    onChange={(e) => setCustomDeliverableInput(e.target.value)}
                    onKeyDown={handleAddCustomDeliverable}
                    placeholder="+ Tambah format serah terima kustom (contoh: 10 Foto High-Res Pura Uluwatu)"
                    className="h-9 flex-1 rounded-xl border border-dashed border-border bg-background px-3 text-xs focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDeliverable}
                    className="h-9 px-3.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-bold text-foreground flex items-center gap-1 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>

              {/* Free revisions */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Jatah Garansi Revisi Minor
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {(["1x", "2x", "3x"] as const).map((rev) => (
                    <button
                      key={rev}
                      type="button"
                      onClick={() => setFreeRevisions(rev)}
                      className={`h-10 text-center rounded-xl border text-sm font-bold transition-all ${
                        freeRevisions === rev
                          ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                          : "border-border/60 bg-card text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      {rev} Revisi {rev === "2x" && "(Standar)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 4 Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <span>Lanjut: Timeline & Jadwal</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Timeline & Gantt Sprint Roadmap */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out my-auto">
              {/* Duration Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Target Durasi Pengerjaan Total (Hari Kalender) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3.5">
                  <input
                    type="number"
                    value={durationDays}
                    onChange={(e) => handleDurationChange(e.target.value)}
                    min={1}
                    max={180}
                    className="h-10 w-32 rounded-xl border border-input bg-background px-3.5 text-base font-bold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <span className="text-sm text-muted-foreground">
                    Estimasi pengerjaan: {parsedDuration} hari kerja
                  </span>
                </div>
              </div>

              {/* Gantt Tasks Timeline Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Rencana Tahapan Tugas (Auto-Generated)</span>
                  </label>
                  <span className="text-xs text-muted-foreground font-semibold">
                    {ganttTasks.length} tahapan kerja
                  </span>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {ganttTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-2xl border border-border/70 bg-card/80 flex items-center justify-between gap-2.5 text-sm"
                    >
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-bold">
                            {t.milestonePhase}
                          </span>
                          <span className="font-semibold text-foreground truncate">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {t.startDate} &rarr; {t.endDate}
                          </span>
                        </div>
                      </div>

                      {ganttTasks.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGanttTask(t.id)}
                          className="text-muted-foreground hover:text-rose-500 p-1.5 transition-colors shrink-0"
                          aria-label="Hapus tugas"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Custom Task */}
                <form onSubmit={handleAddGanttTask} className="flex items-center gap-2 pt-0.5">
                  <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="+ Tambah tahapan tugas kustom..."
                    className="h-9 flex-1 rounded-xl border border-dashed border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newTaskName.trim()}
                    className="h-9 px-3.5 rounded-xl bg-muted hover:bg-muted/80 text-sm font-bold text-foreground flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </form>
              </div>

              {/* Step 5 Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <span>Lanjut: Budget & Dana Aman</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: Budget & Escrow Preference */}
          {step === 6 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-50 slide-in-from-right-4 duration-300 ease-out my-auto">
              {/* Budget Input */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground flex items-center justify-between">
                  <span>Total Anggaran Proyek (Rp) <span className="text-rose-500">*</span></span>
                  <span className="text-xs font-semibold text-primary">
                    Estimasi: Rp {parsedBudget.toLocaleString("id-ID")}
                  </span>
                </label>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  placeholder="150000"
                  className="h-11 w-full rounded-2xl border border-input bg-background px-4 text-base font-bold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Milestone Breakdown */}
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                    <span>Simulasi Pencairan Dana Bertahap (Garansi Aman)</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    100% Proteksi Dana
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-card border border-border/60 shadow-xs">
                    <span className="text-xs font-bold text-foreground block">
                      Milestone 1 (40%)
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      Draft Awal & Konsep
                    </span>
                    <span className="text-sm font-bold text-primary block mt-1">
                      Rp {m1Amount.toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-card border border-border/60 shadow-xs">
                    <span className="text-xs font-bold text-foreground block">
                      Milestone 2 (60%)
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      Hasil Akhir & Serah Terima
                    </span>
                    <span className="text-sm font-bold text-primary block mt-1">
                      Rp {m2Amount.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferred Payment Method */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-foreground">
                  Preferensi Metode Pembayaran Aman (Rekening Bersama)
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: "va" as const, label: "Virtual Account", icon: Building2, desc: "BCA, Mandiri, BRI" },
                    { id: "qris" as const, label: "QRIS & E-Wallet", icon: QrCode, desc: "GoPay, OVO, ShopeePay" },
                    { id: "cc" as const, label: "Kartu Kredit", icon: CreditCard, desc: "Visa, Mastercard" },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethodPreference === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethodPreference(pm.id)}
                        className={`p-2.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                            : "border-border/70 bg-card hover:bg-muted/50"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5 text-primary mb-1" />
                        <span className="text-xs font-bold text-foreground block">{pm.label}</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{pm.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 6 Actions */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl border border-border px-6 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || parsedBudget <= 0}
                  className="h-11 inline-flex items-center gap-2 rounded-2xl bg-primary px-7 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Mempublikasikan...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Publikasikan Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 7: Success Screen & Fast-Match Talent Preview */}
          {step === 7 && (
            <div className="py-2 space-y-5 animate-in zoom-in-95 duration-300 my-auto">
              <div className="text-center space-y-1.5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 shadow-md shadow-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold font-heading text-foreground">
                  Proyek Berhasil Dipublikasikan!
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Proyek <strong>&ldquo;{title}&rdquo;</strong> kini aktif di status <strong>Hiring</strong>.
                </p>
              </div>

              {/* Fast-Match Recommendation Cards */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI Fast-Match: Rekomendasi Talenta Cocok</span>
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">Berdasarkan Kategori & Skill</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {matchedTalents.map((talent) => {
                    const isInvited = invitedTalents[talent.id];
                    return (
                      <div
                        key={talent.id}
                        className="p-3 rounded-2xl border border-border/80 bg-card/80 flex flex-col justify-between gap-2.5 shadow-xs hover:border-primary/40 transition-all"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="relative h-9 w-9 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                            <Image
                              src={talent.avatar}
                              alt={talent.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-foreground truncate">{talent.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{talent.role}</p>
                            <div className="flex items-center gap-1 text-xs font-semibold text-amber-500 mt-0.5">
                              <Star className="h-3.5 w-3.5 fill-amber-500" />
                              <span>{talent.rating}</span>
                              <span className="text-muted-foreground font-normal">({talent.reviewsCount})</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-border/50 text-xs">
                          <span className="font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            {talent.matchScore}%
                          </span>

                          <button
                            type="button"
                            onClick={() => handleInviteTalent(talent.id)}
                            disabled={isInvited}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                              isInvited
                                ? "bg-emerald-500/15 text-emerald-600"
                                : "bg-primary text-white hover:bg-primary-600 shadow-xs"
                            }`}
                          >
                            {isInvited ? "Terkirim ✓" : "Undang"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation CTAs */}
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all"
                >
                  <Layers className="h-4 w-4" />
                  <span>Dashboard Proyek</span>
                </button>

                <Link
                  href="/client/projects"
                  onClick={onClose}
                  className="h-11 inline-flex items-center justify-center rounded-2xl border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <span>Daftar Proyek</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Popover / Overlay Directory: 30+ Kategori Lainnya (Searchable) */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl shadow-black/40 space-y-4 max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-foreground">Direktori Semua Kategori</h3>
                <p className="text-xs text-muted-foreground">Pilih bidang pekerjaan spesifik untuk proyekmu</p>
              </div>
              <ModalCloseButton variant="pill" onClick={() => setShowCategoryPicker(false)} />
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Cari kategori... (contoh: Poster, Foto Bali, TikTok, Landing Page, Admin)"
                className="h-11 w-full rounded-2xl border border-input bg-background pl-10 pr-4 text-sm focus:border-primary focus:outline-none"
                autoFocus
              />
            </div>

            {/* Category Groups List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[50vh]">
              {Object.keys(filteredCategoryDirectory).length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Tidak ditemukan kategori yang cocok. Anda tetap bisa menggunakan kategori kustom dengan mengetikkan langsung.
                </div>
              ) : (
                Object.entries(filteredCategoryDirectory).map(([groupName, items]) => (
                  <div key={groupName} className="space-y-2">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">{groupName}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {items.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => handleSelectCategory(item)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                            category === item
                              ? "border-primary bg-primary/10 text-primary font-bold"
                              : "border-border/70 bg-card hover:bg-muted/50 text-foreground"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
