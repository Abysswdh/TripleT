"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Container } from "@/components/layout/Container";
import { useTranslation } from "@/context/language-context";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/40 bg-muted/20 py-12 text-muted-foreground mt-auto w-full relative">
      <Container className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Brand & Mission Copy */}
        <div className="max-w-md space-y-3">
          <BrandLogo variant="full" height={42} />
          <p className="text-xs text-muted-foreground leading-relaxed font-normal">
            &copy; {new Date().getFullYear()} Doable! Indonesia. {t("footer.tagline", "Empowering the creative workforce through AI synergy.")}
          </p>
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
