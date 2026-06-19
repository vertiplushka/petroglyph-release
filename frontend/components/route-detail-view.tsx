"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock, Banknote, Star, ArrowDown, Heart, Printer } from "lucide-react";
import type { Place } from "@/lib/server-api";
import { getUserToken, apiAddFavorite } from "@/lib/user-auth";

const GORNO_ALTAYSK = { lat: 51.96, lng: 85.96 };

const RouteDetailMapInner = dynamic(
  () => import("./route-detail-map-inner"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[#eef2ea] flex items-center justify-center">
        <p className="text-[#233516]/40 font-sans text-sm">Загрузка карты…</p>
      </div>
    ),
  }
);

interface OsrmLeg  { distance: number; duration: number }
interface OsrmData {
  geometry: { coordinates: [number, number][] };
  legs: OsrmLeg[];
  distance: number;
  duration: number;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

function formatDistance(meters: number): string {
  return `${Math.round(meters / 1000)} км`;
}

function parsePrice(s: string): number {
  return parseInt(s.replace(/\D/g, ""), 10) || 0;
}

export default function RouteDetailView({ places }: { places: Place[] }) {
  const [osrm, setOsrm] = useState<OsrmData | null>(null);
  const [osrmLoading, setOsrmLoading] = useState(true);
  const [favSaved, setFavSaved] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    const coords = [
      `${GORNO_ALTAYSK.lng},${GORNO_ALTAYSK.lat}`,
      ...places.map((p) => `${p.lng},${p.lat}`),
    ].join(";");

    fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.code === "Ok" && data.routes?.[0]) setOsrm(data.routes[0]);
      })
      .catch(console.error)
      .finally(() => setOsrmLoading(false));
  }, [places]);

  // OSRM geometry: [lng, lat] → Leaflet: [lat, lng]
  const routePolyline: [number, number][] | null = osrm
    ? osrm.geometry.coordinates.map(([lng, lat]) => [lat, lng])
    : null;

  const totalCost = places.reduce((s, p) => s + parsePrice(p.price), 0);

  async function saveFavorite() {
    const token = getUserToken();
    if (!token) { window.location.href = "/login"; return; }
    setFavLoading(true);
    const title = places.map((p) => p.name).join(" → ");
    await apiAddFavorite(token, { title, placeIds: places.map((p) => p.id) });
    setFavSaved(true);
    setFavLoading(false);
  }

  // legs[i] = segment от точки i до точки i+1
  // Точки: [Горно-Алтайск, place0, place1, ..., placeN-1]
  // legs[0]  = Горно-Алтайск → place0
  // legs[i]  = place[i-1]    → place[i]
  const legs = osrm?.legs ?? [];

  return (
    <div className="flex flex-col">
      {/* ── Карта ── */}
      <div className="w-full h-[55vh] min-h-[380px]">
        <RouteDetailMapInner places={places} routePolyline={routePolyline} />
      </div>

      {/* ── Итоговая статистика ── */}
      <div className="bg-[#233516] text-[#fffcf3] px-4 md:px-16 py-4 flex flex-wrap gap-6 items-center justify-between">
        {osrmLoading ? (
          <p className="font-sans text-sm text-white/60 animate-pulse">Рассчитываем маршрут…</p>
        ) : osrm ? (
          <>
            <StatBadge icon={<MapPin className="size-4" />} label="Расстояние" value={formatDistance(osrm.distance)} />
            <div className="w-px h-5 bg-white/20" />
            <StatBadge icon={<Clock className="size-4" />} label="В дороге" value={formatDuration(osrm.duration)} />
            <div className="w-px h-5 bg-white/20" />
          </>
        ) : null}
        <StatBadge icon={<Banknote className="size-4" />} label="Стоимость" value={`от ${totalCost.toLocaleString("ru-RU")} ₽`} />
        <div className="w-px h-5 bg-white/20" />
        <StatBadge icon={<MapPin className="size-4" />} label="Мест" value={String(places.length)} />
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={saveFavorite}
            disabled={favSaved || favLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-sm font-sans font-medium text-white hover:bg-white/10 disabled:opacity-60 transition"
          >
            <Heart className={`size-4 ${favSaved ? "fill-white" : ""}`} />
            {favSaved ? "Сохранено" : favLoading ? "Сохраняем…" : "В избранное"}
          </button>
          <button
            onClick={() => {
              const token = getUserToken();
              const idsParam = places.map((p) => p.id).join(",");
              if (!token) {
                window.location.href = `/login?next=${encodeURIComponent(`/route-detail/print?ids=${idsParam}`)}`;
              } else {
                window.open(`/route-detail/print?ids=${idsParam}`, "_blank");
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 text-sm font-sans font-medium text-white hover:bg-white/10 transition"
          >
            <Printer className="size-4" />
            Распечатать
          </button>
        </div>
      </div>

      {/* ── Тайм-лайн маршрута ── */}
      <div className="bg-[#fffcf3] px-4 md:px-16 py-12">
        <div className="max-w-[860px] mx-auto flex flex-col">

          {/* Точка старта */}
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 rounded-full bg-[#233516] flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-lg">🚩</span>
            </div>
            <div>
              <p className="font-sans font-semibold text-base text-[#0e0f11]">Горно-Алтайск</p>
              <p className="font-sans text-xs text-[#999]">Точка отправления</p>
            </div>
          </div>

          {places.map((place, i) => {
            const leg = legs[i];
            const isLast = i === places.length - 1;

            return (
              <div key={place.id} className="flex flex-col">
                {/* Коннектор с данными отрезка */}
                <div className="flex items-center gap-3 py-2 ml-4">
                  <div className="flex flex-col items-center">
                    <div className="w-px flex-1 bg-[#233516]/20 min-h-[8px]" />
                    <ArrowDown className="size-3.5 text-[#233516]/40 my-0.5" />
                    <div className="w-px flex-1 bg-[#233516]/20 min-h-[8px]" />
                  </div>
                  {leg ? (
                    <div className="flex items-center gap-3 bg-white border border-[#e8e4d8] rounded-full px-4 py-1.5 shadow-sm">
                      <span className="font-sans text-xs text-[#555] flex items-center gap-1.5">
                        <MapPin className="size-3 text-[#233516]" />
                        {formatDistance(leg.distance)}
                      </span>
                      <span className="text-[#ddd]">·</span>
                      <span className="font-sans text-xs text-[#555] flex items-center gap-1.5">
                        <Clock className="size-3 text-[#233516]" />
                        {formatDuration(leg.duration)}
                      </span>
                    </div>
                  ) : (
                    <div className="h-5" />
                  )}
                </div>

                {/* Карточка места */}
                <Link
                  href={`/places/${place.id}`}
                  className="group flex gap-4 bg-white rounded-2xl border border-[#e8e4d8] shadow-[5px_2px_20px_0px_rgba(84,61,50,0.08)] overflow-hidden hover:shadow-[5px_2px_30px_0px_rgba(84,61,50,0.15)] transition-shadow"
                >
                  {/* Изображение */}
                  <div className="relative w-36 md:w-48 flex-shrink-0">
                    <Image
                      src={place.image}
                      alt={place.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="192px"
                      unoptimized
                    />
                    {/* Бейдж номера */}
                    <div className={`absolute top-3 left-3 size-7 rounded-full flex items-center justify-center text-xs font-bold font-sans shadow ${isLast ? "bg-[#e63946] text-white" : "bg-[#233516] text-[#fffcf3]"}`}>
                      {isLast ? "🏁" : i + 1}
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="flex flex-col gap-2 py-4 pr-4 flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block font-sans text-[11px] text-[#233516] bg-[#233516]/8 px-2 py-0.5 rounded-full mb-1">
                          {place.category}
                        </span>
                        <h3 className="font-sans font-bold text-base text-[#0e0f11] leading-tight">
                          {place.name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star className="size-3.5 text-amber-400 fill-amber-400" />
                        <span className="font-sans font-semibold text-sm text-[#0e0f11]">{place.rating}</span>
                      </div>
                    </div>

                    <p className="font-sans text-sm text-[#666] line-clamp-2 leading-relaxed">
                      {place.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {place.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-[#f5f0e8] px-2 py-0.5 rounded-md text-[#666] text-[11px] font-sans">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="font-sans font-semibold text-sm text-[#233516] mt-1">
                      от {place.price}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-white/60">{icon}</span>
      <div>
        <p className="font-sans text-[10px] text-white/50 uppercase tracking-wide leading-none">{label}</p>
        <p className="font-sans font-semibold text-sm text-white">{value}</p>
      </div>
    </div>
  );
}
