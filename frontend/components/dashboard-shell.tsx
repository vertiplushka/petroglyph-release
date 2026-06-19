"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DashboardTab {
  id: string;
  label: string;
}

interface DashboardShellProps {
  greeting?: string;
  tabs: DashboardTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  title: string;
  children: React.ReactNode;
}

export function DashboardShell({
  greeting = "Привет, user",
  tabs,
  activeTab,
  onTabChange,
  title,
  children,
}: DashboardShellProps) {
  return (
    <div className="w-full bg-[#fffcf3] min-h-[calc(100vh-92px)]">
      {/* Greeting + search band */}
      <div className="w-full border-b border-[#0e0f11]/5">
        <div className="max-w-[1440px] mx-auto flex items-center gap-6 px-4 md:px-16 py-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="size-12 md:size-14 rounded-lg bg-[#233516] flex items-center justify-center flex-shrink-0">
              <span className="font-sans font-bold text-lg text-[#fffcf3] select-none uppercase">
                {greeting?.replace(/^Привет,\s*/i, "").trim().slice(0, 2)}
              </span>
            </div>
            <p className="font-display text-xl md:text-2xl font-semibold text-[#0e0f11] whitespace-nowrap">
              {greeting}
            </p>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#0e0f11]/50"
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full rounded-lg border border-[#0e0f11]/10 bg-white pl-11 pr-4 py-3 font-sans text-sm text-[#0e0f11] placeholder:text-[#0e0f11]/40 outline-none focus:border-[#233516] focus:ring-2 focus:ring-[#233516]/15 transition"
              />
            </div>
            <button className="hidden md:inline-flex rounded-lg bg-[#233516] text-[#fffcf3] px-6 py-3 font-sans text-sm font-medium hover:bg-[#1a2811] transition">
              Поиск
            </button>
          </div>
        </div>
      </div>

      {/* Body: sidebar + content */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 md:gap-12 px-4 md:px-16 py-10">
        <aside className="flex lg:flex-col justify-between lg:min-h-[500px] overflow-x-auto">
          <nav className="flex lg:flex-col gap-1">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => onTabChange(t.id)}
                  className={cn(
                    "text-left font-sans text-sm px-3 py-2 rounded-md transition whitespace-nowrap",
                    active
                      ? "bg-[#233516]/8 text-[#233516] font-semibold"
                      : "text-[#0e0f11] hover:bg-[#0e0f11]/5",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
          </nav>

          <div className="hidden lg:flex flex-col gap-1 mt-8">
            <button
              onClick={() => {
                document.cookie = "partner_token=; path=/; max-age=0";
                document.cookie = "admin_token=; path=/; max-age=0";
                document.cookie = "user_token=; path=/; max-age=0";
                window.location.href = "/";
              }}
              className="text-left font-sans text-sm text-[#0e0f11] hover:text-red-500 px-3 py-2 transition"
            >
              Выйти
            </button>
            <a
              href="mailto:support@altaiguide.ru"
              className="text-left font-sans text-sm text-[#0e0f11] hover:text-[#233516] px-3 py-2 transition"
            >
              Помощь
            </a>
          </div>
        </aside>

        <section className="flex flex-col gap-6">
          <h1 className="font-display font-semibold text-3xl md:text-4xl text-[#0e0f11]">
            {title}
          </h1>
          {children}
        </section>
      </div>
    </div>
  );
}
