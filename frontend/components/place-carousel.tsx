"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MediaItem {
  type: "image" | "video";
  url: string;
}

interface Props {
  items: MediaItem[];
  alt: string;
  className?: string;
}

export default function PlaceCarousel({ items, alt, className }: Props) {
  const [idx, setIdx] = useState(0);

  const prev = useCallback(() => setIdx((i) => (i - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setIdx((i) => (i + 1) % items.length), [items.length]);

  if (items.length === 0) return null;

  const current = items[idx];
  const hasMany = items.length > 1;

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-black/5", className)}>
      {/* Main media */}
      <div className="relative w-full h-full">
        {current.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            controls
            className="w-full h-full object-cover"
            playsInline
          />
        ) : (
          <Image
            key={current.url}
            src={current.url}
            alt={`${alt} — фото ${idx + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={idx === 0}
            unoptimized
          />
        )}
      </div>

      {/* Nav arrows */}
      {hasMany && (
        <>
          <button
            onClick={prev}
            aria-label="Назад"
            className="absolute left-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Вперёд"
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm transition-colors z-10"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* Dots */}
      {hasMany && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Фото ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === idx
                  ? "w-5 h-2 bg-white"
                  : "size-2 bg-white/50 hover:bg-white/75"
              )}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {hasMany && (
        <div className="absolute top-3 right-3 bg-black/35 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm z-10">
          {idx + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
