import Link from "next/link";
import { BrandLogo } from "@/components/branding/BrandLogo";
import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/20 py-12 text-muted-foreground mt-auto w-full z-10 relative">
      <Container className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Brand & Mission Copy */}
        <div className="max-w-md space-y-3">
          <BrandLogo variant="full" height={42} />
          <p className="text-xs text-muted-foreground leading-relaxed font-normal">
            &copy; {new Date().getFullYear()} Doable! Indonesia. Empowering the creative workforce through AI synergy.
          </p>
        </div>

        {/* Right Navigation & Legal Links */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-foreground/80">
          <Link href="/#our-story" className="hover:text-primary transition-colors">
            Mission
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/#realitas" className="hover:text-primary transition-colors">
            Unemployment Data 2024
          </Link>
          <Link href="/#transformasi-ai" className="hover:text-primary transition-colors">
            AI Ethics
          </Link>
          <Link href="#" className="hover:text-primary transition-colors">
            Contact Us
          </Link>
        </div>
      </Container>
    </footer>
  );
}
