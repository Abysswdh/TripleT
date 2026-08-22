"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  FolderOpen,
  Users,
  TrendingUp,
  Plus,
  Sparkles,
  Clock,
  ChevronRight,
  Briefcase,
  Star,
  ShieldCheck,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Grainient from "@/components/ui/Grainient";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  budget: string;
  proposalsCount: number;
  status: "Hiring" | "In Progress" | "Under Review";
  dueDate: string;
}

interface TalentMatch {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  hourlyRate: string;
  skills: string[];
  isVerified: boolean;
}

interface ProposalItem {
  id: string;
  freelancerName: string;
  freelancerAvatar: string;
  projectTitle: string;
  bidAmount: string;
  timeline: string;
  submittedAt: string;
  matchScore: number;
}

const mockProjects: ProjectItem[] = [
  {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile Development",
    budget: "Rp 15.000.000",
    proposalsCount: 8,
    status: "Hiring",
    dueDate: "Dalam 14 hari",
  },
  {
    id: "proj-2",
    title: "AI Chatbot Integration for Customer Support",
    category: "AI & Automation",
    budget: "Rp 8.500.000",
    proposalsCount: 4,
    status: "In Progress",
    dueDate: "Dalam 5 hari",
  },
  {
    id: "proj-3",
    title: "Landing Page & Brand Design System",
    category: "UI/UX Design",
    budget: "Rp 5.000.000",
    proposalsCount: 12,
    status: "Under Review",
    dueDate: "Besok",
  },
];

const mockTalents: TalentMatch[] = [
  {
    id: "t-1",
    name: "Dimas Arya Pratama",
    role: "Fullstack Web & AI Specialist",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 38,
    hourlyRate: "Rp 175.000 / jam",
    skills: ["Next.js", "FastAPI", "PostgreSQL", "PyTorch"],
    isVerified: true,
  },
  {
    id: "t-2",
    name: "Siti Rahmawati",
    role: "Senior UI/UX & Product Designer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: 5.0,
    reviewsCount: 52,
    hourlyRate: "Rp 150.000 / jam",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"],
    isVerified: true,
  },
  {
    id: "t-3",
    name: "Budi Santoso",
    role: "Mobile App Developer (Flutter / React Native)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 29,
    hourlyRate: "Rp 160.000 / jam",
    skills: ["Flutter", "React Native", "Firebase", "State Management"],
    isVerified: true,
  },
];

const mockProposals: ProposalItem[] = [
  {
    id: "prop-1",
    freelancerName: "Fajar Nugraha",
    freelancerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    projectTitle: "E-Commerce Mobile App Redesign",
    bidAmount: "Rp 14.000.000",
    timeline: "3 Minggu",
    submittedAt: "2 jam yang lalu",
    matchScore: 96,
  },
  {
    id: "prop-2",
    freelancerName: "Anisa Putri",
    freelancerAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    projectTitle: "Landing Page & Brand Design System",
    bidAmount: "Rp 4.800.000",
    timeline: "7 Hari",
    submittedAt: "5 jam yang lalu",
    matchScore: 92,
  },
];

export function ClientDashboard() {
  const { user } = useAuth();
  const clientName = user?.user_metadata?.full_name || "Project Owner";

  const stats = [
    {
      label: "Active Projects",
      value: "3",
      change: "+1 new this week",
      icon: FolderOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Proposals Received",
      value: "24",
      change: "4 pending review",
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      label: "Total Budget Invested",
      value: "Rp 28.5M",
      change: "2 escrow active",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Hired Talent",
      value: "5",
      change: "100% on schedule",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Grainient
            color1="#38BDF8"
            color2="#1E40AF"
            color3="#070B24"
            timeSpeed={0.2}
            colorBalance={0.0}
            warpStrength={1.0}
            warpFrequency={5.0}
            warpSpeed={2.0}
            warpAmplitude={50.0}
            blendAngle={0.0}
            blendSoftness={0.05}
            rotationAmount={500.0}
            noiseScale={2.0}
            grainAmount={0.1}
            grainScale={2.0}
            grainAnimated={false}
            contrast={1.4}
            gamma={1.0}
            saturation={1.05}
            centerX={0.0}
            centerY={0.0}
            zoom={0.9}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-black/30 backdrop-blur-[1px] pointer-events-none" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-sans text-xs font-semibold backdrop-blur-md">
              <Briefcase className="h-3.5 w-3.5 text-primary-300" />
              <span>Client Dashboard Workspace</span>
            </div>
            <h1 className="font-heading text-xl font-normal tracking-tight md:text-2xl lg:text-3xl leading-snug">
              Welcome back, {clientName}!
            </h1>
            <p className="max-w-xl font-sans text-sm text-slate-300 leading-relaxed">
              Manage your posted projects, review proposals from verified talent, and track development milestones seamlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-600 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4" />
              <span>Post New Project</span>
            </Link>
            <Link
              href="/dashboard/talent"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 font-sans text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <Users className="h-4 w-4" />
              <span>Browse Talent</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="rounded-full bg-muted/60 px-2.5 py-0.5 font-sans text-xs font-medium text-muted-foreground">
                {stat.change}
              </span>
            </div>
            <p className="font-heading text-xl font-normal tracking-tight text-foreground">{stat.value}</p>
            <p className="mt-1 font-sans text-xs font-medium text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Active Projects & Incoming Proposals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active Projects */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-normal tracking-tight text-foreground md:text-lg">
                Your Project Postings
              </h2>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                Current status and proposals on your open quests
              </p>
            </div>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
            >
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {mockProjects.map((project) => (
              <div
                key={project.id}
                className="group flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2.5 py-0.5 font-sans text-xs font-semibold text-primary">
                      {project.category}
                    </span>
                    <span
                      className={`rounded-md px-2.5 py-0.5 font-sans text-xs font-medium ${project.status === "Hiring"
                          ? "bg-amber-500/10 text-amber-600"
                          : project.status === "In Progress"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                    >
                      {project.status}
                    </span>
                  </div>
                  <h3 className="font-heading text-sm font-normal text-foreground group-hover:text-primary transition-colors leading-snug">
                    {project.title}
                  </h3>
                  <div className="flex items-center gap-4 font-sans text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{project.budget}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {project.proposalsCount} Proposals
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {project.dueDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:self-center">
                  <Link
                    href={`/dashboard/projects`}
                    className="inline-flex items-center justify-center rounded-xl border border-border/80 bg-background px-4 py-2 font-sans text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:border-primary/30"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Inbound Proposals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base font-normal tracking-tight text-foreground md:text-lg">
                Recent Proposals
              </h2>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">
                Top matched candidate submissions
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-sans text-[11px] font-bold text-primary">
              {mockProposals.length} New
            </span>
          </div>

          <div className="space-y-3">
            {mockProposals.map((prop) => (
              <div
                key={prop.id}
                className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={prop.freelancerAvatar}
                      alt={prop.freelancerName}
                      className="h-10 w-10 rounded-full object-cover border border-border"
                    />
                    <div>
                      <h4 className="font-heading text-xs font-normal text-foreground leading-snug">
                        {prop.freelancerName}
                      </h4>
                      <p className="font-sans text-xs text-muted-foreground truncate max-w-[140px]">
                        {prop.projectTitle}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-sans text-[11px] font-bold text-emerald-600">
                    <Sparkles className="h-3 w-3" />
                    {prop.matchScore}% Match
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 font-sans text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{prop.bidAmount}</span>
                    <span className="text-muted-foreground"> ({prop.timeline})</span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">{prop.submittedAt}</span>
                </div>

                <div className="mt-3 flex items-center gap-2 font-sans">
                  <button className="flex-1 rounded-lg bg-primary/10 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-all">
                    Review Bid
                  </button>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Verified Talent for Clients */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-base font-normal tracking-tight text-foreground md:text-lg">
              Top Verified Freelancers Ready to Hire
            </h2>
            <p className="font-sans text-xs text-muted-foreground mt-0.5">
              Pre-vetted professionals with proven skill certifications
            </p>
          </div>
          <Link
            href="/dashboard/talent"
            className="inline-flex items-center gap-1 font-sans text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
          >
            <span>Explore All Talent</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockTalents.map((talent) => (
            <div
              key={talent.id}
              className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="h-12 w-12 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading text-xs font-normal text-foreground leading-snug">
                          {talent.name}
                        </h4>
                        {talent.isVerified && (
                          <ShieldCheck className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="font-sans text-xs text-muted-foreground">{talent.role}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between font-sans text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{talent.rating}</span>
                    <span className="text-muted-foreground">({talent.reviewsCount})</span>
                  </div>
                  <span className="font-semibold text-primary">{talent.hourlyRate}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 font-sans">
                  {talent.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-2 font-sans">
                <Link
                  href="/dashboard/talent"
                  className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-semibold text-white shadow-sm shadow-primary/20 hover:bg-primary-600 transition-colors"
                >
                  Invite to Project
                </Link>
                <Link
                  href="/dashboard/talent"
                  className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
