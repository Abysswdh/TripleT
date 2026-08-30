"use client";

import {
  ExperienceLevel,
  FreelancerBackground,
  ClientHiringType,
  ClientBudgetPref,
  OnboardingData,
} from "@/hooks/use-onboarding";
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
  "Figma",
  "UI/UX Design",
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Python",
  "FastAPI",
  "AI & ML",
  "Flutter",
  "Photoshop",
  "Canva",
  "Brand Identity",
  "PostgreSQL",
  "Docker",
];

const PROJECT_CATEGORIES = [
  "Branding & Desain Visual UMKM",
  "UI/UX & Product Design",
  "Website & Web App Development",
  "Mobile Apps (Flutter / React Native)",
  "Otomasi Bisnis & Integrasi AI",
  "Backend API & Database Cloud",
];

const STARTING_PRICE_OPTIONS = [
  { value: 250000, label: "Rp 250.000", desc: "Starter / Tugas Ringan" },
  { value: 500000, label: "Rp 500.000", desc: "Standar Desain / Fitur" },
  { value: 1000000, label: "Rp 1.000.000", desc: "Proyek Modul Menengah" },
  { value: 2500000, label: "Rp 2.500.000", desc: "Proyek Komprehensif" },
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
    <div className="flex h-full flex-col justify-between space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {isFreelancer ? "Keahlian & Pengalaman" : "Kebutuhan Usaha & Proyek"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {isFreelancer
            ? "Lengkapi latar belakang, skill utama, dan estimasi tarif minimum per proyek."
            : "Lengkapi data usaha dan jenis kebutuhan proyek Anda."}
        </p>
      </div>

      {isFreelancer ? (
        /* FREELANCER ONBOARDING DETAILS */
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Background / Status */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Latar Belakang / Status
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { id: "mahasiswa", label: "Mahasiswa / Pelajar", desc: "Aktif studi" },
                  { id: "fresh_grad", label: "Fresh Graduate", desc: "< 1 th lulus" },
                  { id: "switch_career", label: "Switch Career", desc: "Belajar bidang baru" },
                  { id: "professional", label: "Profesional", desc: "Berpengalaman" },
                ] as const
              ).map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => onUpdate({ backgroundType: bg.id as FreelancerBackground })}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    data.backgroundType === bg.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{bg.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{bg.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Tingkat Pengalaman
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {(
                [
                  {
                    level: "starter",
                    label: "Pemula (0 Portofolio)",
                    desc: "Belum ada pengalaman komersial.",
                  },
                  {
                    level: "intermediate",
                    label: "Menengah (1-2 Tahun)",
                    desc: "Pernah menyelesaikan beberapa proyek.",
                  },
                  {
                    level: "expert",
                    label: "Expert (3+ Tahun)",
                    desc: "Memiliki portofolio & rekam jejak matang.",
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => onUpdate({ experienceLevel: item.level as ExperienceLevel })}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    data.experienceLevel === item.level
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Skill Selector */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Pilih Keahlian Utama <span className="text-[11px] text-muted-foreground font-normal">(Minimal 1)</span>
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
                        ? "bg-primary text-white shadow-xs ring-2 ring-primary/20"
                        : "border border-border/70 bg-card text-foreground hover:border-primary/50 hover:bg-muted/50"
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
                placeholder="Tambah skill lain (misal: Flutter, Midtrans, Canva)..."
                className="h-8 flex-1 rounded-xl border border-border bg-card px-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="submit"
                className="h-8 rounded-xl bg-secondary px-3 text-xs font-semibold text-foreground hover:bg-secondary/80 transition-colors"
              >
                Tambah
              </button>
            </form>
          </div>

          {/* Starting Price Per Project */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Estimasi Tarif Minimum Mulai (Per Proyek)
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-2">
              {STARTING_PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onUpdate({ startingPrice: opt.value })}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    data.startingPrice === opt.value
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{opt.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            <div className="relative max-w-[240px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-xs">
                Rp
              </span>
              <input
                id="startingPriceInput"
                type="number"
                step={50000}
                min={100000}
                max={50000000}
                value={data.startingPrice ?? 500000}
                onChange={(e) => onUpdate({ startingPrice: Number(e.target.value) })}
                className="h-9 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-xs font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Tarif dasar ini akan ditampilkan di profil publik Anda sebagai patokan awal untuk klien.
            </p>
          </div>
        </div>
      ) : (
        /* CLIENT ONBOARDING DETAILS */
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Entity / Business Type */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Tipe Usaha / Entitas
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  { type: "umkm", label: "UMKM / Bisnis Lokal", desc: "Kedai Kopi, Retail, F&B, Toko Online" },
                  { type: "startup", label: "Startup Teknologi", desc: "Tim produk berkembang" },
                  { type: "agency", label: "Agensi / Studio", desc: "Eksekusi proyek klien" },
                  { type: "individual", label: "Individu / Personal", desc: "Proyek mandiri" },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => onUpdate({ hiringType: item.type as ClientHiringType })}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    data.hiringType === item.type
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label htmlFor="businessName" className="mb-1 block text-xs font-semibold text-foreground">
              Nama Usaha / Brand / Perusahaan
            </label>
            <input
              id="businessName"
              type="text"
              value={data.businessName || ""}
              onChange={(e) => onUpdate({ businessName: e.target.value })}
              placeholder="Contoh: Kopi Seduh Kenari, PT Inovasi Digital..."
              className="h-9 w-full rounded-xl border border-border bg-card px-3 text-xs placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Primary Hiring Needs / Category */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Kategori Kebutuhan Proyek
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
                        : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Tier Preference */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Kisaran Budget Proyek
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { pref: "umkm", label: "Ramah UMKM", desc: "< Rp 2 Juta", note: "Proyek awal & esensial" },
                  { pref: "standard", label: "Standar Bisnis", desc: "Rp 2jt - 10jt", note: "Cakupan fitur lengkap" },
                  { pref: "enterprise", label: "Enterprise", desc: "> Rp 10 Juta", note: "Skala besar & custom" },
                ] as const
              ).map((item) => (
                <button
                  key={item.pref}
                  type="button"
                  onClick={() => onUpdate({ budgetPreference: item.pref as ClientBudgetPref })}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    data.budgetPreference === item.pref
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border/70 bg-card hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <p className="text-xs font-bold text-foreground">{item.label}</p>
                  <p className="text-xs font-semibold text-primary mt-0.5">{item.desc}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{item.note}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-600 transition-all"
        >
          <span>Lanjutkan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
