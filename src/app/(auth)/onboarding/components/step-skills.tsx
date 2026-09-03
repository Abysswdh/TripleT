"use client";

import { OnboardingData } from "@/hooks/use-onboarding";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  Palette,
  Camera,
  MapPin,
  Globe,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { UNIFIED_PROJECT_CATEGORIES } from "@/lib/constants/categories";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  "Desain & Branding": Palette,
  "Foto & Video Kreatif": Camera,
  "Tugas Lokal / On-Site": MapPin,
  "Web & IT Engineering": Globe,
  "Penulisan & Admin": FileText,
  "Marketing & Promosi": TrendingUp,
};

interface StepSkillsProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onToggleSkill: (skill: string) => void;
  onToggleCategory: (cat: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

const POPULAR_SKILLS = [
  "Figma",
  "UI/UX Design",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Python",
  "AI & ML",
  "Flutter",
  "Photoshop / Canva",
  "SEO & Copywriting",
  "Video Editing",
];

export function StepSkills({
  data,
  onToggleSkill,
  onToggleCategory,
  onNext,
  onPrev,
}: StepSkillsProps) {
  const [customSkill, setCustomSkill] = useState("");
  const isFreelancer = data.role === "freelancer";

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !data.skills.includes(customSkill.trim())) {
      onToggleSkill(customSkill.trim());
      setCustomSkill("");
    }
  };

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Form Content: Compact & Unscrollable */}
      <div className="my-auto space-y-3.5 sm:space-y-4">
        {isFreelancer ? (
          <>
            {/* Skill Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs sm:text-sm font-bold text-foreground">
                  Pilih Keahlian Utama
                </label>
                <span className="text-xs font-semibold text-primary">
                  {data.skills.length} skill dipilih
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((skill) => {
                  const isSelected = data.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => onToggleSkill(skill)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-xs ring-2 ring-primary/20 scale-[1.02]"
                          : "border border-border/70 bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Skill Input */}
            <div className="pt-1">
              <label className="mb-1.5 block text-xs sm:text-sm font-bold text-foreground">
                Punya Skill Lain yang Belum Terdaftar?
              </label>
              <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Ketik skill (misal: Golang, Blender, Copywriting)..."
                  className="h-10 sm:h-11 flex-1 rounded-xl border border-border bg-card px-3.5 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!customSkill.trim()}
                  className="h-10 sm:h-11 rounded-xl bg-secondary px-4 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 shrink-0"
                >
                  Tambah
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Client Categories */
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs sm:text-sm font-bold text-foreground">
                Pilih Kategori Kebutuhan (Bisa Lebih Dari Satu)
              </label>
              <span className="text-xs font-semibold text-primary">
                {data.projectCategories.length} kategori dipilih
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {UNIFIED_PROJECT_CATEGORIES.map((cat) => {
                const isSelected = data.projectCategories.includes(cat.id);
                const Icon = CATEGORY_ICON_MAP[cat.id] || Globe;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onToggleCategory(cat.id)}
                    className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary shadow-xs"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">{cat.title}</p>
                        {isSelected && (
                          <div className="h-4.5 w-4.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all active:scale-[0.98]"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
