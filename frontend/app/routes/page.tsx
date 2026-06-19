"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, SlidersHorizontal } from "lucide-react";
import type { Route } from "@/lib/server-api";
import { HeroHeader } from "@/components/hero-context";

const SORT_OPTIONS = [
  { value: "default",   label: "По умолчанию" },
  { value: "name_asc",  label: "А → Я" },
  { value: "name_desc", label: "Я → А" },
];

export default function RoutesPage() {
  const [routes,       setRoutes]       = useState<Route[]>([]);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy,       setSortBy]       = useState("default");
  const [tags,         setTags]         = useState<string[]>([]);

  useEffect(() => {
    fetch("/v1/routes").then(r => r.json()).then(setRoutes).catch(console.error);
  }, []);

  const allTags = useMemo(() => [...new Set(routes.flatMap(r => r.tags))].sort(), [routes]);

  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const resetFilters = () => { setSortBy("default"); setTags([]); };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (sortBy !== "default") n++;
    if (tags.length) n++;
    return n;
  }, [sortBy, tags]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return routes
      .filter(r => {
        if (q && !r.title.toLowerCase().includes(q) && !r.subtitle.toLowerCase().includes(q) &&
            !r.description.toLowerCase().includes(q) && !r.path.toLowerCase().includes(q) &&
            !r.tags.some(t => t.toLowerCase().includes(q))) return false;
        if (tags.length && !tags.some(t => r.tags.includes(t))) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name_asc")  return a.title.localeCompare(b.title, "ru");
        if (sortBy === "name_desc") return b.title.localeCompare(a.title, "ru");
        return 0;
      });
  }, [routes, searchQuery, sortBy, tags]);

  return (
    <div className="w-full">
      <HeroHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden -mt-[92px] pt-[92px]">
        <Image src="https://images.unsplash.com/photo-1716479852367-336a095cb2cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="" fill className="object-cover object-center" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="relative z-10">
          <div className="py-12 md:py-24 px-4 md:px-16">
            <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                Каталог маршрутов
              </h1>
              <p className="font-sans text-sm md:text-base lg:text-xl text-white/90">
                Готовые маршруты путешественников — выберите любой или составьте свой
              </p>
            </div>
          </div>
          <div className="px-4 md:px-16 pb-0">
            <div className="max-w-[968px] mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-[24px] shadow-[5px_2px_35px_0px_rgba(0,0,0,0.25)] px-2 py-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-[#fffdf8] rounded-xl px-4 md:px-5 py-3 md:py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-[#829177] transition-colors">
                    <Search className="size-5 text-[#807e7b] flex-shrink-0" />
                    <input type="text" placeholder="Найти маршрут..."
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent font-sans text-base md:text-lg text-[#0e0f11] placeholder:text-[#807e7b]/50 outline-none" />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1 text-[#807e7b] hover:text-[#0e0f11]">
                        <X className="size-4" />
                      </button>
                    )}
                  </div>
                  <Link href="/partners"
                    className="bg-[#233516] px-6 py-3 md:py-4 rounded-xl font-sans font-semibold text-sm text-[#fffcf3] hover:bg-[#1a2811] transition-colors text-center flex-shrink-0 flex items-center justify-center">
                    Предложить маршрут
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="h-8 md:h-12" />
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-[#fffcf3] py-8 md:py-12 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-[#0e0f11]">Маршруты</h2>
              <p className="font-sans text-sm text-[#666] mt-1">
                {filtered.length} {filtered.length === 1 ? "маршрут" : "маршрутов"} найдено
                {searchQuery && <> по запросу «{searchQuery}»</>}
              </p>
            </div>
            <button onClick={() => setIsFilterOpen(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 border border-[#233516] rounded-xl font-sans text-sm text-[#233516] hover:bg-[#233516] hover:text-[#fffcf3] transition-colors">
              <SlidersHorizontal className="size-4" />
              Фильтры
              {activeFilterCount > 0 && (
                <span className="size-5 rounded-full bg-[#233516] text-[#fffcf3] text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Filter panel */}
          {isFilterOpen && (
            <div className="bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] p-6 md:p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-sans font-semibold text-lg text-[#0e0f11]">Фильтры</h3>
                <div className="flex items-center gap-4">
                  {activeFilterCount > 0 && (
                    <button onClick={resetFilters} className="font-sans text-sm text-[#666] hover:text-red-500 transition-colors">
                      Сбросить все
                    </button>
                  )}
                  <button onClick={() => setIsFilterOpen(false)} className="p-1 hover:opacity-70">
                    <X className="size-5 text-[#0e0f11]" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Sort */}
                <div>
                  <p className="font-sans font-semibold text-xs uppercase tracking-wider text-[#0e0f11]/40 mb-2.5">Сортировка</p>
                  <div className="flex flex-col gap-0.5">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setSortBy(opt.value)}
                        className={`text-left px-3 py-2 rounded-lg font-sans text-sm transition-colors ${
                          sortBy === opt.value ? "bg-[#233516] text-[#fffcf3] font-semibold" : "text-[#666] hover:bg-[#f5f0e8]"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                {allTags.length > 0 && (
                  <div>
                    <p className="font-sans font-semibold text-xs uppercase tracking-wider text-[#0e0f11]/40 mb-2.5">Тематика</p>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 rounded-full font-sans text-xs border transition-all ${
                            tags.includes(tag)
                              ? "bg-[#233516] border-[#233516] text-[#fffcf3]"
                              : "border-[#e5e5e5] text-[#666] hover:border-[#233516] hover:text-[#233516]"
                          }`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Route cards */}
          <div className="flex flex-col gap-6 md:gap-10">
            {filtered.map(route => (
              <Link key={route.id} href={`/routes/${route.id}`}
                className="bg-[#fffdf8] rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] overflow-hidden flex flex-col md:flex-row hover:shadow-[5px_2px_45px_0px_rgba(84,61,50,0.25)] transition-shadow group">
                <div className="relative h-64 md:h-full md:min-h-[280px] md:w-[400px] lg:w-[540px] flex-shrink-0">
                  <Image src={route.image} alt={route.title} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 540px" unoptimized />
                </div>
                <div className="flex-1 p-5 md:p-8 flex flex-col gap-3 md:gap-4">
                  <h3 className="font-sans font-bold text-xl md:text-2xl lg:text-[32px] text-[#0e0f11]">{route.title}</h3>
                  <p className="font-sans font-normal text-base text-[#0e0f11]">{route.subtitle}</p>
                  <p className="font-sans font-semibold text-sm text-[#233516]">{route.path}</p>
                  <p className="font-sans font-normal text-base text-[#0e0f11] line-clamp-3">{route.description}</p>
                  <div className="flex flex-wrap gap-2.5 mt-auto">
                    {route.tags.map(tag => (
                      <span key={tag} className="bg-[#ddd] px-2.5 py-1 rounded-lg text-[#666] text-sm font-sans">{tag}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-20">
                <p className="font-sans text-lg text-[#666]">Маршруты не найдены</p>
                <p className="font-sans text-sm text-[#666] mt-2">Попробуйте изменить параметры поиска</p>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="mt-4 font-sans text-sm text-[#233516] underline underline-offset-2">
                    Сбросить фильтры
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
