"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Sparkles,
  ShieldCheck,
  Star,
  Plus,
  ArrowRight,
  Code2,
  Palette,
  Bot,
  Smartphone,
  Server,
  Cloud,
  CheckCircle2,
  Clock,
  Users,
  FolderOpen,
  Check,
  X,
  ChevronDown,
  Send,
  Flame,
  Layers,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Grainient from "@/components/ui/Grainient";

interface ProjectTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  badge: string;
  badgeColor: string;
  estimatedBudget: string;
  estimatedBudgetNumeric: number;
  estimatedDuration: string;
  difficulty: "Starter" | "Standard" | "Enterprise";
  skills: string[];
  thumbnail: string;
  milestonesCount: number;
  popularityScore: number;
}

interface FeaturedTalent {
  id: string;
  name: string;
  avatar: string;
  role: string;
  level: "Verified Pro" | "Top Rated" | "Level 2 Seller";
  category: string;
  serviceTitle: string;
  thumbnail: string;
  rating: number;
  reviewsCount: number;
  startingPrice: string;
  deliveryTime: string;
  skills: string[];
}

interface MilestoneItem {
  id: string;
  title: string;
  amount: string;
  status: "completed" | "in_progress" | "pending";
  dueDate: string;
}

interface ProposalApplicant {
  id: string;
  name: string;
  avatar: string;
  role: string;
  rating: number;
  reviewsCount: number;
  bidAmount: string;
  deliveryDays: number;
  pitch: string;
  skills: string[];
  badge: "Verified Pro" | "Top Rated" | "Rising Star";
}

interface ClientProject {
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
  milestones: MilestoneItem[];
  applicants: ProposalApplicant[];
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "tpl-1",
    title: "SaaS Dashboard & Multi-Tenant Web App",
    category: "Frontend & Web",
    description: "Membangun web app SaaS lengkap dengan autentikasi multi-tenant, visual charts interaktif, dan integrasi payment gateway.",
    badge: "Paling Populer",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    estimatedBudget: "Rp 6.500.000 - Rp 14.000.000",
    estimatedBudgetNumeric: 8500000,
    estimatedDuration: "7 - 14 hari",
    difficulty: "Standard",
    skills: ["Next.js 14", "TypeScript", "Tailwind CSS", "Supabase", "Midtrans"],
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    milestonesCount: 3,
    popularityScore: 98,
  },
  {
    id: "tpl-2",
    title: "Cross-Platform Mobile App (iOS & Android)",
    category: "Mobile App Development",
    description: "Aplikasi mobile responsif Flutter / React Native dengan state management solid, push notifications, dan offline-first caching.",
    badge: "High Demand",
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    estimatedBudget: "Rp 9.000.000 - Rp 22.000.000",
    estimatedBudgetNumeric: 12500000,
    estimatedDuration: "14 - 21 hari",
    difficulty: "Enterprise",
    skills: ["Flutter", "Dart", "Firebase", "REST API", "State Management"],
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
    milestonesCount: 4,
    popularityScore: 95,
  },
  {
    id: "tpl-3",
    title: "Integrasi AI Agent, LLM Chatbot & RAG System",
    category: "AI & Machine Learning",
    description: "Integrasi LLM cerdas berbasis dokumen bisnis (RAG), voice assistant interaktif, dan automasi workflow API.",
    badge: "Trending Tech",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    estimatedBudget: "Rp 5.500.000 - Rp 16.000.000",
    estimatedBudgetNumeric: 7500000,
    estimatedDuration: "5 - 10 hari",
    difficulty: "Standard",
    skills: ["Python", "FastAPI", "OpenAI", "LangChain", "Vector DB"],
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
    milestonesCount: 3,
    popularityScore: 96,
  },
  {
    id: "tpl-4",
    title: "Atomic UI/UX Design System & Interactive Prototype",
    category: "UI/UX & Product Design",
    description: "Desain sistem komponen lengkap di Figma dengan auto-layout responsif, guideline typography, warna, dan prototipe siap uji.",
    badge: "Quick Turnaround",
    badgeColor: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    estimatedBudget: "Rp 3.500.000 - Rp 8.000.000",
    estimatedBudgetNumeric: 4500000,
    estimatedDuration: "4 - 7 hari",
    difficulty: "Starter",
    skills: ["Figma", "Atomic Design", "Wireframing", "User Research", "Prototyping"],
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    milestonesCount: 2,
    popularityScore: 92,
  },
  {
    id: "tpl-5",
    title: "High-Throughput Microservice API & Database Architecture",
    category: "Backend & Database",
    description: "Arsitektur backend scalable dengan clean architecture, caching Redis, query optimization PostgreSQL, dan automated unit test.",
    badge: "Robust Backend",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    estimatedBudget: "Rp 7.000.000 - Rp 18.000.000",
    estimatedBudgetNumeric: 9500000,
    estimatedDuration: "7 - 14 hari",
    difficulty: "Enterprise",
    skills: ["Go / Python", "PostgreSQL", "Redis", "Docker", "REST & GraphQL"],
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    milestonesCount: 3,
    popularityScore: 90,
  },
  {
    id: "tpl-6",
    title: "Landing Page Modern & Performance SEO Speed 98+",
    category: "Frontend & Web",
    description: "Landing page konversi tinggi dengan micro-animations mulus, dark mode, dan performa Google Lighthouse skor 98+.",
    badge: "Fast Launch",
    badgeColor: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    estimatedBudget: "Rp 2.800.000 - Rp 6.000.000",
    estimatedBudgetNumeric: 3500000,
    estimatedDuration: "3 - 5 hari",
    difficulty: "Starter",
    skills: ["Next.js", "Tailwind CSS", "Framer Motion", "SEO Best Practice"],
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    milestonesCount: 2,
    popularityScore: 89,
  },
];

const FEATURED_TALENTS: FeaturedTalent[] = [
  {
    id: "tal-1",
    name: "Dimas Arya Pratama",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "Fullstack Web & SaaS Specialist",
    level: "Verified Pro",
    category: "Frontend",
    serviceTitle: "Membangun SaaS Dashboard Fullstack Modern dengan Next.js 14, Tailwind & Supabase",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 38,
    startingPrice: "Rp 3.500.000",
    deliveryTime: "5 hari",
    skills: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
  },
  {
    id: "tal-2",
    name: "Siti Rahmawati",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    role: "Lead UI/UX & Product Designer",
    level: "Top Rated",
    category: "UI/UX",
    serviceTitle: "Desain UI/UX Mobile & Web App Lengkap dengan Figma Atomic Design System & Prototype",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 52,
    startingPrice: "Rp 2.800.000",
    deliveryTime: "4 hari",
    skills: ["Figma", "Design Systems", "Prototyping", "Wireframing"],
  },
  {
    id: "tal-3",
    name: "Reza Mahendra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "AI Engineer & Python Developer",
    level: "Verified Pro",
    category: "AI & Machine",
    serviceTitle: "Integrasi AI Voice Agent & LLM Chatbot dengan FastAPI, WebSockets & OpenAI",
    thumbnail: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 29,
    startingPrice: "Rp 5.500.000",
    deliveryTime: "7 hari",
    skills: ["Python", "FastAPI", "OpenAI", "WebSockets"],
  },
  {
    id: "tal-4",
    name: "Budi Santoso",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "Mobile App Flutter Specialist",
    level: "Top Rated",
    category: "Mobile",
    serviceTitle: "Aplikasi Mobile Flutter Cross-Platform (iOS & Android) dengan Midtrans Payment",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 24,
    startingPrice: "Rp 4.200.000",
    deliveryTime: "8 hari",
    skills: ["Flutter", "Dart", "Midtrans", "Firebase"],
  },
];

const INITIAL_CLIENT_PROJECTS: ClientProject[] = [
  {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile App Development",
    budget: "Rp 15.000.000",
    budgetNumeric: 15000000,
    status: "Hiring",
    proposalsCount: 8,
    dueDate: "14 hari lagi",
    postedDate: "2 hari lalu",
    description: "Peremajaan total antarmuka UI/UX mobile app dengan arsitektur modular Flutter, integrasi gateway Midtrans, dan push notification Firebase.",
    skills: ["Flutter", "Dart", "Midtrans", "Firebase", "State Management"],
    milestones: [
      { id: "m1", title: "Setup Project & UI Kit Implementation", amount: "Rp 5.000.000", status: "completed", dueDate: "Selesai" },
      { id: "m2", title: "API Integration & Checkout Flow", amount: "Rp 6.000.000", status: "in_progress", dueDate: "7 hari lagi" },
      { id: "m3", title: "Testing, QA & Play Store Deployment", amount: "Rp 4.000.000", status: "pending", dueDate: "14 hari lagi" },
    ],
    applicants: [
      {
        id: "app-1",
        name: "Dimas Arya Pratama",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "Senior Flutter & Fullstack Engineer",
        rating: 4.9,
        reviewsCount: 38,
        bidAmount: "Rp 14.500.000",
        deliveryDays: 12,
        pitch: "Saya telah membangun 6 aplikasi e-commerce Flutter di Play Store & App Store dengan integrasi Midtrans. Siap menyelesaikan dalam 12 hari dengan milestone terstruktur.",
        skills: ["Flutter", "Dart", "Midtrans", "BLoC"],
        badge: "Verified Pro",
      },
      {
        id: "app-2",
        name: "Budi Santoso",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        role: "Mobile App Specialist",
        rating: 4.8,
        reviewsCount: 24,
        bidAmount: "Rp 15.000.000",
        deliveryDays: 14,
        pitch: "Portofolio saya mencakup aplikasi retail dengan 50k+ user aktif. Desain pixel-perfect sesuai mockup Figma Anda.",
        skills: ["Flutter", "Firebase", "REST API"],
        badge: "Top Rated",
      },
      {
        id: "app-3",
        name: "Farhan Maulana",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        role: "Cross-Platform Developer",
        rating: 5.0,
        reviewsCount: 19,
        bidAmount: "Rp 13.800.000",
        deliveryDays: 10,
        pitch: "Fast turnaround dengan clean code architecture, offline SQLite caching, dan laporan progress harian via Slack/Discord.",
        skills: ["Flutter", "Dart", "Provider"],
        badge: "Rising Star",
      },
    ],
  },
  {
    id: "proj-2",
    title: "AI Chatbot & Voice Agent Integration for Customer Support",
    category: "AI & Machine Learning",
    budget: "Rp 8.500.000",
    budgetNumeric: 8500000,
    status: "In Progress",
    proposalsCount: 4,
    dueDate: "5 hari lagi",
    postedDate: "4 hari lalu",
    description: "Membangun sistem chatbot customer service pintar yang membaca knowledge base internal dan terhubung ke WhatsApp Cloud API.",
    skills: ["Python", "FastAPI", "OpenAI", "WebSockets", "RAG"],
    milestones: [
      { id: "m2-1", title: "RAG Vector Store & Prompt Engineering", amount: "Rp 4.500.000", status: "completed", dueDate: "Selesai" },
      { id: "m2-2", title: "WhatsApp Gateway & Dashboard Monitoring", amount: "Rp 4.000.000", status: "in_progress", dueDate: "5 hari lagi" },
    ],
    applicants: [
      {
        id: "app-4",
        name: "Reza Mahendra",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        role: "AI & Backend Engineer",
        rating: 4.9,
        reviewsCount: 29,
        bidAmount: "Rp 8.500.000",
        deliveryDays: 7,
        pitch: "Kontrak sedang aktif berjalan. Sedang menyelesaikan fase sinkronisasi webhook WhatsApp Cloud API.",
        skills: ["Python", "FastAPI", "OpenAI"],
        badge: "Verified Pro",
      },
    ],
  },
  {
    id: "proj-3",
    title: "FinTech Landing Page & Atomic Design System",
    category: "UI/UX & Product Design",
    budget: "Rp 5.000.000",
    budgetNumeric: 5000000,
    status: "Completed",
    proposalsCount: 12,
    dueDate: "Selesai",
    postedDate: "2 minggu lalu",
    description: "Design system komprehensif di Figma lengkap dengan 40+ variasi komponen dan prototipe landing page interaktif.",
    skills: ["Figma", "Atomic Design", "Design Systems"],
    milestones: [
      { id: "m3-1", title: "Wireframe & Information Architecture", amount: "Rp 2.000.000", status: "completed", dueDate: "Selesai" },
      { id: "m3-2", title: "High-Fidelity UI & Design System Component", amount: "Rp 3.000.000", status: "completed", dueDate: "Selesai" },
    ],
    applicants: [
      {
        id: "app-5",
        name: "Siti Rahmawati",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
        role: "Lead UI/UX Designer",
        rating: 5.0,
        reviewsCount: 52,
        bidAmount: "Rp 5.000.000",
        deliveryDays: 5,
        pitch: "Proyek telah selesai 100% dan dana escrow telah sukses dicairkan.",
        skills: ["Figma", "Design Systems"],
        badge: "Top Rated",
      },
    ],
  },
];

const CATEGORIES = [
  { name: "Frontend & Web", icon: Code2, projectCount: "140+ Proyek", avgBudget: "Rp 4M - 15M", color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/20" },
  { name: "Mobile App Solutions", icon: Smartphone, projectCount: "85+ Proyek", avgBudget: "Rp 8M - 25M", color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-500/20" },
  { name: "AI & Machine Learning", icon: Bot, projectCount: "60+ Proyek", avgBudget: "Rp 5M - 20M", color: "from-purple-500/10 to-violet-500/10 text-purple-600 border-purple-500/20" },
  { name: "UI/UX & Product Design", icon: Palette, projectCount: "95+ Proyek", avgBudget: "Rp 3M - 8M", color: "from-pink-500/10 to-rose-500/10 text-pink-600 border-pink-500/20" },
  { name: "Backend & Database", icon: Server, projectCount: "110+ Proyek", avgBudget: "Rp 6M - 18M", color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/20" },
  { name: "DevOps & Cloud Systems", icon: Cloud, projectCount: "45+ Proyek", avgBudget: "Rp 4M - 14M", color: "from-cyan-500/10 to-sky-500/10 text-cyan-600 border-cyan-500/20" },
];

export function ClientDashboard() {
  // State
  const [projects, setProjects] = useState<ClientProject[]>(INITIAL_CLIENT_PROJECTS);
  const [projectStatusFilter, setProjectStatusFilter] = useState<"All" | "Hiring" | "In Progress" | "Completed">("All");
  const [talentCategory, setTalentCategory] = useState("Semua");
  const [savedTalents, setSavedTalents] = useState<string[]>([]);
  const [quickPrompt, setQuickPrompt] = useState("");

  // Modal State for Project Creation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Frontend & Web");
  const [newDescription, setNewDescription] = useState("");
  const [newSkills, setNewSkills] = useState<string[]>(["Next.js", "TypeScript"]);
  const [skillInput, setSkillInput] = useState("");
  const [newBudget, setNewBudget] = useState("7500000");
  const [newDurationDays, setNewDurationDays] = useState("14");
  const [newDifficulty, setNewDifficulty] = useState<"Starter" | "Standard" | "Enterprise">("Standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Proposal Review Modal State
  const [selectedProjectForProposals, setSelectedProjectForProposals] = useState<ClientProject | null>(null);
  const [acceptedProposalId, setAcceptedProposalId] = useState<string | null>(null);

  // Invite / Direct Hire Talent Modal State
  const [selectedTalentForInvite, setSelectedTalentForInvite] = useState<FeaturedTalent | null>(null);
  const [inviteProjectId, setInviteProjectId] = useState(projects[0]?.id || "");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Linear scroll progress (0 to 1) for the Hero Grainient scale-down
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    let rafId: number;
    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const range = 550; // scroll distance for linear scale-down (slower, smooth progression)
        const current = window.scrollY;
        const prog = Math.min(Math.max(current / range, 0), 1);
        setScrollProgress(prog);
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const p = scrollProgress;

  // Filtered Projects
  const filteredProjects = useMemo(() => {
    if (projectStatusFilter === "All") return projects;
    return projects.filter((p) => p.status === projectStatusFilter);
  }, [projects, projectStatusFilter]);

  // Filtered Talents
  const filteredTalents = useMemo(() => {
    if (talentCategory === "Semua") return FEATURED_TALENTS;
    return FEATURED_TALENTS.filter((t) => t.category.includes(talentCategory));
  }, [talentCategory]);

  // Toggle Save Talent
  const toggleSaveTalent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTalents((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Quick Prompt from Hero
  const handleLaunchQuickPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (quickPrompt.trim()) {
      setNewTitle(quickPrompt.trim());
      setNewDescription(`Kebutuhan pengerjaan untuk proyek: ${quickPrompt.trim()}. Membutuhkan pengerjaan yang rapi, arsitektur scalable, dan laporan berkala.`);
    }
    setCreateStep(1);
    setIsCreateModalOpen(true);
  };

  // Open Modal with Pre-filled Template Blueprint
  const handleApplyTemplate = (tpl: ProjectTemplate) => {
    setNewTitle(tpl.title);
    setNewCategory(tpl.category);
    setNewDescription(tpl.description);
    setNewSkills(tpl.skills);
    setNewBudget(tpl.estimatedBudgetNumeric.toString());
    setNewDifficulty(tpl.difficulty);
    setNewDurationDays("14");
    setCreateStep(1);
    setIsCreateModalOpen(true);
  };

  // Add Skill Tag
  const handleAddSkill = () => {
    if (skillInput.trim() && !newSkills.includes(skillInput.trim())) {
      setNewSkills([...newSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setNewSkills(newSkills.filter((s) => s !== skill));
  };

  // Handle Project Creation Submission
  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const budgetNum = parseInt(newBudget.replace(/\D/g, ""), 10) || 5000000;
    const formattedBudget = `Rp ${budgetNum.toLocaleString("id-ID")}`;

    const newProj: ClientProject = {
      id: `proj-${Date.now()}`,
      title: newTitle || "Proyek Pengembangan Baru",
      category: newCategory,
      budget: formattedBudget,
      budgetNumeric: budgetNum,
      status: "Hiring",
      proposalsCount: 0,
      dueDate: `${newDurationDays} hari`,
      postedDate: "Baru saja",
      description: newDescription || "Deskripsi kebutuhan proyek teknologi.",
      skills: newSkills.length > 0 ? newSkills : ["Next.js", "TypeScript"],
      milestones: [
        {
          id: `m-${Date.now()}-1`,
          title: "Milestone 1: Prototype & Initial Setup",
          amount: `Rp ${(budgetNum * 0.4).toLocaleString("id-ID")}`,
          status: "pending",
          dueDate: `${Math.round(parseInt(newDurationDays) * 0.4)} hari`,
        },
        {
          id: `m-${Date.now()}-2`,
          title: "Milestone 2: Final Delivery & QA Testing",
          amount: `Rp ${(budgetNum * 0.6).toLocaleString("id-ID")}`,
          status: "pending",
          dueDate: `${newDurationDays} hari`,
        },
      ],
      applicants: [],
    };

    setTimeout(() => {
      setProjects([newProj, ...projects]);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsCreateModalOpen(false);
        setQuickPrompt("");
        // Reset form
        setNewTitle("");
        setNewDescription("");
        setCreateStep(1);
      }, 1400);
    }, 800);
  };

  // Handle Invite Talent Submit
  const handleSendTalentInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setSelectedTalentForInvite(null);
      setInviteMessage("");
    }, 1500);
  };

  return (
    <div className="w-full space-y-10">
      {/* ============================================================ */}
      {/* 1. HERO PROJECT CREATION HUB & QUICK AI/TEMPLATE LAUNCHER */}
      {/* ============================================================ */}
      <div
        className="w-full flex justify-center mx-auto"
        style={{
          maxWidth: p === 0 ? "100%" : `min(100%, calc(100vw * (1 - ${p}) + 80rem * ${p}))`,
          paddingLeft: `${p * 24}px`,
          paddingRight: `${p * 24}px`,
          paddingTop: `${p * 16}px`,
          width: "100%",
        }}
      >
        <div
          className="relative overflow-hidden text-white shadow-2xl border border-white/10 w-full will-change-transform flex flex-col justify-center"
          style={{
            borderRadius: `${p * 24}px`,
            borderLeftWidth: `${p}px`,
            borderRightWidth: `${p}px`,
            borderTopWidth: `${p}px`,
            borderBottomWidth: "1px",
            minHeight: `calc((100vh - 6.5rem) * ${1 - p} + 0px)`,
            paddingTop: `${Math.round(48 + (1 - p) * 16)}px`,
            paddingBottom: `${Math.round(48 + (1 - p) * 16)}px`,
            paddingLeft: `${Math.round(32 + p * 16)}px`,
            paddingRight: `${Math.round(32 + p * 16)}px`,
          }}
        >
          {/* Grainient Canvas Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Grainient
              color1="#2563EB"
              color2="#4F46E5"
              color3="#0B0F19"
              timeSpeed={0.25}
              colorBalance={0.0}
              warpStrength={1.2}
              warpFrequency={4.0}
              warpSpeed={1.8}
              warpAmplitude={40.0}
              blendAngle={0.0}
              blendSoftness={0.06}
              rotationAmount={450.0}
              noiseScale={2.0}
              grainAmount={0.2}
              grainScale={2.0}
              grainAnimated={false}
              contrast={1.4}
              gamma={1.0}
              saturation={1.1}
              centerX={0.0}
              centerY={0.0}
              zoom={0.95}
            />
          </div>
          <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-black/40 to-black/60 pointer-events-none" />

          {/* Ambient Glows */}
          <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto w-full space-y-5 flex flex-col items-center text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-center">
              Wujudkan Ide Digitalmu Menjadi Proyek Nyata.
            </h1>

            <p className="text-base md:text-lg text-slate-200 leading-relaxed font-normal max-w-2xl mx-auto text-center">
              Pasang proyek dalam hitungan menit, tentukan milestone pengerjaan, dan dapatkan proposal terbaik dari developer & desainer terverifikasi dengan proteksi escrow 100%.
            </p>

            {/* Quick Project Scoper Bar */}
            <form onSubmit={handleLaunchQuickPrompt} className="pt-2 w-full max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl backdrop-blur-md">
                <div className="flex-1 flex items-center gap-3 px-3">
                  <Sparkles className="h-5 w-5 text-primary shrink-0" />
                  <input
                    type="text"
                    placeholder='Deskripsikan proyekmu (e.g. "SaaS AI Dashboard dengan Next.js & Supabase")...'
                    value={quickPrompt}
                    onChange={(e) => setQuickPrompt(e.target.value)}
                    className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-primary-600 transition-all hover:scale-[1.01]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Buat Proyek</span>
                </button>
              </div>

              {/* Quick Template Chips */}
              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  <span>Blueprint Siap Pakai:</span>
                </span>
                {[
                  { name: "🚀 Web App SaaS", tplId: "tpl-1" },
                  { name: "📱 Mobile Flutter App", tplId: "tpl-2" },
                  { name: "🤖 AI Agent / Chatbot", tplId: "tpl-3" },
                  { name: "🎨 UI/UX Design System", tplId: "tpl-4" },
                  { name: "⚡ Backend API Scalable", tplId: "tpl-5" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.tplId}
                    onClick={() => {
                      const found = PROJECT_TEMPLATES.find((t) => t.id === item.tplId);
                      if (found) handleApplyTemplate(found);
                    }}
                    className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/95 hover:bg-white/20 transition-all backdrop-blur-sm hover:scale-[1.02]"
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </form>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-white/15 w-full">
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-white">{projects.length} Proyek</div>
                <div className="text-xs text-slate-300">Portofolio Klienmu</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-white">
                  {projects.reduce((acc, p) => acc + p.proposalsCount, 0)} Proposal
                </div>
                <div className="text-xs text-slate-300">Total Bids Masuk</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-emerald-400">100% Escrow</div>
                <div className="text-xs text-slate-300">Dana Terproteksi</div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="text-xl font-bold text-amber-300">&lt; 15 Menit</div>
                <div className="text-xs text-slate-300">Respon Talent Pertama</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator hint when at top */}
          <div
            className="pt-6 pb-2 flex items-center justify-center"
            style={{
              opacity: Math.max(0, 1 - p * 2.5),
              pointerEvents: p > 0.2 ? "none" : "auto",
            }}
          >
            <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5 animate-bounce">
              <ChevronDown className="h-4 w-4 text-primary-200" />
              <span>Scroll ke bawah untuk melihat proyek & talenta</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. INNER CONTAINER FOR OTHER DASHBOARD SECTIONS */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 w-full pt-4">

        {/* ============================================================ */}
        {/* 2. ACTIVE PROJECTS PIPELINE & PROPOSAL MANAGEMENT */}
        {/* ============================================================ */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">
                  Proyek Saya
                </h2>
                <span className="flex h-5 min-w-5 px-1 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white shadow-xs">
                  {projects.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCreateStep(1);
                  setIsCreateModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white px-4 py-2 text-xs font-semibold shadow-sm shadow-primary/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                <span>Pasang Proyek Baru</span>
              </button>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
            {(["All", "Hiring", "In Progress", "Completed"] as const).map((status) => {
              const count = status === "All" ? projects.length : projects.filter((p) => p.status === status).length;
              const label = status === "All" ? "Semua Proyek" : status === "Hiring" ? "Dalam Seleksi" : status === "In Progress" ? "Sedang Berjalan" : "Selesai";
              const isActive = projectStatusFilter === status;

              return (
                <button
                  key={status}
                  onClick={() => setProjectStatusFilter(status)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${isActive
                    ? "bg-primary text-white shadow-xs"
                    : "border border-border/80 bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-xs ${isActive ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Project Pipeline List */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((proj) => {
              const completedMilestones = proj.milestones.filter((m) => m.status === "completed").length;
              const totalMilestones = proj.milestones.length;
              const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

              return (
                <div
                  key={proj.id}
                  className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-5 shadow-xs transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 space-y-4"
                >
                  <div className="space-y-3">
                    {/* Category & Live Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                        {proj.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${proj.status === "Hiring"
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : proj.status === "In Progress"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                            : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${proj.status === "Hiring"
                            ? "bg-amber-500 animate-pulse"
                            : proj.status === "In Progress"
                              ? "bg-blue-500 animate-pulse"
                              : "bg-emerald-500"
                            }`}
                        />
                        {proj.status}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-sans font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {proj.title}
                      </h3>
                      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {/* Budget & Timeline Pill Strip */}
                    <div className="flex items-center justify-between text-xs py-1.5 border-y border-border/40">
                      <div>
                        <span className="text-xs text-muted-foreground block font-medium">Anggaran Escrow</span>
                        <span className="font-bold text-foreground text-sm">{proj.budget}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground block font-medium">Target Deadline</span>
                        <span className="font-semibold text-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          {proj.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">
                          Milestone Selesai ({completedMilestones}/{totalMilestones})
                        </span>
                        <span className="font-bold text-foreground">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Required Skills Chips */}
                    <div className="flex flex-wrap gap-1">
                      {proj.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                      {proj.skills.length > 3 && (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                          +{proj.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                    {proj.applicants.length > 0 ? (
                      <button
                        onClick={() => setSelectedProjectForProposals(proj)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 text-xs font-semibold transition-colors"
                      >
                        <Users className="h-3.5 w-3.5" />
                        <span>Tinjau Proposal ({proj.applicants.length})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Menunggu pelamar...</span>
                      </span>
                    )}

                    <Link
                      href="/client/projects"
                      className="rounded-xl border border-border/80 bg-card hover:bg-muted p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Detail Proyek"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>



        {/* ============================================================ */}
        {/* 4. CARI TALENTA & JASA TERVERIFIKASI (TALENT MARKETPLACE ROW) */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 mb-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>100% Talent Telah Diverifikasi & Lulus Skill Test</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Cari Talenta & Jasa Pilihan Teratas
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["Semua", "Frontend", "UI/UX", "AI & Machine", "Mobile"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTalentCategory(cat)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${talentCategory === cat
                      ? "bg-primary text-white shadow-xs"
                      : "border border-border/80 bg-card text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <Link
                href="/client/talent"
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline ml-1"
              >
                <span>Semua Talent</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Talents Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredTalents.map((tal) => (
              <div
                key={tal.id}
                className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card overflow-hidden shadow-xs transition-all hover:border-primary/40 hover:shadow-lg hover:-translate-y-1"
              >
                <div>
                  {/* Thumbnail Image */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                    <img
                      src={tal.thumbnail}
                      alt={tal.serviceTitle}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80";
                      }}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <button
                      onClick={(e) => toggleSaveTalent(tal.id, e)}
                      className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/70"
                      title="Simpan Talent"
                    >
                      <Heart
                        className={`h-4 w-4 ${savedTalents.includes(tal.id)
                          ? "fill-rose-500 text-rose-500"
                          : "text-white"
                          }`}
                      />
                    </button>
                    <span className="absolute bottom-2 left-2.5 rounded-md bg-black/60 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-md">
                      {tal.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Seller Header */}
                    <div className="flex items-center gap-2.5">
                      <img
                        src={tal.avatar}
                        alt={tal.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
                        }}
                        className="h-7 w-7 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="font-sans font-semibold text-sm text-foreground truncate">{tal.name}</span>
                          <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">{tal.level}</span>
                      </div>
                    </div>

                    {/* Service Title */}
                    <h3 className="font-sans font-medium text-sm text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {tal.serviceTitle}
                    </h3>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                      <span className="font-bold text-foreground">{tal.rating}</span>
                      <span className="text-muted-foreground text-xs">({tal.reviewsCount})</span>
                    </div>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-1">
                      {tal.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Starting Price & Hire CTA */}
                <div className="border-t border-border/40 p-4 pt-3 flex items-center justify-between bg-muted/10">
                  <div>
                    <span className="text-xs text-muted-foreground block uppercase font-semibold">Mulai dari</span>
                    <span className="text-sm font-bold text-primary">{tal.startingPrice}</span>
                  </div>

                  <button
                    onClick={() => setSelectedTalentForInvite(tal)}
                    className="rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
                  >
                    Hire Talent
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. EXPLORE PROJECT SCOPES & BUDGET BENCHMARKS */}
        {/* ============================================================ */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Jelajahi Kategori Proyek & Benchmark Biaya
            </h2>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.name}
                  onClick={() => {
                    setNewCategory(cat.name);
                    setNewTitle(`Kebutuhan Proyek ${cat.name}`);
                    setCreateStep(1);
                    setIsCreateModalOpen(true);
                  }}
                  className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border bg-gradient-to-br ${cat.color} transition-transform group-hover:scale-105 shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-sans font-semibold text-base text-foreground group-hover:text-primary transition-colors truncate">
                      {cat.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                      <span>{cat.projectCount}</span>
                      <span>•</span>
                      <span className="font-semibold text-primary">{cat.avgBudget}</span>
                    </div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:rotate-90 transition-all shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. LIVE PROPOSALS ACTIVITY FEED (RECENT BIDS FROM TALENT) */}
        {/* ============================================================ */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Aktivitas Proposal & Milestone Masuk Terbaru</span>
              </h3>
            </div>

            <Link
              href="/client/projects"
              className="text-xs font-semibold text-primary hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              <span>Buka Semua Proyek</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {projects
              .flatMap((p) => p.applicants.map((a) => ({ ...a, projectTitle: p.title, projId: p.id })))
              .slice(0, 4)
              .map((app) => (
                <div
                  key={app.id}
                  className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-muted/20 p-3.5 hover:border-primary/40 transition-colors"
                >
                  <img
                    src={app.avatar}
                    alt={app.name}
                    className="h-10 w-10 rounded-full object-cover border border-border shrink-0"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">{app.name}</span>
                        <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      </div>
                      <span className="text-xs font-bold text-primary shrink-0">{app.bidAmount}</span>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{app.role}</span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="h-3 w-3 fill-amber-500" />
                        {app.rating}
                      </span>
                    </div>

                    <p className="text-sm text-foreground/90 line-clamp-1 italic font-light">
                      &ldquo;{app.pitch}&rdquo;
                    </p>

                    <div className="text-xs text-muted-foreground pt-1 flex items-center justify-between">
                      <span className="truncate">Proyek: <strong className="text-foreground">{app.projectTitle}</strong></span>
                      <span className="font-semibold text-emerald-600 shrink-0">{app.deliveryDays} hari</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. ESCROW & SAFE MILESTONE TRUST GUARANTEE BANNER */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/5 via-blue-500/5 to-indigo-500/5 p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Proteksi Escrow 100% Aman</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dana proyekmu tersimpan aman di rekening escrow terproteksi dan hanya akan dicairkan ke freelancer setelah kamu menyetujui milestone.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Talenta Teruji & Bebas Resiko</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Setiap freelancer yang mengajukan proposal telah lulus verifikasi portofolio dan asesmen skill coding komprehensif.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Turnaround Cepat & Milestone Jelas</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dapatkan proposal pertama dalam 15 menit, sepakati deliverable per milestone, dan nikmati serah terima source code 100% legal milikmu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. INTERACTIVE MULTI-STEP "PASANG PROYEK BARU" MODAL */}
      {/* ============================================================ */}
      {mounted &&
        isCreateModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {submitSuccess ? (
                <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-foreground">Proyek Berhasil Dipublikasikan!</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Proyekmu kini aktif dalam status <strong>Dalam Seleksi (Hiring)</strong>. Freelancer terverifikasi akan segera mengirimkan proposal pengerjaan.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Project Creation Wizard</span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">Pasang Proyek / Quest Baru</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rancang kebutuhan proyekmu dengan estimasi milestone dan perlindungan escrow otomatis.
                    </p>
                  </div>

                  {/* Step Indicators */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { step: 1, title: "1. Info & Kategori" },
                      { step: 2, title: "2. Scope & Skills" },
                      { step: 3, title: "3. Budget & Milestone" },
                    ].map((s) => (
                      <button
                        key={s.step}
                        type="button"
                        onClick={() => setCreateStep(s.step as 1 | 2 | 3)}
                        className={`rounded-xl py-2 px-3 text-xs font-semibold transition-all text-center ${createStep === s.step
                          ? "bg-primary text-white shadow-xs"
                          : createStep > s.step
                            ? "bg-primary/15 text-primary border border-primary/20"
                            : "bg-muted text-muted-foreground"
                          }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleCreateProjectSubmit} className="space-y-5">
                    {/* STEP 1: Basic Information */}
                    {createStep === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Judul Proyek <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            placeholder="e.g. Membangun SaaS Dashboard Multi-Tenant dengan Next.js 14"
                            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Kategori Spesialisasi <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="Frontend & Web">Frontend & Web Application</option>
                            <option value="Mobile App Development">Mobile App (Flutter / React Native)</option>
                            <option value="AI & Machine Learning">AI, Machine Learning & LLM Integration</option>
                            <option value="UI/UX & Product Design">UI/UX & Product Design System</option>
                            <option value="Backend & Database">Backend, Database & Cloud APIs</option>
                            <option value="DevOps & Cloud Systems">DevOps, Docker & Security</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Deskripsi Kebutuhan & Deliverable <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            rows={4}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            required
                            placeholder="Jelaskan tujuan proyek, fitur-fitur utama yang diharapkan, referensi desain/arsitektur, dan ekspektasi hasil akhir..."
                            className="w-full rounded-xl border border-input bg-background p-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          />
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setCreateStep(2)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-600 transition-all"
                          >
                            <span>Lanjut ke Kebutuhan Skill</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Scope, Skills, Complexity */}
                    {createStep === 2 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Tingkat Kompleksitas Proyek
                          </label>
                          <div className="grid grid-cols-3 gap-2.5">
                            {[
                              { level: "Starter" as const, desc: "Landing page, bugfix, prototype" },
                              { level: "Standard" as const, desc: "Full feature web/app, AI agent" },
                              { level: "Enterprise" as const, desc: "Arsitektur kompleks skala besar" },
                            ].map((item) => (
                              <button
                                type="button"
                                key={item.level}
                                onClick={() => setNewDifficulty(item.level)}
                                className={`rounded-xl border p-3 text-left transition-all ${newDifficulty === item.level
                                  ? "border-primary bg-primary/10 text-foreground shadow-xs"
                                  : "border-border/80 bg-background text-muted-foreground hover:border-border"
                                  }`}
                              >
                                <div className="text-xs font-bold text-foreground">{item.level}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-foreground">
                            Kebutuhan Tech Stack & Keahlian
                          </label>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddSkill();
                                }
                              }}
                              placeholder="Ketik skill (e.g. Next.js, Figma, Python) dan tekan Tambah"
                              className="h-10 flex-1 rounded-xl border border-input bg-background px-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <button
                              type="button"
                              onClick={handleAddSkill}
                              className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
                            >
                              Tambah
                            </button>
                          </div>

                          {/* Skill Pills */}
                          <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 rounded-xl bg-muted/40 border border-border/60">
                            {newSkills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center gap-1 rounded-lg bg-card border border-border px-2.5 py-1 text-xs font-medium text-foreground"
                              >
                                <span>{skill}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill)}
                                  className="text-muted-foreground hover:text-rose-500"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setCreateStep(1)}
                            className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            ← Kembali
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreateStep(3)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-primary-600 transition-all"
                          >
                            <span>Lanjut ke Budget & Escrow</span>
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Budget, Timeline, Escrow Breakdown */}
                    {createStep === 3 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground">
                              Alokasi Budget Proyek (Rp) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={newBudget}
                              onChange={(e) => setNewBudget(e.target.value)}
                              required
                              placeholder="7500000"
                              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm font-bold text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Estimasi: Rp {parseInt(newBudget || "0", 10).toLocaleString("id-ID")}
                            </p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold mb-1.5 text-foreground">
                              Target Durasi Pengerjaan (Hari) <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="number"
                              value={newDurationDays}
                              onChange={(e) => setNewDurationDays(e.target.value)}
                              required
                              placeholder="14"
                              className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                            <p className="text-[11px] text-muted-foreground mt-1">
                              Target: {newDurationDays} hari kalender
                            </p>
                          </div>
                        </div>

                        {/* Escrow Breakdown Box */}
                        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/5 to-indigo-500/5 p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span>Simulasi Pencairan Milestone Escrow</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40">
                              <div>
                                <span className="font-semibold text-foreground block">Milestone 1: Kickoff & Core Architecture (40%)</span>
                                <span className="text-[11px] text-muted-foreground">Deliverable awal dan setup repository</span>
                              </div>
                              <span className="font-bold text-foreground">
                                Rp {(parseInt(newBudget || "0", 10) * 0.4).toLocaleString("id-ID")}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-lg bg-card/60 border border-border/40">
                              <div>
                                <span className="font-semibold text-foreground block">Milestone 2: Final QA & Handover (60%)</span>
                                <span className="text-[11px] text-muted-foreground">Source code lengkap, deployment & IP transfer</span>
                              </div>
                              <span className="font-bold text-foreground">
                                Rp {(parseInt(newBudget || "0", 10) * 0.6).toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                            <span>Dana hanya ditarik ke escrow saat kamu menyetujui pelamar terpilih.</span>
                          </div>
                        </div>

                        <div className="pt-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setCreateStep(2)}
                            className="rounded-xl border border-border px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                          >
                            ← Kembali
                          </button>

                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                <span>Mempublikasikan...</span>
                              </>
                            ) : (
                              <>
                                <Send className="h-3.5 w-3.5" />
                                <span>Publikasikan Proyek Sekarang</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* ============================================================ */}
      {/* 9. PROPOSAL REVIEW MODAL */}
      {/* ============================================================ */}
      {mounted &&
        selectedProjectForProposals &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedProjectForProposals(null)}
            />
            <div className="relative z-10 w-full max-w-3xl rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProjectForProposals(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <span className="text-xs font-semibold text-primary">{selectedProjectForProposals.category}</span>
                <h2 className="text-xl font-bold text-foreground">
                  Tinjau Pelamar Proposal: {selectedProjectForProposals.title}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alokasi Budget: <strong className="text-foreground">{selectedProjectForProposals.budget}</strong> • {selectedProjectForProposals.applicants.length} Proposal Masuk
                </p>
              </div>

              <div className="space-y-4">
                {selectedProjectForProposals.applicants.map((app) => {
                  const isAccepted = acceptedProposalId === app.id;

                  return (
                    <div
                      key={app.id}
                      className={`rounded-2xl border p-5 transition-all space-y-3 ${isAccepted
                        ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                        : "border-border/70 bg-card hover:border-primary/40"
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={app.avatar}
                            alt={app.name}
                            className="h-12 w-12 rounded-xl object-cover border border-border"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span className="rounded-md bg-primary/10 px-2 py-0.2 text-[10px] font-semibold text-primary">
                                {app.badge}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">{app.role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs font-bold text-primary block">{app.bidAmount}</span>
                            <span className="text-[11px] text-muted-foreground">{app.deliveryDays} hari kerja</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            <span>{app.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pitch */}
                      <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/40">
                        &ldquo;{app.pitch}&rdquo;
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap gap-1.5">
                          {app.skills.map((s) => (
                            <span
                              key={s}
                              className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2">
                          {isAccepted ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Telah Diterima & Escrow Terkunci</span>
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedProjectForProposals(null);
                                  setSelectedTalentForInvite({
                                    id: app.id,
                                    name: app.name,
                                    avatar: app.avatar,
                                    role: app.role,
                                    level: "Verified Pro",
                                    category: selectedProjectForProposals.category,
                                    serviceTitle: selectedProjectForProposals.title,
                                    thumbnail: "",
                                    rating: app.rating,
                                    reviewsCount: app.reviewsCount,
                                    startingPrice: app.bidAmount,
                                    deliveryTime: `${app.deliveryDays} hari`,
                                    skills: app.skills,
                                  });
                                }}
                                className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
                              >
                                Hubungi Chat
                              </button>
                              <button
                                onClick={() => {
                                  setAcceptedProposalId(app.id);
                                  setTimeout(() => {
                                    setSelectedProjectForProposals(null);
                                  }, 1800);
                                }}
                                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                              >
                                Terima Proposal & Danai Escrow
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ============================================================ */}
      {/* 10. INVITE TALENT TO PROJECT MODAL */}
      {/* ============================================================ */}
      {mounted &&
        selectedTalentForInvite &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedTalentForInvite(null)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedTalentForInvite(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {inviteSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Undangan Berhasil Terkirim!</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTalentForInvite.name} telah menerima notifikasi undangan proyek dan akan segera menghubungimu.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTalentForInvite.avatar}
                      alt={selectedTalentForInvite.name}
                      className="h-12 w-12 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold text-foreground">{selectedTalentForInvite.name}</h3>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedTalentForInvite.role}</p>
                      <span className="text-xs font-bold text-primary">{selectedTalentForInvite.startingPrice}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSendTalentInvite} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-foreground">
                        Pilih Proyek yang Ingin Ditawarkan
                      </label>
                      <select
                        value={inviteProjectId}
                        onChange={(e) => setInviteProjectId(e.target.value)}
                        className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {projects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.budget})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-foreground">
                        Pesan Tambahan / Catatan Singkat
                      </label>
                      <textarea
                        rows={3}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Hai! Saya tertarik dengan portofoliomu dan ingin mengundangmu mengajukan proposal untuk proyek ini..."
                        className="w-full rounded-xl border border-input bg-background p-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTalentForInvite(null)}
                        className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                      >
                        Kirim Undangan Proyek
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
