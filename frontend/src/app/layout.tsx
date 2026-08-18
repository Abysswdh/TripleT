import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
