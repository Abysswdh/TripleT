/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Star,
  Clock,
  Award,
  Flame,
  ArrowRight,
  Heart,
  MapPin,
  Check,
  Edit3,
  Share2,
  Zap,
  Briefcase
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { getClientProjects, type ProjectRecord } from "@/lib/services/projects";

export interface TalentProfile {
  id: string;
  name: string;
  avatar: string;
  coverImage?: string;
  role: string;
  location: string;
  organization: string;
  level: string;
  category: string;
  projectsCount: number;
  rating: number;
  reviewsCount: number;
  responseTime: string;
  earnings: string;
  aboutMe: string[];
  streakWeeks: number;
  availability?: string;
  verifiedSkills: string[];
  otherSkills: string[];
  recentProjects: {
    id: string;
    title: string;
    category: string;
    description: string;
    image: string;
    tags: string[];
    isFeatured?: boolean;
  }[];
}

export const TALENT_PROFILES: Record<string, TalentProfile> = {
  "tal-1": {
    id: "tal-1",
    name: "Dimas Arya Pratama",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
    role: "Senior Full-Stack Developer",
    location: "Bandung, Indonesia",
    organization: "Institut Teknologi Bandung",
    level: "Verified Pro",
    category: "Frontend",
    projectsCount: 142,
    rating: 4.9,
    reviewsCount: 38,
    responseTime: "2hrs",
    earnings: "$120k+",
    aboutMe: [
      "I build robust, scalable web applications from architecture to deployment. With over 8 years of experience in the startup ecosystem, I specialize in transforming complex business requirements into clean, maintainable code.",
      "My approach is deeply collaborative. I don't just write code; I partner with clients to understand their users and business goals, ensuring every technical decision drives value. Whether you need a rapid MVP or a refactor of a legacy monolithic system, I bring strategic thinking and technical excellence to the table."
    ],
    streakWeeks: 12,
    availability: "15 – 30 Jam / Minggu (Part-Time)",
    verifiedSkills: ["REACT", "NODE.JS", "TYPESCRIPT", "SYSTEM DESIGN", "NEXT.JS", "SUPABASE"],
    otherSkills: ["AWS", "GRAPHQL", "POSTGRESQL", "TAILWIND CSS", "DOCKER"],
    recentProjects: [
      {
        id: "p-1",
        title: "Nexus Trading Platform",
        category: "FINTECH APP",
        description: "Architected a real-time trading dashboard using React, WebSockets, and Node.js. Improved data streaming throughput by 45% and reduced UI latency to sub-50ms.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
        tags: ["REACT", "NODE", "WEBSOCKETS"],
        isFeatured: true
      },
      {
        id: "p-2",
        title: "Lumina E-commerce",
        category: "E-COMMERCE & RETAIL",
        description: "Headless Shopify implementation with Next.js for a boutique lighting brand.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
        tags: ["NEXT.JS", "SHOPIFY API"]
      },
      {
        id: "p-3",
        title: "MedSync Portal",
        category: "HEALTHCARE PLATFORM",
        description: "Secure patient management portal adhering to strict compliance standards.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
        tags: ["VUE.JS", "PYTHON"]
      }
    ]
  },
  "tal-2": {
    id: "tal-2",
    name: "Siti Rahmawati",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    role: "Lead UI/UX & Product Designer",
    location: "Jakarta Selatan, Indonesia",
    organization: "Universitas Indonesia",
    level: "Top Rated",
    category: "UI/UX",
    projectsCount: 98,
    rating: 5.0,
    reviewsCount: 52,
    responseTime: "1hr",
    earnings: "$95k+",
    aboutMe: [
      "I craft intuitive, conversion-focused digital experiences and design systems that bridge business goals with user delight. With over 6 years leading design teams, I specialize in end-to-end product design from user research to production-ready Figma design systems.",
      "My design methodology emphasizes atomic components, accessibility (WCAG), and seamless developer handoff to ensure rapid, consistent engineering implementation."
    ],
    streakWeeks: 18,
    availability: "> 30 Jam / Minggu (Full-Time)",
    verifiedSkills: ["FIGMA", "DESIGN SYSTEMS", "PROTOTYPING", "USER RESEARCH", "WIREFRAMING"],
    otherSkills: ["UI DESIGN", "UX AUDIT", "DESIGN TOKENS", "MOBILE APP UI"],
    recentProjects: [
      {
        id: "p-1",
        title: "Apex Finance Design System",
        category: "FINTECH & BANKING",
        description: "Comprehensive 200+ component atomic design system in Figma with dark/light mode tokens and responsive guidelines.",
        image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80",
        tags: ["FIGMA", "DESIGN SYSTEM", "MOBILE"],
        isFeatured: true
      },
      {
        id: "p-2",
        title: "KlinikSehat Telemed Mobile",
        category: "MOBILE APP",
        description: "User journey and high-fidelity prototype for prescription ordering and doctor consultations.",
        image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80",
        tags: ["FIGMA", "PROTOTYPING"]
      },
      {
        id: "p-3",
        title: "SaaS Analytics Web App",
        category: "WEB DASHBOARD",
        description: "Clean data visualization interfaces and custom chart components.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
        tags: ["DASHBOARD", "UI/UX"]
      }
    ]
  },
  "tal-3": {
    id: "tal-3",
    name: "Reza Mahendra",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
    role: "AI Engineer & Machine Learning Specialist",
    location: "Yogyakarta, Indonesia",
    organization: "Universitas Gadjah Mada",
    level: "Verified Pro",
    category: "AI & Machine",
    projectsCount: 76,
    rating: 4.9,
    reviewsCount: 29,
    responseTime: "3hrs",
    earnings: "$140k+",
    aboutMe: [
      "I specialize in production-grade LLM integrations, autonomous AI agents, Retrieval-Augmented Generation (RAG) pipelines, and low-latency voice AI systems.",
      "Whether building custom model fine-tuning workflows, enterprise vector search with pgvector/Pinecone, or FastAPI asynchronous microservices, I deliver intelligent applications that perform reliably under high load."
    ],
    streakWeeks: 10,
    availability: "15 – 30 Jam / Minggu (Part-Time)",
    verifiedSkills: ["PYTHON", "FASTAPI", "OPENAI", "LANGCHAIN", "RAG PIPELINES", "WEBSOCKETS"],
    otherSkills: ["PYTORCH", "PINECONE", "DOCKER", "POSTGRESQL", "HUGGINGFACE"],
    recentProjects: [
      {
        id: "p-1",
        title: "OmniVoice Customer AI Agent",
        category: "VOICE AI & LLM",
        description: "Real-time bidirectional voice assistant powered by OpenAI Realtime API and FastAPI WebSockets with sub-300ms response time.",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
        tags: ["PYTHON", "OPENAI", "WEBSOCKETS"],
        isFeatured: true
      },
      {
        id: "p-2",
        title: "DocuQuery Enterprise RAG",
        category: "ENTERPRISE SEARCH",
        description: "Hybrid vector search across 50,000+ internal PDF documents with precise source attribution.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
        tags: ["LANGCHAIN", "PINECONE"]
      },
      {
        id: "p-3",
        title: "Automated Ticket Classifier",
        category: "NLP & ML",
        description: "Fine-tuned transformer model for triage and auto-routing of customer tickets.",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
        tags: ["PYTHON", "FASTAPI"]
      }
    ]
  },
  "tal-4": {
    id: "tal-4",
    name: "Budi Santoso",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    role: "Mobile App Flutter Specialist",
    location: "Malang, Indonesia",
    organization: "BINUS University",
    level: "Top Rated",
    category: "Mobile",
    projectsCount: 110,
    rating: 4.8,
    reviewsCount: 24,
    responseTime: "2hrs",
    earnings: "$80k+",
    aboutMe: [
      "I develop high-performance cross-platform mobile apps for iOS & Android with Flutter, clean architecture (Bloc/Riverpod), and robust payment gateway integrations.",
      "With 5+ years crafting consumer and enterprise mobile solutions, I handle everything from pixel-perfect UI animations to native device feature bindings and App Store / Play Store deployment."
    ],
    streakWeeks: 14,
    availability: "< 15 Jam / Minggu (Side Hustle)",
    verifiedSkills: ["FLUTTER", "DART", "FIREBASE", "MIDTRANS", "BLOC / RIVERPOD"],
    otherSkills: ["REST API", "OFFLINE-FIRST", "BIOMETRICS", "PUSH NOTIFICATIONS"],
    recentProjects: [
      {
        id: "p-1",
        title: "PayKu Fintech Digital Wallet",
        category: "FINTECH MOBILE APP",
        description: "Full-featured digital wallet mobile app with QRIS scanner, biometric authentication, and multi-bank virtual accounts.",
        image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
        tags: ["FLUTTER", "DART", "MIDTRANS"],
        isFeatured: true
      },
      {
        id: "p-2",
        title: "LogisTrack Fleet Courier App",
        category: "LOGISTICS & GPS",
        description: "Real-time background GPS tracking and proof-of-delivery photo capture for dispatch drivers.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
        tags: ["FLUTTER", "FIREBASE"]
      },
      {
        id: "p-3",
        title: "SatuWarung POS Mobile",
        category: "RETAIL & INVENTORY",
        description: "Offline-first point-of-sale app with thermal bluetooth receipt printer support.",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
        tags: ["DART", "BLOC"]
      }
    ]
  }
};

export const DEFAULT_PROFILE: TalentProfile = {
  id: "default",
  name: "Dimas Arya Pratama",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
  role: "Senior Full-Stack Developer",
  location: "Bandung, Indonesia",
  organization: "Institut Teknologi Bandung",
  level: "Verified Pro",
  category: "Frontend",
  projectsCount: 142,
  rating: 4.9,
  reviewsCount: 38,
  responseTime: "2hrs",
  earnings: "$120k+",
  aboutMe: [
    "I build robust, scalable web applications from architecture to deployment. With over 8 years of experience in the startup ecosystem, I specialize in transforming complex business requirements into clean, maintainable code.",
    "My approach is deeply collaborative. I don't just write code; I partner with clients to understand their users and business goals, ensuring every technical decision drives value. Whether you need a rapid MVP or a refactor of a legacy monolithic system, I bring strategic thinking and technical excellence to the table."
  ],
  streakWeeks: 12,
  verifiedSkills: ["REACT", "NODE.JS", "TYPESCRIPT", "SYSTEM DESIGN", "NEXT.JS", "SUPABASE"],
  otherSkills: ["AWS", "GRAPHQL", "POSTGRESQL", "TAILWIND CSS", "DOCKER"],
  recentProjects: [
    {
      id: "p-1",
      title: "Nexus Trading Platform",
      category: "FINTECH APP",
      description: "Architected a real-time trading dashboard using React, WebSockets, and Node.js. Improved data throughput by 45% and reduced latency to sub-50ms.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
      tags: ["REACT", "NODE", "WEBSOCKETS"],
      isFeatured: true
    },
    {
      id: "p-2",
      title: "Lumina E-commerce",
      category: "E-COMMERCE",
      description: "Headless Shopify implementation with Next.js for a boutique lighting brand.",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80",
      tags: ["NEXT.JS", "SHOPIFY API"]
    },
    {
      id: "p-3",
      title: "MedSync Portal",
      category: "HEALTHCARE",
      description: "Secure patient management portal adhering to strict compliance standards.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&auto=format&fit=crop&q=80",
      tags: ["VUE.JS", "PYTHON"]
    }
  ]
};

// Generate 16 weeks of GitHub-style contribution data
function generateGitHubHeatmap() {
  const weeks = 16;
  const days = 7;
  const heatmap: Array<Array<{ level: number; date: string; count: number }>> = [];

  const pattern = [
    [0, 1, 0, 2, 0, 1, 0],
    [1, 0, 2, 1, 3, 0, 1],
    [0, 2, 1, 0, 2, 1, 0],
    [1, 1, 0, 3, 2, 0, 1],
    [2, 0, 1, 1, 4, 1, 0],
    [0, 1, 3, 2, 0, 2, 1],
    [1, 2, 0, 1, 3, 1, 0],
    [2, 1, 2, 0, 1, 2, 1],
    [0, 3, 1, 2, 4, 0, 1],
    [1, 0, 2, 3, 1, 2, 0],
    [2, 1, 0, 2, 3, 1, 1],
    [1, 3, 2, 1, 0, 2, 1],
    [3, 2, 4, 1, 2, 3, 0],
    [2, 3, 1, 4, 2, 1, 2],
    [1, 2, 3, 2, 4, 3, 1],
    [2, 4, 3, 3, 4, 3, 0],
  ];

  for (let w = 0; w < weeks; w++) {
    const weekCol: Array<{ level: number; date: string; count: number }> = [];
    for (let d = 0; d < days; d++) {
      const level = pattern[w] ? pattern[w][d] : Math.floor(Math.random() * 3);
      const count = level === 0 ? 0 : level * 2 + 1;
      weekCol.push({
        level,
        date: `Minggu ${w + 1}, Hari ${d + 1}`,
        count,
      });
    }
    heatmap.push(weekCol);
  }
  return heatmap;
}

interface FreelancerProfileViewProps {
  talentId?: string;
  isOwner?: boolean;
}

export function FreelancerProfileView({ talentId = "tal-1", isOwner = false }: FreelancerProfileViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [liveProfile, setLiveProfile] = useState<TalentProfile | null>(null);
  const githubHeatmap = useMemo(() => generateGitHubHeatmap(), []);

  const baseProfile = TALENT_PROFILES[talentId] || DEFAULT_PROFILE;

  // If viewing own profile, initialize with the current user's actual profile details
  const meta = user?.user_metadata || {};
  const localProfile: TalentProfile = isOwner && user
    ? {
        id: user.id,
        name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "Freelancer"),
        avatar: meta.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
        coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
        role: meta.headline || (meta.skills && meta.skills[0] ? `${meta.skills[0]} Specialist` : "Digital Specialist"),
        location: meta.location || "Indonesia",
        organization: "Member Terdaftar TripleT",
        level: "Verified Pro",
        category: "Web & Tech",
        projectsCount: 0,
        rating: 5.0,
        reviewsCount: 0,
        responseTime: "< 2 Jam",
        earnings: meta.hourly_rate ? `Rp ${(meta.hourly_rate * 20).toLocaleString("id-ID")}` : "Rp 0",
        availability: meta.weekly_availability === "part_time"
          ? "< 15 Jam / Mgg"
          : meta.weekly_availability === "full_time"
          ? "> 30 Jam / Mgg"
          : meta.weekly_availability === "flexible"
          ? "Fleksibel"
          : "15–30 Jam / Mgg",
        aboutMe: meta.bio ? [meta.bio] : [
          "Freelancer spesialis terdaftar di platform TripleT. Berpengalaman mengerjakan proyek pengembangan teknologi dan desain modern."
        ],
        streakWeeks: 1,
        verifiedSkills: meta.skills && meta.skills.length > 0 ? meta.skills : ["React", "TypeScript", "Next.js"],
        otherSkills: ["Git", "REST API"],
        recentProjects: [],
      }
    : baseProfile;

  const profile: TalentProfile = liveProfile || localProfile;

  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const supabase = createClient();
        const targetUserId = isOwner ? user?.id : talentId;
        if (!targetUserId) return;

        // 1. Fetch freelancer profile & user data
        const { data, error } = await supabase
          .from("freelancer_profiles")
          .select(`
            *,
            user:users!user_id(id, full_name, avatar_url, location, is_verified, bio, email)
          `)
          .or(`user_id.eq.${targetUserId},id.eq.${targetUserId}`)
          .maybeSingle();

        // 2. Fetch portfolio projects if any
        const { data: portData } = await supabase
          .from("portfolio_projects")
          .select("*")
          .eq("freelancer_id", targetUserId);

        if (data && !error) {
          const u = data.user || user?.user_metadata || {};
          const mappedPortfolio = ((portData as Array<Record<string, unknown>>) || []).map((p) => ({
            id: String(p.id || ""),
            title: String(p.title || "Proyek Portofolio"),
            category: String(p.category || "PROJECT"),
            description: String(p.description || ""),
            image: String(p.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"),
            tags: (p.technologies as string[]) || ["TECH"]
          }));

          setLiveProfile({
            id: data.id || targetUserId,
            name: u.full_name || meta.full_name || (u.email ? u.email.split("@")[0] : baseProfile.name),
            avatar: u.avatar_url || meta.avatar_url || baseProfile.avatar,
            coverImage: data.cover_image || baseProfile.coverImage,
            role: data.headline || meta.headline || baseProfile.role,
            location: u.location || meta.location || "Indonesia",
            organization: data.education || baseProfile.organization,
            level: (data.badge_level as string) || "Verified Pro",
            category: data.category || baseProfile.category,
            projectsCount: data.completed_projects_count || 0,
            rating: Number(data.average_rating) || 5.0,
            reviewsCount: data.total_reviews_count || 0,
            responseTime: "< 2 Jam",
            earnings: data.hourly_rate ? `Rp ${(data.hourly_rate * 20).toLocaleString("id-ID")}` : "Rp 0",
            availability: data.starting_price?.includes("Jam")
              ? data.starting_price.split("(")[0].trim()
              : data.availability || (meta.weekly_availability === "part_time"
              ? "< 15 Jam / Mgg"
              : meta.weekly_availability === "full_time"
              ? "> 30 Jam / Mgg"
              : meta.weekly_availability === "flexible"
              ? "Fleksibel"
              : "15–30 Jam / Mgg"),
            aboutMe: data.bio ? [data.bio] : (u.bio ? [u.bio] : baseProfile.aboutMe),
            streakWeeks: data.streak_weeks || 1,
            verifiedSkills: data.skills && data.skills.length > 0 ? data.skills : (meta.skills || baseProfile.verifiedSkills),
            otherSkills: data.other_skills || baseProfile.otherSkills,
            recentProjects: mappedPortfolio.length > 0 ? mappedPortfolio : (isOwner ? [] : baseProfile.recentProjects),
          });
        }
      } catch (err) {
        console.info("Supabase profile fetch fallback to local:", err);
      }
    }

    fetchFromSupabase();
  }, [talentId, isOwner, user?.id, baseProfile]);

  const [isSaved, setIsSaved] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [hireMessage, setHireMessage] = useState("");
  const [hireSuccess, setHireSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [clientProjects, setClientProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  useEffect(() => {
    async function loadClientProjects() {
      const projs = await getClientProjects();
      if (projs && projs.length > 0) {
        setClientProjects(projs);
        setSelectedProjectId(projs[0].id);
      }
    }
    loadClientProjects();
  }, []);

  const activeTargetProject = clientProjects.find((p) => p.id === selectedProjectId) || clientProjects[0] || null;

  const handleHireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHireSuccess(true);
    setTimeout(() => {
      setHireSuccess(false);
      setIsHireModalOpen(false);
      setHireMessage("");
    }, 1800);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const featuredProject = profile.recentProjects.find((p) => p.isFeatured) || profile.recentProjects[0];
  const otherProjects = profile.recentProjects.filter((p) => p.id !== featuredProject?.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Top Back Navigation for Visitor */}
        {!isOwner && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Kembali ke Cari Talenta</span>
            </button>
          </div>
        )}

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================= */}
          {/* LEFT COLUMN: Identity, Quick Stats, Verified Skills (4 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Profile Identity Card */}
            <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm">
              {/* Header Cover Banner */}
              <div className="relative h-28 w-full bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-purple-500/30 overflow-hidden">
                {profile.coverImage && (
                  <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="h-full w-full object-cover opacity-60"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              </div>

              {/* Avatar & Main Info */}
              <div className="px-6 pb-6 -mt-12 space-y-4 text-center">
                <div className="relative inline-block mx-auto">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-24 w-24 rounded-full object-cover border-4 border-card shadow-lg bg-muted mx-auto"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{profile.role}</p>
                  
                  {profile.location && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{profile.location}</span>
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                {isOwner ? (
                  <div className="flex items-center gap-2 pt-2">
                    <Link
                      href="/freelancer/settings?tab=profile"
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-3 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Profil</span>
                    </Link>

                    <button
                      onClick={handleCopyLink}
                      className="p-3 rounded-2xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                      title={copiedLink ? "Link Disalin!" : "Bagikan Profil"}
                    >
                      {copiedLink ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setIsHireModalOpen(true)}
                      className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-3 shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
                    >
                      Hire Me
                    </button>

                    <button
                      onClick={() => setIsSaved(!isSaved)}
                      className={`p-3 rounded-2xl border transition-all ${
                        isSaved
                          ? "border-rose-500 bg-rose-500/10 text-rose-500"
                          : "border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                      title={isSaved ? "Tersimpan" : "Simpan Profil"}
                    >
                      <Heart className={`h-4 w-4 ${isSaved ? "fill-rose-500" : ""}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. 4 Quick Stat Cards (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Stat 1: Projects */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.projectsCount}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Projects</div>
              </div>

              {/* Stat 2: Rating */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.rating}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Rating</div>
              </div>

              {/* Stat 3: Response */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.responseTime}</div>
                <div className="text-[11px] text-muted-foreground font-medium">Response</div>
              </div>

              {/* Stat 4: Kapasitas / Availability */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <div className="text-sm sm:text-base font-bold text-emerald-600 truncate" title={profile.availability || "15–30 Jam / Minggu"}>
                  {profile.availability?.split("(")[0]?.trim() || "15–30 Jam/Mgg"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Kapasitas / Mgg</div>
              </div>
            </div>

            {/* 3. Verified Skills Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground tracking-tight">Verified Skills</h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.verifiedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"
                  >
                    <Check className="h-3 w-3" />
                    <span>{skill}</span>
                  </span>
                ))}
                {profile.otherSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-xl border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: About Me, Streak Heatmap, Recent Projects (8 cols) */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. About Me Card */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-foreground">About Me</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                {profile.aboutMe.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* 2. GitHub-Style Green Contribution Heatmap & Streak */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                    <Flame className="h-5 w-5 fill-emerald-500 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      6 Hari Streak Konsisten
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Total 48 kontribusi aktif dalam 4 bulan terakhir
                    </p>
                  </div>
                </div>
              </div>

              {/* True GitHub-Style Contribution Heatmap Matrix */}
              <div className="rounded-2xl bg-muted/20 border border-border/50 p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Agu</span>
                  <span>Sep</span>
                </div>

                {/* Heatmap Grid: 16 Week Columns x 7 Day Rows */}
                <div className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-1 scrollbar-none justify-between">
                  {githubHeatmap.map((week, wIdx) =>
                    week.map((day, dIdx) => (
                      <div
                        key={`${wIdx}-${dIdx}`}
                        title={`${day.count} aktivitas pada ${day.date}`}
                        className={`h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-[3px] transition-all hover:scale-125 cursor-pointer ${
                          day.level === 0
                            ? "bg-muted/60"
                            : day.level === 1
                            ? "bg-emerald-500/30"
                            : day.level === 2
                            ? "bg-emerald-500/60"
                            : day.level === 3
                            ? "bg-emerald-500/85"
                            : "bg-emerald-600 dark:bg-emerald-400"
                        }`}
                      />
                    ))
                  )}
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground font-medium">
                  <span>Kurang</span>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-muted/60" />
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/30" />
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/60" />
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/85" />
                    <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-400" />
                  </div>
                  <span>Lebih</span>
                </div>
              </div>
            </div>

            {/* 3. Recent Projects Portfolio */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Recent Projects</h2>
                {isOwner ? (
                  <Link href="/freelancer/my-work" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    <span>PORTFOLIO & MY WORK</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <button className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                    <span>VIEW ALL</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* Featured Project Horizontal Card */}
              {featuredProject && (
                <div className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:border-primary/40 hover:shadow-md transition-all grid grid-cols-1 md:grid-cols-12">
                  <div className="md:col-span-6 relative aspect-video md:aspect-auto overflow-hidden bg-muted">
                    <img
                      src={featuredProject.image}
                      alt={featuredProject.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                        {featuredProject.category}
                      </span>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {featuredProject.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {featuredProject.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {featuredProject.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Projects Grid (2 cols) */}
              <div className="grid gap-4 sm:grid-cols-2">
                {otherProjects.map((proj) => (
                  <div
                    key={proj.id}
                    className="group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-sm hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-5 space-y-2">
                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                          {proj.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0 flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hire Talent Modal */}
      {isHireModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            <ModalCloseButton onClick={() => setIsHireModalOpen(false)} />

            {hireSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Tawaran Proyek Terkirim!</h3>
                <p className="text-xs text-muted-foreground">
                  {profile.name} telah menerima pesan penawaranmu dan akan segera merespon via chat pesan langsung.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-12 w-12 rounded-full object-cover border-2 border-primary/20"
                  />
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                      <span>Hire {profile.name}</span>
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    </h3>
                    <p className="text-xs text-muted-foreground">{profile.role}</p>
                  </div>
                </div>

                <form onSubmit={handleHireSubmit} className="space-y-4 pt-2">
                  {/* Selected Project Card */}
                  <div className="p-3.5 rounded-2xl border border-primary/25 bg-primary/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Proyek yang Ditawarkan</span>
                      </span>
                      {activeTargetProject && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {activeTargetProject.budget}
                        </span>
                      )}
                    </div>

                    {clientProjects.length > 0 ? (
                      <select
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card p-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                      >
                        {clientProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} ({p.budget}) — {p.category}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Belum ada proyek dibuat.</span>
                        <Link href="/dashboard" className="text-primary font-bold hover:underline">
                          + Buat Proyek Baru
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5 text-foreground">
                      Pesan Singkat / Ringkasan Kebutuhan
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={hireMessage}
                      onChange={(e) => setHireMessage(e.target.value)}
                      placeholder={`Halo ${profile.name}, kami memiliki proyek ${activeTargetProject?.title || "pengembangan"} yang sesuai dengan keahlianmu. Bisakah kita berdiskusi lebih lanjut?`}
                      className="w-full rounded-2xl border border-border bg-muted/40 p-3.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsHireModalOpen(false)}
                      className="flex-1 rounded-2xl border border-border/80 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-2xl bg-primary py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 hover:bg-primary-600 transition-all"
                    >
                      Kirim Undangan Proyek
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
