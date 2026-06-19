"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { SlidersHorizontal, X, Search, MapPin, BedDouble, UtensilsCrossed, Landmark, Star, BadgeCheck } from "lucide-react";
import type { PlaceType } from "@/lib/data";
import type { Place } from "@/lib/server-api";
import { HeroHeader } from "@/components/hero-context";

const TABS: { id: PlaceType; label: string; icon: React.ReactNode }[] = [
  { id: "attraction", label: "Достопримечательности", icon: <MapPin className="size-4" /> },
  { id: "hotel",      label: "Отели",                 icon: <BedDouble className="size-4" /> },
  { id: "restaurant", label: "Рестораны",             icon: <UtensilsCrossed className="size-4" /> },
  { id: "museum",     label: "Музеи",                 icon: <Landmark className="size-4" /> },
];

const SORT_OPTIONS = [
  { value: "rating",     label: "По рейтингу" },
  { value: "price_asc",  label: "Цена ↑" },
  { value: "price_desc", label: "Цена ↓" },
  { value: "name",       label: "А → Я" },
];

const RATING_OPTIONS = [
  { value: 0,   label: "Любой" },
  { value: 4,   label: "4.0+" },
  { value: 4.5, label: "4.5+" },
  { value: 4.8, label: "4.8+" },
];

function parsePrice(s: string): number {
  const m = s.replace(/[\s ]/g, "").match(/\d+/g);
  return m ? parseInt(m[0]) : 0;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`size-3.5 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-[#ddd] fill-[#ddd]"}`} />
      ))}
    </div>
  );
}

export default function PlacesPage() {
  const [places,     setPlaces]     = useState<Place[]>([]);
  const [activeTab,  setActiveTab]  = useState<PlaceType>("attraction");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [sortBy,      setSortBy]      = useState("rating");
  const [minRating,   setMinRating]   = useState(0);
  const [maxPrice,    setMaxPrice]    = useState(Infinity);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [tags,        setTags]        = useState<string[]>([]);

  useEffect(() => {
    fetch("/v1/places").then(r => r.json()).then(setPlaces).catch(console.error);
  }, []);

  const tabPlaces     = useMemo(() => places.filter(p => (p.type ?? "attraction") === activeTab), [places, activeTab]);
  const allCategories = useMemo(() => [...new Set(tabPlaces.map(p => p.category))], [tabPlaces]);
  const allTags       = useMemo(() => [...new Set(tabPlaces.flatMap(p => p.tags))].sort(), [tabPlaces]);
  const maxPossible   = useMemo(() => Math.max(...tabPlaces.map(p => parsePrice(p.price)), 0), [tabPlaces]);

  useEffect(() => {
    setCategories([]); setTags([]); setMaxPrice(maxPossible || Infinity);
  }, [activeTab, maxPossible]);

  const toggleCategory = (c: string) =>
    setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleTag = (t: string) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  const resetFilters = () => {
    setSortBy("rating"); setMinRating(0); setMaxPrice(maxPossible || Infinity);
    setCategories([]); setTags([]);
  };

  const activeFilterCount = useMemo(() => {
    let n = 0;
    if (sortBy !== "rating") n++;
    if (minRating > 0) n++;
    if (maxPrice < maxPossible) n++;
    if (categories.length) n++;
    if (tags.length) n++;
    return n;
  }, [sortBy, minRating, maxPrice, maxPossible, categories, tags]);

  const filteredPlaces = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tabPlaces
      .filter(p => {
        if (q && !p.name.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
        if (categories.length && !categories.includes(p.category)) return false;
        if (tags.length && !tags.some(t => p.tags.includes(t))) return false;
        if (p.rating < minRating) return false;
        if (parsePrice(p.price) > maxPrice) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "rating")     return b.rating - a.rating;
        if (sortBy === "price_asc")  return parsePrice(a.price) - parsePrice(b.price);
        if (sortBy === "price_desc") return parsePrice(b.price) - parsePrice(a.price);
        return a.name.localeCompare(b.name, "ru");
      });
  }, [tabPlaces, searchQuery, sortBy, minRating, maxPrice, categories, tags]);

  const handleTabChange = (tab: PlaceType) => {
    setActiveTab(tab); setSearchQuery(""); setIsFilterOpen(false);
  };

  return (
    <div className="w-full">
      <HeroHeader />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden -mt-[92px] pt-[92px]">
        <Image src="https://images.unsplash.com/photo-1747138167921-223e530279cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
          alt="" fill className="object-cover object-center" priority unoptimized />
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_24fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        <div className="relative z-10">
          <div className="py-12 md:py-24 px-4 md:px-16">
            <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                Каталог мест
              </h1>
              <p className="font-sans text-sm md:text-base lg:text-xl text-white/90">
                Достопримечательности, отели, рестораны и музеи Горного Алтая
              </p>
            </div>
          </div>
          <div className="px-4 md:px-16 pb-0">
            <div className="max-w-[968px] mx-auto">
              <div className="bg-white/95 backdrop-blur-sm rounded-[24px] shadow-[5px_2px_35px_0px_rgba(0,0,0,0.25)] px-2 py-1">
                <div className="bg-[#fffdf8] rounded-xl px-4 md:px-5 py-3 md:py-4 flex items-center gap-3 border-2 border-transparent focus-within:border-[#829177] transition-colors">
                  <Search className="size-5 text-[#807e7b] flex-shrink-0" />
                  <input type="text" placeholder="Найти место, отель, ресторан..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent font-sans text-base md:text-lg text-[#0e0f11] placeholder:text-[#807e7b]/50 outline-none" />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="p-1 text-[#807e7b] hover:text-[#0e0f11]">
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="px-4 md:px-16 pt-8 pb-0">
            <div className="max-w-[1280px] mx-auto flex gap-2 flex-wrap">
              {TABS.map(tab => {
                const count = places.filter(p => (p.type ?? "attraction") === tab.id).length;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-sans text-sm font-medium transition-all ${
                      active ? "bg-[#fffcf3] text-[#233516]" : "bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    }`}>
                    {tab.icon}{tab.label}
                    <span className={`text-xs rounded-full px-1.5 py-0.5 ${active ? "bg-[#233516]/10 text-[#233516]" : "bg-white/20 text-white"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section className="bg-[#fffcf3] py-8 md:py-12 px-4 md:px-16">
        <div className="max-w-[1280px] mx-auto">

          {/* Header row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl md:text-2xl lg:text-3xl text-[#0e0f11]">
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="font-sans text-sm text-[#666] mt-1">
                {filteredPlaces.length} {filteredPlaces.length === 1 ? "объект" : "объектов"} найдено
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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

                {/* Rating */}
                <div>
                  <p className="font-sans font-semibold text-xs uppercase tracking-wider text-[#0e0f11]/40 mb-2.5">Рейтинг</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {RATING_OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setMinRating(opt.value)}
                        className={`py-2 rounded-xl font-sans text-xs font-semibold transition-colors ${
                          minRating === opt.value ? "bg-[#233516] text-[#fffcf3]" : "bg-[#f5f0e8] text-[#666] hover:bg-[#ede6d9]"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                {maxPossible > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <p className="font-sans font-semibold text-xs uppercase tracking-wider text-[#0e0f11]/40">Макс. цена</p>
                      <span className="font-sans text-sm font-bold text-[#233516]">
                        {maxPrice === Infinity ? "∞" : maxPrice.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                    <input type="range" min={0} max={maxPossible} step={Math.ceil(maxPossible / 20)}
                      value={maxPrice === Infinity ? maxPossible : maxPrice}
                      onChange={e => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-[#233516] cursor-pointer" />
                    <div className="flex justify-between font-sans text-[10px] text-[#0e0f11]/30 mt-1">
                      <span>0 ₽</span><span>{maxPossible.toLocaleString("ru-RU")} ₽</span>
                    </div>
                  </div>
                )}

                {/* Categories */}
                {allCategories.length > 1 && (
                  <div>
                    <p className="font-sans font-semibold text-xs uppercase tracking-wider text-[#0e0f11]/40 mb-2.5">Категория</p>
                    <div className="flex flex-col gap-1.5">
                      {allCategories.map(cat => (
                        <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                          <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)}
                            className="size-4 rounded accent-[#233516] cursor-pointer" />
                          <span className="font-sans text-sm text-[#666] group-hover:text-[#0e0f11] transition-colors">{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              {allTags.length > 0 && (
                <div className="pt-5 border-t border-[#f0ebe0]">
                  <p className="font-sans font-semibold text-xs uppercase tracking-wider text-[#0e0f11]/40 mb-2.5">Теги</p>
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
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPlaces.map(place => (
              <Link key={place.id} href={`/places/${place.id}`}
                className="bg-white rounded-2xl shadow-[5px_2px_35px_0px_rgba(84,61,50,0.15)] overflow-hidden group hover:shadow-[5px_2px_45px_0px_rgba(84,61,50,0.25)] transition-shadow">
                <div className="relative h-64 overflow-hidden">
                  <Image src={place.image} alt={place.name} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" unoptimized />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                    <Star className="size-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-sans font-semibold text-xs text-[#0e0f11]">{place.rating}</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-[#233516]/80 backdrop-blur-sm rounded-lg px-2 py-1">
                    <span className="font-sans text-xs text-white">{place.category}</span>
                  </div>
                  {place.partner?.subscriptionActive && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                      <BadgeCheck className="size-3.5 text-[#233516] fill-[#233516]/10" strokeWidth={2.5} />
                      <span className="font-sans text-[10px] font-bold text-[#233516]">Партнёр Petroglyph</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {place.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="bg-[#ddd] px-2.5 py-1 rounded-lg text-[#666] text-xs font-sans">{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-sans font-bold text-lg text-[#0e0f11] mb-2">{place.name}</h3>
                  <p className="font-sans text-sm text-[#666] mb-4 line-clamp-2">{place.description}</p>
                  <div className="flex items-center justify-between">
                    <StarRating rating={place.rating} />
                    <span className="font-sans font-semibold text-base text-[#233516]">{place.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredPlaces.length === 0 && (
            <div className="text-center py-20">
              <p className="font-sans text-lg text-[#666]">Ничего не найдено</p>
              <p className="font-sans text-sm text-[#666] mt-2">Попробуйте изменить параметры поиска</p>
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="mt-4 font-sans text-sm text-[#233516] underline underline-offset-2">
                  Сбросить фильтры
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
