"use client";

import { useState } from "react";
import { Search, Star, ShieldCheck } from "lucide-react";
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

export default function TalentPage() {
  const [search, setSearch] = useState("");

  const filtered = TALENTS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.role.toLowerCase().includes(search.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="animate-fade-in space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            Cari Talent Terverifikasi
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Temukan freelancer terbaik dengan keahlian yang telah diuji dan diverifikasi.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors self-start md:self-auto"
        >
          ← Kembali
        </Link>
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
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={talent.avatar}
                  alt={talent.name}
                  className="h-12 w-12 rounded-xl object-cover border border-border"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-foreground">{talent.name}</h4>
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
            </div>

            <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-2">
              <button className="flex-1 rounded-xl bg-primary py-2 text-center text-xs font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors">
                Undang ke Proyek
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
