"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, Star, ShieldCheck, CheckCircle2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { getTalents, inviteTalentToProject, type TalentRecord } from "@/lib/services/talents";
import { getClientProjects, type ProjectRecord } from "@/lib/services/projects";
import { useTranslation } from "@/context/language-context";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

const CATEGORY_TABS = [
  "Semua Kategori",
  "Full-Stack Web & Next.js",
  "Backend & Cloud Systems",
  "UI/UX & Product Design",
  "Mobile App Development",
  "AI & Machine Learning"
] as const;

export default function ClientTalentPage() {
  const [mounted, setMounted] = useState(false);
  const [talents, setTalents] = useState<TalentRecord[]>([]);
  const [clientProjects, setClientProjects] = useState<ProjectRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua Kategori");
  const [selectedLevel, setSelectedLevel] = useState<string>("Semua Level");
  const [selectedRateTier, setSelectedRateTier] = useState<string>("Semua");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "rate_low" | "rate_high" | "name">("rating");

  const [selectedTalent, setSelectedTalent] = useState<TalentRecord | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const [talentData, projData] = await Promise.all([
        getTalents(),
        getClientProjects()
      ]);
      if (talentData && talentData.length > 0) {
        setTalents(talentData);
      }
      if (projData && projData.length > 0) {
        setClientProjects(projData);
        setSelectedProjectId(projData[0].id);
      }
    }
    loadData();
  }, []);

  // Filter & Sort Logic
  const filtered = useMemo(() => {
    return talents
      .filter((talent) => {
        // 1. Search Query
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          talent.name.toLowerCase().includes(q) ||
          talent.title.toLowerCase().includes(q) ||
          (talent.location && talent.location.toLowerCase().includes(q)) ||
          talent.skills.some((s) => s.toLowerCase().includes(q));

        // 2. Category
        let matchesCategory = selectedCategory === "Semua Kategori";
        if (!matchesCategory) {
          const cat = selectedCategory.toLowerCase();
          matchesCategory =
            (talent.category && talent.category.toLowerCase().includes(cat)) ||
            talent.title.toLowerCase().includes(cat) ||
            talent.skills.some((s) => s.toLowerCase().includes(cat));
        }

        // 3. Level / Badge
        const matchesLevel =
          selectedLevel === "Semua Level" ||
          talent.badgeLevel.toLowerCase() === selectedLevel.toLowerCase();

        // 4. Rate Tier
        const rateNum = talent.hourlyRateNumeric || 35;
        let matchesRate = true;
        if (selectedRateTier === "< 150k") matchesRate = rateNum < 25;
        else if (selectedRateTier === "150k - 300k") matchesRate = rateNum >= 25 && rateNum <= 40;
        else if (selectedRateTier === "> 300k") matchesRate = rateNum > 40;

        return matchesSearch && matchesCategory && matchesLevel && matchesRate;
      })
      .sort((a, b) => {
        if (sortBy === "reviews") return b.reviewsCount - a.reviewsCount;
        if (sortBy === "rate_low") return (a.hourlyRateNumeric || 0) - (b.hourlyRateNumeric || 0);
        if (sortBy === "rate_high") return (b.hourlyRateNumeric || 0) - (a.hourlyRateNumeric || 0);
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return b.rating - a.rating; // default highest rating
      });
  }, [talents, searchQuery, selectedCategory, selectedLevel, selectedRateTier, sortBy]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTalent) return;

    setIsSubmittingInvite(true);
    const targetProjId = selectedProjectId || (clientProjects[0]?.id) || "da000000-0000-0000-0000-000000000001";
    await inviteTalentToProject({
      projectId: targetProjId,
      freelancerId: selectedTalent.userId,
      message: inviteMessage,
    });
    setIsSubmittingInvite(false);
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setSelectedTalent(null);
      setInviteMessage("");
    }, 2000);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-16">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
          {t("talent.title", "Cari Talenta Terverifikasi")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("talent.subtitle", "Temukan freelancer terbaik dengan keahlian yang telah diuji dan diverifikasi.")}
        </p>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="space-y-4">
        {/* Search Bar & Dropdown Selectors */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("talent.searchPlaceholder", "Cari berdasarkan nama, peran, skill (Next.js, Python, Flutter, Figma)...")}
              className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {/* Level Selector */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              aria-label="Filter level talenta"
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="Semua Level">{t("talent.allLevels", "Semua Level")}</option>
              <option value="Verified Pro">{t("talent.verifiedPro", "Verified Pro")}</option>
              <option value="Top Rated">{t("talent.topRated", "Top Rated")}</option>
              <option value="Rising Star">{t("talent.risingStar", "Rising Star")}</option>
            </select>

            {/* Hourly Rate Range Selector */}
            <select
              value={selectedRateTier}
              onChange={(e) => setSelectedRateTier(e.target.value)}
              aria-label="Filter rate per jam"
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="Semua">{t("talent.allRates", "Semua Rate")}</option>
              <option value="< 150k">{t("talent.under150k", "< Rp 150rb / jam")}</option>
              <option value="150k - 300k">{t("talent.range150to300k", "Rp 150rb - 300rb / jam")}</option>
              <option value="> 300k">{t("talent.above300k", "> Rp 300rb / jam")}</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "rating" | "reviews" | "rate_low" | "rate_high" | "name")}
              aria-label="Urutkan talenta"
              className="h-11 rounded-2xl border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-primary focus:outline-none shadow-xs cursor-pointer"
            >
              <option value="rating">{t("talent.highestRating", "Rating Tertinggi")}</option>
              <option value="reviews">{t("talent.mostReviews", "Ulasan Terbanyak")}</option>
              <option value="rate_low">{t("talent.lowestRate", "Rate Termurah")}</option>
              <option value="rate_high">{t("talent.highestRate", "Rate Tertinggi")}</option>
              <option value="name">{t("talent.nameAsc", "Nama (A-Z)")}</option>
            </select>
          </div>
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORY_TABS.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-102"
                    : "border border-border/80 bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat === "Semua Kategori" ? t("talent.allCategories", "Semua Kategori") : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TALENT GRID */}
      {filtered.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
          <SlidersHorizontal className="mx-auto h-8 w-8 text-muted-foreground" />
          <h3 className="mt-3 text-base font-bold text-foreground">
            {t("talent.emptyTitle", "Tidak ada talenta yang ditemukan")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            {t("talent.emptyDesc", "Coba ubah kata kunci pencarian atau sesuaikan filter level dan rentang rate.")}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("Semua Kategori");
              setSelectedLevel("Semua Level");
              setSelectedRateTier("Semua");
              setSortBy("rating");
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-semibold text-primary hover:bg-muted transition-colors shadow-xs"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((talent) => (
            <div
              key={talent.id}
              className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-primary/50 hover:shadow-md hover:-translate-y-1"
            >
              <Link href={`/client/talent/${talent.id}`} className="group/card block space-y-4">
                {/* Header: Avatar, Name & Level Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={talent.avatar}
                      alt={talent.name}
                      className="h-12 w-12 rounded-2xl object-cover border border-border bg-muted shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-foreground truncate group-hover/card:text-primary transition-colors">
                          {talent.name}
                        </h3>
                        {talent.verified && <ShieldCheck className="h-4 w-4 text-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{talent.title}</p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0 ${
                      talent.badgeLevel === "Verified Pro"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : talent.badgeLevel === "Top Rated"
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                    }`}
                  >
                    {talent.badgeLevel}
                  </span>
                </div>

                {/* Rating & Hourly Rate */}
                <div className="flex items-center justify-between text-xs py-1 border-y border-border/40">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-500" />
                    <span>{talent.rating}</span>
                    <span className="text-muted-foreground font-normal">({talent.reviewsCount})</span>
                  </div>
                  <span className="font-extrabold text-foreground">{talent.hourlyRate}</span>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {talent.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                  {talent.skills.length > 4 && (
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      +{talent.skills.length - 4}
                    </span>
                  )}
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="mt-5 pt-3.5 border-t border-border/40 flex items-center gap-2">
                <Link
                  href={`/client/talent/${talent.id}`}
                  className="flex-1 rounded-xl border border-border/80 bg-card py-2 text-center text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  {t("talent.viewProfile", "Lihat Profil")}
                </Link>
                <button
                  onClick={() => setSelectedTalent(talent)}
                  className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-bold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-102"
                >
                  {t("talent.inviteToProject", "Undang ke Proyek")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. Invite Modal (PORTAL) */}
      {mounted &&
        selectedTalent &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedTalent(null)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-hidden">
              <ModalCloseButton onClick={() => setSelectedTalent(null)} />

              {inviteSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold font-sans text-foreground">
                    {t("talent.inviteSuccess", "Undangan Berhasil Terkirim!")}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedTalent.name} telah menerima notifikasi undangan proyek dan akan segera menghubungimu.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedTalent.avatar}
                      alt={selectedTalent.name}
                      className="h-12 w-12 rounded-2xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold font-sans text-foreground">{selectedTalent.name}</h3>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedTalent.title}</p>
                      <span className="text-xs font-bold text-primary">{selectedTalent.hourlyRate}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
                    {clientProjects.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold mb-1.5 text-foreground">
                          Pilih Proyek Anda
                        </label>
                        <select
                          value={selectedProjectId}
                          onChange={(e) => setSelectedProjectId(e.target.value)}
                          className="w-full rounded-2xl border border-input bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        >
                          {clientProjects.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.title} ({p.budget})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-foreground">
                        {t("talent.customMessage", "Pesan Tambahan / Catatan Singkat")}
                      </label>
                      <textarea
                        rows={3}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Hai! Saya tertarik dengan portofoliomu dan ingin mengundangmu mengajukan proposal untuk proyek kami..."
                        className="w-full rounded-2xl border border-input bg-background p-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTalent(null)}
                        className="flex-1 rounded-xl border border-border py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingInvite}
                        className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        {isSubmittingInvite ? "Mengirim..." : t("talent.sendInvite", "Kirim Undangan Proyek")}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
