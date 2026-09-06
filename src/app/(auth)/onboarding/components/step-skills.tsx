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
  Sparkles,
} from "lucide-react";
import { useState, useMemo } from "react";
import { UNIFIED_PROJECT_CATEGORIES } from "@/lib/constants/categories";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  "Desain & Branding": Palette,
  "Foto & Video Kreatif": Camera,
  "Tugas Lokal / On-Site": MapPin,
  "Web & IT Engineering": Globe,
  "Penulisan & Admin": FileText,
  "Marketing & Promosi": TrendingUp,
};

// Skill recommendations mapped dynamically to each unified category
const SKILLS_BY_CATEGORY: Record<string, string[]> = {
  "Desain & Branding": [
    "Figma",
    "UI/UX Design",
    "Desain Logo",
    "Brand Identity",
    "Canva / Photoshop",
    "Desain Kemasan",
    "Social Media Feed",
    "Vector Illustration",
  ],
  "Foto & Video Kreatif": [
    "Video Editing",
    "Reels & TikTok",
    "CapCut / Premiere Pro",
    "Fotografi Produk",
    "Motion Graphics",
    "Color Grading",
    "Voice Over",
    "Storyboarding",
  ],
  "Tugas Lokal / On-Site": [
    "Survei Lapangan",
    "Verifikasi Lokasi Fisik",
    "Mystery Shopper",
    "Event Assistant",
    "Fotografi On-Site",
    "Logistik Acara",
  ],
  "Web & IT Engineering": [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "Python",
    "PostgreSQL",
    "Flutter",
    "Fullstack Dev",
    "AI & Integrasi LLM",
  ],
  "Penulisan & Admin": [
    "Copywriting Iklan",
    "Artikel SEO",
    "Virtual Assistant",
    "Data Entry",
    "Microsoft Excel",
    "Proofreading & Editing",
    "Transkripsi Audio",
  ],
  "Marketing & Promosi": [
    "Social Media Management",
    "Meta Ads (IG & FB)",
    "TikTok Marketing",
    "Google Ads & SEO",
    "Riset Tren Pasar",
    "Content Strategy",
  ],
};

const DEFAULT_FALLBACK_SKILLS = [
  "Figma",
  "UI/UX Design",
  "Next.js",
  "React",
  "TypeScript",
  "Canva / Photoshop",
  "Copywriting Iklan",
  "Video Editing",
  "Python",
  "Social Media Marketing",
];

interface StepSkillsProps {
  data: OnboardingData;
  onUpdate: (updates: Partial<OnboardingData>) => void;
  onToggleSkill: (skill: string) => void;
  onToggleCategory: (cat: string) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function StepSkills({
  data,
  onToggleSkill,
  onToggleCategory,
  onNext,
  onPrev,
}: StepSkillsProps) {
  const [customSkill, setCustomSkill] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const isFreelancer = data.role === "freelancer";

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkill.trim() && !data.skills.includes(customSkill.trim())) {
      onToggleSkill(customSkill.trim());
      setCustomSkill("");
      setValidationError(null);
    }
  };

  // Derive recommended skill options dynamically based on selected categories
  const dynamicRecommendedSkills = useMemo(() => {
    if (!isFreelancer) return [];
    if (data.projectCategories.length === 0) return DEFAULT_FALLBACK_SKILLS;

    const collected: string[] = [];
    data.projectCategories.forEach((cat) => {
      const skills = SKILLS_BY_CATEGORY[cat] || [];
      skills.forEach((s) => {
        if (!collected.includes(s)) {
          collected.push(s);
        }
      });
    });

    return collected.length > 0 ? collected : DEFAULT_FALLBACK_SKILLS;
  }, [isFreelancer, data.projectCategories]);

  const handleProceed = () => {
    if (isFreelancer) {
      if (data.projectCategories.length === 0) {
        setValidationError("Pilih minimal 1 bidang spesialisasi / kategori.");
        return;
      }
      if (data.skills.length === 0) {
        setValidationError("Pilih atau tambahkan minimal 1 keahlian (skill).");
        return;
      }
    } else {
      if (data.projectCategories.length === 0) {
        setValidationError("Pilih minimal 1 kategori kebutuhan proyek bisnis.");
        return;
      }
    }
    setValidationError(null);
    onNext();
  };

  return (
    <div className="flex flex-1 flex-col justify-between min-h-0">
      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-3 sm:space-y-4 py-1 custom-scrollbar">
        {isFreelancer ? (
          <>
            {/* 1. Category Selection (Max 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-foreground block">
                    Pilih Bidang Minat / Spesialisasi
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Pilih hingga 3 kategori utama tempat Anda ingin menerima quest & kuis
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    data.projectCategories.length >= 3
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {data.projectCategories.length}/3 Dipilih
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {UNIFIED_PROJECT_CATEGORIES.map((cat) => {
                  const isSelected = data.projectCategories.includes(cat.id);
                  const Icon = CATEGORY_ICON_MAP[cat.id] || Globe;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        onToggleCategory(cat.id);
                        setValidationError(null);
                      }}
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-xs"
                          : data.projectCategories.length >= 3
                          ? "border-border/60 bg-card/60 opacity-60 hover:opacity-80"
                          : "border-border/80 bg-card hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-bold text-foreground truncate">{cat.title}</p>
                          {isSelected && (
                            <div className="h-3.5 w-3.5 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                          {cat.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Dynamic Skills Recommended */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <label className="text-xs sm:text-sm font-bold text-foreground">
                    Keahlian & Tools Rekomendasi
                  </label>
                </div>
                <span className="text-xs font-semibold text-primary">
                  {data.skills.length} skill aktif
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1 custom-scrollbar">
                {dynamicRecommendedSkills.map((skill) => {
                  const isSelected = data.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        onToggleSkill(skill);
                        setValidationError(null);
                      }}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-primary text-white shadow-xs ring-2 ring-primary/25 scale-[1.02]"
                          : "border border-border/80 bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {isSelected ? (
                        <Check className="h-3 w-3 stroke-[3]" />
                      ) : (
                        <Plus className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Custom Skill Addition Form */}
            <div className="pt-1">
              <label className="mb-1 block text-xs font-bold text-foreground">
                Tambah Skill Kustom
              </label>
              <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                <input
                  type="text"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  placeholder="Ketik skill (misal: Blender, Three.js, Flutter)..."
                  className="h-9 sm:h-10 flex-1 rounded-xl border border-border bg-card px-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!customSkill.trim()}
                  className="h-9 sm:h-10 rounded-xl bg-secondary px-3.5 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 shrink-0"
                >
                  Tambah
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Client Categories Selection (Max 3) */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs sm:text-sm font-bold text-foreground block">
                  Pilih Kategori Kebutuhan Proyek Bisnis
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Pilih hingga 3 kategori yang paling sering dibutuhkan usaha Anda
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  data.projectCategories.length >= 3
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {data.projectCategories.length}/3 Dipilih
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {UNIFIED_PROJECT_CATEGORIES.map((cat) => {
                const isSelected = data.projectCategories.includes(cat.id);
                const Icon = CATEGORY_ICON_MAP[cat.id] || Globe;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      onToggleCategory(cat.id);
                      setValidationError(null);
                    }}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary shadow-xs"
                        : data.projectCategories.length >= 3
                        ? "border-border/60 bg-card/60 opacity-60 hover:opacity-80"
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div
                      className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm font-bold text-foreground truncate">{cat.title}</p>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
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

      {/* Validation Message Banner */}
      {validationError && (
        <div className="mt-2 text-xs font-semibold text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
          {validationError}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-border/40 shrink-0">
        <button
          type="button"
          onClick={onPrev}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 sm:px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={handleProceed}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 sm:px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
