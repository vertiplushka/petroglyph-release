"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/admin-api";
import { MapPin, Route, MessageSquare, LogOut, Handshake, Settings } from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/places",   label: "Места",      icon: MapPin },
  { href: "/admin/routes",   label: "Маршруты",   icon: Route },
  { href: "/admin/reviews",  label: "Отзывы",     icon: MessageSquare },
  { href: "/admin/partners", label: "Партнёры",   icon: Handshake },
  { href: "/admin/settings", label: "Настройки",  icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#fffcf3] flex">
      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside
        className="w-[220px] shrink-0 fixed inset-y-0 left-0 z-40 flex flex-col"
        style={{
          background: "linear-gradient(160deg, #182610 0%, #233516 60%, #2d421b 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-5 py-5">
          <Logo color="white" className="w-8 h-8 shrink-0" />
          <div>
            <div className="text-white font-semibold text-[13px] leading-tight tracking-wide">
              Petroglyph
            </div>
            <div className="text-white/35 text-[9px] font-semibold tracking-[0.16em] uppercase mt-0.5">
              Admin Panel
            </div>
          </div>
        </div>

        <div className="relative mx-5 h-px bg-white/8" />

        {/* Nav */}
        <nav className="relative flex-1 p-3 mt-3 flex flex-col gap-0.5">
          <p className="px-3 text-[9px] font-bold tracking-[0.18em] text-white/22 uppercase mb-2">
            Контент
          </p>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-white/13 text-white"
                    : "text-white/50 hover:text-white/85 hover:bg-white/7"
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white/65 rounded-full" />
                )}
                <Icon size={15} strokeWidth={active ? 2 : 1.75} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="relative p-3 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            <div className="size-7 rounded-full bg-white/12 ring-1 ring-white/18 flex items-center justify-center text-white text-[11px] font-bold">
              A
            </div>
            <div>
              <div className="text-white/85 text-[12px] font-medium">Admin</div>
              <div className="text-white/30 text-[10px]">Супер-пользователь</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-xl text-[13px] font-medium text-white/38 hover:text-white/70 hover:bg-white/7 transition-all"
          >
            <LogOut size={14} />
            Выйти
          </button>
        </div>
      </aside>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="flex-1 ml-[220px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
