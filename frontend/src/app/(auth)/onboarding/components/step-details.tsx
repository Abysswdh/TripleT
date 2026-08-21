"use client";

import { ExperienceLevel, HiringType, OnboardingData } from "@/hooks/use-onboarding";
import { ArrowLeft, ArrowRight, Check, Plus } from "lucide-react";
import { useState } from "react";

interface StepDetailsProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onToggleSkill: (skill: string) => void;
  onToggleCategory: (cat: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const POPULAR_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Python",
  "FastAPI",
  "Tailwind CSS",
  "UI/UX Design",
  "Figma",
  "AI & ML",
  "PostgreSQL",
  "Mobile Dev",
  "Docker",
];

const PROJECT_CATEGORIES = [
  "Web Development",
  "Full-Stack Web App",
  "AI & Machine Learning",
  "UI/UX & Product Design",
  "Mobile Apps (iOS & Android)",
  "API & Backend Engineering",
];

export function StepDetails({
  data,
  onUpdate,
  onToggleSkill,
  onToggleCategory,
  onNext,
  onPrev,
}: StepDetailsProps) {
  const [customSkill, setCustomSkill] = useState("");

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !data.skills.includes(customSkill.trim())) {
      onToggleSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  const isFreelancer = data.role === "freelancer";

  return (
    <div className="flex h-full flex-col justify-between space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-foreground">
          {isFreelancer ? "Keahlian & Pengalaman" : "Kebutuhan Proyek"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {isFreelancer
            ? "Pilih skill utama dan tingkat pengalamanmu."
            : "Pilih kategori proyek yang sesuai dengan kebutuhanmu."}
        </p>
      </div>

      {isFreelancer ? (
        /* Freelancer Details */
        <div className="space-y-4">
          {/* Skill Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Pilih Skill Utama <span className="text-[11px] text-muted-foreground font-normal">(Minimal 1)</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = data.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-sm shadow-primary/30 ring-2 ring-primary/20"
                        : "border border-slate-200 bg-white text-slate-700 hover:border-primary/50 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3" />}
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Skill */}
            <form onSubmit={handleAddCustomSkill} className="mt-2 flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Tambah skill lain (misal: Flutter, PyTorch)..."
                className="h-8 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs transition-colors placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="h-8 rounded-lg bg-slate-800 px-3 text-xs font-medium text-white hover:bg-slate-900 transition-colors"
              >
                Tambah
              </button>
            </form>
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Tingkat Pengalaman</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { level: "entry", label: "Junior", desc: "0-2 tahun" },
                  { level: "intermediate", label: "Middle", desc: "2-5 tahun" },
                  { level: "expert", label: "Senior", desc: "5+ tahun" },
                ] as const
              ).map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => onUpdate({ experienceLevel: item.level as ExperienceLevel })}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    data.experienceLevel === item.level
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label htmlFor="hourlyRate" className="mb-1 block text-xs font-semibold text-foreground">
              Ekspektasi Tarif <span className="text-[10px] text-muted-foreground font-normal">(USD/jam)</span>
            </label>
            <div className="relative max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">
                $
              </span>
              <input
                id="hourlyRate"
                type="number"
                min={5}
                max={500}
                value={data.hourlyRate ?? 35}
                onChange={(e) => onUpdate({ hourlyRate: Number(e.target.value) })}
                className="h-8 w-full rounded-lg border border-slate-200 bg-white pl-7 pr-3 text-xs transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Client Details */
        <div className="space-y-4">
          {/* Project Category Picker */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Pilih Kategori Proyek
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROJECT_CATEGORIES.map((cat) => {
                const isSelected = data.projectCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onToggleCategory(cat)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hiring As */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Merekrut Sebagai:</label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { type: "individual", label: "Individu", desc: "Proyek personal" },
                  { type: "startup", label: "Startup / UKM", desc: "Tim berkembang" },
                  { type: "company", label: "Perusahaan", desc: "Skala korporat" },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onUpdate({ hiringType: item.type as HiringType })}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    data.hiringType === item.type
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-800">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
