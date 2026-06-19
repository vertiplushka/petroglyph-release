"use client";

import Image from "next/image";
import Link from "next/link";
import { Home, ArrowLeft, MapPin } from "lucide-react";
import { HeroHeader } from "@/components/hero-context";

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden -mt-[92px]">
      <HeroHeader />

      {/* Фоновый пейзаж */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1920"
        alt="Горный Алтай"
        fill
        className="object-cover object-center"
        priority
        unoptimized
      />

      {/* Градиент — темнее снизу, чтобы текст читался */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/75" />

      {/* Контент */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-[92px]">

        {/* Бейдж */}
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
          <MapPin className="size-3.5 text-white/70" />
          <span className="font-sans text-xs text-white/70 tracking-wider uppercase">
            Горный Алтай
          </span>
        </div>

        {/* Большой 404 */}
        <h1 className="font-display font-bold text-[140px] md:text-[220px] lg:text-[280px] text-white leading-none select-none"
          style={{ textShadow: "0 4px 60px rgba(0,0,0,0.4)" }}
        >
          404
        </h1>

        {/* Подпись */}
        <div className="flex flex-col items-center gap-3 mt-4 mb-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl text-white">
            Такой страницы не существует
          </h2>
          <p className="font-sans text-sm md:text-base text-white/60 max-w-[420px] leading-relaxed">
            Возможно, адрес набран неверно или страница была удалена.
            Зато у нас есть 25 удивительных мест, которые стоит увидеть.
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => history.back()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-sans font-semibold text-sm hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="size-4" />
            Вернуться назад
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#233516] text-[#fffcf3] font-sans font-semibold text-sm hover:bg-[#1a2811] transition-colors shadow-[0_4px_20px_rgba(35,53,22,0.5)]"
          >
            <Home className="size-4" />
            На главную
          </Link>
          <Link
            href="/places"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0e0f11] font-sans font-semibold text-sm hover:bg-white/90 transition-colors"
          >
            <MapPin className="size-4" />
            Смотреть места
          </Link>
        </div>

        {/* Нижняя подпись */}
        <p className="absolute bottom-8 font-sans text-xs text-white/30 tracking-widest uppercase">
          Перевал Чике-Таман · Горный Алтай
        </p>

      </div>
    </div>
  );
}
