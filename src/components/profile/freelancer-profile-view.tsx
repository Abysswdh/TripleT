/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Star,
  Clock,
  Award,
  ArrowRight,
  Heart,
  MapPin,
  Check,
  Edit3,
  Share2,
  Zap,
  Briefcase,
  Camera,
  Globe,
  Link as LinkIcon,
  ExternalLink,
  Banknote,
  Layers,
  FolderGit2,
} from "lucide-react";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { getClientProjects, type ProjectRecord } from "@/lib/services/projects";
import { fetchHeatmapData, type HeatmapData } from "@/lib/services/activity";
import { DoableStreakTracker } from "@/components/dashboard/doable-streak-tracker";

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
  rating: number | string;
  reviewsCount: number;
  responseTime?: string;
  earnings: string;
  aboutMe: string[];
  streakWeeks: number;
  availability?: string;
  workStatus?: "available" | "open" | "busy";
  startingPrice?: string;
  experienceLevel?: "starter" | "intermediate" | "expert" | string;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
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
    isPlatformContract?: boolean;
    amountDisplay?: string;
    completedAt?: string;
    rating?: number;
    reviewComment?: string;
  }[];
  isVerified?: boolean;
}

export const TALENT_PROFILES: Record<string, TalentProfile> = {
  "tal-1": {
    id: "tal-1",
    name: "Dimas Arya Pratama",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&auto=format&fit=crop&q=80",
    role: "Senior Full-Stack Developer",
    location: "Bandung, Indonesia",
    organization: "Institut Teknologi Bandung",
    level: "Verified Pro",
    category: "Frontend",
    projectsCount: 142,
    rating: 4.9,
    reviewsCount: 38,
    responseTime: "< 1 Jam",
    earnings: "Rp 145.000.000",
    workStatus: "available",
    startingPrice: "Rp 3.500.000",
    experienceLevel: "expert",
    githubUrl: "https://github.com/dimaspratama",
    linkedinUrl: "https://linkedin.com/in/dimaspratama",
    portfolioUrl: "https://dimaspratama.dev",
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
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
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

// Generate empty placeholder heatmap for pre-load state
function generateEmptyHeatmap(): HeatmapData["weeks"] {
  return Array.from({ length: 16 }, () =>
    Array.from({ length: 7 }, () => ({ date: "", count: 0, level: 0 as const }))
  );
}

function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function formatAvailabilityHours(raw?: string | null): string {
  if (!raw) return "15–30 Jam";
  const val = String(raw).toLowerCase().trim();

  if (val === "semi_full") return "15–30 Jam";
  if (val === "part_time") return "< 15 Jam";
  if (val === "full_time") return "> 30 Jam";
  if (val === "flexible") return "Fleksibel";

  if (val.includes("jam")) {
    const beforeParenthesis = raw?.split("(")[0]?.trim() || "";
    const cleaned = beforeParenthesis.replace(/\s*\/\s*(minggu|mgg)/gi, "").trim();
    return cleaned || "15–30 Jam";
  }

  if (val.includes("< 15")) return "< 15 Jam";
  if (val.includes("> 30")) return "> 30 Jam";
  if (val.includes("15") && val.includes("30")) return "15–30 Jam";

  return raw || "15–30 Jam";
}

interface FreelancerProfileViewProps {
  talentId?: string;
  isOwner?: boolean;
  showBackButton?: boolean;
}

export function FreelancerProfileView({
  talentId = "tal-1",
  isOwner = false,
  showBackButton,
}: FreelancerProfileViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [liveProfile, setLiveProfile] = useState<TalentProfile | null>(null);

  const targetUserId = (isOwner && user?.id)
    ? user.id
    : (talentId && talentId !== "tal-1" ? talentId : (user?.id || talentId || ""));

  // Real heatmap & streak data from DB
  const [heatmapData, setHeatmapData] = useState<HeatmapData>({
    weeks: generateEmptyHeatmap(),
    totalContributions: 0,
    streakDays: 0,
    monthLabels: [],
    activeDates: [],
  });

  useEffect(() => {
    const uid = targetUserId || user?.id;
    if (!uid) {
      setHeatmapData({
        weeks: generateEmptyHeatmap(),
        totalContributions: 0,
        streakDays: 0,
        monthLabels: [],
        activeDates: [],
      });
      return;
    }
    fetchHeatmapData(uid).then((data) => {
      if (data) setHeatmapData(data);
    });
  }, [targetUserId, user?.id]);

  // Synchronize streak on live activity events across the app
  useEffect(() => {
    const handleActivity = () => {
      const uid = targetUserId || user?.id;
      if (uid) {
        fetchHeatmapData(uid).then((data) => {
          if (data) setHeatmapData(data);
        });
      }
    };
    window.addEventListener("xp-updated", handleActivity);
    window.addEventListener("quiz-completed", handleActivity);
    return () => {
      window.removeEventListener("xp-updated", handleActivity);
      window.removeEventListener("quiz-completed", handleActivity);
    };
  }, [targetUserId, user?.id]);

  const streakDays = heatmapData.streakDays;
  const totalContributions = heatmapData.totalContributions;

  const DEFAULT_AVATAR = "/images/default-avatar.svg";
  const DEFAULT_BANNER = "";
  const isOldStockAvatar = (url?: string | null) => !url || url.includes("photo-1534528741775");
  const isOldStockBanner = (url?: string | null) => !url || url.includes("photo-1557804506");
  const cleanAvatar = (url?: string | null) => (url && !isOldStockAvatar(url) && typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))) ? url : DEFAULT_AVATAR;
  const cleanBanner = (url?: string | null) => (url && !isOldStockBanner(url) && typeof url === "string" && (url.startsWith("http") || url.startsWith("/"))) ? url : DEFAULT_BANNER;

  const meta = user?.user_metadata || {};

  const neutralPlaceholder: TalentProfile = {
    id: talentId || "profile",
    name: "Talenta Spesialis",
    avatar: DEFAULT_AVATAR,
    coverImage: DEFAULT_BANNER,
    role: "Digital Specialist",
    location: "Indonesia",
    organization: "Member Terdaftar TripleT",
    level: "Verified Pro",
    category: "Full-Stack Web & Next.js",
    projectsCount: 0,
    rating: "-",
    reviewsCount: 0,
    earnings: "Rp 0",
    workStatus: "available",
    startingPrice: "Rp 500.000",
    experienceLevel: "intermediate",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    aboutMe: ["Freelancer spesialis terdaftar di platform TripleT. Berpengalaman mengerjakan proyek pengembangan teknologi dan desain modern."],
    streakWeeks: 1,
    verifiedSkills: ["UI/UX Design", "Web Development"],
    otherSkills: ["Git", "REST API"],
    recentProjects: [],
  };

  const baseProfile = TALENT_PROFILES[talentId] || (talentId === "tal-1" ? DEFAULT_PROFILE : neutralPlaceholder);

  const localProfile: TalentProfile = isOwner && user
    ? {
        id: user.id,
        name: meta.full_name || meta.name || (user.email ? user.email.split("@")[0] : "Freelancer"),
        avatar: cleanAvatar(meta.avatar_url),
        coverImage: cleanBanner(meta.banner_url || meta.cover_image),
        role: meta.headline || (meta.skills && meta.skills[0] ? `${meta.skills[0]} Specialist` : "Digital Specialist"),
        location: meta.location || "Indonesia",
        organization: "Member Terdaftar TripleT",
        level: (meta.is_verified || user.user_metadata?.is_verified) ? "Verified Pro" : "Talenta Muda",
        category: "Web & Tech",
        projectsCount: 0,
        rating: meta.rating && Number(meta.reviews_count) > 0 ? Number(meta.rating) : "-",
        reviewsCount: Number(meta.reviews_count) || 0,
        earnings: meta.total_earnings ? `Rp ${Number(meta.total_earnings).toLocaleString("id-ID")}` : "Rp 0",
        workStatus: (meta.availability as "available" | "open" | "busy") || "available",
        startingPrice: meta.starting_price || (meta.hourly_rate ? `Rp ${Number(meta.hourly_rate).toLocaleString("id-ID")}` : "Rp 500.000"),
        experienceLevel: meta.experience_level || "intermediate",
        githubUrl: meta.github_url || "",
        linkedinUrl: meta.linkedin_url || "",
        portfolioUrl: meta.portfolio_url || "",
        availability: formatAvailabilityHours(meta.weekly_availability),
        aboutMe: meta.bio ? [meta.bio] : [
          "Freelancer spesialis terdaftar di platform TripleT. Berpengalaman mengerjakan proyek pengembangan teknologi dan desain modern."
        ],
        streakWeeks: 1,
        verifiedSkills: Array.isArray(meta.skills) && meta.skills.length > 0 ? meta.skills : [],
        otherSkills: [],
        recentProjects: [],
        isVerified: Boolean(meta.is_verified || user.user_metadata?.is_verified),
      }
    : baseProfile;

  const profile: TalentProfile = liveProfile || localProfile;

  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const supabase = createClient();
        const targetUserId = (isOwner && user?.id)
          ? user.id
          : (talentId && talentId !== "tal-1" ? talentId : (user?.id || talentId || ""));
        if (!targetUserId) return;

        let profileData: Record<string, unknown> | null = null;
        let userData: Record<string, unknown> | null = null;

        if (isValidUuid(targetUserId)) {
          // 1. Fetch freelancer profile & user data
          try {
            const { data: fpData, error: fpErr } = await supabase
              .from("freelancer_profiles")
              .select(`
                *,
                user:users!user_id(id, full_name, avatar_url, location, is_verified, bio, email)
              `)
              .or(`user_id.eq.${targetUserId},id.eq.${targetUserId}`)
              .maybeSingle();

            if (fpData && !fpErr) {
              profileData = fpData;
              userData = Array.isArray(fpData.user) ? fpData.user[0] : fpData.user;
            }
          } catch (e) {
            console.warn("Could not query freelancer_profiles join:", e);
          }

          // 2. If user data not retrieved through relation, fetch from users directly
          if (!userData) {
            try {
              const { data: uData } = await supabase
                .from("users")
                .select("id, full_name, avatar_url, location, is_verified, bio, email")
                .eq("id", targetUserId)
                .maybeSingle();

              if (uData) {
                userData = uData;
              }
            } catch (e) {
              console.warn("Could not query users table directly:", e);
            }
          }

          // 3. If profile data not retrieved, try query freelancer_profiles by user_id
          if (!profileData && (userData?.id || targetUserId)) {
            try {
              const uid = userData?.id || targetUserId;
              const { data: fpByUid } = await supabase
                .from("freelancer_profiles")
                .select("*")
                .eq("user_id", uid)
                .maybeSingle();

              if (fpByUid) {
                profileData = fpByUid;
              }
            } catch (e) {
              console.warn("Could not query freelancer_profiles by user_id:", e);
            }
          }
        }

        // 4. Fetch portfolio projects if any
        let mappedPortfolio: Array<{
          id: string;
          title: string;
          category: string;
          description: string;
          image: string;
          tags: string[];
          isFeatured?: boolean;
        }> = [];

        if (isValidUuid(targetUserId)) {
          try {
            const targetFreelancerId = profileData?.id || userData?.id || targetUserId;
            const { data: portData } = await supabase
              .from("portfolio_projects")
              .select("*")
              .or(`freelancer_id.eq.${targetFreelancerId},freelancer_id.eq.${targetUserId}`);

            if (portData && Array.isArray(portData)) {
              mappedPortfolio = portData.map((p) => ({
                id: String(p.id || ""),
                title: String(p.title || "Proyek Portofolio"),
                category: String(p.category || "PROJECT"),
                description: String(p.description || ""),
                image: String(p.image_url || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80"),
                tags: (p.technologies as string[]) || ["TECH"]
              }));
            }
          } catch (e) {
            console.warn("Could not query portfolio projects:", e);
          }
        }

        // 4b. Fetch actual completed contracts, total earnings, and map platform projects
        let liveCompletedContractsCount = 0;
        let liveEarningsSum = 0;
        let mappedContracts: Array<{
          id: string;
          title: string;
          category: string;
          description: string;
          image: string;
          tags: string[];
          isFeatured?: boolean;
          isPlatformContract?: boolean;
          amountDisplay?: string;
          completedAt?: string;
          rating?: number;
          reviewComment?: string;
        }> = [];

        if (isValidUuid(targetUserId)) {
          try {
            const targetFreelancerId = profileData?.id || userData?.id || targetUserId;
            const { count: completedCount, data: completedContracts } = await supabase
              .from("contracts")
              .select("id, project_id, status, total_amount, amount_display, completed_at, created_at, projects(*), reviews(*)", { count: "exact" })
              .or(`freelancer_id.eq.${targetUserId},freelancer_id.eq.${targetFreelancerId}`)
              .eq("status", "completed")
              .order("completed_at", { ascending: false });

            liveCompletedContractsCount = completedCount || (completedContracts?.length ?? 0);

            if (completedContracts && completedContracts.length > 0) {
              liveEarningsSum = completedContracts.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);

              mappedContracts = completedContracts
                .filter((c) => c.status === "completed" && c.projects)
                .map((c, index) => {
                  const proj = (Array.isArray(c.projects) ? c.projects[0] : c.projects) as Record<string, unknown> | null;
                  const cat = String(proj?.category || "Web & IT Engineering");
                  let img = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80";
                  const catLower = cat.toLowerCase();
                  if (catLower.includes("design") || catLower.includes("ui") || catLower.includes("ux")) {
                    img = "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop&q=80";
                  } else if (catLower.includes("mobile") || catLower.includes("android") || catLower.includes("ios") || catLower.includes("flutter")) {
                    img = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80";
                  } else if (catLower.includes("data") || catLower.includes("ai") || catLower.includes("machine")) {
                    img = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80";
                  }

                  const requiredSkills = Array.isArray(proj?.required_skills) && proj.required_skills.length > 0
                    ? (proj.required_skills as string[])
                    : ["VERIFIED", "COMPLETED"];

                  // Extract latest review for this contract
                  const revList = Array.isArray(c.reviews) ? c.reviews : (c.reviews ? [c.reviews] : []);
                  const latestRev = revList.length > 0 ? (revList[0] as Record<string, unknown>) : null;
                  const contractRating = latestRev?.rating ? Number(latestRev.rating) : undefined;
                  const contractReviewComment = latestRev?.comment ? String(latestRev.comment) : undefined;

                  return {
                    id: String(c.id || proj?.id),
                    title: String(proj?.title || "Proyek Klien TripleT"),
                    category: cat.toUpperCase(),
                    description: String(proj?.description || "Proyek berhasil diselesaikan dengan sukses di platform TripleT."),
                    image: img,
                    tags: requiredSkills,
                    isFeatured: index === 0,
                    isPlatformContract: true,
                    amountDisplay: String(c.amount_display || (c.total_amount ? `Rp ${Number(c.total_amount).toLocaleString("id-ID")}` : "Rp 0")),
                    completedAt: c.completed_at ? new Date(c.completed_at).toLocaleDateString("id-ID", { month: "short", year: "numeric" }) : undefined,
                    rating: contractRating,
                    reviewComment: contractReviewComment,
                  };
                });
            }

            // Sync streak heatmap data directly
            fetchHeatmapData(targetUserId).then((data) => {
              if (data) setHeatmapData(data);
            });
          } catch (e) {
            console.warn("Could not query live completed contracts for profile:", e);
          }
        }

        const allRecentProjects = [...mappedContracts, ...mappedPortfolio];

        if (userData || profileData || liveCompletedContractsCount > 0) {
          const u = userData || {};
          const fp = profileData || {};

          const rawAboutMe = Array.isArray(fp.about_me) && fp.about_me.length > 0
            ? (fp.about_me as string[])
            : (fp.bio ? [String(fp.bio)] : (u.bio ? [String(u.bio)] : (isOwner && meta.bio ? [meta.bio] : ["Freelancer spesialis terdaftar di platform TripleT."])));

          const displayName = isOwner
            ? (meta.full_name || meta.name || (u.full_name as string) || (u.email ? String(u.email).split("@")[0] : (user?.email ? user.email.split("@")[0] : "Freelancer")))
            : ((u.full_name as string) || (u.email ? String(u.email).split("@")[0] : "Talenta Spesialis"));

          const displayAvatar = cleanAvatar(
            isOwner ? (meta.avatar_url || (u.avatar_url as string)) : ((u.avatar_url as string) || (fp.avatar_url as string))
          );

          const displayBanner = cleanBanner(
            isOwner ? (meta.banner_url || meta.cover_image || (fp.cover_image as string) || (u.banner_url as string)) : ((fp.cover_image as string) || (u.banner_url as string))
          );

          const displayRole = isOwner
            ? (meta.headline || (fp.headline as string) || "Digital Specialist")
            : ((fp.headline as string) || "Digital Specialist");

          const displayLocation = isOwner
            ? (meta.location || (u.location as string) || "Indonesia")
            : ((u.location as string) || "Indonesia");

          const allSkills = Array.isArray(fp.skills) && fp.skills.length > 0
            ? (fp.skills as string[])
            : (isOwner && Array.isArray(meta.skills) && meta.skills.length > 0 ? meta.skills : []);

          const displayVerifiedSkills = Array.isArray(fp.verified_skills) && fp.verified_skills.length > 0
            ? (fp.verified_skills as string[])
            : allSkills;

          const displayOtherSkills = allSkills.filter((s) => !displayVerifiedSkills.includes(s));

          const totalEarningsNum = Math.max(Number(fp.total_earnings) || 0, liveEarningsSum);
          const formattedEarnings = totalEarningsNum > 0
            ? `Rp ${totalEarningsNum.toLocaleString("id-ID")}`
            : "Rp 0";

          const finalCompletedProjects = Math.max(
            Number(fp.completed_projects) || 0,
            liveCompletedContractsCount
          );

          // Extract review ratings from mapped contracts if fp data not yet updated
          const reviewedContracts = mappedContracts.filter((c) => typeof c.rating === "number" && c.rating > 0);
          const liveReviewsCount = reviewedContracts.length;
          const liveAvgRating = liveReviewsCount > 0
            ? reviewedContracts.reduce((sum, c) => sum + (c.rating || 0), 0) / liveReviewsCount
            : 0;

          const finalReviewsCount = Math.max(Number(fp.reviews_count) || 0, liveReviewsCount);
          const finalRatingNum = Number(fp.rating) > 0 ? Number(fp.rating) : liveAvgRating;

          // Self-heal DB row if out of sync
          if (isValidUuid(targetUserId)) {
            const needProjectsUpdate = finalCompletedProjects > (Number(fp.completed_projects) || 0);
            const needEarningsUpdate = totalEarningsNum > (Number(fp.total_earnings) || 0);
            const needReviewsUpdate = finalReviewsCount > (Number(fp.reviews_count) || 0);
            if (needProjectsUpdate || needEarningsUpdate || needReviewsUpdate) {
              supabase
                .from("freelancer_profiles")
                .update({
                  ...(needProjectsUpdate ? { completed_projects: finalCompletedProjects } : {}),
                  ...(needEarningsUpdate ? { total_earnings: totalEarningsNum } : {}),
                  ...(needReviewsUpdate ? { reviews_count: finalReviewsCount, rating: finalRatingNum } : {}),
                })
                .eq("user_id", targetUserId)
                .then(() => {});
            }
          }

          const rawStatus = (fp.availability as string) || (isOwner ? (meta.availability as string) : "available");
          let parsedWorkStatus: "available" | "open" | "busy" = "available";
          if (rawStatus === "busy" || rawStatus.includes("busy") || rawStatus.includes("penuh")) {
            parsedWorkStatus = "busy";
          } else if (rawStatus === "open" || rawStatus.includes("open") || rawStatus.includes("tawaran")) {
            parsedWorkStatus = "open";
          } else {
            parsedWorkStatus = "available";
          }

          let parsedStartingPrice = "Rp 500.000";
          if (fp.starting_price && typeof fp.starting_price === "string" && !fp.starting_price.includes("Jam") && !fp.starting_price.includes("Minggu")) {
            parsedStartingPrice = fp.starting_price.startsWith("Rp")
              ? fp.starting_price
              : `Rp ${Number(fp.starting_price.replace(/\D/g, "") || 500000).toLocaleString("id-ID")}`;
          } else if (isOwner && meta.starting_price && !meta.starting_price.includes("Jam") && !meta.starting_price.includes("Minggu")) {
            parsedStartingPrice = String(meta.starting_price);
          } else if (fp.hourly_rate || (isOwner && meta.hourly_rate)) {
            const r = Number(fp.hourly_rate || meta.hourly_rate);
            const num = r < 1000 ? r * 50000 : r;
            parsedStartingPrice = `Rp ${num.toLocaleString("id-ID")}`;
          }

          const rawExp = (fp.experience_level as string) || (isOwner ? (meta.experience_level as string) : "intermediate") || "intermediate";
          let parsedExp = "intermediate";
          if (rawExp.includes("start") || rawExp.includes("pemula") || rawExp.includes("junior")) parsedExp = "starter";
          else if (rawExp.includes("expert") || rawExp.includes("lead") || rawExp.includes("ahli") || rawExp.includes("senior")) parsedExp = "expert";

          const parsedGithub = isOwner
            ? (meta.github_url || (fp.github_url as string) || "")
            : ((fp.github_url as string) || "");

          const parsedLinkedin = isOwner
            ? (meta.linkedin_url || (fp.linkedin_url as string) || "")
            : ((fp.linkedin_url as string) || "");

          const parsedPortfolio = isOwner
            ? (meta.portfolio_url || (fp.portfolio_url as string) || "")
            : ((fp.portfolio_url as string) || "");

          const hasValidRating = finalReviewsCount > 0 && !isNaN(finalRatingNum) && finalRatingNum > 0;
          const finalRating = hasValidRating ? finalRatingNum.toFixed(1) : "-";

          setLiveProfile({
            id: targetUserId,
            name: displayName,
            avatar: displayAvatar,
            coverImage: displayBanner,
            role: displayRole,
            location: displayLocation,
            organization: (fp.organization as string) || "Member Terdaftar TripleT",
            level: (fp.badge_level as string) || "Verified Pro",
            category: (fp.category as string) || "Full-Stack Web & Next.js",
            projectsCount: finalCompletedProjects,
            rating: finalRating,
            reviewsCount: finalReviewsCount,
            earnings: formattedEarnings,
            workStatus: parsedWorkStatus,
            startingPrice: parsedStartingPrice,
            experienceLevel: parsedExp,
            githubUrl: parsedGithub,
            linkedinUrl: parsedLinkedin,
            portfolioUrl: parsedPortfolio,
            availability: formatAvailabilityHours(
              typeof fp.starting_price === "string" && fp.starting_price.includes("Jam")
                ? fp.starting_price
                : (fp.availability as string) || (isOwner ? meta.weekly_availability : null)
            ),
            aboutMe: rawAboutMe,
            streakWeeks: Number(fp.streak_weeks) || 1,
            verifiedSkills: displayVerifiedSkills,
            otherSkills: displayOtherSkills,
            recentProjects: allRecentProjects.length > 0 ? allRecentProjects : (isOwner ? [] : baseProfile.recentProjects),
            isVerified: Boolean(u?.is_verified || (isOwner && (meta.is_verified || user?.user_metadata?.is_verified))),
          });
        }
      } catch (err) {
        console.info("Supabase profile fetch fallback to local:", err);
      }
    }

    fetchFromSupabase();

    const handleReviewSubmitted = () => {
      fetchFromSupabase();
    };
    window.addEventListener("review-submitted", handleReviewSubmitted);
    return () => {
      window.removeEventListener("review-submitted", handleReviewSubmitted);
    };
  }, [talentId, isOwner, user?.id]);

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

  const isStandaloneProfile = pathname === "/freelancer/profile";
  const shouldShowBack = showBackButton !== undefined ? showBackButton : !isStandaloneProfile;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Top Back Navigation */}
        {shouldShowBack && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
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
              <div className="relative h-28 w-full bg-gradient-to-br from-blue-500/25 via-indigo-500/20 to-purple-500/30 overflow-hidden group">
                {profile.coverImage && (
                  <img
                    src={profile.coverImage}
                    alt="Cover"
                    className="h-full w-full object-cover opacity-75 transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-card/20 to-transparent" />
                {isOwner && (
                  <Link
                    href="/freelancer/settings?tab=profile"
                    className="absolute top-2.5 right-2.5 z-10 inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-white bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm border border-white/20"
                    title="Ubah Banner Profil"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Ubah Banner</span>
                  </Link>
                )}
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
                    {profile.isVerified && (
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground">{profile.role}</p>
                  
                  {profile.location && (
                    <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 pt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{profile.location}</span>
                    </p>
                  )}

                  {/* Status Ketersediaan Kerja */}
                  <div className="pt-2 flex items-center justify-center">
                    <div
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all shadow-xs ${
                        profile.workStatus === "busy"
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/25"
                          : profile.workStatus === "open"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/25"
                          : "bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
                      }`}
                    >
                      <span className="relative flex h-2 w-2">
                        {profile.workStatus === "available" && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            profile.workStatus === "busy"
                              ? "bg-rose-500"
                              : profile.workStatus === "open"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                      </span>
                      <span>
                        {profile.workStatus === "busy"
                          ? "Sedang Penuh"
                          : profile.workStatus === "open"
                          ? "Terbuka untuk Tawaran"
                          : "Tersedia untuk Kerja"}
                      </span>
                    </div>
                  </div>
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
                <div className="text-[11px] text-muted-foreground font-medium">Projects Selesai</div>
              </div>

              {/* Stat 2: Rating */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className={`mx-auto h-7 w-7 rounded-lg flex items-center justify-center ${
                  profile.rating !== "-" && profile.reviewsCount > 0
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <Star className={`h-4 w-4 ${profile.rating !== "-" && profile.reviewsCount > 0 ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                </div>
                <div className="text-lg font-bold text-foreground">{profile.rating}</div>
                <div className="text-[11px] text-muted-foreground font-medium">
                  {profile.reviewsCount > 0 ? `Rating (${profile.reviewsCount})` : "Rating Klien"}
                </div>
              </div>

              {/* Stat 3: Tarif Mulai Proyek */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Banknote className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-foreground truncate" title={profile.startingPrice || "Rp 500.000"}>
                  {profile.startingPrice || "Rp 500.000"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Tarif Mulai Proyek</div>
              </div>

              {/* Stat 4: Tingkat Pengalaman */}
              <div className="rounded-2xl border border-border/80 bg-card p-4 text-center space-y-1 shadow-xs hover:border-primary/30 transition-colors">
                <div className="mx-auto h-7 w-7 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="text-sm font-bold text-foreground truncate">
                  {profile.experienceLevel === "expert"
                    ? "Ahli (Expert)"
                    : profile.experienceLevel === "starter"
                    ? "Pemula (Starter)"
                    : "Menengah (Intermediate)"}
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Pengalaman</div>
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

            {/* 4. Tautan Portofolio */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                  <h3 className="text-sm font-bold text-foreground tracking-tight truncate">
                    Tautan Portofolio
                  </h3>
                </div>
                {isOwner && (
                  <Link
                    href="/freelancer/settings?tab=work"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 bg-primary/10 hover:bg-primary/15 border border-primary/20 px-2.5 py-1 rounded-lg transition-all shrink-0 shadow-2xs"
                  >
                    <span>Edit</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </Link>
                )}
              </div>

              <div className="space-y-2.5">
                {/* GitHub */}
                {profile.githubUrl && profile.githubUrl !== "https://github.com/" && profile.githubUrl.trim().length > 8 ? (
                  <a
                    href={profile.githubUrl.startsWith("http") ? profile.githubUrl : `https://${profile.githubUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl border border-border/80 bg-muted/30 hover:bg-muted hover:border-border text-foreground hover:text-primary transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">GitHub Profile</div>
                        <div className="text-[10px] text-muted-foreground truncate">{profile.githubUrl.replace(/^https?:\/\//, "")}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </a>
                ) : isOwner ? (
                  <Link
                    href="/freelancer/settings?tab=work"
                    className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 hover:bg-muted/30 text-muted-foreground transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">GitHub Profile</div>
                        <div className="text-[10px] text-muted-foreground truncate">+ Tambahkan tautan GitHub</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </Link>
                ) : null}

                {/* LinkedIn */}
                {profile.linkedinUrl && profile.linkedinUrl !== "https://linkedin.com/in/" && profile.linkedinUrl.trim().length > 10 ? (
                  <a
                    href={profile.linkedinUrl.startsWith("http") ? profile.linkedinUrl : `https://${profile.linkedinUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl border border-border/80 bg-muted/30 hover:bg-muted hover:border-border text-foreground hover:text-blue-600 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">LinkedIn Profile</div>
                        <div className="text-[10px] text-muted-foreground truncate">{profile.linkedinUrl.replace(/^https?:\/\//, "")}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 shrink-0 transition-colors" />
                  </a>
                ) : isOwner ? (
                  <Link
                    href="/freelancer/settings?tab=work"
                    className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 hover:bg-muted/30 text-muted-foreground transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">LinkedIn Profile</div>
                        <div className="text-[10px] text-muted-foreground truncate">+ Tambahkan tautan LinkedIn</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 shrink-0 transition-colors" />
                  </Link>
                ) : null}

                {/* Personal Portfolio */}
                {profile.portfolioUrl && profile.portfolioUrl !== "https://" && profile.portfolioUrl.trim().length > 8 ? (
                  <a
                    href={profile.portfolioUrl.startsWith("http") ? profile.portfolioUrl : `https://${profile.portfolioUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-2xl border border-border/80 bg-muted/30 hover:bg-muted hover:border-border text-foreground hover:text-emerald-600 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">Website Portofolio</div>
                        <div className="text-[10px] text-muted-foreground truncate">{profile.portfolioUrl.replace(/^https?:\/\//, "")}</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 shrink-0 transition-colors" />
                  </a>
                ) : isOwner ? (
                  <Link
                    href="/freelancer/settings?tab=work"
                    className="flex items-center justify-between p-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 hover:bg-muted/30 text-muted-foreground transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate">Website Portofolio</div>
                        <div className="text-[10px] text-muted-foreground truncate">+ Tambahkan tautan Website Portofolio</div>
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 shrink-0 transition-colors" />
                  </Link>
                ) : null}
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

            {/* 2. Doable Streak & Activity Tracker (Seminggu dulu + Expand Sebulan) */}
            <DoableStreakTracker
              streakDays={streakDays}
              streakWeeks={profile.streakWeeks || 12}
              activeDates={heatmapData.activeDates}
              totalContributions={totalContributions}
              isOwner={isOwner}
              userCreatedAt={user?.created_at}
            />

            {/* 3. Recent Projects Portfolio */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">Recent Projects</h2>
                {isOwner ? (
                  <Link
                    href="/freelancer/my-work"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-foreground hover:text-primary transition-all shadow-2xs group"
                  >
                    <FolderGit2 className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Pekerjaan & Portofolio</span>
                    <ArrowRight className="h-3 w-3 ml-0.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      const el = document.getElementById("portfolio-section");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border/70 bg-card hover:bg-muted text-xs font-semibold text-foreground hover:text-primary transition-all shadow-2xs group"
                  >
                    <FolderGit2 className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                    <span>Lihat Portofolio</span>
                    <ArrowRight className="h-3 w-3 ml-0.5 text-muted-foreground group-hover:translate-x-0.5 group-hover:text-primary transition-all" />
                  </button>
                )}
              </div>

              {/* Featured Project Horizontal Card */}
              {featuredProject ? (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                          {featuredProject.category}
                        </span>
                        {featuredProject.isPlatformContract && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Proyek Klien Selesai
                          </span>
                        )}
                        {featuredProject.rating !== undefined && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shadow-xs">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                            <span>⭐ {featuredProject.rating.toFixed(1)} / 5.0</span>
                          </span>
                        )}
                        {featuredProject.amountDisplay && (
                          <span className="text-[10px] font-semibold text-muted-foreground ml-auto">
                            {featuredProject.amountDisplay}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {featuredProject.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {featuredProject.description}
                      </p>
                      {featuredProject.reviewComment && (
                        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-3 text-xs text-foreground/90 flex items-start gap-2.5 mt-2">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                              Ulasan Klien
                            </span>
                            <p className="italic text-muted-foreground leading-relaxed">
                              &ldquo;{featuredProject.reviewComment}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}
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
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center space-y-3">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center">
                    <FolderGit2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Belum Ada Proyek Selesai</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Proyek yang telah kamu selesaikan dari tawaran klien atau ditambahkan ke portofolio akan muncul di sini.
                    </p>
                  </div>
                  {isOwner && (
                    <div className="pt-2">
                      <Link
                        href="/freelancer/explore"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all"
                      >
                        <span>Jelajahi Proyek Baru</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Projects Grid (2 cols) */}
              {otherProjects.length > 0 && (
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                              {proj.category}
                            </span>
                            {proj.isPlatformContract && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                                <CheckCircle2 className="h-2.5 w-2.5" />
                                Selesai
                              </span>
                            )}
                            {proj.rating !== undefined && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full shadow-xs">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-500" />
                                <span>⭐ {proj.rating.toFixed(1)}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {proj.title}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {proj.description}
                          </p>
                          {proj.reviewComment && (
                            <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 px-3 py-2 text-[11px] italic text-muted-foreground line-clamp-2 mt-1">
                              &ldquo;{proj.reviewComment}&rdquo;
                            </div>
                          )}
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
              )}
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
                      {profile.isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
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
