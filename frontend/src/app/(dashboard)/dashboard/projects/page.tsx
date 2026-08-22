"use client";

import { useState } from "react";
import { Plus, Clock, Users, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ProjectItem {
  id: string;
  title: string;
  category: string;
  budget: string;
  proposalsCount: number;
  status: "Hiring" | "In Progress" | "Completed";
  dueDate: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: "proj-1",
    title: "E-Commerce Mobile App Redesign with Flutter",
    category: "Mobile Development",
    budget: "Rp 15.000.000",
    proposalsCount: 8,
    status: "Hiring",
    dueDate: "14 hari",
  },
  {
    id: "proj-2",
    title: "AI Chatbot Integration for Customer Support",
    category: "AI & Automation",
    budget: "Rp 8.500.000",
    proposalsCount: 4,
    status: "In Progress",
    dueDate: "5 hari",
  },
  {
    id: "proj-3",
    title: "Landing Page & Brand Design System",
    category: "UI/UX Design",
    budget: "Rp 5.000.000",
    proposalsCount: 12,
    status: "Completed",
    dueDate: "Selesai",
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [budget, setBudget] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title,
      category,
      budget: budget.startsWith("Rp") ? budget : `Rp ${budget}`,
      proposalsCount: 0,
      status: "Hiring",
      dueDate: "30 hari",
    };
    setProjects([newProject, ...projects]);
    setSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setSubmitted(false);
      setTitle("");
      setBudget("");
    }, 1200);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
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
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            ← Kembali
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Pasang Proyek Baru</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {p.category}
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                    p.status === "Hiring"
                      ? "bg-amber-500/10 text-amber-600"
                      : p.status === "In Progress"
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-emerald-500/10 text-emerald-600"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground">{p.title}</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{p.budget}</span>
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

            <div className="flex items-center gap-2">
              <button className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted transition-colors">
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Post Project */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold">Proyek Berhasil Dipasang!</h3>
              </div>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Pasang Proyek Baru</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Publikasikan kebutuhan proyekmu agar dapat diajukan oleh talent terverifikasi.
                  </p>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Judul Proyek</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Pembuatan Dashboard Analitik Realtime"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Kategori</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Frontend">Frontend Development</option>
                      <option value="Backend">Backend & API</option>
                      <option value="Mobile Development">Mobile App (Flutter / React Native)</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="AI & Automation">AI & Machine Learning</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Estimasi Budget (Rp)</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      required
                      placeholder="e.g. 7.500.000"
                      className="h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                    >
                      Publikasikan Proyek
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
