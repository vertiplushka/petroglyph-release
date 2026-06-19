"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, LayoutDashboard, LogOut, User } from "lucide-react";
import { Logo } from "./logo";
import { useHeroCtx } from "./hero-context";
import { decodePartnerToken, clearPartnerToken, PartnerSession } from "@/lib/partner-api";
import { getUserToken, clearUserToken } from "@/lib/user-auth";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function decodeUserToken(): { email: string | null; phone: string | null; name: string | null } | null {
  if (typeof document === "undefined") return null;
  const token = getUserToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "user") return null;
    return { email: payload.email ?? null, phone: payload.phone ?? null, name: payload.name ?? null };
  } catch {
    return null;
  }
}

// ─── Partner avatar + dropdown ────────────────────────────────────────────────

function PartnerMenu({
  session,
  transparent,
  onLogout,
}: {
  session: PartnerSession;
  transparent: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = getInitials(session.companyName || session.email);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          transparent
            ? "hover:bg-white/10 text-white"
            : "hover:bg-[#233516]/8 text-[#0e0f11]"
        }`}
      >
        <div
          className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #233516 0%, #3a5a25 100%)" }}
        >
          {initials}
        </div>
        <span className="hidden md:block text-sm font-medium max-w-[140px] truncate">
          {session.companyName || session.email}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${transparent ? "text-white/70" : "text-[#888]"}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-[#e8e4d8] rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#f0ece0]">
            <div className="text-[#0e0f11] text-sm font-semibold truncate">{session.companyName}</div>
            <div className="text-[#aaa] text-xs truncate mt-0.5">{session.email}</div>
          </div>
          <div className="p-1.5 flex flex-col gap-0.5">
            <Link
              href="/partner/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#0e0f11] hover:bg-[#f5f2e8] transition-colors font-medium"
            >
              <LayoutDashboard size={14} className="text-[#233516]" />
              Мой кабинет
            </Link>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={14} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── User avatar + dropdown ───────────────────────────────────────────────────

function UserMenu({
  user,
  transparent,
  onLogout,
}: {
  user: { email: string | null; phone: string | null; name: string | null };
  transparent: boolean;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayName = user.name || user.email || user.phone || "Турист";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          transparent
            ? "hover:bg-white/10 text-white"
            : "hover:bg-[#233516]/8 text-[#0e0f11]"
        }`}
      >
        <div
          className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #233516 0%, #3a5a25 100%)" }}
        >
          {initials}
        </div>
        <span className="hidden md:block text-sm font-medium max-w-[140px] truncate">
          {displayName}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""} ${transparent ? "text-white/70" : "text-[#888]"}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white border border-[#e8e4d8] rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-[#f0ece0]">
            <div className="text-[#0e0f11] text-sm font-semibold truncate">{displayName}</div>
            {user.email && <div className="text-[#aaa] text-xs truncate mt-0.5">{user.email}</div>}
            {user.phone && !user.email && <div className="text-[#aaa] text-xs truncate mt-0.5">{user.phone}</div>}
          </div>
          <div className="p-1.5 flex flex-col gap-0.5">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-[#0e0f11] hover:bg-[#f5f2e8] transition-colors font-medium"
            >
              <User size={14} className="text-[#233516]" />
              Мой профиль
            </Link>
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={14} />
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mobile rows ──────────────────────────────────────────────────────────────

function MobilePartnerRow({ session, onLogout }: { session: PartnerSession; onLogout: () => void }) {
  const initials = getInitials(session.companyName || session.email);
  return (
    <div className="border-t border-[#0e0f11]/10 mt-2 pt-4 flex flex-col gap-1">
      <div className="flex items-center gap-3 px-4 py-2 mb-1">
        <div
          className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #233516 0%, #3a5a25 100%)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[#0e0f11] text-sm font-semibold truncate">{session.companyName}</div>
          <div className="text-[#aaa] text-xs truncate">{session.email}</div>
        </div>
      </div>
      <Link
        href="/partner/profile"
        className="flex items-center gap-2.5 font-sans text-base text-[#0e0f11] hover:bg-[#f5f2e8] px-4 py-3 rounded-lg transition-colors"
      >
        <LayoutDashboard size={15} className="text-[#233516]" />
        Мой кабинет
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 font-sans text-base text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors w-full text-left"
      >
        <LogOut size={15} />
        Выйти из кабинета
      </button>
    </div>
  );
}

function MobileUserRow({
  user,
  onLogout,
}: {
  user: { email: string | null; phone: string | null; name: string | null };
  onLogout: () => void;
}) {
  const displayName = user.name || user.email || user.phone || "Турист";
  const initials = displayName.slice(0, 2).toUpperCase();
  return (
    <div className="border-t border-[#0e0f11]/10 mt-2 pt-4 flex flex-col gap-1">
      <div className="flex items-center gap-3 px-4 py-2 mb-1">
        <div
          className="size-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #233516 0%, #3a5a25 100%)" }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="text-[#0e0f11] text-sm font-semibold truncate">{displayName}</div>
          {(user.email || user.phone) && (
            <div className="text-[#aaa] text-xs truncate">{user.email || user.phone}</div>
          )}
        </div>
      </div>
      <Link
        href="/profile"
        className="flex items-center gap-2.5 font-sans text-base text-[#0e0f11] hover:bg-[#f5f2e8] px-4 py-3 rounded-lg transition-colors"
      >
        <User size={15} className="text-[#233516]" />
        Мой профиль
      </Link>
      <button
        onClick={onLogout}
        className="flex items-center gap-2.5 font-sans text-base text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors w-full text-left"
      >
        <LogOut size={15} />
        Выйти
      </button>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isHero } = useHeroCtx();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [partnerSession, setPartnerSession] = useState<PartnerSession | null>(null);
  const [userSession, setUserSession] = useState<{ email: string | null; phone: string | null; name: string | null } | null>(null);

  useEffect(() => {
    setPartnerSession(decodePartnerToken());
    setUserSession(decodeUserToken());
  }, [pathname]);

  useEffect(() => {
    if (!isHero) { setIsScrolled(false); return; }
    const onScroll = () => setIsScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHero]);

  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setIsMobileMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  function handlePartnerLogout() {
    clearPartnerToken();
    setPartnerSession(null);
    router.push("/");
  }

  function handleUserLogout() {
    clearUserToken();
    setUserSession(null);
    router.push("/");
  }

  const transparent = isHero && !isScrolled;

  const navbarBg     = transparent ? "bg-transparent"                                                : "bg-[#fffcf3]";
  const textColor    = transparent ? "text-white"                                                    : "text-[#0e0f11]";
  const logoColor    = transparent ? "#fffcf3"                                                       : "#233516";
  const btnPrimary   = transparent ? "bg-white text-[#233516] hover:bg-white/90"                    : "bg-[#233516] text-[#fffcf3] hover:bg-[#1a2811]";
  const btnSecondary = transparent ? "border-white text-white hover:bg-white hover:text-[#233516]"  : "border-[#233516] text-[#233516] hover:bg-[#233516] hover:text-[#fffcf3]";

  const navLinks = [
    { href: "/places",   label: "Места" },
    { href: "/routes",   label: "Маршруты" },
    { href: "/partners", label: "Партнерам" },
  ];

  const isLoggedIn = partnerSession || userSession;

  return (
    <>
      <div className={`${navbarBg} h-[92px] sticky top-0 w-full z-[9999] transition-all duration-300 ${transparent ? "" : "shadow-sm"}`}>
        <div className="flex items-center justify-between h-full px-4 md:px-16 max-w-[1440px] mx-auto">
          <Link href="/" className="flex items-center justify-center size-[70px]">
            <Logo color={logoColor} className="transition-all duration-300" />
          </Link>

          {/* Desktop */}
          <div className="hidden lg:flex gap-8 items-center">
            <nav className="flex gap-8 items-center">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className={`font-sans font-normal text-base ${textColor} hover:opacity-70 transition-all duration-300`}>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex gap-3 items-center">
              {partnerSession ? (
                <PartnerMenu session={partnerSession} transparent={transparent} onLogout={handlePartnerLogout} />
              ) : userSession ? (
                <UserMenu user={userSession} transparent={transparent} onLogout={handleUserLogout} />
              ) : (
                <>
                  <Link href="/register"
                    className={`px-6 py-2 border rounded-lg font-sans font-normal text-base transition-all duration-300 shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)] ${btnSecondary}`}>
                    Регистрация
                  </Link>
                  <Link href="/login"
                    className={`px-6 py-2 rounded-lg font-sans font-normal text-base transition-all duration-300 shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)] ${btnPrimary}`}>
                    Войти
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-2">
            {partnerSession ? (
              <Link href="/partner/profile" className="flex items-center gap-2 pr-1">
                <div
                  className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #233516 0%, #3a5a25 100%)" }}
                >
                  {getInitials(partnerSession.companyName || partnerSession.email)}
                </div>
              </Link>
            ) : userSession ? (
              <Link href="/profile" className="flex items-center gap-2 pr-1">
                <div
                  className="size-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: "linear-gradient(135deg, #233516 0%, #3a5a25 100%)" }}
                >
                  {(userSession.name || userSession.email || userSession.phone || "Ту").slice(0, 2).toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href="/login"
                className={`px-4 py-2 rounded-lg font-sans font-normal text-sm transition-all duration-300 shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)] ${btnPrimary}`}>
                Войти
              </Link>
            )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2" aria-label="Меню">
              {isMobileMenuOpen
                ? <X size={28} color={transparent ? "white" : "#0e0f11"} />
                : <Menu size={28} color={transparent ? "white" : "#0e0f11"} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-[92px] right-0 w-full max-w-sm bg-[#fffcf3] shadow-2xl h-[calc(100vh-92px)] overflow-y-auto">
            <nav className="flex flex-col p-6 gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}
                  className="font-sans font-normal text-lg text-[#0e0f11] hover:bg-[#fffdf8] px-4 py-3 rounded-lg transition-colors">
                  {link.label}
                </Link>
              ))}

              {partnerSession ? (
                <MobilePartnerRow session={partnerSession} onLogout={handlePartnerLogout} />
              ) : userSession ? (
                <MobileUserRow user={userSession} onLogout={handleUserLogout} />
              ) : (
                <>
                  <div className="border-t border-[#0e0f11]/10 my-4" />
                  <Link href="/register"
                    className="block text-center w-full px-6 py-3 border border-[#233516] rounded-lg font-sans font-normal text-base text-[#233516] hover:bg-[#233516] hover:text-[#fffcf3] transition-colors shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)]">
                    Регистрация
                  </Link>
                  <Link href="/login"
                    className="block text-center w-full px-6 py-3 bg-[#233516] rounded-lg font-sans font-normal text-base text-[#fffcf3] hover:bg-[#1a2811] transition-colors shadow-[4px_5px_20px_0px_rgba(35,53,22,0.25)]">
                    Войти
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
