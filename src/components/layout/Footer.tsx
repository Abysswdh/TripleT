"use client";

import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Container } from "@/components/layout/Container";
import { useTranslation } from "@/context/language-context";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/40 bg-muted/20 py-12 text-muted-foreground mt-auto w-full relative">
      <Container className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Brand & Mission Copy */}
        <div className="max-w-lg space-y-3">
          <BrandLogo variant="both" height={64} />
          <p className="text-xs text-muted-foreground leading-relaxed font-normal">
            &copy; {new Date().getFullYear()} Doable! Indonesia. {t("footer.tagline", "Platform kerja lepas terintegrasi yang menghubungkan talenta terverifikasi dan bisnis melalui kolaborasi cerdas, proteksi kontrak, dan peluang tanpa batas.")}
          </p>
          {/* SDG Alignment Endorsement */}
          <div className="flex items-center gap-2 pt-0.5">
            <Image
              src="/images/sdg/sdg_wheel.svg"
              alt="UN Sustainable Development Goals"
              width={20}
              height={20}
              className="h-4.5 w-4.5 object-contain shrink-0"
            />
            <span className="text-[11px] font-medium text-muted-foreground/80">
              Mendukung Agenda UN Sustainable Development Goals (SDG 8 &amp; SDG 9)
            </span>
          </div>
        </div>

        {/* Right Navigation & Legal Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-foreground/80">
          <Link href="/#our-story" className="hover:text-primary transition-colors">
            {t("footer.mission", "Mission")}
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            {t("footer.privacyPolicy", "Privacy Policy")}
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            {t("footer.termsOfService", "Terms of Service")}
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            {t("footer.contactUs", "Contact Us")}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
