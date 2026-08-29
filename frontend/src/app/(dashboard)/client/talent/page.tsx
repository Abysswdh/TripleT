"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, Star, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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

const TALENTS: TalentMatch[] = [
  {
    id: "tal-1",
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
    id: "tal-2",
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
    id: "tal-3",
    name: "Reza Mahendra",
    role: "AI & Machine Learning Specialist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviewsCount: 29,
    hourlyRate: "Rp 250.000 / jam",
    skills: ["Python", "FastAPI", "OpenAI", "LangChain"],
    isVerified: true,
  },
  {
    id: "tal-4",
    name: "Budi Santoso",
    role: "Mobile App Developer (Flutter / React Native)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviewsCount: 24,
    hourlyRate: "Rp 160.000 / jam",
    skills: ["Flutter", "React Native", "Firebase", "State Management"],
    isVerified: true,
  },
];

export default function ClientTalentPage() {
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTalent, setSelectedTalent] = useState<TalentMatch | null>(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setSelectedTalent(null);
      setInviteMessage("");
    }, 1500);
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Cari Talent Terverifikasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Temukan freelancer terbaik dengan keahlian yang telah diuji dan diverifikasi.
          </p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, peran, atau skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((talent) => (
          <div
            key={talent.id}
            className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <Link href={`/client/talent/${talent.id}`} className="group/card block">
              <div className="flex items-center gap-3">
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="h-12 w-12 rounded-xl object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold font-sans text-foreground group-hover/card:text-primary transition-colors">{talent.name}</h4>
                    {talent.isVerified && <ShieldCheck className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{talent.role}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-amber-500" />
                  <span>{talent.rating}</span>
                  <span className="text-muted-foreground">({talent.reviewsCount})</span>
                </div>
                <span className="font-semibold text-primary">{talent.hourlyRate}</span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {talent.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Link>

            <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-2">
              <Link
                href={`/client/talent/${talent.id}`}
                className="flex-1 rounded-xl border border-border/80 bg-card py-2 text-center text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Lihat Profil
              </Link>
              <button
                onClick={() => setSelectedTalent(talent)}
                className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
              >
                Undang ke Proyek
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal (PORTAL) */}
      {mounted &&
        selectedTalent &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
            {/* Backdrop with dark blur covering entire screen */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
              onClick={() => setSelectedTalent(null)}
            />
            <div className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedTalent(null)}
                className="absolute right-5 top-5 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {inviteSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold font-sans text-foreground">Undangan Berhasil Terkirim!</h3>
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
                      className="h-12 w-12 rounded-xl object-cover border border-border"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-base font-bold font-sans text-foreground">{selectedTalent.name}</h3>
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-xs text-muted-foreground">{selectedTalent.role}</p>
                      <span className="text-xs font-bold text-primary">{selectedTalent.hourlyRate}</span>
                    </div>
                  </div>

                  <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-foreground">
                        Pesan Tambahan / Catatan Singkat
                      </label>
                      <textarea
                        rows={3}
                        value={inviteMessage}
                        onChange={(e) => setInviteMessage(e.target.value)}
                        placeholder="Hai! Saya tertarik dengan portofoliomu dan ingin mengundangmu mengajukan proposal untuk proyek kami..."
                        className="w-full rounded-xl border border-input bg-background p-3.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-600 transition-all"
                      >
                        Kirim Undangan Proyek
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
