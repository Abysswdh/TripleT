"use client";

import { RoleProvider } from "@/context/role-context";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { usePathname } from "next/navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide Navbar/Footer on Auth pages where a clean layout is better
  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register") || pathname.startsWith("/onboarding");

  return (
    <RoleProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {!isAuthPage && <Navbar />}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>
        {!isAuthPage && <Footer />}
      </div>
    </RoleProvider>
  );
}
