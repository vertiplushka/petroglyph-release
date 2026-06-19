"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlaces, deletePlace, Place } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, MapPin, Hotel, UtensilsCrossed, Landmark, Star, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_CFG = {
  attraction: { label: "Достопримечательность", dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  hotel:      { label: "Отель",                  dot: "bg-sky-500",     badge: "bg-sky-50 text-sky-700" },
  restaurant: { label: "Ресторан",               dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700" },
  museum:     { label: "Музей",                  dot: "bg-purple-500",  badge: "bg-purple-50 text-purple-700" },
} as const;

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={11}
          className={s <= full ? "text-amber-400 fill-amber-400" : "text-[#ddd] fill-[#e8e4d8]"}
        />
      ))}
      <span className="ml-1.5 text-[#888] text-xs tabular-nums">{rating.toFixed(1)}</span>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-[#e8e4d8] rounded-2xl h-[92px]" />
        ))}
      </div>
      <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
        <div className="h-10 bg-[#faf8f2] border-b border-[#e8e4d8]" />
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[#e8e4d8] last:border-0">
            <div className="size-10 rounded-xl bg-[#f0ece0] shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-[#ede9de] rounded w-2/5" />
              <div className="h-2.5 bg-[#f0ece0] rounded w-1/4" />
            </div>
            <div className="h-6 w-28 bg-[#f0ece0] rounded-full hidden md:block" />
            <div className="h-3 w-20 bg-[#f5f2e8] rounded hidden lg:block" />
            <div className="size-7 bg-[#f5f2e8] rounded-lg ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    getPlaces()
      .then(setPlaces)
      .catch(() => setError("Не удалось загрузить места"))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Удалить «${name}»?`)) return;
    setDeletingId(id);
    try {
      await deletePlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Не удалось удалить место");
    } finally {
      setDeletingId(null);
    }
  }

  const counts = {
    total:      places.length,
    attraction: places.filter((p) => p.type === "attraction").length,
    hotel:      places.filter((p) => p.type === "hotel").length,
    other:      places.filter((p) => p.type === "restaurant" || p.type === "museum").length,
  };

  const statCards = [
    { label: "Всего",               value: counts.total,      icon: MapPin,          iconCls: "text-[#233516]",  bgCls: "bg-[#233516]/8" },
    { label: "Достопримечательности", value: counts.attraction, icon: MapPin,          iconCls: "text-emerald-600", bgCls: "bg-emerald-50" },
    { label: "Отели",               value: counts.hotel,       icon: Hotel,           iconCls: "text-sky-600",     bgCls: "bg-sky-50" },
    { label: "Рестораны и музеи",    value: counts.other,       icon: UtensilsCrossed, iconCls: "text-purple-600",  bgCls: "bg-purple-50" },
  ] as const;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[#0e0f11] text-[1.85rem] font-semibold leading-tight">
            Места
          </h1>
          {!loading && (
            <p className="text-[#888] text-sm mt-1.5">
              {counts.total} {counts.total === 1 ? "запись" : counts.total < 5 ? "записи" : "записей"} в базе данных
            </p>
          )}
        </div>
        <Link
          href="/admin/places/new"
          className="flex items-center gap-2 bg-[#233516] text-white rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-[#2c4219] active:scale-[0.98] transition-all"
        >
          <Plus size={15} />
          Добавить место
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? <TableSkeleton /> : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statCards.map(({ label, value, icon: Icon, iconCls, bgCls }) => (
              <div key={label} className="bg-white border border-[#e8e4d8] rounded-2xl p-5 flex items-center gap-4">
                <div className={cn("size-11 rounded-xl flex items-center justify-center shrink-0", bgCls)}>
                  <Icon size={18} className={iconCls} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <div className="text-[#0e0f11] text-2xl font-bold leading-none tabular-nums">
                    {value}
                  </div>
                  <div className="text-[#888] text-xs mt-1 leading-snug truncate">{label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Table / Empty state */}
          {places.length === 0 ? (
            <div className="bg-white border border-[#e8e4d8] rounded-2xl flex flex-col items-center py-20">
              <div className="size-16 rounded-2xl bg-[#f5f2e8] flex items-center justify-center mb-4">
                <Landmark size={26} className="text-[#bbb]" strokeWidth={1.5} />
              </div>
              <h3 className="text-[#0e0f11] text-xl font-semibold mb-2">
                Мест пока нет
              </h3>
              <p className="text-[#888] text-sm mb-7">Добавьте первое место для туристов</p>
              <Link
                href="/admin/places/new"
                className="inline-flex items-center gap-2 bg-[#233516] text-white rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-[#2c4219] transition-colors"
              >
                <Plus size={15} />
                Добавить место
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-[#e8e4d8] rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e8e4d8] bg-[#faf8f2]">
                    <th className="w-16 px-4 py-3" />
                    <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase">
                      Название
                    </th>
                    <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase hidden md:table-cell">
                      Тип
                    </th>
                    <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase hidden lg:table-cell">
                      Рейтинг
                    </th>
                    <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase hidden xl:table-cell">
                      Цена
                    </th>
                    <th className="text-left text-[#888] font-semibold px-4 py-3 text-[11px] tracking-wider uppercase hidden 2xl:table-cell">
                      Партнёр
                    </th>
                    <th className="w-20 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {places.map((place) => {
                    const cfg = TYPE_CFG[place.type];
                    return (
                      <tr
                        key={place.id}
                        className="border-b border-[#e8e4d8] last:border-0 hover:bg-[#fdfbf5] transition-colors group"
                      >
                        {/* Thumbnail */}
                        <td className="px-4 py-3">
                          {place.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={place.image}
                              alt={place.name}
                              className="size-10 rounded-xl object-cover border border-[#e8e4d8]"
                              onError={(e) => {
                                e.currentTarget.replaceWith(
                                  Object.assign(document.createElement("div"), {
                                    className: "size-10 rounded-xl bg-[#f0ece0] flex items-center justify-center",
                                    innerHTML: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
                                  })
                                );
                              }}
                            />
                          ) : (
                            <div className="size-10 rounded-xl bg-[#f0ece0] flex items-center justify-center">
                              <MapPin size={13} className="text-[#c0bab0]" />
                            </div>
                          )}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="text-[#0e0f11] font-medium text-[13px] max-w-[200px] truncate">
                            {place.name}
                          </div>
                          <div className="text-[#aaa] text-[11px] mt-0.5">{place.category}</div>
                        </td>

                        {/* Type badge */}
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
                              cfg.badge
                            )}
                          >
                            <span className={cn("size-1.5 rounded-full", cfg.dot)} />
                            {cfg.label}
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <Stars rating={place.rating} />
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-[#666] text-[13px] hidden xl:table-cell">
                          {place.price}
                        </td>

                        {/* Partner */}
                        <td className="px-4 py-3 hidden 2xl:table-cell">
                          {place.partner ? (
                            <div className="flex items-center gap-1.5 text-[#555] text-[12px]">
                              <Handshake size={12} className="text-[#aaa]" />
                              {place.partner.companyName}
                            </div>
                          ) : (
                            <span className="text-[#ccc] text-[12px]">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={`/admin/places/${place.id}/edit`}
                              className="p-2 rounded-lg text-[#999] hover:text-[#233516] hover:bg-[#233516]/8 transition-colors"
                              title="Редактировать"
                            >
                              <Pencil size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(place.id, place.name)}
                              disabled={deletingId === place.id}
                              className="p-2 rounded-lg text-[#999] hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Удалить"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
