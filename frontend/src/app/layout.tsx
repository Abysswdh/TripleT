import type { Metadata } from "next";
import { Krona_One, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
  title: "Doable! — Learn Skills, Land Gigs",
  description:
    "Doable! is a freelance marketplace with gamified learning. Build skills through micro-courses, earn badges, and land projects from verified clients.",
  keywords: [
    "freelance",
    "marketplace",
    "gamified learning",
    "skill development",
    "digital talent",
    "micro-courses",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light ${kronaOne.variable} ${plusJakartaSans.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {children}
      </body>
    </html>
  );
}
