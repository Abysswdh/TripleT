"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import { CreateProjectModal, CreatedProject } from "@/components/dashboard/create-project-modal";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  budget: string;
  proposalsCount: number;
  status: "Hiring" | "In Progress" | "Completed";
  dueDate: string;
  description?: string;
  skills?: string[];
  difficulty?: "Starter" | "Standard" | "Enterprise";
}

import { getClientProjects } from "@/lib/services/projects";

function ClientProjectsContent() {
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateModalOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadClientProjects() {
      const data = await getClientProjects();
      if (data && data.length > 0) {
        const mapped: ProjectItem[] = data.map((p) => ({
          id: p.id,
          title: p.title,
          category: p.category,
          budget: p.budget,
          proposalsCount: p.proposalsCount,
          status: p.status === "Hiring" ? "Hiring" : p.status === "In Progress" ? "In Progress" : "Completed",
          dueDate: p.dueDate,
          description: p.description,
          skills: p.skills,
          difficulty: p.difficulty,
        }));
        setProjects(mapped);
      } else {
        setProjects([]);
      }
    }
    loadClientProjects();
  }, []);

  const handleProjectCreated = (newProj: CreatedProject) => {
    setProjects((prev) => [newProj, ...prev]);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
      {/* Header & Main Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Proyek Saya
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola postingan proyek, pantau proposal masuk, dan tinjau milestone aktif.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/client/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            ← Kembali ke Hub
          </Link>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Pasang Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center bg-card/50 space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Belum ada proyek dibuat</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Anda belum memiliki postingan proyek aktif. Klik tombol di bawah untuk mulai memposting lowongan proyek baru.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Pasang Proyek Baru</span>
            </button>
          </div>
        ) : (
          projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between gap-4 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:items-center hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {p.category}
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                    p.status === "Hiring"
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : p.status === "In Progress"
                      ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  }`}
                >
                  {p.status}
                </span>
                {p.difficulty && (
                  <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {p.difficulty}
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold font-sans text-foreground">{p.title}</h3>

              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 max-w-3xl leading-relaxed">
                  {p.description}
                </p>
              )}

              {p.skills && p.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="font-semibold text-primary">{p.budget}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {p.proposalsCount} Proposal
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {p.dueDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <Link
                href={`/client/projects/${p.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2.5 text-xs font-bold transition-all hover:scale-102"
              >
                <span>Detail</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )))}
      </div>

      {/* Onboarding-Styled Create Project Modal Popup */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  );
}

export default function ClientProjectsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground text-sm">Memuat Proyek...</div>}>
      <ClientProjectsContent />
    </Suspense>
  );
}
