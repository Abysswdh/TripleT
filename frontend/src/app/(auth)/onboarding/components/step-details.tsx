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
  "Node.js",
  "Python",
  "FastAPI",
  "Tailwind CSS",
  "UI/UX Design",
  "Figma",
  "Machine Learning",
  "PostgreSQL",
  "Supabase",
  "GraphQL",
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
  "Database & DevOps",
  "Smart Contracts & Web3",
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isFreelancer ? "Tell us about your skills" : "What are you looking to build?"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {isFreelancer
            ? "Select your top skills and experience level so we can recommend the best quests."
            : "Select the categories that match your project requirements."}
        </p>
      </div>

      {isFreelancer ? (
        /* Freelancer Details */
        <div className="space-y-6">
          {/* Skill Selector */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Select Your Top Skills <span className="text-xs text-muted-foreground font-normal">(Pick at least 1)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = data.skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-primary text-white shadow-sm shadow-primary/30 ring-2 ring-primary/20"
                        : "border border-border/80 bg-background text-foreground hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    {isSelected ? <Check className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3 w-3" />}
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Add Custom Skill */}
            <form onSubmit={handleAddCustomSkill} className="mt-3 flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add other skill (e.g. Flutter, PyTorch)..."
                className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-xs transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="h-9 rounded-lg bg-secondary px-3 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
              >
                Add
              </button>
            </form>
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-2 block text-sm font-semibold">Experience Level</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { level: "entry", label: "Entry Level", desc: "0-2 years" },
                  { level: "intermediate", label: "Intermediate", desc: "2-5 years" },
                  { level: "expert", label: "Expert / Lead", desc: "5+ years" },
                ] as const
              ).map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => onUpdate({ experienceLevel: item.level as ExperienceLevel })}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    data.experienceLevel === item.level
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Hourly Rate */}
          <div>
            <label htmlFor="hourlyRate" className="mb-2 block text-sm font-semibold">
              Target Hourly Rate <span className="text-xs text-muted-foreground font-normal">(USD/hr)</span>
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm">
                $
              </span>
              <input
                id="hourlyRate"
                type="number"
                min={5}
                max={500}
                value={data.hourlyRate ?? 35}
                onChange={(e) => onUpdate({ hourlyRate: Number(e.target.value) })}
                className="h-10 w-full rounded-lg border border-input bg-background pl-8 pr-4 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>
      ) : (
        /* Client Details */
        <div className="space-y-6">
          {/* Project Category Picker */}
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Select Project Categories of Interest
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PROJECT_CATEGORIES.map((cat) => {
                const isSelected = data.projectCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onToggleCategory(cat)}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
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
            <label className="mb-2 block text-sm font-semibold">I am hiring as a:</label>
            <div className="grid grid-cols-3 gap-2.5">
              {(
                [
                  { type: "individual", label: "Individual", desc: "Personal projects" },
                  { type: "startup", label: "Startup / SME", desc: "Growing business" },
                  { type: "company", label: "Enterprise", desc: "Company scale" },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onUpdate({ hiringType: item.type as HiringType })}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    data.hiringType === item.type
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <p className="text-xs font-bold">{item.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted/40 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all hover:shadow-xl hover:shadow-primary/30"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
