"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { ThesisBanner } from "./thesis-banner";
import { HeroProvider } from "./hero-context";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/route-detail/print")) {
    return <>{children}</>;
  }

  return (
    <HeroProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <ThesisBanner />
    </HeroProvider>
  );
}
