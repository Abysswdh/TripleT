import type { Metadata } from "next";
import { Krona_One, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const kronaOne = Krona_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-krona",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Doable! — All About Freelancing",
    template: "%s | Doable!",
  },
  description:
    "Doable! adalah platform freelance marketplace & gamified learning terintegrasi. Bangun portofolio, ikuti kuis keahlian, dan kerjakan proyek aman bersama klien terverifikasi.",
  keywords: [
    "freelance marketplace",
    "doable",
    "gamified learning",
    "freelancer indonesia",
    "digital talent",
    "rekening bersama",
    "proyek web",
    "desain ui ux",
  ],
  authors: [{ name: "Doable! Team" }],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Doable! — All About Freelancing",
    description: "Platform freelance marketplace & gamified learning terintegrasi dengan proteksi Escrow Rekber.",
    url: "https://triple-t-lime.vercel.app",
    siteName: "Doable!",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${kronaOne.variable} ${plusJakartaSans.variable}`}>
      <body className={`${plusJakartaSans.className} font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary`}>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
