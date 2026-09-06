"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Container } from "@/components/layout/Container";
import { useTranslation } from "@/context/language-context";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { Mail, Lock, FileText } from "lucide-react";

export function Footer() {
  const { t, locale } = useTranslation();
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | null>(null);

  const isId = locale === "id";

  return (
    <>
      <footer className="border-t border-border/50 bg-muted/20 py-12 lg:py-16 text-muted-foreground mt-auto w-full relative">
        <Container className="space-y-12">
          {/* Main 4-Column Grid: Brand (Col 5) + 3 Link Columns (Col 7) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Brand, Tagline & Endorsements (Span 5) */}
            <div className="lg:col-span-5 space-y-4">
              <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
                <BrandLogo variant="both" height={60} />
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal max-w-sm">
                {t(
                  "footer.tagline",
                  "Platform kerja lepas terintegrasi yang menghubungkan talenta terverifikasi dan bisnis melalui kolaborasi cerdas, proteksi kontrak, dan peluang tanpa batas."
                )}
              </p>
            </div>

            {/* Column 2: Untuk Talenta (Span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {isId ? "Untuk Talenta" : "For Talents"}
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/freelancer/explore" className="hover:text-primary transition-colors">
                    {isId ? "Jelajahi Quest Proyek" : "Explore Quest Projects"}
                  </Link>
                </li>
                <li>
                  <Link href="/freelancer/skills" className="hover:text-primary transition-colors">
                    {isId ? "Jalur Karir & Kuis" : "Career Path & Quizzes"}
                  </Link>
                </li>
                <li>
                  <Link href="/freelancer/calendar" className="hover:text-primary transition-colors">
                    {isId ? "Kalender & Workload" : "Workload Calendar"}
                  </Link>
                </li>
                <li>
                  <Link href="/freelancer/earnings" className="hover:text-primary transition-colors">
                    {isId ? "Saldo & Rekber" : "Earnings & Escrow"}
                  </Link>
                </li>
                <li>
                  <Link href="/freelancer/profile" className="hover:text-primary transition-colors">
                    {isId ? "Profil Profesional" : "Public Profile"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Untuk Klien & Bisnis (Span 2) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {isId ? "Untuk Klien" : "For Clients"}
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/client/projects" className="hover:text-primary transition-colors">
                    {isId ? "Pasang Proyek Baru" : "Post a New Project"}
                  </Link>
                </li>
                <li>
                  <Link href="/client/talent" className="hover:text-primary transition-colors">
                    {isId ? "Cari Talenta Terverifikasi" : "Find Verified Talents"}
                  </Link>
                </li>
                <li>
                  <Link href="/client/dashboard" className="hover:text-primary transition-colors">
                    {isId ? "Manajemen Kontrak" : "Contract Management"}
                  </Link>
                </li>
                <li>
                  <Link href="/client/market" className="hover:text-primary transition-colors">
                    {isId ? "Pasar Talenta Digital" : "Digital Talent Market"}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Navigasi & Bantuan (Span 3) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground font-heading">
                {isId ? "Informasi & Bantuan" : "Help & Legal"}
              </h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link href="/#cara-kerja" className="hover:text-primary transition-colors">
                    {isId ? "Cara Kerja Rekber Doable!" : "How Escrow Works"}
                  </Link>
                </li>
                <li>
                  <Link href="/#faq" className="hover:text-primary transition-colors">
                    {isId ? "Tanya Jawab (FAQ)" : "Frequently Asked Questions"}
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("privacy")}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    {t("footer.privacyPolicy", "Kebijakan Privasi")}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("terms")}
                    className="hover:text-primary transition-colors cursor-pointer text-left"
                  >
                    {t("footer.termsOfService", "Syarat & Ketentuan")}
                  </button>
                </li>
                <li>
                  <a
                    href="mailto:support@doable.id"
                    className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>support@doable.id</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Quick Links */}
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} <strong>Doable! Indonesia</strong>.{" "}
              {isId ? "Seluruh hak cipta dilindungi." : "All rights reserved."}
            </p>

            <div className="flex items-center gap-4 text-[11px] font-semibold text-muted-foreground">
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {t("footer.privacyPolicy", "Kebijakan Privasi")}
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                {t("footer.termsOfService", "Syarat & Ketentuan")}
              </button>
            </div>
          </div>
        </Container>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: KEBIJAKAN PRIVASI (PRIVACY POLICY)                              */}
      {/* ========================================================================= */}
      {activeModal === "privacy" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <ModalCloseButton onClick={() => setActiveModal(null)} />

            <div className="border-b border-border/50 pb-3 pr-10">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Legal & Keamanan</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">
                Kebijakan Privasi Doable!
              </h3>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                <strong>1. Pengumpulan Data:</strong> Kami mengumpulkan informasi akun (nama, email, portofolio, keahlian) serta data verifikasi identitas (KTP/paspor) secara aman semata-mata untuk menjamin integritas reputasi freelancer dan validitas transaksi klien.
              </p>
              <p>
                <strong>2. Perlindungan Dana & Rekber:</strong> Seluruh transaksi finansial diproses melalui rekening bersama resmi (Rekber Doable!) yang tunduk pada protokol enkripsi perbankan dan standar keamanan pembayaran digital Indonesia.
              </p>
              <p>
                <strong>3. Kerahasiaan Deliverables:</strong> Hak kekayaan intelektual (IP) atas hasil karya yang telah diserahterimakan dan disetujui pembayarannya beralih sepenuhnya kepada klien sesuai kesepakatan kontrak.
              </p>
              <p>
                <strong>4. Tanpa Penjualan Data:</strong> Data pribadi pengguna tidak akan diperjualbelikan kepada pihak ketiga manapun untuk tujuan periklanan di luar ekosistem Doable!.
              </p>
            </div>

            <div className="pt-2 border-t border-border/50 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors cursor-pointer"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SYARAT & KETENTUAN LAYANAN (TERMS OF SERVICE)                    */}
      {/* ========================================================================= */}
      {activeModal === "terms" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <ModalCloseButton onClick={() => setActiveModal(null)} />

            <div className="border-b border-border/50 pb-3 pr-10">
              <div className="inline-flex items-center gap-1.5 text-primary text-xs font-bold uppercase tracking-wider mb-1">
                <FileText className="h-3.5 w-3.5" />
                <span>Aturan Ekosistem</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">
                Syarat & Ketentuan Layanan
              </h3>
            </div>

            <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
              <p>
                <strong>1. Ketentuan Rekber Wajib:</strong> Seluruh pembayaran proyek wajib disetorkan ke sistem Rekber Doable! sebelum pengerjaan dimulai. Transaksi di luar sistem resmi tidak dilindungi oleh garansi platform.
              </p>
              <p>
                <strong>2. Penyerahan Karya & Milestone:</strong> Freelancer berhak menerima pencairan dana rekber setelah klien menyetujui penyerahan karya milestone atau dalam batas waktu konfirmasi otomatis (maksimal 7 hari kalender tanpa sanggahan).
              </p>
              <p>
                <strong>3. Integritas Kuis & XP Karir:</strong> Akun yang terbukti melakukan kecurangan pada kuis keahlian atau memalsukan identitas verifikasi berisiko ditangguhkan atau dicabut lencana keahliannya.
              </p>
              <p>
                <strong>4. Penyelesaian Sengketa:</strong> Apabila terjadi perselisihan hasil kerja, tim mediasi Doable! akan meninjau riwayat pesan kontrak, brief, dan file serah terima secara objektif untuk keputusan pelepasan dana rekber.
              </p>
            </div>

            <div className="pt-2 border-t border-border/50 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-600 transition-colors cursor-pointer"
              >
                Setuju & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
