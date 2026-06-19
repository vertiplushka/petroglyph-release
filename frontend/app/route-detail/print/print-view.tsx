"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Globe, Star, Banknote, Tag, Loader2 } from "lucide-react";
import type { Place } from "@/lib/server-api";
import { getUserToken } from "@/lib/user-auth";

const GORNO_ALTAYSK = { lat: 51.96, lng: 85.96 };

function yandexMapsUrl(lat: number, lng: number) {
  return `https://yandex.ru/maps/?pt=${lng},${lat}&z=15&l=map`;
}

function qrUrl(url: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=88x88&margin=2&data=${encodeURIComponent(url)}`;
}

export default function PrintView({ places }: { places: Place[] }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getUserToken()) {
      router.replace(
        `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
      );
      return;
    }
    setReady(true);
  }, [router]);

  // Auto-print after QR images finish loading
  useEffect(() => {
    if (!ready) return;
    const imgs = document.querySelectorAll<HTMLImageElement>("img.qr-img");
    if (imgs.length === 0) { window.print(); return; }

    let loaded = 0;
    const check = () => { if (++loaded === imgs.length) window.print(); };
    imgs.forEach((img) => {
      if (img.complete) check();
      else { img.onload = check; img.onerror = check; }
    });
  }, [ready]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="size-6 animate-spin text-[#233516]" />
      </div>
    );
  }

  const date = new Date().toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric",
  });

  const startMapUrl = yandexMapsUrl(GORNO_ALTAYSK.lat, GORNO_ALTAYSK.lng);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .place-card { page-break-inside: avoid; break-inside: avoid; }
          header, footer, nav { display: none !important; }
        }
        .print-only { display: none; }
        @page { size: A4; margin: 0; }
      `}</style>

      {/* Screen controls */}
      <div className="no-print fixed top-4 right-4 z-50 flex gap-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-[#233516] text-white font-sans text-sm px-5 py-2.5 rounded-xl shadow-lg hover:bg-[#1a2811] transition"
        >
          Печатать / Сохранить PDF
        </button>
        <button
          onClick={() => window.history.back()}
          className="bg-white border border-[#e8e4d8] text-[#0e0f11] font-sans text-sm px-5 py-2.5 rounded-xl shadow hover:bg-[#f5f0e8] transition"
        >
          Назад
        </button>
      </div>

      <div className="min-h-screen bg-white px-[15mm] py-[18mm] max-w-[860px] mx-auto font-sans text-[#0e0f11]">

        {/* Header */}
        <div className="border-b-2 border-[#233516] pb-6 mb-8">
          <p className="text-[10px] text-[#999] uppercase tracking-widest mb-1">Петроглиф · Горный Алтай</p>
          <h1 className="text-3xl font-bold leading-tight mb-1">Маршрут по Горному Алтаю</h1>
          <p className="text-sm text-[#555]">{places.length} мест · Составлен {date}</p>
          <div className="mt-4 flex items-start gap-4">
            <div className="flex-1">
              <p className="text-xs text-[#999] uppercase tracking-wide mb-0.5">Отправная точка</p>
              <p className="text-sm font-semibold">Горно-Алтайск</p>
              <p className="text-xs text-[#888]">{GORNO_ALTAYSK.lat}°N, {GORNO_ALTAYSK.lng}°E</p>
              <a href={startMapUrl} className="text-xs text-[#233516] underline no-print" target="_blank" rel="noopener noreferrer">
                Открыть в Яндекс.Картах →
              </a>
            </div>
            <div className="flex flex-col items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl(startMapUrl)} alt="QR Горно-Алтайск" className="qr-img size-[72px] border border-[#e8e4d8] rounded" />
              <p className="text-[9px] text-[#bbb] text-center">Яндекс.Карты</p>
            </div>
          </div>
        </div>

        {/* Places */}
        <div className="flex flex-col gap-7">
          {places.map((place, idx) => {
            const isLast = idx === places.length - 1;
            const mapUrl = yandexMapsUrl(place.lat, place.lng);

            return (
              <div key={place.id} className="place-card border border-[#e8e4d8] rounded-xl overflow-hidden">

                {/* Card header bar */}
                <div className="bg-[#233516] px-5 py-3 flex items-center gap-3">
                  <div className="size-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">{isLast ? "🏁" : idx + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-[10px] uppercase tracking-wide">{place.category}</p>
                    <p className="text-white font-bold text-base leading-tight truncate">{place.name}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    <span className="text-white text-sm font-semibold">{place.rating}</span>
                  </div>
                </div>

                <div className="px-5 py-4 flex gap-5">
                  {/* Left: info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-3">

                    {/* Description */}
                    <p className="text-sm text-[#444] leading-relaxed">{place.description}</p>

                    {/* Info rows */}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">

                      <div>
                        <p className="text-[10px] text-[#999] uppercase tracking-wide">Стоимость</p>
                        <div className="flex items-center gap-1">
                          <Banknote className="size-3.5 text-[#233516]" />
                          <span>от {place.price}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] text-[#999] uppercase tracking-wide">Координаты</p>
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-[#233516]" />
                          <span className="text-xs">{place.lat}°N, {place.lng}°E</span>
                        </div>
                      </div>

                      {place.phone && (
                        <div>
                          <p className="text-[10px] text-[#999] uppercase tracking-wide">Телефон</p>
                          <div className="flex items-center gap-1">
                            <Phone className="size-3.5 text-[#233516]" />
                            <span>{place.phone}</span>
                          </div>
                        </div>
                      )}

                      {place.website && (
                        <div>
                          <p className="text-[10px] text-[#999] uppercase tracking-wide">Сайт</p>
                          <div className="flex items-center gap-1">
                            <Globe className="size-3.5 text-[#233516]" />
                            <a href={place.website} className="text-[#233516] underline text-xs break-all">
                              {place.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        </div>
                      )}

                      {place.address && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-[#999] uppercase tracking-wide">Адрес</p>
                          <div className="flex items-center gap-1">
                            <MapPin className="size-3.5 text-[#233516]" />
                            <span>{place.address}</span>
                          </div>
                        </div>
                      )}

                      {place.partner && (
                        <div className="col-span-2">
                          <p className="text-[10px] text-[#999] uppercase tracking-wide">Организатор</p>
                          <p>{place.partner.companyName}</p>
                        </div>
                      )}
                    </div>

                    {/* Yandex Maps link (screen only) */}
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-print inline-flex items-center gap-1.5 text-xs text-[#233516] underline"
                    >
                      <MapPin className="size-3" />
                      Открыть в Яндекс.Картах
                    </a>
                    {/* Print URL */}
                    <p className="print-only text-[10px] text-[#888]">
                      Яндекс.Карты: yandex.ru/maps/?pt={place.lng},{place.lat}&amp;z=15
                    </p>

                    {/* Tags */}
                    {place.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#f0ece0]">
                        <Tag className="size-3 text-[#bbb]" />
                        {place.tags.map((tag) => (
                          <span key={tag} className="text-[10px] bg-[#f5f0e8] text-[#777] px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right: QR code */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl(mapUrl)}
                      alt={`QR ${place.name}`}
                      className="qr-img size-[88px] border border-[#e8e4d8] rounded-lg"
                    />
                    <p className="text-[9px] text-[#bbb] text-center leading-tight">
                      Яндекс<br />Карты
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[#e8e4d8] mt-10 pt-6 text-center">
          <p className="text-[10px] text-[#ccc]">
            Маршрут создан с помощью AI-гида Петроглиф · altai.guide
          </p>
        </div>
      </div>
    </>
  );
}
